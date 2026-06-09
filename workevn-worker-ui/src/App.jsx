import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AirVent,
  ArrowRight,
  BadgeCheck,
  BellRing,
  BriefcaseBusiness,
  CalendarCheck,
  Check,
  ClipboardCheck,
  Clock,
  Drill,
  Fan,
  Hammer,
  Home,
  LocateFixed,
  LogIn,
  LogOut,
  MapPin,
  PlugZap,
  RefreshCw,
  ShieldCheck,
  Star,
  UserRoundCheck,
  WalletCards,
  Wrench,
  X
} from "lucide-react";
import "./index.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const SESSION_KEY = "workevn_worker_session";

const professions = [
  {
    id: "ac_repair",
    name: "AC repair",
    description: "Service, gas refill, installation, cooling diagnosis",
    icon: AirVent,
    tone: "bg-sky-50 text-sky-700 border-sky-100"
  },
  {
    id: "electrician",
    name: "Electrician",
    description: "Wiring, lights, switch boards, fan points, safety checks",
    icon: PlugZap,
    tone: "bg-amber-50 text-amber-700 border-amber-100"
  },
  {
    id: "plumber",
    name: "Plumber",
    description: "Leaks, taps, drains, pumps, bathroom fittings",
    icon: Wrench,
    tone: "bg-emerald-50 text-emerald-700 border-emerald-100"
  },
  {
    id: "fan_repair",
    name: "Fan repair",
    description: "Installations, regulators, balancing, noise fixes",
    icon: Fan,
    tone: "bg-violet-50 text-violet-700 border-violet-100"
  },
  {
    id: "appliance_repair",
    name: "Appliance repair",
    description: "Fridge, washing machine, oven, and home appliance repair",
    icon: Drill,
    tone: "bg-rose-50 text-rose-700 border-rose-100"
  },
  {
    id: "carpenter",
    name: "Carpenter",
    description: "Furniture, doors, fittings, shelves, assembly work",
    icon: Hammer,
    tone: "bg-orange-50 text-orange-700 border-orange-100"
  }
];

const emptyRegisterForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  experienceYears: "2",
  serviceRadiusKm: "10",
  city: "",
  bio: "",
  emergencyName: "",
  emergencyPhone: ""
};

const emptyLoginForm = {
  email: "",
  password: ""
};

function App() {
  const [registerForm, setRegisterForm] = useState(emptyRegisterForm);
  const [loginForm, setLoginForm] = useState(emptyLoginForm);
  const [selectedSkills, setSelectedSkills] = useState(["plumber"]);
  const [location, setLocation] = useState({
    lng: 77.5946,
    lat: 12.9716,
    source: "Default city center"
  });
  const [auth, setAuth] = useState(null);
  const [workerProfile, setWorkerProfile] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [view, setView] = useState("home");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const selectedProfessionNames = useMemo(
    () =>
      professions
        .filter((profession) => selectedSkills.includes(profession.id))
        .map((profession) => profession.name),
    [selectedSkills]
  );

  useEffect(() => {
    const savedSession = localStorage.getItem(SESSION_KEY);
    if (!savedSession) return;

    try {
      const session = JSON.parse(savedSession);
      setAuth(session);
      setView("dashboard");
      loadWorkerPortal(session.token);
    } catch (_error) {
      localStorage.removeItem(SESSION_KEY);
    }
  }, []);

  function updateRegisterField(field, value) {
    setRegisterForm((current) => ({ ...current, [field]: value }));
  }

  function updateLoginField(field, value) {
    setLoginForm((current) => ({ ...current, [field]: value }));
  }

  function toggleSkill(skill) {
    setSelectedSkills((current) => {
      if (current.includes(skill)) {
        return current.length === 1 ? current : current.filter((item) => item !== skill);
      }
      return [...current, skill];
    });
  }

  function saveSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setAuth(session);
    setView("dashboard");
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setAuth(null);
    setWorkerProfile(null);
    setDashboard(null);
    setView("home");
    setMessage("");
  }

  function captureLocation() {
    if (!navigator.geolocation) {
      setMessage("Your browser does not support location capture. Default coordinates will be used.");
      return;
    }

    setMessage("Requesting location permission...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lng: Number(position.coords.longitude.toFixed(6)),
          lat: Number(position.coords.latitude.toFixed(6)),
          source: "Live device location"
        });
        setMessage("Location added to your worker profile.");
      },
      () => {
        setMessage("Location permission was not allowed. Default coordinates will be used for now.");
      }
    );
  }

  async function apiRequest(path, options = {}, token = auth?.token) {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  }

  async function loadWorkerPortal(token = auth?.token) {
    if (!token) return;

    setStatus("loading-dashboard");
    try {
      const [profileData, dashboardData] = await Promise.all([
        apiRequest("/api/workers/me", {}, token),
        apiRequest("/api/workers/dashboard", {}, token)
      ]);
      setWorkerProfile(profileData.workerProfile);
      setDashboard(dashboardData);
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  async function submitLogin(event) {
    event.preventDefault();
    setStatus("logging-in");
    setMessage("");

    try {
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(loginForm)
      });

      if (data.user.role !== "worker") {
        throw new Error("This login is not a worker account.");
      }

      saveSession({ token: data.token, user: data.user });
      await loadWorkerPortal(data.token);
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  async function submitApplication(event) {
    event.preventDefault();
    setStatus("registering");
    setMessage("");

    try {
      const authData = await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: registerForm.name,
          email: registerForm.email,
          phone: registerForm.phone,
          password: registerForm.password,
          role: "worker"
        })
      });

      const applicationData = await apiRequest(
        "/api/workers/apply",
        {
          method: "POST",
          body: JSON.stringify({
            skills: selectedSkills,
            experienceYears: Number(registerForm.experienceYears || 0),
            serviceRadiusKm: Number(registerForm.serviceRadiusKm || 10),
            bio: registerForm.bio,
            emergencyContact: {
              name: registerForm.emergencyName,
              phone: registerForm.emergencyPhone,
              relation: "Emergency contact"
            },
            documents: [],
            location: {
              type: "Point",
              coordinates: [location.lng, location.lat]
            }
          })
        },
        authData.token
      );

      saveSession({ token: authData.token, user: applicationData.user });
      setWorkerProfile(applicationData.workerProfile);
      await loadWorkerPortal(authData.token);
      setStatus("idle");
      setMessage("Worker profile created. Verification is skipped for now, so your profile is approved and available.");
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  async function respondToBooking(bookingId, action) {
    setStatus(`booking-${bookingId}`);
    setMessage("");

    try {
      await apiRequest(`/api/bookings/${bookingId}/${action}`, {
        method: "PATCH",
        body: action === "reject" ? JSON.stringify({ reason: "Rejected by worker" }) : JSON.stringify({})
      });
      await loadWorkerPortal();
      setMessage(`Booking ${action === "accept" ? "accepted" : "rejected"} successfully.`);
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  const isAuthenticated = Boolean(auth?.token);

  return (
    <main className="min-h-screen bg-[#f5f1e8] text-[#151515]">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#fffdf8]/90 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <a className="flex items-center gap-3" href="/" onClick={(event) => event.preventDefault()}>
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#151515] text-white">
              <BriefcaseBusiness size={19} />
            </span>
            <span>
              <span className="block text-lg font-black leading-none">Workevn Workers</span>
              <span className="block text-xs font-bold text-zinc-500">Partner platform</span>
            </span>
          </a>

          <div className="hidden items-center gap-8 text-sm font-bold text-zinc-700 md:flex">
            <a href="#professions">Professions</a>
            <button onClick={() => setView("home")}>Register</button>
            {isAuthenticated && <button onClick={() => setView("dashboard")}>Dashboard</button>}
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    setView("dashboard");
                    loadWorkerPortal();
                  }}
                  className="hidden rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-bold shadow-sm sm:inline-flex"
                >
                  Dashboard
                </button>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-md bg-[#151515] px-4 py-2 text-sm font-bold text-white shadow-sm"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setView("login")}
                  className="inline-flex items-center gap-2 rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-bold shadow-sm"
                >
                  <LogIn size={16} />
                  Login
                </button>
                <a
                  href="#register"
                  onClick={() => setView("home")}
                  className="rounded-md bg-[#151515] px-4 py-2 text-sm font-bold text-white shadow-sm"
                >
                  Start earning
                </a>
              </>
            )}
          </div>
        </nav>
      </header>

      {view === "dashboard" && isAuthenticated ? (
        <WorkerDashboard
          auth={auth}
          dashboard={dashboard}
          workerProfile={workerProfile}
          message={message}
          status={status}
          onRefresh={() => loadWorkerPortal()}
          onRespond={respondToBooking}
        />
      ) : view === "login" ? (
        <LoginView
          loginForm={loginForm}
          status={status}
          message={message}
          onChange={updateLoginField}
          onSubmit={submitLogin}
          onRegister={() => setView("home")}
        />
      ) : (
        <HomeView
          registerForm={registerForm}
          selectedSkills={selectedSkills}
          selectedProfessionNames={selectedProfessionNames}
          location={location}
          status={status}
          message={message}
          onFieldChange={updateRegisterField}
          onSkillToggle={toggleSkill}
          onCaptureLocation={captureLocation}
          onSubmit={submitApplication}
          onLogin={() => setView("login")}
        />
      )}
    </main>
  );
}

function HomeView({
  registerForm,
  selectedSkills,
  selectedProfessionNames,
  location,
  status,
  message,
  onFieldChange,
  onSkillToggle,
  onCaptureLocation,
  onSubmit,
  onLogin
}) {
  return (
    <>
      <section className="relative overflow-hidden border-b border-black/10 bg-[#efe5d5]">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.22),transparent_34rem)] lg:block" />
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-[0.95fr_1.05fr] lg:py-20">
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-2 text-sm font-bold text-zinc-700 shadow-sm">
              <ShieldCheck size={16} className="text-emerald-700" />
              Worker onboarding is open
            </div>
            <h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-normal sm:text-6xl">
              Join Workevn as a trusted home-service professional.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-700">
              Register your profile, choose your profession, share your service area, and manage
              customer bookings from a dedicated worker dashboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#register" className="inline-flex items-center gap-2 rounded-md bg-[#151515] px-5 py-3 font-black text-white">
                Register now
                <ArrowRight size={18} />
              </a>
              <button onClick={onLogin} className="inline-flex items-center gap-2 rounded-md border border-black/10 bg-white px-5 py-3 font-black shadow-sm">
                <LogIn size={18} />
                Login to dashboard
              </button>
            </div>
          </div>

          <DashboardPreview />
        </div>
      </section>

      <section id="professions" className="mx-auto max-w-7xl px-5 py-16">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase text-emerald-700">Choose your work</p>
            <h2 className="mt-2 max-w-2xl text-3xl font-black tracking-normal sm:text-4xl">
              Pick one or more professions you can serve professionally.
            </h2>
          </div>
          <a href="#register" className="inline-flex items-center gap-2 self-start rounded-md border border-black/10 bg-white px-4 py-3 text-sm font-black shadow-sm">
            Register profile
            <ArrowRight size={17} />
          </a>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {professions.map((profession) => {
            const Icon = profession.icon;
            const selected = selectedSkills.includes(profession.id);

            return (
              <button
                key={profession.id}
                onClick={() => onSkillToggle(profession.id)}
                className={`group min-h-44 rounded-lg border bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${
                  selected ? "border-[#151515] ring-2 ring-black/10" : "border-black/10"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className={`grid h-12 w-12 place-items-center rounded-lg border ${profession.tone}`}>
                    <Icon size={23} />
                  </span>
                  {selected && (
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-600 text-white">
                      <Check size={16} />
                    </span>
                  )}
                </div>
                <span className="mt-5 block text-lg font-black">{profession.name}</span>
                <span className="mt-2 block text-sm leading-6 text-zinc-600">{profession.description}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section id="register" className="border-y border-black/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-[0.85fr_1.15fr]">
          <aside className="space-y-5">
            <div>
              <p className="text-sm font-black uppercase text-emerald-700">Worker registration</p>
              <h2 className="mt-2 text-3xl font-black tracking-normal sm:text-4xl">
                Create your Workevn worker profile.
              </h2>
              <p className="mt-4 leading-7 text-zinc-600">
                Verification is skipped for now. The API approves your worker profile immediately
                so customers can discover and book you during development.
              </p>
            </div>

            <div className="rounded-lg border border-black/10 bg-[#fbfaf7] p-5">
              <h3 className="font-black">Selected professions</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedProfessionNames.map((name) => (
                  <span key={name} className="rounded-full bg-[#151515] px-3 py-1.5 text-xs font-bold text-white">
                    {name}
                  </span>
                ))}
              </div>
            </div>

            <FeatureList />
          </aside>

          <form onSubmit={onSubmit} className="rounded-lg border border-black/10 bg-[#fbfaf7] p-5 shadow-sm md:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Full name" value={registerForm.name} onChange={(value) => onFieldChange("name", value)} required />
              <Field label="Phone number" value={registerForm.phone} onChange={(value) => onFieldChange("phone", value)} required />
              <Field label="Email address" type="email" value={registerForm.email} onChange={(value) => onFieldChange("email", value)} required />
              <Field label="Password" type="password" value={registerForm.password} onChange={(value) => onFieldChange("password", value)} required />
              <Field label="Experience years" type="number" min="0" value={registerForm.experienceYears} onChange={(value) => onFieldChange("experienceYears", value)} />
              <Field label="Service radius km" type="number" min="1" max="100" value={registerForm.serviceRadiusKm} onChange={(value) => onFieldChange("serviceRadiusKm", value)} />
              <Field label="City / area" value={registerForm.city} onChange={(value) => onFieldChange("city", value)} />
              <Field label="Emergency contact phone" value={registerForm.emergencyPhone} onChange={(value) => onFieldChange("emergencyPhone", value)} />
              <Field label="Emergency contact name" value={registerForm.emergencyName} onChange={(value) => onFieldChange("emergencyName", value)} />
              <div className="rounded-lg border border-black/10 bg-white p-4">
                <p className="text-sm font-black">Service location</p>
                <p className="mt-1 text-xs font-semibold text-zinc-500">
                  {location.source}: {location.lat}, {location.lng}
                </p>
                <button type="button" onClick={onCaptureLocation} className="mt-3 inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-bold text-white">
                  <LocateFixed size={16} />
                  Use current location
                </button>
              </div>
            </div>

            <label className="mt-4 block">
              <span className="text-sm font-black">Short profile bio</span>
              <textarea
                className="mt-2 min-h-28 w-full resize-none rounded-md border border-black/10 bg-white px-3 py-3 outline-none transition focus:border-emerald-600"
                value={registerForm.bio}
                onChange={(event) => onFieldChange("bio", event.target.value)}
                placeholder="Example: I handle plumbing repairs, bathroom fittings, and urgent leakage work across my city."
              />
            </label>

            <StatusMessage status={status} message={message} />

            <button type="submit" disabled={status === "registering"} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#151515] px-5 font-black text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60">
              {status === "registering" ? "Creating profile..." : "Register on Workevn"}
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </section>

      <Benefits />
    </>
  );
}

function LoginView({ loginForm, status, message, onChange, onSubmit, onRegister }) {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-8 px-5 py-14 lg:grid-cols-[0.9fr_1.1fr]">
      <div>
        <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-2 text-sm font-bold text-zinc-700 shadow-sm">
          <LogIn size={16} className="text-emerald-700" />
          Worker login
        </div>
        <h1 className="text-5xl font-black leading-[1.04] tracking-normal sm:text-6xl">
          Welcome back to your worker dashboard.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-zinc-700">
          Login to view assigned bookings, accept or reject customer requests, and track your active
          work from one place.
        </p>
      </div>

      <form onSubmit={onSubmit} className="rounded-lg border border-black/10 bg-white p-6 shadow-xl shadow-black/10">
        <h2 className="text-2xl font-black">Login</h2>
        <p className="mt-2 text-sm font-semibold text-zinc-600">Use the email and password from worker registration.</p>
        <div className="mt-6 grid gap-4">
          <Field label="Email address" type="email" value={loginForm.email} onChange={(value) => onChange("email", value)} required />
          <Field label="Password" type="password" value={loginForm.password} onChange={(value) => onChange("password", value)} required />
        </div>
        <StatusMessage status={status} message={message} />
        <button type="submit" disabled={status === "logging-in"} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#151515] px-5 font-black text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60">
          {status === "logging-in" ? "Logging in..." : "Login to dashboard"}
          <ArrowRight size={18} />
        </button>
        <button type="button" onClick={onRegister} className="mt-3 w-full rounded-md border border-black/10 bg-[#fbfaf7] px-5 py-3 text-sm font-black">
          Create a new worker account
        </button>
      </form>
    </section>
  );
}

function WorkerDashboard({ auth, dashboard, workerProfile, message, status, onRefresh, onRespond }) {
  const bookings = dashboard?.bookings || [];
  const pendingBookings = bookings.filter((booking) => booking.status === "requested");
  const activeBookings = bookings.filter((booking) => ["accepted", "in_progress"].includes(booking.status));
  const completedBookings = bookings.filter((booking) => booking.status === "completed");

  return (
    <section className="mx-auto max-w-7xl px-5 py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase text-emerald-700">Worker dashboard</p>
          <h1 className="mt-2 text-4xl font-black tracking-normal sm:text-5xl">
            Hi, {auth.user.name}
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-zinc-600">
            Review new customer bookings, accept or reject requests, and keep an eye on your work
            pipeline.
          </p>
        </div>
        <button onClick={onRefresh} className="inline-flex items-center gap-2 self-start rounded-md border border-black/10 bg-white px-4 py-3 text-sm font-black shadow-sm">
          <RefreshCw size={17} className={status === "loading-dashboard" ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <StatusMessage status={status} message={message} />

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard icon={BellRing} label="Pending requests" value={dashboard?.stats?.pendingRequests ?? pendingBookings.length} />
        <MetricCard icon={Clock} label="Active jobs" value={dashboard?.stats?.activeJobs ?? activeBookings.length} />
        <MetricCard icon={CalendarCheck} label="Completed jobs" value={dashboard?.stats?.completedJobs ?? completedBookings.length} />
        <MetricCard icon={Star} label="Profile rating" value={workerProfile?.ratingAverage || "0.0"} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
        <aside className="space-y-4">
          <div className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
            <h2 className="font-black">Worker profile</h2>
            <div className="mt-4 space-y-3 text-sm font-semibold text-zinc-700">
              <p className="flex items-center justify-between gap-4">
                <span>Status</span>
                <StatusPill status={workerProfile?.verificationStatus || "pending"} />
              </p>
              <p className="flex items-center justify-between gap-4">
                <span>Availability</span>
                <span>{workerProfile?.isAvailable ? "Available" : "Not available"}</span>
              </p>
              <p className="flex items-center justify-between gap-4">
                <span>Radius</span>
                <span>{workerProfile?.serviceRadiusKm || 10} km</span>
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(workerProfile?.skills || []).map((skill) => (
                <span key={skill} className="rounded-full bg-[#151515] px-3 py-1.5 text-xs font-bold text-white">
                  {formatSkill(skill)}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-black/10 bg-[#151515] p-5 text-white shadow-sm">
            <h2 className="font-black">Next actions</h2>
            <div className="mt-4 grid gap-3">
              {[
                "Accept bookings quickly when customers request work.",
                "Reject jobs you cannot serve so customers can rebook.",
                "Keep your location and service radius accurate."
              ].map((item) => (
                <p key={item} className="flex gap-3 text-sm font-semibold text-zinc-200">
                  <Check className="mt-0.5 shrink-0 text-emerald-300" size={16} />
                  {item}
                </p>
              ))}
            </div>
          </div>
        </aside>

        <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-black/10 pb-5 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-black">Booking requests</h2>
              <p className="mt-1 text-sm font-semibold text-zinc-600">
                Customer bookings assigned to your worker account appear here.
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
              {pendingBookings.length} waiting
            </span>
          </div>

          <div className="mt-5 grid gap-4">
            {bookings.length === 0 && (
              <div className="rounded-lg border border-dashed border-black/20 bg-[#fbfaf7] p-8 text-center">
                <BellRing className="mx-auto text-zinc-400" />
                <h3 className="mt-4 font-black">No bookings yet</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
                  When a user books your service, the request will show here with accept and reject
                  actions.
                </p>
              </div>
            )}

            {bookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                busy={status === `booking-${booking._id}`}
                onAccept={() => onRespond(booking._id, "accept")}
                onReject={() => onRespond(booking._id, "reject")}
              />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function BookingCard({ booking, busy, onAccept, onReject }) {
  const isPending = booking.status === "requested";

  return (
    <article className="rounded-lg border border-black/10 bg-[#fbfaf7] p-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-black">{formatSkill(booking.skill)}</h3>
            <StatusPill status={booking.status} />
          </div>
          <p className="mt-2 text-sm font-semibold text-zinc-600">
            Customer: {booking.customer?.name || "Customer"} {booking.customer?.phone ? `- ${booking.customer.phone}` : ""}
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-zinc-600">
            <CalendarCheck size={15} />
            {formatDate(booking.scheduledFor)}
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-zinc-600">
            <MapPin size={15} />
            {[booking.address?.line1, booking.address?.city, booking.address?.state].filter(Boolean).join(", ") || "Customer location shared"}
          </p>
          {booking.notes && <p className="mt-3 rounded-md bg-white p-3 text-sm text-zinc-700">{booking.notes}</p>}
        </div>

        <div className="flex gap-2 md:flex-col">
          {isPending ? (
            <>
              <button disabled={busy} onClick={onAccept} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-black text-white disabled:opacity-60">
                <Check size={16} />
                Accept
              </button>
              <button disabled={busy} onClick={onReject} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 text-sm font-black text-red-700 disabled:opacity-60">
                <X size={16} />
                Reject
              </button>
            </>
          ) : (
            <span className="rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-black text-zinc-700">
              {booking.status}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function DashboardPreview() {
  return (
    <div className="relative">
      <div className="rounded-lg border border-black/10 bg-white p-4 shadow-2xl shadow-black/10">
        <div className="rounded-md bg-[#151515] p-5 text-white">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-emerald-300">Today on Workevn</p>
              <h2 className="mt-1 text-2xl font-black">Worker dashboard preview</h2>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-white/10">
              <BellRing />
            </span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["08", "new jobs"],
              ["04", "accepted"],
              ["2.8k", "est. earnings"]
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg bg-white/10 p-4">
                <p className="text-2xl font-black">{value}</p>
                <p className="mt-1 text-xs font-bold text-zinc-300">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          {[
            ["AC service request", "Indiranagar - 2.4 km away", "Accept"],
            ["Kitchen tap leakage", "Koramangala - 4.1 km away", "Review"],
            ["Ceiling fan install", "HSR Layout - 5.6 km away", "Accept"]
          ].map(([title, area, action]) => (
            <article key={title} className="flex items-center justify-between gap-4 rounded-lg border border-black/10 bg-[#fbfaf7] p-4">
              <div>
                <h3 className="font-black">{title}</h3>
                <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-zinc-600">
                  <MapPin size={14} />
                  {area}
                </p>
              </div>
              <button className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-bold text-white">
                {action}
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeatureList() {
  return (
    <div className="grid gap-3">
      {[
        [UserRoundCheck, "Register with name, phone, email, and password"],
        [LocateFixed, "Attach your service location and coverage radius"],
        [ClipboardCheck, "Receive bookings in the worker dashboard"],
        [WalletCards, "Track accepted work and earnings"]
      ].map(([Icon, label]) => (
        <div key={label} className="flex items-center gap-3 rounded-lg border border-black/10 bg-[#fbfaf7] p-4">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-white text-emerald-700">
            <Icon size={19} />
          </span>
          <span className="text-sm font-bold">{label}</span>
        </div>
      ))}
    </div>
  );
}

function Benefits() {
  return (
    <section id="benefits" className="mx-auto max-w-7xl px-5 py-16">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          [BellRing, "Instant job requests", "Customers can book you and the worker dashboard shows pending work."],
          [Star, "Build your rating", "Completed bookings can power ratings, repeat jobs, and better discovery."],
          [Home, "Local work nearby", "Location-based matching keeps jobs inside your preferred service radius."]
        ].map(([Icon, title, text]) => (
          <article key={title} className="rounded-lg border border-black/10 bg-white p-6 shadow-sm">
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-[#151515] text-white">
              <Icon size={22} />
            </span>
            <h3 className="mt-5 text-xl font-black">{title}</h3>
            <p className="mt-3 leading-7 text-zinc-600">{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function MetricCard({ icon: Icon, label, value }) {
  return (
    <article className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#151515] text-white">
          <Icon size={20} />
        </span>
        <p className="text-3xl font-black">{value}</p>
      </div>
      <p className="mt-4 text-sm font-black text-zinc-600">{label}</p>
    </article>
  );
}

function Field({ label, value, onChange, type = "text", required = false, min, max }) {
  return (
    <label className="block">
      <span className="text-sm font-black">{label}</span>
      <input
        className="mt-2 h-12 w-full rounded-md border border-black/10 bg-white px-3 outline-none transition focus:border-emerald-600"
        type={type}
        min={min}
        max={max}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function StatusMessage({ status, message }) {
  if (!message) return null;

  return (
    <p
      className={`mt-4 rounded-md px-4 py-3 text-sm font-bold ${
        status === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"
      }`}
    >
      {message}
    </p>
  );
}

function StatusPill({ status }) {
  const style =
    status === "accepted" || status === "approved" || status === "completed"
      ? "bg-emerald-50 text-emerald-700"
      : status === "rejected" || status === "cancelled"
        ? "bg-red-50 text-red-700"
        : "bg-amber-50 text-amber-700";

  return <span className={`rounded-full px-3 py-1 text-xs font-black ${style}`}>{status}</span>;
}

function formatSkill(skill = "") {
  return skill
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value) {
  if (!value) return "Schedule not set";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

createRoot(document.getElementById("root")).render(<App />);

import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AirVent,
  ArrowRight,
  BadgeCheck,
  BellRing,
  CalendarCheck,
  Check,
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
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  UserPlus,
  UserRoundCheck,
  Wrench,
  X,
} from "lucide-react";
import heroImage from "./assets/workevn-hero.png";
import "./index.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const SESSION_KEY = "workevn_customer_session";

const services = [
  {
    id: "ac_repair",
    name: "AC repair",
    line: "Cooling checks, servicing, leaks, and installs",
    icon: AirVent,
    tone: "bg-sky-50 text-sky-700 border-sky-100",
  },
  {
    id: "electrician",
    name: "Electrician",
    line: "Switches, wiring, panels, lights, and safety checks",
    icon: PlugZap,
    tone: "bg-amber-50 text-amber-700 border-amber-100",
  },
  {
    id: "plumber",
    name: "Plumber",
    line: "Leaks, fixtures, pumps, drains, and bathroom work",
    icon: Wrench,
    tone: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  {
    id: "fan_repair",
    name: "Fan repair",
    line: "Noise, speed, regulator, installation, and balance",
    icon: Fan,
    tone: "bg-violet-50 text-violet-700 border-violet-100",
  },
  {
    id: "appliance_repair",
    name: "Appliance repair",
    line: "Washing machine, fridge, oven, and kitchen appliances",
    icon: Drill,
    tone: "bg-rose-50 text-rose-700 border-rose-100",
  },
  {
    id: "carpenter",
    name: "Carpenter",
    line: "Furniture repair, fittings, doors, shelves, and assembly",
    icon: Hammer,
    tone: "bg-orange-50 text-orange-700 border-orange-100",
  },
];

const defaultLocation = {
  lat: 12.9716,
  lng: 77.5946,
  label: "Bengaluru default",
};

const emptyAuthForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
};

const emptyBookingForm = {
  scheduledFor: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  notes: "",
};

function App() {
  const [auth, setAuth] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authOpen, setAuthOpen] = useState(false);
  const [authForm, setAuthForm] = useState(emptyAuthForm);
  const [selectedSkill, setSelectedSkill] = useState("plumber");
  const [workers, setWorkers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [bookingForm, setBookingForm] = useState(emptyBookingForm);
  const [location, setLocation] = useState(defaultLocation);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const selectedService = useMemo(
    () =>
      services.find((service) => service.id === selectedSkill) || services[0],
    [selectedSkill],
  );

  useEffect(() => {
    const savedSession = localStorage.getItem(SESSION_KEY);
    if (!savedSession) return;

    try {
      const session = JSON.parse(savedSession);
      setAuth(session);
      loadMyBookings(session.token);
    } catch (_error) {
      localStorage.removeItem(SESSION_KEY);
    }
  }, []);

  function saveSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setAuth(session);
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setAuth(null);
    setBookings([]);
    setMessage("");
  }

  function updateAuthField(field, value) {
    setAuthForm((current) => ({ ...current, [field]: value }));
  }

  function updateBookingField(field, value) {
    setBookingForm((current) => ({ ...current, [field]: value }));
  }

  async function apiRequest(path, options = {}, token = auth?.token) {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  }

  async function submitAuth(event) {
    event.preventDefault();
    setStatus("auth");
    setMessage("");

    try {
      const payload =
        authMode === "register"
          ? {
              name: authForm.name,
              email: authForm.email,
              phone: authForm.phone,
              password: authForm.password,
              role: "customer",
            }
          : {
              email: authForm.email,
              password: authForm.password,
            };

      const data = await apiRequest(
        `/api/auth/${authMode === "register" ? "register" : "login"}`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );

      if (data.user.role !== "customer") {
        throw new Error("Please use a customer account to book services.");
      }

      saveSession({ token: data.token, user: data.user });
      setAuthOpen(false);
      setAuthForm(emptyAuthForm);
      setStatus("idle");
      setMessage(
        authMode === "register"
          ? "Account created. You can book a service now."
          : "Logged in successfully.",
      );
      await loadMyBookings(data.token);
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  function requestLocationAndFindWorkers() {
    setStatus("finding-workers");
    setMessage("Checking your location and finding available workers...");

    if (!navigator.geolocation) {
      findWorkers(defaultLocation);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
          label: "Current location",
        };
        setLocation(nextLocation);
        findWorkers(nextLocation);
      },
      () => {
        setMessage(
          "Location permission was not allowed. Showing workers around the default city location.",
        );
        findWorkers(defaultLocation);
      },
    );
  }

  async function findWorkers(searchLocation = location) {
    setStatus("finding-workers");

    try {
      const data = await apiRequest(
        `/api/workers/nearby?lat=${searchLocation.lat}&lng=${searchLocation.lng}&radiusKm=25&skill=${selectedSkill}`,
        {},
        null,
      );
      setWorkers(data.workers || []);
      setStatus("idle");
      setMessage(
        (data.workers || []).length
          ? `Found ${(data.workers || []).length} available ${selectedService.name.toLowerCase()} worker(s).`
          : "No approved available workers found for this service yet.",
      );
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  function startBooking(worker) {
    if (!auth) {
      setAuthMode("login");
      setAuthOpen(true);
      setMessage("Login or create an account before booking a worker.");
      return;
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    setSelectedWorker(worker);
    setBookingForm({
      ...emptyBookingForm,
      scheduledFor: toDateTimeLocal(tomorrow),
      city: auth.user.address?.city || "",
      state: auth.user.address?.state || "",
    });
  }

  async function submitBooking(event) {
    event.preventDefault();
    if (!selectedWorker) return;

    setStatus("booking");
    setMessage("");

    try {
      const data = await apiRequest("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          workerId: selectedWorker.user._id,
          skill: selectedSkill,
          scheduledFor: new Date(bookingForm.scheduledFor).toISOString(),
          address: {
            line1: bookingForm.line1,
            line2: bookingForm.line2,
            city: bookingForm.city,
            state: bookingForm.state,
            pincode: bookingForm.pincode,
          },
          location: {
            type: "Point",
            coordinates: [location.lng, location.lat],
          },
          notes: bookingForm.notes,
        }),
      });

      setSelectedWorker(null);
      setBookingForm(emptyBookingForm);
      setMessage(
        `Booking requested with ${data.booking.worker.name}. They can accept or reject it from the worker dashboard.`,
      );
      await loadMyBookings();
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  async function loadMyBookings(token = auth?.token) {
    if (!token) return;

    try {
      const data = await apiRequest("/api/bookings/my", {}, token);
      setBookings(data.bookings || []);
    } catch (_error) {
      setBookings([]);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f4ef] text-[#171717]">
      <Header
        auth={auth}
        onLogin={() => {
          setAuthMode("login");
          setAuthOpen(true);
        }}
        onRegister={() => {
          setAuthMode("register");
          setAuthOpen(true);
        }}
        onLogout={logout}
        onBook={requestLocationAndFindWorkers}
      />

      <Hero
        selectedService={selectedService}
        selectedSkill={selectedSkill}
        onSkillChange={setSelectedSkill}
        onFindWorkers={requestLocationAndFindWorkers}
      />

      <Services
        selectedSkill={selectedSkill}
        onSkillSelect={setSelectedSkill}
        onFindWorkers={requestLocationAndFindWorkers}
      />

      <BookingExperience
        workers={workers}
        selectedService={selectedService}
        selectedSkill={selectedSkill}
        location={location}
        status={status}
        message={message}
        auth={auth}
        bookings={bookings}
        onFindWorkers={requestLocationAndFindWorkers}
        onBookWorker={startBooking}
        onRefreshBookings={() => loadMyBookings()}
      />

      <HowItWorks />
      <WorkerCta />

      {authOpen && (
        <AuthModal
          mode={authMode}
          form={authForm}
          status={status}
          message={message}
          onClose={() => setAuthOpen(false)}
          onModeChange={setAuthMode}
          onFieldChange={updateAuthField}
          onSubmit={submitAuth}
        />
      )}

      {selectedWorker && (
        <BookingModal
          worker={selectedWorker}
          service={selectedService}
          form={bookingForm}
          status={status}
          location={location}
          onClose={() => setSelectedWorker(null)}
          onFieldChange={updateBookingField}
          onSubmit={submitBooking}
        />
      )}
    </main>
  );
}

function Header({ auth, onLogin, onRegister, onLogout, onBook }) {
  return (
    <header className="sticky top-0 z-30 border-b border-black/10 bg-[#fbfaf7]/90 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <a
          href="/"
          className="flex items-center gap-3"
          aria-label="Workevn home"
        >
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#141414] text-white">
            <Home size={19} />
          </span>
          <span>
            <span className="block text-lg font-bold leading-none tracking-normal">
              Workevn
            </span>
            <span className="block text-xs font-medium text-zinc-500">
              Home services
            </span>
          </span>
        </a>

        <div className="hidden items-center gap-8 text-sm font-medium text-zinc-700 md:flex">
          <a href="#services">Services</a>
          <a href="#workers">Workers</a>
          <a href="#bookings">My bookings</a>
          <a href="#join">Join as worker</a>
        </div>

        <div className="flex items-center gap-2">
          {auth ? (
            <>
              <span className="hidden text-sm font-bold text-zinc-700 sm:inline">
                Hi, {auth.user.name.split(" ")[0]}
              </span>
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-2 rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-bold shadow-sm"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onLogin}
                className="hidden items-center gap-2 rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-bold shadow-sm sm:inline-flex"
              >
                <LogIn size={16} />
                Login
              </button>
              <button
                onClick={onRegister}
                className="hidden items-center gap-2 rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-bold shadow-sm md:inline-flex"
              >
                <UserPlus size={16} />
                Register
              </button>
            </>
          )}
          {/* <button onClick={onBook} className="rounded-md bg-[#141414] px-4 py-2 text-sm font-semibold text-white shadow-sm">
            Book service
          </button> */}
        </div>
      </nav>
    </header>
  );
}

function Hero({
  selectedService,
  selectedSkill,
  onSkillChange,
  onFindWorkers,
}) {
  return (
    <section className="relative overflow-hidden border-b border-black/10 bg-[#efe9df]">
      <img
        src={heroImage}
        alt="Verified Workevn professionals arriving for home service"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#f6f0e6] via-[#f6f0e6]/88 to-[#f6f0e6]/15" />
      <div className="relative mx-auto grid min-h-[680px] max-w-7xl items-center px-5 py-14 lg:grid-cols-[minmax(0,640px)_1fr]">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-2 text-sm font-semibold text-zinc-700 shadow-sm">
            <ShieldCheck size={16} className="text-emerald-700" />
            Verified workers. Real booking flow.
          </div>

          <h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-normal text-[#111111] sm:text-6xl lg:text-7xl">
            Book trusted help for every home repair.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-700">
            Register as a customer, discover available workers near your
            location, and send booking requests that workers can accept or
            reject from their dashboard.
          </p>

          <div
            id="book"
            className="mt-8 max-w-2xl rounded-lg border border-black/10 bg-white p-3 shadow-2xl shadow-black/10"
          >
            <div className="grid gap-3 md:grid-cols-[1fr_180px]">
              <div className="flex min-h-14 items-center gap-3 rounded-md bg-zinc-50 px-4">
                <Search size={20} className="shrink-0 text-zinc-500" />
                <select
                  className="w-full bg-transparent text-base font-bold outline-none"
                  value={selectedSkill}
                  onChange={(event) => onSkillChange(event.target.value)}
                >
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={onFindWorkers}
                className="flex min-h-14 items-center justify-center gap-2 rounded-md bg-emerald-600 px-5 font-bold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <LocateFixed size={19} />
                Find workers
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                "AC service",
                "Tap leakage",
                "Fan installation",
                "Switch board",
              ].map((item) => (
                <button
                  key={item}
                  className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:border-black/30"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7 grid max-w-xl grid-cols-3 gap-3">
            {[
              ["Live", "auth flow"],
              ["Nearby", "worker search"],
              ["Real", "booking API"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-lg border border-black/10 bg-white/75 p-4 backdrop-blur"
              >
                <p className="text-2xl font-black">{value}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-normal text-zinc-500">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-5 text-sm font-bold text-zinc-600">
            Selected service: {selectedService.name}
          </p>
        </div>
      </div>
    </section>
  );
}

function Services({ selectedSkill, onSkillSelect, onFindWorkers }) {
  return (
    <section id="services" className="mx-auto max-w-7xl px-5 py-16">
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-normal text-emerald-700">
            Services offered
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-normal sm:text-4xl">
            Choose a service and match with available workers.
          </h2>
        </div>
        <button
          onClick={onFindWorkers}
          className="inline-flex items-center gap-2 self-start rounded-md border border-black/10 bg-white px-4 py-3 text-sm font-bold shadow-sm"
        >
          Find available workers
          <ArrowRight size={17} />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => {
          const Icon = service.icon;
          const isSelected = service.id === selectedSkill;

          return (
            <button
              key={service.id}
              onClick={() => onSkillSelect(service.id)}
              className={`group min-h-44 rounded-lg border bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${
                isSelected
                  ? "border-black ring-2 ring-black/10"
                  : "border-black/10"
              }`}
            >
              <span
                className={`mb-5 grid h-12 w-12 place-items-center rounded-lg border ${service.tone}`}
              >
                <Icon size={23} />
              </span>
              <span className="block text-lg font-black">{service.name}</span>
              <span className="mt-2 block text-sm leading-6 text-zinc-600">
                {service.line}
              </span>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-zinc-900">
                Select service
                <ArrowRight
                  size={15}
                  className="transition group-hover:translate-x-1"
                />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function BookingExperience({
  workers,
  selectedService,
  selectedSkill,
  location,
  status,
  message,
  auth,
  bookings,
  onFindWorkers,
  onBookWorker,
  onRefreshBookings,
}) {
  return (
    <section id="workers" className="border-y border-black/10 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-bold uppercase tracking-normal text-emerald-700">
            Book a worker
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-normal sm:text-4xl">
            Available {selectedService.name.toLowerCase()} workers near you.
          </h2>
          <p className="mt-4 max-w-xl leading-7 text-zinc-600">
            Results come from `GET /api/workers/nearby`. Booking uses your
            customer JWT and sends a request to `POST /api/bookings`.
          </p>

          <div className="mt-6 rounded-lg border border-black/10 bg-[#fbfaf7] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black">Search location</p>
                <p className="mt-1 text-sm font-semibold text-zinc-600">
                  {location.label}: {location.lat}, {location.lng}
                </p>
              </div>
              <button
                onClick={onFindWorkers}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-3 text-sm font-black text-white"
              >
                <RefreshCw
                  size={17}
                  className={status === "finding-workers" ? "animate-spin" : ""}
                />
                Refresh workers
              </button>
            </div>
          </div>

          <StatusMessage status={status} message={message} />

          <div
            id="bookings"
            className="mt-6 rounded-lg border border-black/10 bg-[#151515] p-5 text-white"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-black">My bookings</h3>
                <p className="mt-1 text-sm font-semibold text-zinc-300">
                  {auth
                    ? "Customer booking history from the API."
                    : "Login to view your booking history."}
                </p>
              </div>
              {auth && (
                <button
                  onClick={onRefreshBookings}
                  className="rounded-md bg-white/10 px-3 py-2 text-sm font-black"
                >
                  Refresh
                </button>
              )}
            </div>
            <div className="mt-4 grid gap-3">
              {bookings.length === 0 ? (
                <p className="rounded-md bg-white/10 p-4 text-sm font-semibold text-zinc-300">
                  No bookings yet.
                </p>
              ) : (
                bookings.slice(0, 4).map((booking) => (
                  <div key={booking._id} className="rounded-md bg-white/10 p-4">
                    <p className="font-black">{formatSkill(booking.skill)}</p>
                    <p className="mt-1 text-sm text-zinc-300">
                      {booking.worker?.name || "Worker"} - {booking.status} -{" "}
                      {formatDate(booking.scheduledFor)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {workers.length === 0 && (
            <div className="rounded-lg border border-dashed border-black/20 bg-[#fbfaf7] p-8 text-center">
              <Search className="mx-auto text-zinc-400" />
              <h3 className="mt-4 font-black">No workers loaded</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
                Choose a service and click Book service or Find workers. Only
                approved and available workers are returned by the backend.
              </p>
            </div>
          )}

          {workers.map((item) => (
            <WorkerCard
              key={item.user._id}
              item={item}
              selectedSkill={selectedSkill}
              onBook={() => onBookWorker(item)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkerCard({ item, selectedSkill, onBook }) {
  const { user, workerProfile } = item;

  return (
    <article className="rounded-lg border border-black/10 bg-[#fbfaf7] p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-[#141414] text-lg font-black text-white">
            {user.name.slice(0, 1)}
          </div>
          <div>
            <h3 className="font-black">{user.name}</h3>
            <p className="mt-1 text-sm text-zinc-600">
              {(workerProfile.skills || []).map(formatSkill).join(", ")} -{" "}
              {workerProfile.experienceYears} yrs experience
            </p>
            <p className="mt-1 flex items-center gap-1 text-sm font-bold text-amber-700">
              <Star size={15} fill="currentColor" />
              {workerProfile.ratingAverage || "0.0"} rating -{" "}
              {workerProfile.serviceRadiusKm || 10} km radius
            </p>
          </div>
        </div>
        <button
          onClick={onBook}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#141414] px-4 py-3 text-sm font-bold text-white"
        >
          <CalendarCheck size={17} />
          Book {formatSkill(selectedSkill)}
        </button>
      </div>
    </article>
  );
}

function AuthModal({
  mode,
  form,
  status,
  message,
  onClose,
  onModeChange,
  onFieldChange,
  onSubmit,
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4 py-8 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-lg rounded-lg border border-black/10 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase text-emerald-700">
              Customer auth
            </p>
            <h2 className="mt-1 text-2xl font-black">
              {mode === "register"
                ? "Create your Workevn account"
                : "Login to book services"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-md border border-black/10"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 grid gap-4">
          {mode === "register" && (
            <>
              <Field
                label="Full name"
                value={form.name}
                onChange={(value) => onFieldChange("name", value)}
                required
              />
              <Field
                label="Phone number"
                value={form.phone}
                onChange={(value) => onFieldChange("phone", value)}
                required
              />
            </>
          )}
          <Field
            label="Email address"
            type="email"
            value={form.email}
            onChange={(value) => onFieldChange("email", value)}
            required
          />
          <Field
            label="Password"
            type="password"
            value={form.password}
            onChange={(value) => onFieldChange("password", value)}
            required
          />
        </div>

        <StatusMessage status={status} message={message} />

        <button
          type="submit"
          disabled={status === "auth"}
          className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#141414] px-5 font-black text-white disabled:opacity-60"
        >
          {status === "auth"
            ? "Please wait..."
            : mode === "register"
              ? "Create account"
              : "Login"}
          <ArrowRight size={18} />
        </button>

        <button
          type="button"
          onClick={() =>
            onModeChange(mode === "register" ? "login" : "register")
          }
          className="mt-3 w-full rounded-md border border-black/10 bg-[#fbfaf7] px-5 py-3 text-sm font-black"
        >
          {mode === "register"
            ? "Already registered? Login"
            : "New customer? Register"}
        </button>
      </form>
    </div>
  );
}

function BookingModal({
  worker,
  service,
  form,
  status,
  location,
  onClose,
  onFieldChange,
  onSubmit,
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/45 px-4 py-8 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-2xl rounded-lg border border-black/10 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase text-emerald-700">
              Confirm booking
            </p>
            <h2 className="mt-1 text-2xl font-black">
              {service.name} with {worker.user.name}
            </h2>
            <p className="mt-2 text-sm font-semibold text-zinc-600">
              Request goes to the worker dashboard for accept or reject action.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-md border border-black/10"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field
            label="Preferred date and time"
            type="datetime-local"
            value={form.scheduledFor}
            onChange={(value) => onFieldChange("scheduledFor", value)}
            required
          />
          <Field
            label="City"
            value={form.city}
            onChange={(value) => onFieldChange("city", value)}
          />
          <Field
            label="Address line 1"
            value={form.line1}
            onChange={(value) => onFieldChange("line1", value)}
            required
          />
          <Field
            label="Address line 2"
            value={form.line2}
            onChange={(value) => onFieldChange("line2", value)}
          />
          <Field
            label="State"
            value={form.state}
            onChange={(value) => onFieldChange("state", value)}
          />
          <Field
            label="Pincode"
            value={form.pincode}
            onChange={(value) => onFieldChange("pincode", value)}
          />
        </div>

        <label className="mt-4 block">
          <span className="text-sm font-black">Work notes</span>
          <textarea
            className="mt-2 min-h-24 w-full resize-none rounded-md border border-black/10 bg-white px-3 py-3 outline-none transition focus:border-emerald-600"
            value={form.notes}
            onChange={(event) => onFieldChange("notes", event.target.value)}
            placeholder="Describe the issue, appliance model, or anything the worker should know."
          />
        </label>

        <p className="mt-4 rounded-md bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-600">
          Booking coordinates: {location.lat}, {location.lng}
        </p>

        <button
          type="submit"
          disabled={status === "booking"}
          className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-5 font-black text-white disabled:opacity-60"
        >
          {status === "booking" ? "Requesting booking..." : "Request booking"}
          <CalendarCheck size={18} />
        </button>
      </form>
    </div>
  );
}

function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16">
      <div className="grid gap-5 lg:grid-cols-3">
        {[
          [
            "1",
            "Create account",
            "Register or login as a customer before confirming your booking.",
          ],
          [
            "2",
            "Choose worker",
            "Find approved workers near your location for the selected service.",
          ],
          [
            "3",
            "Request booking",
            "The worker sees the request and can accept or reject it.",
          ],
        ].map(([step, title, text]) => (
          <article
            key={step}
            className="rounded-lg border border-black/10 bg-white p-6 shadow-sm"
          >
            <span className="grid h-10 w-10 place-items-center rounded-md bg-emerald-600 text-sm font-black text-white">
              {step}
            </span>
            <h3 className="mt-5 text-xl font-black">{title}</h3>
            <p className="mt-3 leading-7 text-zinc-600">{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function WorkerCta() {
  return (
    <section id="join" className="mx-auto max-w-7xl px-5 pb-16">
      <div className="grid gap-5 overflow-hidden rounded-lg border border-black/10 bg-[#151515] p-6 text-white md:grid-cols-[1fr_auto] md:items-center md:p-8">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-bold">
            <UserRoundCheck size={16} />
            Worker onboarding
          </div>
          <h2 className="text-3xl font-black tracking-normal">
            Skilled worker? Join Workevn.
          </h2>
          <p className="mt-3 max-w-2xl leading-7 text-zinc-300">
            Workers register in the partner app, select professions, and receive
            bookings in their dashboard.
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-3 font-black text-[#151515]">
          Apply as worker
          <Sparkles size={18} />
        </button>
      </div>
    </section>
  );
}

function Field({ label, value, onChange, type = "text", required = false }) {
  return (
    <label className="block">
      <span className="text-sm font-black">{label}</span>
      <input
        className="mt-2 h-12 w-full rounded-md border border-black/10 bg-white px-3 outline-none transition focus:border-emerald-600"
        type={type}
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
        status === "error"
          ? "bg-red-50 text-red-700"
          : "bg-emerald-50 text-emerald-800"
      }`}
    >
      {message}
    </p>
  );
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
    timeStyle: "short",
  }).format(new Date(value));
}

function toDateTimeLocal(date) {
  const offsetDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000,
  );
  return offsetDate.toISOString().slice(0, 16);
}

createRoot(document.getElementById("root")).render(<App />);

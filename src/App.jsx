import { useEffect, useMemo, useState } from 'react'
import './App.css'
import {
  adminComplaints,
  arrivalSlots,
  difficultyTags,
  indianLanguages,
  initialLocations,
  initialOrders,
  materialOptions,
  partnerJobTemplates,
  repairCatalog,
  serviceCategories,
  serviceSuggestions,
  trustFormula,
  verificationSteps,
  workerDirectory,
} from './data.js'

const STORAGE_KEYS = {
  customerSession: 'workven.customer.session',
  customerProfile: 'workven.customer.profile',
  workerSession: 'workven.worker.session',
  workerProfile: 'workven.worker.profile',
  savedLocations: 'workven.customer.locations',
  selectedLocation: 'workven.customer.selectedLocation',
  recipientContact: 'workven.customer.recipientContact',
  orders: 'workven.customer.orders',
  language: 'workven.customer.language',
  feedbackEntries: 'workven.customer.feedbackEntries',
  complaintEntries: 'workven.customer.complaintEntries',
  workerLeads: 'workven.worker.leads',
}

const defaultCustomerProfile = {
  name: 'Sai Kiran',
  mobile: '+91 98765 43210',
  email: 'saikiran@example.com',
  city: 'Hyderabad',
  avatar: '',
  memberSince: 'May 2026',
}

const defaultWorkerProfile = {
  name: 'Ravi Teja',
  mobile: '+91 91234 56789',
  idNumber: 'TS-ID-4821',
  city: 'Hyderabad',
  skill: 'Electrical',
  experienceYears: 4,
  education: 'ITI Electrician',
  certificateName: 'ITI certificate.pdf',
  experienceDocumentName: 'Apartment maintenance reference.pdf',
  previousEmployer: 'MetroCare Facility Services',
  referenceContact: '+91 90000 12345',
  skillTestScore: 84,
  completedOrders: 118,
  rating: 4.7,
  complaints: 2,
  avatar: '',
  trustScore: 78,
  studyScore: 82,
  documentScore: 86,
  previousWorkScore: 78,
  trialScore: 74,
  ratingScore: 71,
}

const skillOptions = [
  'Electrical',
  'Plumbing',
  'AC',
  'Carpentry',
  'Appliance',
  'Painting',
  'Multi-Skill',
]

const smartServiceStrip = [
  'Electric switch problem?',
  'Leakage repair?',
  'AC not cooling?',
  'Fan installation?',
]

function readStorage(key, fallbackValue) {
  if (typeof window === 'undefined') {
    return fallbackValue
  }

  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallbackValue
  } catch {
    return fallbackValue
  }
}

function getRouteFromHash() {
  if (typeof window === 'undefined') {
    return '/customer'
  }

  const rawHash = window.location.hash.replace(/^#/, '')
  return rawHash ? (rawHash.startsWith('/') ? rawHash : `/${rawHash}`) : '/customer'
}

function formatDisplayDate(value = new Date()) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function getInitials(name = '') {
  const parts = name.trim().split(' ').filter(Boolean).slice(0, 2)
  return parts.length ? parts.map((part) => part[0].toUpperCase()).join('') : 'WV'
}

function createId(prefix) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}${Math.random()
    .toString(36)
    .slice(2, 5)
    .toUpperCase()}`
}

function sortJobsByDistance(jobs) {
  return [...jobs].sort((left, right) => Number(left.distanceKm) - Number(right.distanceKm))
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Could not read the selected image.'))
    reader.readAsDataURL(file)
  })
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported on this device.'))
      return
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 12000,
    })
  })
}

async function reverseGeocode(latitude, longitude) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
  )

  if (!response.ok) {
    throw new Error('Unable to fetch the current address.')
  }

  const data = await response.json()
  const address = data.address ?? {}
  const locality =
    address.suburb ||
    address.neighbourhood ||
    address.city_district ||
    address.town ||
    address.village ||
    ''
  const city = address.city || address.town || address.state_district || address.state || ''
  const country = address.country || 'India'
  const parts = [locality, city, country].filter(Boolean)

  return parts.length ? parts.join(', ') : `Lat ${latitude.toFixed(4)}, Lon ${longitude.toFixed(4)}`
}

function numberFromAmount(value) {
  if (typeof value === 'number') {
    return value
  }

  const normalized = String(value ?? '').replace(/[^\d.-]/g, '')
  return Number(normalized) || 0
}

function formatCurrency(value) {
  const amount = numberFromAmount(value)
  const sign = amount < 0 ? '-' : ''
  return `${sign}Rs. ${Math.abs(Math.round(amount)).toLocaleString('en-IN')}`
}

function getServiceConfig(name) {
  return serviceCategories.find((service) => service.name === name) ?? serviceCategories[0]
}

function getDifficultyConfig(id) {
  return difficultyTags.find((difficulty) => difficulty.id === id) ?? difficultyTags[1]
}

function getMaterialConfig(id) {
  return materialOptions.find((material) => material.id === id) ?? materialOptions[1]
}

function roundToTen(value) {
  return Math.round(value / 10) * 10
}

function getCommissionBreakdown(total) {
  const gross = numberFromAmount(total)
  const platformFee = Math.round(gross * 0.05)
  return {
    gross,
    platformFee,
    workerPayout: gross - platformFee,
  }
}

function buildEstimate({ serviceName, difficultyId, slotId, emergency, materialId, distanceKm }) {
  const service = getServiceConfig(serviceName)
  const difficulty = getDifficultyConfig(difficultyId)
  const material = getMaterialConfig(materialId)
  const slot = arrivalSlots.find((item) => item.id === slotId) ?? arrivalSlots[0]
  const distance = Number(distanceKm) || 0
  const labor = roundToTen(service.baseLabor * difficulty.multiplier)
  const materials = roundToTen(service.materialHint * material.multiplier * difficulty.multiplier)
  const travelFee = distance > 8 ? Math.min(420, roundToTen((distance - 5) * 18)) : distance > 5 ? 80 : 0
  const urgencyFee = slot.urgencyFee + (emergency ? 220 : 0)
  const total = roundToTen(service.inspectionFee + labor + materials + travelFee + urgencyFee)

  return {
    total,
    warrantyDays: service.warrantyDays,
    lineItems: [
      { label: 'Inspection and visit', amount: service.inspectionFee },
      { label: `${difficulty.label} job labor`, amount: labor },
      { label: material.label, amount: materials },
      { label: 'Travel and priority fee', amount: travelFee + urgencyFee },
    ],
  }
}

function matchWorkers(serviceName, difficultyId, location) {
  const difficulty = getDifficultyConfig(difficultyId)
  const distance = Number(location?.distanceKm) || 0

  return workerDirectory
    .filter((worker) => worker.domain === serviceName)
    .map((worker) => {
      const nearbyBoost = Math.max(0, 22 - Math.abs(worker.distanceKm - Math.min(distance, 12)) * 2)
      const gateBoost = worker.trustScore >= difficulty.trustGate ? 14 : -18
      const matchScore =
        worker.trustScore * 0.45 +
        worker.rating * 8 +
        worker.experienceYears * 2 +
        nearbyBoost +
        gateBoost

      return {
        ...worker,
        matchScore: Math.round(matchScore),
        eligible: worker.trustScore >= difficulty.trustGate,
      }
    })
    .sort((left, right) => {
      if (Number(right.eligible) !== Number(left.eligible)) {
        return Number(right.eligible) - Number(left.eligible)
      }

      return right.matchScore - left.matchScore
    })
}

function getProgressForStatus(status) {
  const progressMap = {
    Scheduled: 18,
    'Worker assigned': 32,
    Accepted: 42,
    'On the way': 68,
    'Approval needed': 74,
    'Approved after inspection': 82,
    'Revised lower estimate': 82,
    Completed: 100,
  }

  return progressMap[status] ?? 24
}

function normalizeOrders(orders) {
  return orders.map((order) => {
    const estimateTotal = numberFromAmount(order.estimateTotal ?? order.total)
    const finalTotal =
      order.finalTotal === null || order.finalTotal === undefined
        ? null
        : numberFromAmount(order.finalTotal)
    const billTotal = finalTotal ?? estimateTotal
    const commission = getCommissionBreakdown(billTotal)

    return {
      ...order,
      problemDescription: order.problemDescription ?? order.notes ?? order.issue,
      difficulty: order.difficulty ?? 'medium',
      paymentMode: order.paymentMode ?? 'Online',
      paymentStatus: order.paymentStatus ?? (order.status === 'Completed' ? 'Paid' : 'Pending'),
      estimateTotal,
      finalTotal,
      platformFee: numberFromAmount(order.platformFee) || (order.status === 'Completed' ? commission.platformFee : 0),
      workerPayout: numberFromAmount(order.workerPayout) || (order.status === 'Completed' ? commission.workerPayout : 0),
      warrantyDays: order.warrantyDays ?? getServiceConfig(order.service).warrantyDays,
      summary: order.summary ?? 'Service summary will appear after completion.',
      lineItems: (order.lineItems ?? []).map((item) => ({
        ...item,
        amount: numberFromAmount(item.amount),
      })),
    }
  })
}

function normalizeWorkerProfile(profile) {
  const merged = { ...defaultWorkerProfile, ...profile }
  const experienceYears =
    Number(merged.experienceYears) || Number.parseInt(String(merged.experience ?? '1'), 10) || 1

  return {
    ...merged,
    experienceYears,
    trustScore: Number(merged.trustScore) || calculatePartnerTrust(merged).trustScore,
  }
}

function calculatePartnerTrust(profile) {
  const experienceYears = Number(profile.experienceYears) || 0
  const studyScore = profile.education ? Math.min(95, 55 + experienceYears * 5) : 20
  const documentScore = profile.idNumber && profile.certificateName ? 86 : profile.idNumber ? 55 : 20
  const previousWorkScore = profile.previousEmployer ? Math.min(92, 45 + experienceYears * 8) : 30
  const trialScore = Number(profile.completedOrders) > 25 ? 78 : Number(profile.completedOrders) > 5 ? 58 : 42
  const ratingScore = Math.round((Number(profile.rating) || 4.2) * 18)
  const trustScore = Math.round(
    (studyScore + documentScore + previousWorkScore + trialScore + ratingScore) / 5,
  )

  return {
    trustScore,
    studyScore,
    documentScore,
    previousWorkScore,
    trialScore,
    ratingScore,
  }
}

function getTrustBand(score) {
  if (score >= 88) {
    return 'Top trusted'
  }

  if (score >= 72) {
    return 'Verified pro'
  }

  if (score >= 58) {
    return 'Growing trust'
  }

  return 'Starter jobs'
}

function getAccessibleDifficulties(trustScore) {
  return difficultyTags.filter((difficulty) => trustScore >= difficulty.trustGate)
}

function App() {
  const [route, setRoute] = useState(getRouteFromHash)
  const [customerSession, setCustomerSession] = useState(() =>
    readStorage(STORAGE_KEYS.customerSession, false),
  )
  const [workerSession, setWorkerSession] = useState(() =>
    readStorage(STORAGE_KEYS.workerSession, false),
  )
  const [customerProfile, setCustomerProfile] = useState(() =>
    readStorage(STORAGE_KEYS.customerProfile, defaultCustomerProfile),
  )
  const [workerProfile, setWorkerProfile] = useState(() =>
    normalizeWorkerProfile(readStorage(STORAGE_KEYS.workerProfile, defaultWorkerProfile)),
  )
  const [savedLocations, setSavedLocations] = useState(() =>
    readStorage(STORAGE_KEYS.savedLocations, initialLocations),
  )
  const [selectedLocation, setSelectedLocation] = useState(() =>
    readStorage(STORAGE_KEYS.selectedLocation, initialLocations[0]),
  )
  const [recipientContact, setRecipientContact] = useState(() =>
    readStorage(STORAGE_KEYS.recipientContact, {
      mode: 'self',
      name: defaultCustomerProfile.name,
      mobile: defaultCustomerProfile.mobile,
      relation: 'Self',
    }),
  )
  const [orders, setOrders] = useState(() =>
    normalizeOrders(readStorage(STORAGE_KEYS.orders, initialOrders)),
  )
  const [language, setLanguage] = useState(() => readStorage(STORAGE_KEYS.language, 'English'))
  const [feedbackEntries, setFeedbackEntries] = useState(() =>
    readStorage(STORAGE_KEYS.feedbackEntries, []),
  )
  const [complaintEntries, setComplaintEntries] = useState(() =>
    readStorage(STORAGE_KEYS.complaintEntries, adminComplaints),
  )
  const [workerLeads, setWorkerLeads] = useState(() =>
    readStorage(STORAGE_KEYS.workerLeads, []),
  )

  useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = '/customer'
    }

    const handleHashChange = () => setRoute(getRouteFromHash())
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    const title = route.startsWith('/admin')
      ? 'Workven Admin'
      : route.startsWith('/worker') || route.startsWith('/partner')
        ? 'Workven Worker'
        : 'Workven'
    document.title = title
  }, [route])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.customerSession, JSON.stringify(customerSession))
  }, [customerSession])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.workerSession, JSON.stringify(workerSession))
  }, [workerSession])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.customerProfile, JSON.stringify(customerProfile))
  }, [customerProfile])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.workerProfile, JSON.stringify(workerProfile))
  }, [workerProfile])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.savedLocations, JSON.stringify(savedLocations))
  }, [savedLocations])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.selectedLocation, JSON.stringify(selectedLocation))
  }, [selectedLocation])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.recipientContact, JSON.stringify(recipientContact))
  }, [recipientContact])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders))
  }, [orders])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.language, JSON.stringify(language))
  }, [language])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.feedbackEntries, JSON.stringify(feedbackEntries))
  }, [feedbackEntries])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.complaintEntries, JSON.stringify(complaintEntries))
  }, [complaintEntries])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.workerLeads, JSON.stringify(workerLeads))
  }, [workerLeads])

  const navigate = (nextRoute) => {
    window.location.hash = nextRoute
  }

  const portal = route.startsWith('/admin')
    ? 'admin'
    : route.startsWith('/worker') || route.startsWith('/partner')
      ? 'worker'
      : 'customer'

  return (
    <div className="app-shell">
      {portal === 'admin' ? (
        <AdminDashboard
          orders={orders}
          complaintEntries={complaintEntries}
          setComplaintEntries={setComplaintEntries}
          workerProfile={workerProfile}
        />
      ) : portal === 'worker' ? (
        <WorkerPortal
          workerSession={workerSession}
          setWorkerSession={setWorkerSession}
          workerProfile={workerProfile}
          setWorkerProfile={setWorkerProfile}
          workerLeads={workerLeads}
        />
      ) : (
        <CustomerPortal
          route={route}
          navigate={navigate}
          customerSession={customerSession}
          setCustomerSession={setCustomerSession}
          customerProfile={customerProfile}
          setCustomerProfile={setCustomerProfile}
          savedLocations={savedLocations}
          setSavedLocations={setSavedLocations}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          recipientContact={recipientContact}
          setRecipientContact={setRecipientContact}
          orders={orders}
          setOrders={setOrders}
          language={language}
          setLanguage={setLanguage}
          feedbackEntries={feedbackEntries}
          setFeedbackEntries={setFeedbackEntries}
          complaintEntries={complaintEntries}
          setComplaintEntries={setComplaintEntries}
          setWorkerLeads={setWorkerLeads}
        />
      )}
    </div>
  )
}

function CustomerPortal({
  route,
  navigate,
  customerSession,
  setCustomerSession,
  customerProfile,
  setCustomerProfile,
  savedLocations,
  setSavedLocations,
  selectedLocation,
  setSelectedLocation,
  recipientContact,
  setRecipientContact,
  orders,
  setOrders,
  language,
  setLanguage,
  feedbackEntries,
  setFeedbackEntries,
  complaintEntries,
  setComplaintEntries,
  setWorkerLeads,
}) {
  if (!customerSession) {
    return (
      <CustomerLogin
        customerProfile={customerProfile}
        setCustomerProfile={setCustomerProfile}
        setCustomerSession={setCustomerSession}
        setRecipientContact={setRecipientContact}
      />
    )
  }

  if (route === '/customer/profile') {
    return (
      <CustomerProfilePage
        customerProfile={customerProfile}
        setCustomerProfile={setCustomerProfile}
        selectedLocation={selectedLocation}
        savedLocations={savedLocations}
        recipientContact={recipientContact}
        orders={orders}
        setOrders={setOrders}
        language={language}
        setLanguage={setLanguage}
        feedbackEntries={feedbackEntries}
        setFeedbackEntries={setFeedbackEntries}
        complaintEntries={complaintEntries}
        setComplaintEntries={setComplaintEntries}
        navigate={navigate}
        setCustomerSession={setCustomerSession}
      />
    )
  }

  return (
    <CustomerDashboard
      customerProfile={customerProfile}
      selectedLocation={selectedLocation}
      setSelectedLocation={setSelectedLocation}
      savedLocations={savedLocations}
      setSavedLocations={setSavedLocations}
      recipientContact={recipientContact}
      setRecipientContact={setRecipientContact}
      orders={orders}
      setOrders={setOrders}
      navigate={navigate}
      setWorkerLeads={setWorkerLeads}
      setCustomerSession={setCustomerSession}
    />
  )
}

function CustomerLogin({
  customerProfile,
  setCustomerProfile,
  setCustomerSession,
  setRecipientContact,
}) {
  const [form, setForm] = useState({
    name: customerProfile.name,
    mobile: customerProfile.mobile,
    email: customerProfile.email,
    city: customerProfile.city,
  })
  const [otpCode, setOtpCode] = useState('')
  const [otpInput, setOtpInput] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSendOtp = () => {
    const code = String(Math.floor(100000 + Math.random() * 900000))
    setOtpCode(code)
    setOtpInput(code)
    setErrorMessage('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!otpCode || otpInput !== otpCode) {
      setErrorMessage('Enter the demo OTP before continuing.')
      return
    }

    setCustomerProfile((current) => ({
      ...current,
      ...form,
    }))

    setRecipientContact({
      mode: 'self',
      name: form.name,
      mobile: form.mobile,
      relation: 'Self',
    })

    setCustomerSession(true)
  }

  return (
    <main className="portal-page portal-page--hero">
      <section className="login-layout">
        <div className="login-copy">
          <p className="eyebrow">Customer app</p>
          <h2>Book verified home experts with transparent estimates.</h2>
          <p>
            Choose a domain, compare nearby workers, approve any scope change, track
            arrival, pay online or cash, and receive a warranty-backed invoice.
          </p>

          <div className="login-visual" aria-label="Booking flow preview">
            <div className="visual-route">
              <span />
              <span />
              <span />
            </div>
            <div className="visual-card visual-card--top">
              <strong>Verified worker</strong>
              <small>Trust score 91</small>
            </div>
            <div className="visual-card visual-card--bottom">
              <strong>Estimate before booking</strong>
              <small>Approval needed for increase</small>
            </div>
          </div>
        </div>

        <form className="panel form-card" onSubmit={handleSubmit}>
          <div className="section-heading">
            <div>
              <p className="eyebrow">OTP login</p>
              <h3>Customer details</h3>
            </div>
          </div>

          <label className="field">
            <span>Name</span>
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Enter your full name"
              required
            />
          </label>

          <label className="field">
            <span>Mobile number</span>
            <input
              type="tel"
              value={form.mobile}
              onChange={(event) =>
                setForm((current) => ({ ...current, mobile: event.target.value }))
              }
              placeholder="+91 98765 43210"
              required
            />
          </label>

          <div className="field-row">
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                placeholder="name@example.com"
              />
            </label>
            <label className="field">
              <span>City</span>
              <input
                type="text"
                value={form.city}
                onChange={(event) =>
                  setForm((current) => ({ ...current, city: event.target.value }))
                }
                placeholder="Hyderabad"
              />
            </label>
          </div>

          <div className="field-row">
            <button type="button" className="secondary-button" onClick={handleSendOtp}>
              Send OTP
            </button>
            <label className="field">
              <span>OTP</span>
              <input
                type="text"
                value={otpInput}
                onChange={(event) => setOtpInput(event.target.value)}
                placeholder="6 digit OTP"
                required
              />
            </label>
          </div>

          {otpCode ? <p className="info-note">Demo OTP generated: {otpCode}</p> : null}
          {errorMessage ? <p className="error-note">{errorMessage}</p> : null}

          <button type="submit" className="primary-button">
            Enter customer app
          </button>
        </form>
      </section>
    </main>
  )
}

function CustomerDashboard({
  customerProfile,
  selectedLocation,
  setSelectedLocation,
  savedLocations,
  setSavedLocations,
  recipientContact,
  setRecipientContact,
  orders,
  setOrders,
  navigate,
  setWorkerLeads,
  setCustomerSession,
}) {
  const [searchQuery, setSearchQuery] = useState('Electrical repair')
  const [selectedService, setSelectedService] = useState('Electrical')
  const [repairIssue, setRepairIssue] = useState('Switch board sparking')
  const [problemDescription, setProblemDescription] = useState(
    'The switch board sparks when the kitchen chimney is turned on.',
  )
  const [difficultyId, setDifficultyId] = useState('medium')
  const [materialId, setMaterialId] = useState('standard')
  const [bookingMode, setBookingMode] = useState('instant')
  const [timeSlotId, setTimeSlotId] = useState(arrivalSlots[0].id)
  const [emergency, setEmergency] = useState(false)
  const [paymentMode, setPaymentMode] = useState('Online')
  const [selectedWorkerId, setSelectedWorkerId] = useState('')
  const [locationPanelOpen, setLocationPanelOpen] = useState(false)
  const [locationSearch, setLocationSearch] = useState('')
  const [locationState, setLocationState] = useState({
    loading: false,
    error: '',
    candidate: null,
  })
  const [manualLocation, setManualLocation] = useState({
    label: '',
    address: '',
    city: '',
    distanceKm: 6,
  })
  const [pendingFarLocation, setPendingFarLocation] = useState(null)
  const [contactDraft, setContactDraft] = useState({
    name: '',
    mobile: '',
    relation: 'Family',
  })
  const [contactMode, setContactMode] = useState('self')
  const [bookingMessage, setBookingMessage] = useState('')
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [showAddress, setShowAddress] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      setShowAddress(window.scrollY < 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const repairs = repairCatalog[selectedService] ?? []
  const selectedSlot = arrivalSlots.find((slot) => slot.id === timeSlotId) ?? arrivalSlots[0]
  const completedOrdersList = orders.filter((order) => order.status === 'Completed')
  const recentBookings = completedOrdersList.slice(0, 4)
  const bookingSteps = ['Select domain', 'Choose issue type', 'Add details', 'Estimate', 'Confirm booking']
  const currentBookingStep = 2
  const suggestions = serviceSuggestions.filter((item) =>
    item.toLowerCase().includes(searchQuery.toLowerCase()),
  )
  const matchedWorkers = useMemo(
    () => matchWorkers(selectedService, difficultyId, selectedLocation),
    [difficultyId, selectedLocation, selectedService],
  )
  const selectedWorker =
    matchedWorkers.find((worker) => worker.id === selectedWorkerId) ?? matchedWorkers[0]
  const estimate = useMemo(
    () =>
      buildEstimate({
        serviceName: selectedService,
        difficultyId,
        slotId: timeSlotId,
        emergency,
        materialId,
        distanceKm: selectedLocation.distanceKm,
      }),
    [difficultyId, emergency, materialId, selectedLocation.distanceKm, selectedService, timeSlotId],
  )
  const activeOrder =
    orders.find((order) => order.status !== 'Completed') ?? orders.find(Boolean) ?? null
  const matchingLocations = savedLocations.filter((location) => {
    const target = `${location.label} ${location.address} ${location.city}`.toLowerCase()
    return target.includes(locationSearch.toLowerCase())
  })

  const handleSuggestionSelect = (suggestion) => {
    setSearchQuery(suggestion)

    const matchedService = serviceCategories.find((service) =>
      suggestion.toLowerCase().includes(service.name.toLowerCase()),
    )

    if (matchedService) {
      setSelectedService(matchedService.name)
      setRepairIssue(repairCatalog[matchedService.name][0])
    }
  }

  const handleServiceSelect = (serviceName) => {
    setSelectedService(serviceName)
    setRepairIssue(repairCatalog[serviceName][0])
    setSearchQuery(`${serviceName} repair`)
  }

  const applyLocation = (location, nextRecipientContact) => {
    setSelectedLocation(location)
    setRecipientContact(nextRecipientContact)
    setPendingFarLocation(null)
    setLocationPanelOpen(false)
  }

  const handleLocationSelect = (location) => {
    if (Number(location.distanceKm) > 20) {
      setPendingFarLocation(location)
      setContactMode('self')
      setContactDraft({
        name: '',
        mobile: '',
        relation: 'Family',
      })
      return
    }

    applyLocation(location, {
      mode: 'self',
      name: customerProfile.name,
      mobile: customerProfile.mobile,
      relation: 'Self',
    })
  }

  const handleCurrentLocation = async () => {
    setLocationState({
      loading: true,
      error: '',
      candidate: null,
    })

    try {
      const position = await getCurrentPosition()
      const latitude = position.coords.latitude
      const longitude = position.coords.longitude
      const address = await reverseGeocode(latitude, longitude)

      setLocationState({
        loading: false,
        error: '',
        candidate: {
          id: createId('current'),
          label: 'Current location',
          address,
          city: customerProfile.city,
          distanceKm: 0.6,
        },
      })
    } catch (error) {
      setLocationState({
        loading: false,
        error:
          error.message ||
          'We could not fetch the current location. Please allow location access.',
        candidate: null,
      })
    }
  }

  const handleCurrentLocationChoice = (shouldSave) => {
    if (!locationState.candidate) {
      return
    }

    const candidate = locationState.candidate

    if (shouldSave) {
      const savedVersion = {
        ...candidate,
        label: `Saved ${savedLocations.length + 1}`,
      }
      setSavedLocations((current) => [savedVersion, ...current])
      setSelectedLocation(savedVersion)
    } else {
      setSelectedLocation(candidate)
    }

    setRecipientContact({
      mode: 'self',
      name: customerProfile.name,
      mobile: customerProfile.mobile,
      relation: 'Self',
    })
    setLocationState({
      loading: false,
      error: '',
      candidate: null,
    })
    setLocationPanelOpen(false)
  }

  const handleManualLocationSave = (event) => {
    event.preventDefault()

    const newLocation = {
      id: createId('loc'),
      label: manualLocation.label || 'Manual location',
      address: manualLocation.address,
      city: manualLocation.city || customerProfile.city,
      distanceKm: Number(manualLocation.distanceKm) || 8,
    }

    setSavedLocations((current) => [newLocation, ...current])
    setSelectedLocation(newLocation)
    setRecipientContact({
      mode: 'self',
      name: customerProfile.name,
      mobile: customerProfile.mobile,
      relation: 'Self',
    })
    setManualLocation({
      label: '',
      address: '',
      city: '',
      distanceKm: 6,
    })
    setLocationPanelOpen(false)
  }

  const handleFarLocationConfirm = (event) => {
    event.preventDefault()

    if (!pendingFarLocation) {
      return
    }

    const nextRecipientContact =
      contactMode === 'self'
        ? {
          mode: 'self',
          name: customerProfile.name,
          mobile: customerProfile.mobile,
          relation: 'Self',
        }
        : {
          mode: 'guest',
          name: contactDraft.name,
          mobile: contactDraft.mobile,
          relation: contactDraft.relation,
        }

    applyLocation(pendingFarLocation, nextRecipientContact)
  }

  const handleBooking = (event) => {
    event.preventDefault()

    if (!selectedWorker) {
      setBookingMessage('No verified worker is available for this domain right now.')
      return
    }

    const orderId = createId('WV')
    const commission = getCommissionBreakdown(estimate.total)
    const nextOrder = {
      id: orderId,
      invoiceNumber: `INV-${orderId}`,
      service: selectedService,
      issue: repairIssue || searchQuery,
      problemDescription,
      difficulty: difficultyId,
      status: bookingMode === 'instant' ? 'Worker assigned' : 'Scheduled',
      arrivalWindow: selectedSlot.label,
      workerId: selectedWorker.id,
      workerName: selectedWorker.name,
      workerTrustScore: selectedWorker.trustScore,
      address: selectedLocation.address,
      paymentMode,
      paymentStatus: paymentMode === 'Online' ? 'Authorized' : 'Pending cash',
      estimateTotal: estimate.total,
      finalTotal: null,
      platformFee: 0,
      workerPayout: 0,
      warrantyDays: estimate.warrantyDays,
      summary: 'Worker will inspect the issue before final work starts.',
      lineItems: estimate.lineItems,
      emergency,
    }

    setOrders((current) => [nextOrder, ...current])
    setWorkerLeads((current) =>
      sortJobsByDistance([
        {
          id: createId('JOB'),
          service: selectedService,
          issue: repairIssue || searchQuery,
          customerName: recipientContact.name,
          locationLabel: selectedLocation.label,
          address: selectedLocation.address,
          distanceKm: Math.max(1, Number(selectedLocation.distanceKm) || 3),
          arrivalWindow: selectedSlot.label,
          priority: Number(selectedLocation.distanceKm) <= 5 ? 'Nearby first' : 'Next circle',
          status: 'New',
          difficulty: difficultyId,
          estimateTotal: estimate.total,
          paymentMode,
          workerPayout: commission.workerPayout,
        },
        ...current,
      ]),
    )
    setBookingMessage(
      `${selectedService} booking confirmed with ${selectedWorker.name}. Estimated bill: ${formatCurrency(
        estimate.total,
      )}.`,
    )
  }

  const updateOrderAfterInspection = (orderId, direction) => {
    setOrders((current) =>
      current.map((order) => {
        if (order.id !== orderId) {
          return order
        }

        const currentTotal = order.finalTotal ?? order.estimateTotal

        if (direction === 'smaller') {
          const revisedTotal = Math.max(299, roundToTen(currentTotal * 0.78))
          return {
            ...order,
            status: 'Revised lower estimate',
            finalTotal: revisedTotal,
            summary: 'Inspection found the issue was smaller than expected. Price reduced.',
            lineItems: [
              ...order.lineItems.filter((item) => item.label !== 'Inspection reduction'),
              { label: 'Inspection reduction', amount: revisedTotal - currentTotal },
            ],
          }
        }

        const proposedTotal = roundToTen(currentTotal * 1.24)
        return {
          ...order,
          status: 'Approval needed',
          scopeChange: {
            proposedTotal,
            reason: 'Worker found additional work after inspection.',
            approved: false,
          },
        }
      }),
    )
  }

  const approveScopeChange = (orderId) => {
    setOrders((current) =>
      current.map((order) => {
        if (order.id !== orderId || !order.scopeChange) {
          return order
        }

        return {
          ...order,
          status: 'Approved after inspection',
          finalTotal: order.scopeChange.proposedTotal,
          scopeChange: {
            ...order.scopeChange,
            approved: true,
          },
          summary: 'Customer approved the expanded scope after inspection.',
          lineItems: [
            ...order.lineItems.filter((item) => item.label !== 'Approved added scope'),
            {
              label: 'Approved added scope',
              amount: order.scopeChange.proposedTotal - order.estimateTotal,
            },
          ],
        }
      }),
    )
  }

  const completeOrder = (orderId) => {
    setOrders((current) =>
      current.map((order) => {
        if (order.id !== orderId) {
          return order
        }

        const finalTotal = order.finalTotal ?? order.estimateTotal
        const commission = getCommissionBreakdown(finalTotal)

        return {
          ...order,
          status: 'Completed',
          finalTotal,
          paymentStatus: order.paymentMode === 'Online' ? 'Paid' : 'Cash collected',
          platformFee: commission.platformFee,
          workerPayout: commission.workerPayout,
          summary:
            order.summary === 'Worker will inspect the issue before final work starts.'
              ? 'Service completed, photos verified and invoice generated.'
              : order.summary,
        }
      }),
    )
  }

  return (
    <main className="portal-page">
      <section className="customer-home">
        
        {/* Address at the top of the header that hides on scroll */}
        {showAddress && (
          <div className="address-bar-top" style={{ padding: '12px 14px', background: '#fff' }}>
            <button
              type="button"
              className="location-button"
              onClick={() => setLocationPanelOpen(true)}
              style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
            >
              <span className="eyebrow">Location</span>
              <strong>{selectedLocation.label}</strong>
              <small>{selectedLocation.address}</small>
            </button>
          </div>
        )}

        <div className="mobile-home-header panel" style={{ flexDirection: 'column', alignItems: 'stretch', position: 'sticky', top: 0, zIndex: 50, borderRadius: showAddress ? '0 0 16px 16px' : '0 0 16px 16px', borderTop: showAddress ? '1px solid var(--border)' : 'none', margin: 0 }}>
          <div className="header-top-row">
            <div className="header-left">
              <div className="logo-placeholder">
                <h2 style={{ margin: 0 }}>Workven</h2>
              </div>
            </div>

            <div className="header-search">
              <input
                type="text"
                className="search-input"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search for services..."
              />
            </div>

            <div className="header-right" style={{ position: 'relative' }}>
              <button
                type="button"
                className="profile-button"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                aria-label="Open profile"
              >
                <Avatar profile={customerProfile} size="md" />
              </button>
              
              {profileMenuOpen && (
                <div className="profile-dropdown">
                  <button onClick={() => navigate('/customer/profile')}>Profile Settings</button>
                  <button onClick={() => navigate('/customer/profile#orders')}>Orders</button>
                  <button onClick={() => navigate('/customer/profile#themes')}>Themes</button>
                  <hr />
                  <button className="danger-text" onClick={() => setCustomerSession(false)}>Logout</button>
                </div>
              )}
            </div>
          </div>


        </div>

        <section className="hero-band hero-band--compact">
          <div>
            <p className="eyebrow">Trusted service at home</p>
            <h2>Start your booking in 4 smart steps</h2>
            <p>
              Select a domain, choose the exact issue, add details, and get a clear estimate before you confirm.
            </p>
          </div>

          <div className="hero-quickstats">
            <div>
              <strong>{recipientContact.name}</strong>
              <span>Primary contact</span>
            </div>
            <div>
              <strong>{selectedSlot.label}</strong>
              <span>Best available window</span>
            </div>
            <div>
              <strong>{formatCurrency(estimate.total)}</strong>
              <span>Current estimate</span>
            </div>
          </div>
        </section>

        <section className="experience-strip">
          <div className="experience-item">
            <span className="badge badge--success">Verified workers</span>
            <strong>Safety & trust badge</strong>
            <p>Every worker is screened, rated and matched with your issue.</p>
          </div>
          <div className="experience-item">
            <span className="badge badge--accent">Offer today</span>
            <strong>Up to 12% off</strong>
            <p>Selected services get priority dispatch and reduced platform fees.</p>
          </div>
          <div className="experience-item">
            <span className="badge badge--soft">Premium UX</span>
            <strong>Faster booking flow</strong>
            <p>Smart suggestions and worker cards speed up your choice.</p>
          </div>
        </section>

        <section className="suggestion-strip panel">
          <p className="eyebrow">Quick service suggestions</p>
          <div className="suggestion-chip-row">
            {smartServiceStrip.map((hint) => (
              <button
                key={hint}
                type="button"
                className="suggestion-chip"
                onClick={() => handleSuggestionSelect(hint)}
              >
                {hint}
              </button>
            ))}
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="dashboard-main">
            <section className="panel app-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Service domain</p>
                  <h3>Select the work category</h3>
                </div>
              </div>

              {/* Search input moved to header */}

              {searchQuery ? (
                <div className="suggestion-list">
                  {suggestions.slice(0, 6).map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      className="suggestion-item"
                      onClick={() => handleSuggestionSelect(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="service-grid">
                {serviceCategories.map((service) => (
                  <button
                    key={service.name}
                    type="button"
                    className={
                      selectedService === service.name
                        ? 'service-card service-card--active'
                        : 'service-card'
                    }
                    onClick={() => handleServiceSelect(service.name)}
                  >
                    <span className="service-mark">{service.shortLabel}</span>
                    <strong>{service.name}</strong>
                    <small>{service.blurb}</small>
                    <span>{service.eta}</span>
                  </button>
                ))}
              </div>

              {recentBookings.length ? (
                <div className="book-again-panel">
                  <div className="section-heading">
                    <div>
                      <p className="eyebrow">Book again</p>
                      <h3>Repeat your recent services</h3>
                    </div>
                  </div>

                  <div className="book-again-grid">
                    {recentBookings.map((order) => (
                      <button
                        key={order.id}
                        type="button"
                        className="book-again-card"
                        onClick={() => {
                          setSelectedService(order.service)
                          setRepairIssue(order.issue)
                          setSearchQuery(`${order.service} repair`)
                        }}
                      >
                        <strong>{order.service}</strong>
                        <span>{order.issue}</span>
                        <small>{formatCurrency(order.finalTotal ?? order.estimateTotal)} • {order.arrivalWindow}</small>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>

            <form className="panel app-section" onSubmit={handleBooking}>
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Booking details</p>
                  <h3>Problem, schedule and payment</h3>
                </div>
              </div>

              <div className="booking-stepper">
                {bookingSteps.map((step, index) => (
                  <div key={step} className={index <= currentBookingStep ? 'step-pill step-pill--active' : 'step-pill'}>
                    <span>{index + 1}</span>
                    <strong>{step}</strong>
                  </div>
                ))}
              </div>

              <label className="field">
                <span>Issue type</span>
                <input
                  type="text"
                  value={repairIssue}
                  onChange={(event) => setRepairIssue(event.target.value)}
                  placeholder="Describe the problem title"
                  required
                />
              </label>

              <div className="quick-chip-list">
                {repairs.map((repair) => (
                  <button
                    key={repair}
                    type="button"
                    className={repairIssue === repair ? 'quick-chip quick-chip--active' : 'quick-chip'}
                    onClick={() => setRepairIssue(repair)}
                  >
                    {repair}
                  </button>
                ))}
              </div>

              <label className="field">
                <span>Problem description</span>
                <textarea
                  rows="4"
                  value={problemDescription}
                  onChange={(event) => setProblemDescription(event.target.value)}
                  placeholder="Example: The kitchen switch sparks only when the chimney is on."
                  required
                />
              </label>

              <div className="field-row field-row--three">
                <label className="field">
                  <span>Job difficulty</span>
                  <select value={difficultyId} onChange={(event) => setDifficultyId(event.target.value)}>
                    {difficultyTags.map((difficulty) => (
                      <option key={difficulty.id} value={difficulty.id}>
                        {difficulty.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Material expectation</span>
                  <select value={materialId} onChange={(event) => setMaterialId(event.target.value)}>
                    {materialOptions.map((material) => (
                      <option key={material.id} value={material.id}>
                        {material.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Payment</span>
                  <select value={paymentMode} onChange={(event) => setPaymentMode(event.target.value)}>
                    <option>Online</option>
                    <option>Cash after service</option>
                  </select>
                </label>
              </div>

              <div className="segmented-control">
                <button
                  type="button"
                  className={bookingMode === 'instant' ? 'segment segment--active' : 'segment'}
                  onClick={() => {
                    setBookingMode('instant')
                    setTimeSlotId('asap')
                  }}
                >
                  Book instantly
                </button>
                <button
                  type="button"
                  className={bookingMode === 'schedule' ? 'segment segment--active' : 'segment'}
                  onClick={() => setBookingMode('schedule')}
                >
                  Schedule later
                </button>
                <button
                  type="button"
                  className={emergency ? 'segment segment--active segment--danger' : 'segment'}
                  onClick={() => setEmergency((current) => !current)}
                >
                  Emergency
                </button>
              </div>

              <div className="slot-grid">
                {arrivalSlots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    className={timeSlotId === slot.id ? 'slot-card slot-card--active' : 'slot-card'}
                    onClick={() => {
                      setBookingMode(slot.id === 'asap' ? 'instant' : 'schedule')
                      setTimeSlotId(slot.id)
                    }}
                  >
                    <strong>{slot.label}</strong>
                    <small>{slot.caption}</small>
                  </button>
                ))}
              </div>

              <div className="booking-summary">
                <div>
                  <span>Address</span>
                  <strong>{selectedLocation.address}</strong>
                </div>
                <div>
                  <span>Contact</span>
                  <strong>
                    {recipientContact.name} | {recipientContact.mobile}
                  </strong>
                </div>
                <div>
                  <span>Warranty</span>
                  <strong>{estimate.warrantyDays} days after completion</strong>
                </div>
              </div>

              <button type="submit" className="primary-button">
                Confirm booking at {formatCurrency(estimate.total)}
              </button>

              {bookingMessage ? <p className="success-note">{bookingMessage}</p> : null}
            </form>

            <section className="panel app-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Nearby workers</p>
                  <h3>AI-ranked verified professionals</h3>
                </div>
              </div>

              <div className="worker-grid">
                {matchedWorkers.map((worker) => (
                  <button
                    key={worker.id}
                    type="button"
                    className={
                      selectedWorker?.id === worker.id
                        ? 'worker-card worker-card--active'
                        : 'worker-card'
                    }
                    onClick={() => setSelectedWorkerId(worker.id)}
                  >
                    <div className="worker-card__head">
                      <Avatar profile={worker} size="md" />
                      <div>
                        <strong>{worker.name}</strong>
                        <span>{worker.domain} specialist</span>
                      </div>
                    </div>
                    <div className="worker-meta">
                      <span>{worker.rating} rating</span>
                      <span>{worker.experienceYears} yrs exp</span>
                      <span>{worker.distanceKm} km</span>
                    </div>
                    <div className="trust-meter">
                      <span style={{ width: `${worker.trustScore}%` }} />
                    </div>
                    <div className="worker-meta">
                      <span>Trust {worker.trustScore}</span>
                      <span>{worker.verified ? 'Verified' : 'Reviewing'}</span>
                      <span>{worker.eligible ? 'Eligible' : 'Starter only'}</span>
                    </div>
                    <p>{worker.qualification}</p>
                    <small>{worker.recentWork}</small>
                    <div className="badge-row">
                      {worker.badges.map((badge) => (
                        <span key={`${worker.id}-${badge}`} className="badge">
                          {badge}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>

          <aside className="dashboard-side">
            <EstimateCard estimate={estimate} selectedWorker={selectedWorker} />
            <TrackingCard order={activeOrder} />
            <InspectionCard
              order={activeOrder}
              onSmaller={() => activeOrder && updateOrderAfterInspection(activeOrder.id, 'smaller')}
              onLarger={() => activeOrder && updateOrderAfterInspection(activeOrder.id, 'larger')}
              onApprove={() => activeOrder && approveScopeChange(activeOrder.id)}
              onComplete={() => activeOrder && completeOrder(activeOrder.id)}
            />
            <RecentOrders orders={orders} navigate={navigate} />
          </aside>
        </section>
      </section>

      {locationPanelOpen ? (
        <LocationModal
          selectedLocation={selectedLocation}
          locationSearch={locationSearch}
          setLocationSearch={setLocationSearch}
          matchingLocations={matchingLocations}
          handleLocationSelect={handleLocationSelect}
          handleCurrentLocation={handleCurrentLocation}
          locationState={locationState}
          handleCurrentLocationChoice={handleCurrentLocationChoice}
          manualLocation={manualLocation}
          setManualLocation={setManualLocation}
          handleManualLocationSave={handleManualLocationSave}
          pendingFarLocation={pendingFarLocation}
          contactMode={contactMode}
          setContactMode={setContactMode}
          contactDraft={contactDraft}
          setContactDraft={setContactDraft}
          handleFarLocationConfirm={handleFarLocationConfirm}
          onClose={() => setLocationPanelOpen(false)}
        />
      ) : null}
    </main>
  )
}

function EstimateCard({ estimate, selectedWorker }) {
  const commission = getCommissionBreakdown(estimate.total)

  return (
    <section className="panel app-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Estimate before booking</p>
          <h3>{formatCurrency(estimate.total)}</h3>
        </div>
      </div>

      <div className="invoice-line-items">
        {estimate.lineItems.map((item) => (
          <div key={item.label} className="invoice-line-item">
            <span>{item.label}</span>
            <strong>{formatCurrency(item.amount)}</strong>
          </div>
        ))}
      </div>

      <div className="invoice-total">
        <span>Estimated customer bill</span>
        <strong>{formatCurrency(estimate.total)}</strong>
      </div>

      <div className="detail-stack">
        <div className="detail-item">
          <span>Platform commission</span>
          <strong>5% from worker payout after completion</strong>
        </div>
        <div className="detail-item">
          <span>Worker net example</span>
          <strong>{formatCurrency(commission.workerPayout)} after {formatCurrency(commission.platformFee)} fee</strong>
        </div>
        <div className="detail-item">
          <span>Assigned profile</span>
          <strong>{selectedWorker ? `${selectedWorker.name} | Trust ${selectedWorker.trustScore}` : 'Select worker'}</strong>
        </div>
      </div>

      <p className="info-note">
        If inspection finds a smaller issue, the bill can go down. If scope expands,
        the worker must request approval before charging more.
      </p>
    </section>
  )
}

function TrackingCard({ order }) {
  if (!order) {
    return (
      <section className="panel app-section">
        <p className="info-note">Book a service to start live worker tracking.</p>
      </section>
    )
  }

  const progress = getProgressForStatus(order.status)

  return (
    <section className="panel app-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Live tracking</p>
          <h3>{order.workerName}</h3>
        </div>
        <span className="status-badge">{order.status}</span>
      </div>

      <div className="tracking-map" aria-label="Simulated worker route">
        <div className="tracking-road tracking-road--one" />
        <div className="tracking-road tracking-road--two" />
        <div className="tracking-home">Home</div>
        <div className="tracking-worker" style={{ left: `${Math.min(progress, 88)}%` }}>
          Pro
        </div>
      </div>

      <div className="progress-row">
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="detail-stack">
        <div className="detail-item">
          <span>Order</span>
          <strong>
            {order.id} | {order.issue}
          </strong>
        </div>
        <div className="detail-item">
          <span>Arrival</span>
          <strong>{order.arrivalWindow}</strong>
        </div>
      </div>
    </section>
  )
}

function InspectionCard({ order, onSmaller, onLarger, onApprove, onComplete }) {
  if (!order) {
    return null
  }

  return (
    <section className="panel app-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">After inspection</p>
          <h3>Estimate update</h3>
        </div>
      </div>

      {order.scopeChange ? (
        <p className="warning-note">
          Added scope requested: {formatCurrency(order.scopeChange.proposedTotal)}. Work
          can proceed only after customer approval.
        </p>
      ) : (
        <p className="info-note">
          Simulate the worker inspection result for the active order and see how the
          customer approval rule works.
        </p>
      )}

      <div className="button-grid">
        <button type="button" className="secondary-button" onClick={onSmaller}>
          Smaller issue
        </button>
        <button type="button" className="secondary-button" onClick={onLarger}>
          Scope increased
        </button>
        <button
          type="button"
          className="primary-button"
          onClick={onApprove}
          disabled={!order.scopeChange || order.scopeChange.approved}
        >
          Approve increase
        </button>
        <button type="button" className="primary-button" onClick={onComplete}>
          Complete service
        </button>
      </div>
    </section>
  )
}

function RecentOrders({ orders, navigate }) {
  return (
    <section className="panel app-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Booking history</p>
          <h3>Recent invoices</h3>
        </div>
      </div>

      <div className="order-list compact-order-list">
        {orders.slice(0, 3).map((order) => (
          <article key={order.id} className="invoice-card invoice-card--compact">
            <div className="invoice-head">
              <div>
                <strong>{order.service}</strong>
                <p>
                  {order.id} | {order.status}
                </p>
              </div>
              <span className="status-badge">
                {formatCurrency(order.finalTotal ?? order.estimateTotal)}
              </span>
            </div>
            <p>{order.issue}</p>
            <small>{order.arrivalWindow}</small>
          </article>
        ))}
      </div>

      <button type="button" className="secondary-button" onClick={() => navigate('/customer/profile')}>
        Open invoices and support
      </button>
    </section>
  )
}

function LocationModal({
  selectedLocation,
  locationSearch,
  setLocationSearch,
  matchingLocations,
  handleLocationSelect,
  handleCurrentLocation,
  locationState,
  handleCurrentLocationChoice,
  manualLocation,
  setManualLocation,
  handleManualLocationSave,
  pendingFarLocation,
  contactMode,
  setContactMode,
  contactDraft,
  setContactDraft,
  handleFarLocationConfirm,
  onClose,
}) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="modal-sheet"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <p className="eyebrow">Choose location</p>
            <h3>Saved and current addresses</h3>
          </div>
          <button type="button" className="ghost-button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="detail-item">
          <span>Selected address</span>
          <strong>{selectedLocation.address}</strong>
        </div>

        <label className="field">
          <span>Search saved locations</span>
          <input
            type="text"
            value={locationSearch}
            onChange={(event) => setLocationSearch(event.target.value)}
            placeholder="Search location, area or city"
          />
        </label>

        <div className="modal-actions-row">
          <button type="button" className="secondary-button" onClick={handleCurrentLocation}>
            Use current location
          </button>
        </div>

        {locationState.loading ? <p className="info-note">Fetching your current location...</p> : null}
        {locationState.error ? <p className="error-note">{locationState.error}</p> : null}

        {locationState.candidate ? (
          <div className="candidate-card">
            <strong>{locationState.candidate.address}</strong>
            <p>Save this current location for future bookings?</p>
            <div className="modal-actions-row">
              <button
                type="button"
                className="primary-button"
                onClick={() => handleCurrentLocationChoice(true)}
              >
                Save and use
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => handleCurrentLocationChoice(false)}
              >
                Use once
              </button>
            </div>
          </div>
        ) : null}

        <div className="saved-location-list">
          {matchingLocations.map((location) => (
            <button
              key={location.id}
              type="button"
              className="saved-location-card"
              onClick={() => handleLocationSelect(location)}
            >
              <div>
                <strong>{location.label}</strong>
                <p>{location.address}</p>
              </div>
              <span>{location.distanceKm} km</span>
            </button>
          ))}
        </div>

        <form className="panel form-card form-card--muted" onSubmit={handleManualLocationSave}>
          <div className="section-heading">
            <div>
              <p className="eyebrow">Manual location</p>
              <h3>Add a new address</h3>
            </div>
          </div>

          <label className="field">
            <span>Address label</span>
            <input
              type="text"
              value={manualLocation.label}
              onChange={(event) =>
                setManualLocation((current) => ({ ...current, label: event.target.value }))
              }
              placeholder="Home, Office, Parents"
            />
          </label>

          <label className="field">
            <span>Full address</span>
            <textarea
              rows="3"
              value={manualLocation.address}
              onChange={(event) =>
                setManualLocation((current) => ({ ...current, address: event.target.value }))
              }
              placeholder="Enter complete service address"
              required
            />
          </label>

          <div className="field-row">
            <label className="field">
              <span>City</span>
              <input
                type="text"
                value={manualLocation.city}
                onChange={(event) =>
                  setManualLocation((current) => ({ ...current, city: event.target.value }))
                }
                placeholder="City"
              />
            </label>
            <label className="field">
              <span>Distance in km</span>
              <input
                type="number"
                min="1"
                value={manualLocation.distanceKm}
                onChange={(event) =>
                  setManualLocation((current) => ({
                    ...current,
                    distanceKm: event.target.value,
                  }))
                }
                placeholder="6"
              />
            </label>
          </div>

          <button type="submit" className="primary-button">
            Save location
          </button>
        </form>

        {pendingFarLocation ? (
          <form className="panel form-card form-card--muted" onSubmit={handleFarLocationConfirm}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Far-away location</p>
                <h3>Confirm job contact</h3>
              </div>
            </div>

            <p>
              {pendingFarLocation.address} is outside the usual area. Use your own
              details or enter the contact who will receive the worker.
            </p>

            <div className="quick-chip-list">
              <button
                type="button"
                className={contactMode === 'self' ? 'quick-chip quick-chip--active' : 'quick-chip'}
                onClick={() => setContactMode('self')}
              >
                Use my details
              </button>
              <button
                type="button"
                className={contactMode === 'guest' ? 'quick-chip quick-chip--active' : 'quick-chip'}
                onClick={() => setContactMode('guest')}
              >
                Another person
              </button>
            </div>

            {contactMode === 'guest' ? (
              <div className="field-row field-row--three">
                <label className="field">
                  <span>Contact name</span>
                  <input
                    type="text"
                    value={contactDraft.name}
                    onChange={(event) =>
                      setContactDraft((current) => ({ ...current, name: event.target.value }))
                    }
                    required
                  />
                </label>
                <label className="field">
                  <span>Mobile number</span>
                  <input
                    type="tel"
                    value={contactDraft.mobile}
                    onChange={(event) =>
                      setContactDraft((current) => ({ ...current, mobile: event.target.value }))
                    }
                    required
                  />
                </label>
                <label className="field">
                  <span>Relation</span>
                  <input
                    type="text"
                    value={contactDraft.relation}
                    onChange={(event) =>
                      setContactDraft((current) => ({ ...current, relation: event.target.value }))
                    }
                  />
                </label>
              </div>
            ) : null}

            <button type="submit" className="primary-button">
              Use this location
            </button>
          </form>
        ) : null}
      </section>
    </div>
  )
}

function CustomerProfilePage({
  customerProfile,
  setCustomerProfile,
  selectedLocation,
  savedLocations,
  recipientContact,
  orders,
  setOrders,
  language,
  setLanguage,
  feedbackEntries,
  setFeedbackEntries,
  complaintEntries,
  setComplaintEntries,
  navigate,
  setCustomerSession,
}) {
  const [feedbackForm, setFeedbackForm] = useState({
    orderId: orders[0]?.id ?? '',
    rating: 5,
    comments: '',
    beforeImage: '',
    afterImage: '',
  })
  const [complaintForm, setComplaintForm] = useState({
    orderId: orders[0]?.id ?? '',
    reason: 'Service quality issue',
    details: '',
    requestedRefund: 0,
  })
  const [profileMessage, setProfileMessage] = useState('')

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const avatar = await fileToDataUrl(file)
    setCustomerProfile((current) => ({
      ...current,
      avatar,
    }))
  }

  const handleFeedbackImage = async (field, event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const image = await fileToDataUrl(file)
    setFeedbackForm((current) => ({
      ...current,
      [field]: image,
    }))
  }

  const handleFeedbackSubmit = (event) => {
    event.preventDefault()

    const feedbackEntry = {
      ...feedbackForm,
      id: createId('FDB'),
      createdAt: formatDisplayDate(),
    }

    setFeedbackEntries((current) => [feedbackEntry, ...current])
    setOrders((current) =>
      current.map((order) =>
        order.id === feedbackForm.orderId
          ? { ...order, feedbackSubmitted: true, customerRating: feedbackForm.rating }
          : order,
      ),
    )
    setFeedbackForm({
      orderId: orders[0]?.id ?? '',
      rating: 5,
      comments: '',
      beforeImage: '',
      afterImage: '',
    })
    setProfileMessage('Review saved with photo proof.')
  }

  const handleComplaintSubmit = (event) => {
    event.preventDefault()

    const order = orders.find((item) => item.id === complaintForm.orderId)
    const complaint = {
      id: createId('CMP'),
      orderId: complaintForm.orderId,
      customer: customerProfile.name,
      worker: order?.workerName ?? 'Assigned worker',
      reason: complaintForm.reason,
      details: complaintForm.details,
      requestedRefund: Number(complaintForm.requestedRefund) || 0,
      status: 'Refund review',
    }

    setComplaintEntries((current) => [complaint, ...current])
    setProfileMessage('Complaint submitted to admin support.')
    setComplaintForm({
      orderId: orders[0]?.id ?? '',
      reason: 'Service quality issue',
      details: '',
      requestedRefund: 0,
    })
  }

  const repeatBooking = (order) => {
    const orderId = createId('WV')
    const repeatedOrder = {
      ...order,
      id: orderId,
      invoiceNumber: `INV-${orderId}`,
      status: 'Scheduled',
      arrivalWindow: 'Tomorrow, 10:30 AM',
      finalTotal: null,
      platformFee: 0,
      workerPayout: 0,
      paymentStatus: 'Pending',
      summary: `Repeat booking requested with ${order.workerName}.`,
    }

    setOrders((current) => [repeatedOrder, ...current])
    setProfileMessage(`Repeat booking created with ${order.workerName}.`)
  }

  return (
    <main className="portal-page">
      <section className="profile-layout">
        <div className="profile-header panel">
          <button type="button" className="ghost-button" onClick={() => navigate('/customer')}>
            Back to home
          </button>

          <div className="profile-hero">
            <Avatar profile={customerProfile} size="xl" />
            <div>
              <p className="eyebrow">Customer profile</p>
              <h2>{customerProfile.name}</h2>
              <p>
                {customerProfile.mobile} | {customerProfile.email}
              </p>
              <small>
                Preferred location: {selectedLocation.label} | Member since {customerProfile.memberSince}
              </small>
            </div>
          </div>
        </div>

        {profileMessage ? <p className="success-note">{profileMessage}</p> : null}

        <section className="profile-grid">
          <article className="panel app-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Profile</p>
                <h3>Edit customer details</h3>
              </div>
            </div>

            <div className="field-row field-row--three">
              <label className="field">
                <span>Name</span>
                <input
                  type="text"
                  value={customerProfile.name}
                  onChange={(event) =>
                    setCustomerProfile((current) => ({ ...current, name: event.target.value }))
                  }
                />
              </label>
              <label className="field">
                <span>Mobile</span>
                <input
                  type="tel"
                  value={customerProfile.mobile}
                  onChange={(event) =>
                    setCustomerProfile((current) => ({ ...current, mobile: event.target.value }))
                  }
                />
              </label>
              <label className="field">
                <span>City</span>
                <input
                  type="text"
                  value={customerProfile.city}
                  onChange={(event) =>
                    setCustomerProfile((current) => ({ ...current, city: event.target.value }))
                  }
                />
              </label>
            </div>

            <label className="field">
              <span>Email</span>
              <input
                type="email"
                value={customerProfile.email}
                onChange={(event) =>
                  setCustomerProfile((current) => ({ ...current, email: event.target.value }))
                }
              />
            </label>

            <label className="field">
              <span>Profile image</span>
              <input type="file" accept="image/*" onChange={handleAvatarUpload} />
            </label>
          </article>

          <article className="panel app-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Addresses</p>
                <h3>Saved service locations</h3>
              </div>
            </div>

            <div className="detail-stack">
              <div className="detail-item">
                <span>Selected for next booking</span>
                <strong>{selectedLocation.address}</strong>
              </div>
              <div className="detail-item">
                <span>Booking contact</span>
                <strong>
                  {recipientContact.name} | {recipientContact.mobile}
                </strong>
              </div>
            </div>

            <div className="saved-location-list saved-location-list--profile">
              {savedLocations.map((location) => (
                <article key={location.id} className="saved-location-card saved-location-card--static">
                  <div>
                    <strong>{location.label}</strong>
                    <p>{location.address}</p>
                  </div>
                  <span>{location.distanceKm} km</span>
                </article>
              ))}
            </div>
          </article>

          <article className="panel app-section profile-wide-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Invoices</p>
                <h3>Booking history and service summary</h3>
              </div>
            </div>

            <div className="order-list">
              {orders.map((order) => (
                <article key={order.id} className="invoice-card">
                  <div className="invoice-head">
                    <div>
                      <strong>
                        {order.service} | {order.id}
                      </strong>
                      <p>{order.invoiceNumber}</p>
                    </div>
                    <span className="status-badge">{order.status}</span>
                  </div>
                  <p>{order.problemDescription}</p>
                  <small>
                    {order.arrivalWindow} | {order.workerName} | {order.paymentMode}
                  </small>

                  <div className="invoice-line-items">
                    {order.lineItems.map((item) => (
                      <div key={`${order.id}-${item.label}`} className="invoice-line-item">
                        <span>{item.label}</span>
                        <strong>{formatCurrency(item.amount)}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="invoice-total">
                    <span>Estimate</span>
                    <strong>{formatCurrency(order.estimateTotal)}</strong>
                  </div>
                  <div className="invoice-total">
                    <span>Final bill</span>
                    <strong>{formatCurrency(order.finalTotal ?? order.estimateTotal)}</strong>
                  </div>
                  {order.status === 'Completed' ? (
                    <div className="commission-grid">
                      <div>
                        <span>Platform fee 5%</span>
                        <strong>{formatCurrency(order.platformFee)}</strong>
                      </div>
                      <div>
                        <span>Worker payout</span>
                        <strong>{formatCurrency(order.workerPayout)}</strong>
                      </div>
                      <div>
                        <span>Warranty</span>
                        <strong>{order.warrantyDays} days</strong>
                      </div>
                    </div>
                  ) : null}
                  <p className="info-note">{order.summary}</p>
                  <button type="button" className="secondary-button" onClick={() => repeatBooking(order)}>
                    Repeat same worker
                  </button>
                </article>
              ))}
            </div>
          </article>

          <article className="panel app-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Review</p>
                <h3>Rate worker and upload proof</h3>
              </div>
            </div>

            <form className="feedback-form" onSubmit={handleFeedbackSubmit}>
              <label className="field">
                <span>Order</span>
                <select
                  value={feedbackForm.orderId}
                  onChange={(event) =>
                    setFeedbackForm((current) => ({ ...current, orderId: event.target.value }))
                  }
                >
                  {orders.map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.id} | {order.service} | {order.issue}
                    </option>
                  ))}
                </select>
              </label>

              <RatingInput
                label="Customer rating"
                value={feedbackForm.rating}
                onChange={(value) => setFeedbackForm((current) => ({ ...current, rating: value }))}
              />

              <div className="field-row">
                <label className="field">
                  <span>Before work image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleFeedbackImage('beforeImage', event)}
                  />
                </label>
                <label className="field">
                  <span>After work image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleFeedbackImage('afterImage', event)}
                  />
                </label>
              </div>

              <div className="image-preview-grid">
                {feedbackForm.beforeImage ? (
                  <img src={feedbackForm.beforeImage} alt="Before work preview" className="preview-image" />
                ) : null}
                {feedbackForm.afterImage ? (
                  <img src={feedbackForm.afterImage} alt="After work preview" className="preview-image" />
                ) : null}
              </div>

              <label className="field">
                <span>Review comments</span>
                <textarea
                  rows="4"
                  value={feedbackForm.comments}
                  onChange={(event) =>
                    setFeedbackForm((current) => ({ ...current, comments: event.target.value }))
                  }
                  placeholder="Share work quality, behavior, punctuality and cleanup."
                />
              </label>

              <button type="submit" className="primary-button">
                Submit review
              </button>
            </form>

            {feedbackEntries.length ? (
              <div className="feedback-log">
                {feedbackEntries.slice(0, 3).map((feedback) => (
                  <article key={feedback.id} className="feedback-log-card">
                    <strong>{feedback.orderId}</strong>
                    <p>
                      Rating {feedback.rating}/5 | {feedback.comments || 'No comment'}
                    </p>
                    <small>{feedback.createdAt}</small>
                  </article>
                ))}
              </div>
            ) : null}
          </article>

          <article className="panel app-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Complaint and refund</p>
                <h3>Raise support request</h3>
              </div>
            </div>

            <form className="feedback-form" onSubmit={handleComplaintSubmit}>
              <label className="field">
                <span>Order</span>
                <select
                  value={complaintForm.orderId}
                  onChange={(event) =>
                    setComplaintForm((current) => ({ ...current, orderId: event.target.value }))
                  }
                >
                  {orders.map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.id} | {order.service}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Reason</span>
                <select
                  value={complaintForm.reason}
                  onChange={(event) =>
                    setComplaintForm((current) => ({ ...current, reason: event.target.value }))
                  }
                >
                  <option>Service quality issue</option>
                  <option>Worker no-show</option>
                  <option>Warranty claim</option>
                  <option>Invoice or payment issue</option>
                </select>
              </label>

              <label className="field">
                <span>Refund request</span>
                <input
                  type="number"
                  min="0"
                  value={complaintForm.requestedRefund}
                  onChange={(event) =>
                    setComplaintForm((current) => ({
                      ...current,
                      requestedRefund: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="field">
                <span>Details</span>
                <textarea
                  rows="4"
                  value={complaintForm.details}
                  onChange={(event) =>
                    setComplaintForm((current) => ({ ...current, details: event.target.value }))
                  }
                  placeholder="Explain the issue for support review."
                  required
                />
              </label>

              <button type="submit" className="primary-button">
                Submit complaint
              </button>
            </form>

            <div className="feedback-log">
              {complaintEntries.slice(0, 3).map((complaint) => (
                <article key={complaint.id} className="feedback-log-card">
                  <strong>
                    {complaint.id} | {complaint.status}
                  </strong>
                  <p>{complaint.reason}</p>
                  <small>Refund: {formatCurrency(complaint.requestedRefund)}</small>
                </article>
              ))}
            </div>
          </article>

          <article className="panel app-section" id="themes">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Themes</p>
                <h3>App appearance</h3>
              </div>
            </div>

            <label className="field">
              <span>Select Theme</span>
              <select defaultValue="light">
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode</option>
                <option value="system">System Default</option>
              </select>
            </label>
          </article>

          <article className="panel app-section" id="support">
            <div className="section-heading">
              <div>
                <p className="eyebrow">AI Support</p>
                <h3>Ask common questions</h3>
              </div>
            </div>
            
            <div style={{ background: 'var(--soft)', padding: '16px', borderRadius: '8px' }}>
               <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                 <div style={{ background: '#fff', padding: '10px 14px', borderRadius: '8px', alignSelf: 'flex-start', maxWidth: '85%', border: '1px solid var(--border)' }}>
                   <strong>AI Assistant:</strong> Hi there! Need help with your orders or services? I can answer any common questions.
                 </div>
               </div>
               <div style={{ display: 'flex', gap: '8px' }}>
                 <input type="text" placeholder="Type your question..." className="search-input" style={{ flex: 1, margin: 0 }} />
                 <button type="button" className="primary-button" onClick={() => alert('AI generation feature would respond here.')}>Send</button>
               </div>
            </div>
          </article>

          <article className="panel app-section" id="settings">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Settings</p>
                <h3>Language and account</h3>
              </div>
            </div>

            <label className="field">
              <span>Preferred language</span>
              <select value={language} onChange={(event) => setLanguage(event.target.value)}>
                {indianLanguages.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <div className="field-row" style={{ marginTop: '24px' }}>
              <button type="button" className="secondary-button" onClick={() => setCustomerSession(false)}>
                Sign out
              </button>
              <button type="button" className="secondary-button" onClick={() => {
                  alert('Account deleted successfully');
                  setCustomerSession(false);
              }} style={{ borderColor: '#d32f2f', color: '#d32f2f' }}>
                Delete account
              </button>
            </div>

            <div className="section-heading" style={{ marginTop: '32px' }}>
              <div>
                <p className="eyebrow">Portals</p>
                <h3>Switch application portal</h3>
              </div>
            </div>

            <div className="field-row">
              <button
                type="button"
                className="chip-button"
                onClick={() => navigate('/worker')}
              >
                Worker Portal
              </button>
              <button
                type="button"
                className="chip-button"
                onClick={() => navigate('/admin')}
              >
                Admin Portal
              </button>
            </div>
          </article>
        </section>
      </section>
    </main>
  )
}

function WorkerPortal({
  workerSession,
  setWorkerSession,
  workerProfile,
  setWorkerProfile,
  workerLeads,
}) {
  if (!workerSession) {
    return (
      <WorkerLogin
        workerProfile={workerProfile}
        setWorkerProfile={setWorkerProfile}
        setWorkerSession={setWorkerSession}
      />
    )
  }

  return (
    <WorkerDashboard
      workerProfile={workerProfile}
      workerLeads={workerLeads}
      setWorkerSession={setWorkerSession}
    />
  )
}

function WorkerLogin({ workerProfile, setWorkerProfile, setWorkerSession }) {
  const [form, setForm] = useState(workerProfile)
  const [otpCode, setOtpCode] = useState('')
  const [otpInput, setOtpInput] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleFileName = (field, event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setForm((current) => ({
      ...current,
      [field]: file.name,
    }))
  }

  const handleSendOtp = () => {
    const code = String(Math.floor(100000 + Math.random() * 900000))
    setOtpCode(code)
    setOtpInput(code)
    setErrorMessage('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!otpCode || otpInput !== otpCode) {
      setErrorMessage('Verify the worker phone number with the demo OTP.')
      return
    }

    const trust = calculatePartnerTrust(form)
    setWorkerProfile(
      normalizeWorkerProfile({
        ...form,
        ...trust,
      }),
    )
    setWorkerSession(true)
  }

  const completedSteps = verificationSteps.filter((step) => {
    if (step === 'Phone OTP') return Boolean(otpCode)
    if (step === 'Government ID') return Boolean(form.idNumber)
    if (step === 'Certificate review') return Boolean(form.certificateName)
    if (step === 'Background check') return Boolean(form.referenceContact)
    if (step === 'Skill test') return Number(form.skillTestScore) >= 60
    return Number(form.completedOrders) > 0
  })

  return (
    <main className="portal-page portal-page--hero">
      <section className="login-layout">
        <div className="login-copy">
          <p className="eyebrow">Worker app</p>
          <h2>Register, verify documents and receive domain-matched jobs.</h2>
          <p>
            New workers begin with smaller starter jobs. Larger orders unlock as
            trust improves through study proof, documents, past work, trial jobs and ratings.
          </p>

          <div className="verification-preview">
            {verificationSteps.map((step) => (
              <div key={step} className={completedSteps.includes(step) ? 'step step--done' : 'step'}>
                <span>{completedSteps.includes(step) ? 'Done' : 'Open'}</span>
                <strong>{step}</strong>
              </div>
            ))}
          </div>
        </div>

        <form className="panel form-card" onSubmit={handleSubmit}>
          <div className="section-heading">
            <div>
              <p className="eyebrow">Worker OTP login</p>
              <h3>Profile and verification</h3>
            </div>
          </div>

          <div className="field-row">
            <label className="field">
              <span>Name</span>
              <input
                type="text"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                required
              />
            </label>
            <label className="field">
              <span>Mobile</span>
              <input
                type="tel"
                value={form.mobile}
                onChange={(event) =>
                  setForm((current) => ({ ...current, mobile: event.target.value }))
                }
                required
              />
            </label>
          </div>

          <div className="field-row">
            <label className="field">
              <span>Government ID</span>
              <input
                type="text"
                value={form.idNumber}
                onChange={(event) =>
                  setForm((current) => ({ ...current, idNumber: event.target.value }))
                }
                required
              />
            </label>
            <label className="field">
              <span>City</span>
              <input
                type="text"
                value={form.city}
                onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                required
              />
            </label>
          </div>

          <div className="field-row">
            <label className="field">
              <span>Work domain</span>
              <select
                value={form.skill}
                onChange={(event) => setForm((current) => ({ ...current, skill: event.target.value }))}
              >
                {skillOptions.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Experience years</span>
              <input
                type="number"
                min="0"
                value={form.experienceYears}
                onChange={(event) =>
                  setForm((current) => ({ ...current, experienceYears: event.target.value }))
                }
              />
            </label>
          </div>

          <label className="field">
            <span>Study background</span>
            <input
              type="text"
              value={form.education}
              onChange={(event) =>
                setForm((current) => ({ ...current, education: event.target.value }))
              }
              placeholder="ITI, diploma, trade certificate or course"
            />
          </label>

          <div className="field-row">
            <label className="field">
              <span>Certificate upload</span>
              <input type="file" onChange={(event) => handleFileName('certificateName', event)} />
              <small>{form.certificateName}</small>
            </label>
            <label className="field">
              <span>Experience document</span>
              <input
                type="file"
                onChange={(event) => handleFileName('experienceDocumentName', event)}
              />
              <small>{form.experienceDocumentName}</small>
            </label>
          </div>

          <div className="field-row">
            <label className="field">
              <span>Previous employer</span>
              <input
                type="text"
                value={form.previousEmployer}
                onChange={(event) =>
                  setForm((current) => ({ ...current, previousEmployer: event.target.value }))
                }
              />
            </label>
            <label className="field">
              <span>Reference contact</span>
              <input
                type="tel"
                value={form.referenceContact}
                onChange={(event) =>
                  setForm((current) => ({ ...current, referenceContact: event.target.value }))
                }
              />
            </label>
          </div>

          <div className="field-row">
            <label className="field">
              <span>Skill test score</span>
              <input
                type="number"
                min="0"
                max="100"
                value={form.skillTestScore}
                onChange={(event) =>
                  setForm((current) => ({ ...current, skillTestScore: event.target.value }))
                }
              />
            </label>
            <label className="field">
              <span>Completed starter jobs</span>
              <input
                type="number"
                min="0"
                value={form.completedOrders}
                onChange={(event) =>
                  setForm((current) => ({ ...current, completedOrders: event.target.value }))
                }
              />
            </label>
          </div>

          <div className="field-row">
            <button type="button" className="secondary-button" onClick={handleSendOtp}>
              Send OTP
            </button>
            <label className="field">
              <span>OTP</span>
              <input
                type="text"
                value={otpInput}
                onChange={(event) => setOtpInput(event.target.value)}
                required
              />
            </label>
          </div>

          {otpCode ? <p className="info-note">Demo OTP generated: {otpCode}</p> : null}
          {errorMessage ? <p className="error-note">{errorMessage}</p> : null}

          <button type="submit" className="primary-button">
            Enter worker dashboard
          </button>
        </form>
      </section>
    </main>
  )
}

function WorkerDashboard({ workerProfile, workerLeads, setWorkerSession }) {
  const [online, setOnline] = useState(true)
  const [releasedIndex, setReleasedIndex] = useState(3)
  const [highlightJobId, setHighlightJobId] = useState('')
  const [jobPhotos, setJobPhotos] = useState({})
  const [jobStatuses, setJobStatuses] = useState({})
  const [rejectedJobs, setRejectedJobs] = useState([])
  const [estimateDrafts, setEstimateDrafts] = useState({})
  const [soundReady, setSoundReady] = useState(false)

  const trustScore = Number(workerProfile.trustScore) || calculatePartnerTrust(workerProfile).trustScore
  const accessibleDifficulties = getAccessibleDifficulties(trustScore)
  const accessibleDifficultyIds = accessibleDifficulties.map((difficulty) => difficulty.id)
  const liveTemplateJobs = partnerJobTemplates.slice(0, releasedIndex)
  const mergedJobs = sortJobsByDistance([...workerLeads, ...liveTemplateJobs])
  const domainJobs =
    workerProfile.skill === 'Multi-Skill'
      ? mergedJobs
      : mergedJobs.filter((job) => job.service === workerProfile.skill)
  const visibleJobs = domainJobs.filter((job) => !rejectedJobs.includes(job.id))
  const eligibleJobs = visibleJobs.filter((job) => accessibleDifficultyIds.includes(job.difficulty))
  const lockedJobs = visibleJobs.filter((job) => !accessibleDifficultyIds.includes(job.difficulty))
  const completedOrders = Number(workerProfile.completedOrders) || 0
  const pendingPayments = Math.round(completedOrders * 124)
  const monthlyEarnings = Math.round(completedOrders * 740)

  const playNotificationTone = () => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext

    if (!AudioContextClass) {
      return
    }

    const audioContext = new AudioContextClass()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.type = 'triangle'
    oscillator.frequency.value = 880
    gainNode.gain.value = 0.0001

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.start()
    gainNode.gain.exponentialRampToValueAtTime(0.16, audioContext.currentTime + 0.02)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.38)
    oscillator.stop(audioContext.currentTime + 0.4)
  }

  useEffect(() => {
    if (!online || releasedIndex >= partnerJobTemplates.length) {
      return
    }

    const timeout = window.setTimeout(() => {
      const nextJob = partnerJobTemplates[releasedIndex]
      setReleasedIndex((current) => current + 1)
      setHighlightJobId(nextJob.id)

      if (soundReady) {
        playNotificationTone()
      }
    }, 9000)

    return () => window.clearTimeout(timeout)
  }, [online, releasedIndex, soundReady])

  useEffect(() => {
    if (!workerLeads.length || !online) {
      return
    }

    const timeout = window.setTimeout(() => {
      const latestLead = sortJobsByDistance(workerLeads)[0]
      setHighlightJobId(latestLead.id)

      if (soundReady) {
        playNotificationTone()
      }
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [online, workerLeads, soundReady])

  const handlePhotoUpload = async (jobId, stage, event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const image = await fileToDataUrl(file)
    setJobPhotos((current) => ({
      ...current,
      [jobId]: {
        ...current[jobId],
        [stage]: image,
      },
    }))
  }

  const updateJobStatus = (jobId, status) => {
    setJobStatuses((current) => ({
      ...current,
      [jobId]: status,
    }))
  }

  const updateEstimateDraft = (jobId, field, value) => {
    setEstimateDrafts((current) => ({
      ...current,
      [jobId]: {
        ...current[jobId],
        [field]: value,
      },
    }))
  }

  const requestEstimateApproval = (job) => {
    const draft = estimateDrafts[job.id]

    if (!draft?.amount) {
      return
    }

    setJobStatuses((current) => ({
      ...current,
      [job.id]: `Approval requested: ${formatCurrency(draft.amount)}`,
    }))
  }

  const renderJobCard = (job) => {
    const status = jobStatuses[job.id] || job.status
    const media = jobPhotos[job.id] || {}
    const highlighted = highlightJobId === job.id
    const commission = getCommissionBreakdown(job.estimateTotal)
    const draft = estimateDrafts[job.id] ?? {
      amount: job.estimateTotal,
      reason: '',
    }

    return (
      <article
        key={job.id}
        className={highlighted ? 'job-card job-card--highlighted' : 'job-card'}
      >
        <div className="invoice-head">
          <div>
            <strong>
              {job.service} | {job.issue}
            </strong>
            <p>
              {job.customerName} | {job.locationLabel}
            </p>
          </div>
          <span className="status-badge">
            {job.distanceKm} km | {status}
          </span>
        </div>

        <p>{job.address}</p>
        <small>
          {job.arrivalWindow} | {job.priority} | {job.difficulty}
        </small>

        <div className="commission-grid">
          <div>
            <span>Customer bill</span>
            <strong>{formatCurrency(job.estimateTotal)}</strong>
          </div>
          <div>
            <span>Platform fee 5%</span>
            <strong>{formatCurrency(commission.platformFee)}</strong>
          </div>
          <div>
            <span>Net payout</span>
            <strong>{formatCurrency(commission.workerPayout)}</strong>
          </div>
        </div>

        <div className="job-card__actions">
          <button type="button" className="secondary-button" onClick={() => updateJobStatus(job.id, 'Accepted')}>
            Accept
          </button>
          <button type="button" className="secondary-button" onClick={() => setRejectedJobs((current) => [...current, job.id])}>
            Reject
          </button>
          <button type="button" className="secondary-button" onClick={() => updateJobStatus(job.id, 'On the way')}>
            On the way
          </button>
          <button type="button" className="secondary-button" onClick={() => updateJobStatus(job.id, 'Completed')}>
            Complete
          </button>
        </div>

        <div className="field-row">
          <label className="field">
            <span>Revised estimate</span>
            <input
              type="number"
              min="0"
              value={draft.amount}
              onChange={(event) => updateEstimateDraft(job.id, 'amount', event.target.value)}
            />
          </label>
          <label className="field">
            <span>Reason for change</span>
            <input
              type="text"
              value={draft.reason}
              onChange={(event) => updateEstimateDraft(job.id, 'reason', event.target.value)}
              placeholder="Part replacement, smaller issue, extra work"
            />
          </label>
        </div>

        <button type="button" className="primary-button" onClick={() => requestEstimateApproval(job)}>
          Request customer approval
        </button>

        <div className="field-row">
          <label className="field">
            <span>Before work photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => handlePhotoUpload(job.id, 'before', event)}
            />
          </label>
          <label className="field">
            <span>After work photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => handlePhotoUpload(job.id, 'after', event)}
            />
          </label>
        </div>

        <div className="image-preview-grid">
          {media.before ? <img src={media.before} alt="Before work" className="preview-image" /> : null}
          {media.after ? <img src={media.after} alt="After work" className="preview-image" /> : null}
        </div>
      </article>
    )
  }

  return (
    <main className="portal-page">
      <section className="worker-home">
        <div className="worker-banner panel">
          <div className="profile-hero">
            <Avatar profile={workerProfile} size="lg" />
            <div>
              <p className="eyebrow">Worker dashboard</p>
              <h2>{workerProfile.name}</h2>
              <p>
                {workerProfile.skill} specialist | {workerProfile.experienceYears} years experience
              </p>
              <small>{workerProfile.mobile}</small>
            </div>
          </div>

          <div className="metric-strip">
            <button
              type="button"
              className={online ? 'soft-pill soft-pill--active' : 'soft-pill'}
              onClick={() => setOnline((current) => !current)}
            >
              <strong>{online ? 'Online for jobs' : 'Offline'}</strong>
              <span>Availability</span>
            </button>
            <button
              type="button"
              className="soft-pill"
              onClick={() => {
                setSoundReady(true)
                playNotificationTone()
              }}
            >
              <strong>{soundReady ? 'Sound enabled' : 'Enable alert sound'}</strong>
              <span>New request tone</span>
            </button>
            <button type="button" className="soft-pill" onClick={() => setWorkerSession(false)}>
              <strong>Sign out</strong>
              <span>Leave dashboard</span>
            </button>
          </div>

          <div className="worker-action-strip">
            <button type="button" className="action-pill">
              <strong>Accept next job</strong>
            </button>
            <button type="button" className="action-pill">
              <strong>View directions</strong>
            </button>
            <button type="button" className="action-pill">
              <strong>Upload completion proof</strong>
            </button>
            <button type="button" className="action-pill">
              <strong>Withdraw earnings</strong>
            </button>
          </div>
        </div>

        <section className="panel worker-onboarding-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Worker onboarding</p>
              <h3>Verification progress</h3>
            </div>
            <span className="status-badge">Trust {trustScore}</span>
          </div>

          <div className="progress-row worker-progress-row">
            <span style={{ width: `${Math.min(trustScore, 100)}%` }} />
          </div>
          <div className="detail-stack">
            <div className="detail-item">
              <span>Profile & documents</span>
              <strong>{Math.min(trustScore, 100)}%</strong>
            </div>
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="dashboard-main">
            <section className="panel app-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Domain requests</p>
                  <h3>Jobs for {workerProfile.skill}</h3>
                </div>
                <span className="status-badge">Trust {trustScore}</span>
              </div>

              {eligibleJobs.length ? (
                <div className="job-grid">{eligibleJobs.map(renderJobCard)}</div>
              ) : (
                <p className="info-note">No eligible jobs are waiting for this domain right now.</p>
              )}
            </section>

            <section className="panel app-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Growth rules</p>
                  <h3>Starter jobs and locked work</h3>
                </div>
              </div>

              <div className="difficulty-grid">
                {difficultyTags.map((difficulty) => (
                  <article
                    key={difficulty.id}
                    className={
                      accessibleDifficultyIds.includes(difficulty.id)
                        ? 'difficulty-card difficulty-card--open'
                        : 'difficulty-card'
                    }
                  >
                    <strong>{difficulty.label}</strong>
                    <span>Trust gate {difficulty.trustGate}</span>
                    <p>{difficulty.caption}</p>
                  </article>
                ))}
              </div>

              {lockedJobs.length ? (
                <div className="job-grid job-grid--compact">{lockedJobs.map(renderJobCard)}</div>
              ) : (
                <p className="success-note">All visible jobs are unlocked for this trust level.</p>
              )}
            </section>
          </div>

          <aside className="dashboard-side">
            <section className="panel app-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Trust score</p>
                  <h3>{trustScore} | {getTrustBand(trustScore)}</h3>
                </div>
              </div>

              <TrustBreakdown profile={workerProfile} />
            </section>

            <section className="panel app-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Earnings</p>
                  <h3>Payout summary</h3>
                </div>
              </div>

              <div className="commission-grid commission-grid--stacked">
                <div>
                  <span>Completed orders</span>
                  <strong>{completedOrders}</strong>
                </div>
                <div>
                  <span>Monthly gross</span>
                  <strong>{formatCurrency(monthlyEarnings)}</strong>
                </div>
                <div>
                  <span>Pending payments</span>
                  <strong>{formatCurrency(pendingPayments)}</strong>
                </div>
                <div>
                  <span>Rating</span>
                  <strong>{workerProfile.rating}/5</strong>
                </div>
              </div>
            </section>

            <section className="panel app-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Verification</p>
                  <h3>Documents and background</h3>
                </div>
              </div>

              <div className="detail-stack">
                <div className="detail-item">
                  <span>Government ID</span>
                  <strong>{workerProfile.idNumber}</strong>
                </div>
                <div className="detail-item">
                  <span>Education</span>
                  <strong>{workerProfile.education}</strong>
                </div>
                <div className="detail-item">
                  <span>Certificate</span>
                  <strong>{workerProfile.certificateName}</strong>
                </div>
                <div className="detail-item">
                  <span>Previous work</span>
                  <strong>{workerProfile.previousEmployer}</strong>
                </div>
              </div>
            </section>
          </aside>
        </section>
      </section>
    </main>
  )
}

function TrustBreakdown({ profile }) {
  const rows = [
    ['Study background', profile.studyScore],
    ['Documents', profile.documentScore],
    ['Previous work', profile.previousWorkScore],
    ['Trial jobs', profile.trialScore],
    ['Ratings', profile.ratingScore],
  ]

  return (
    <div className="trust-breakdown">
      {rows.map(([label, score]) => (
        <div key={label}>
          <div className="invoice-line-item">
            <span>{label}</span>
            <strong>{score}/100</strong>
          </div>
          <div className="trust-meter">
            <span style={{ width: `${Math.min(Number(score) || 0, 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function AdminDashboard({ orders, complaintEntries, setComplaintEntries, workerProfile }) {
  const completedOrders = orders.filter((order) => order.status === 'Completed')
  const activeBookings = orders.filter((order) => order.status !== 'Completed').length
  const cancelledJobs = orders.filter((order) => order.status === 'Cancelled').length
  const commissionTotal = completedOrders.reduce((sum, order) => sum + numberFromAmount(order.platformFee), 0)
  const grossTotal = completedOrders.reduce(
    (sum, order) => sum + numberFromAmount(order.finalTotal ?? order.estimateTotal),
    0,
  )
  const pendingComplaints = complaintEntries.filter((complaint) => complaint.status !== 'Resolved')
  const unresolvedIssues = pendingComplaints.length
  const pendingVerifications = workerDirectory.filter((worker) => worker.trustScore < 88).slice(0, 4)
  const liveWorker = normalizeWorkerProfile(workerProfile)
  const fraudAlertCount = 2
  const liveIssues = orders
    .filter((order) => order.status !== 'Completed')
    .slice(0, 4)

  const resolveComplaint = (complaintId) => {
    setComplaintEntries((current) =>
      current.map((complaint) =>
        complaint.id === complaintId ? { ...complaint, status: 'Resolved' } : complaint,
      ),
    )
  }

  return (
    <main className="portal-page">
      <section className="admin-home">
        <section className="hero-band">
          <div>
            <p className="eyebrow">Admin dashboard</p>
            <h2>Verification, trust, billing and safety controls.</h2>
            <p>
              Monitor worker onboarding, customer complaints, refunds, job difficulty
              gates, estimates and the 5% platform commission.
            </p>
          </div>

          <div className="metric-strip metric-strip--admin">
            <div>
              <strong>{orders.length}</strong>
              <span>Total bookings</span>
            </div>
            <div>
              <strong>{activeBookings}</strong>
              <span>Active bookings</span>
            </div>
            <div>
              <strong>{unresolvedIssues}</strong>
              <span>Unresolved issues</span>
            </div>
            <div>
              <strong>{formatCurrency(grossTotal)}</strong>
              <span>Completed gross</span>
            </div>
            <div>
              <strong>{formatCurrency(commissionTotal)}</strong>
              <span>Platform fee</span>
            </div>
            <div>
              <strong>{fraudAlertCount}</strong>
              <span>Fraud alerts</span>
            </div>
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="dashboard-main">
            <section className="panel app-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Real-time issue monitor</p>
                  <h3>Live bookings, delays and alerts</h3>
                </div>
                <span className="status-badge">{liveIssues.length} live</span>
              </div>

              <div className="order-list">
                {liveIssues.map((order) => (
                  <article key={order.id} className="invoice-card">
                    <div className="invoice-head">
                      <div>
                        <strong>{order.id} | {order.service}</strong>
                        <p>{order.issue}</p>
                      </div>
                      <span className="status-badge">{order.status}</span>
                    </div>
                    <p>{order.problemDescription || order.issue}</p>
                    <small>
                      {order.workerName || 'Unassigned'} • {order.arrivalWindow} • {order.paymentMode}
                    </small>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel app-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Verification queue</p>
                  <h3>Trust score inputs</h3>
                </div>
              </div>

              <div className="worker-grid">
                {[liveWorker, ...pendingVerifications].map((worker) => (
                  <article key={worker.id ?? worker.mobile} className="worker-card worker-card--static">
                    <div className="worker-card__head">
                      <Avatar profile={worker} size="md" />
                      <div>
                        <strong>{worker.name}</strong>
                        <span>{worker.skill ?? worker.domain} | Trust {worker.trustScore}</span>
                      </div>
                    </div>
                    <div className="trust-meter">
                      <span style={{ width: `${Number(worker.trustScore) || 0}%` }} />
                    </div>
                    <div className="badge-row">
                      <span className="badge">ID verified</span>
                      <span className="badge">Certificate review</span>
                      <span className="badge">Trial jobs</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel app-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Complaints and refunds</p>
                  <h3>Support cases</h3>
                </div>
                <span className="status-badge">{pendingComplaints.length} open</span>
              </div>

              <div className="order-list">
                {complaintEntries.map((complaint) => (
                  <article key={complaint.id} className="invoice-card">
                    <div className="invoice-head">
                      <div>
                        <strong>
                          {complaint.id} | {complaint.orderId}
                        </strong>
                        <p>
                          {complaint.customer} vs {complaint.worker}
                        </p>
                      </div>
                      <span className="status-badge">{complaint.status}</span>
                    </div>
                    <p>{complaint.reason}</p>
                    <small>Refund requested: {formatCurrency(complaint.requestedRefund)}</small>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => resolveComplaint(complaint.id)}
                    >
                      Mark resolved
                    </button>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="dashboard-side">
            <section className="panel app-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Trust formula</p>
                  <h3>Balanced scoring</h3>
                </div>
              </div>

              <div className="detail-stack">
                {trustFormula.map((item) => (
                  <div key={item.label} className="detail-item">
                    <span>{item.label}</span>
                    <strong>{item.value}% weight</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel app-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Assignment policy</p>
                  <h3>Domain and difficulty gates</h3>
                </div>
              </div>

              <div className="difficulty-grid difficulty-grid--single">
                {difficultyTags.map((difficulty) => (
                  <article key={difficulty.id} className="difficulty-card">
                    <strong>{difficulty.label}</strong>
                    <span>Trust gate {difficulty.trustGate}</span>
                    <p>{difficulty.caption}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel app-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Billing policy</p>
                  <h3>Estimate governance</h3>
                </div>
              </div>

              <div className="detail-stack">
                <div className="detail-item">
                  <span>Before booking</span>
                  <strong>Customer sees estimated bill upfront.</strong>
                </div>
                <div className="detail-item">
                  <span>Smaller issue</span>
                  <strong>Worker can reduce bill after inspection.</strong>
                </div>
                <div className="detail-item">
                  <span>Expanded work</span>
                  <strong>Increase requires explicit customer approval.</strong>
                </div>
                <div className="detail-item">
                  <span>Commission</span>
                  <strong>5% deducted from completed worker earnings.</strong>
                </div>
              </div>
            </section>
          </aside>
        </section>
      </section>
    </main>
  )
}

function Avatar({ profile, size }) {
  if (profile.avatar) {
    return <img src={profile.avatar} alt={`${profile.name} avatar`} className={`avatar avatar--${size}`} />
  }

  return (
    <div className={`avatar avatar--${size} avatar--fallback`} aria-hidden="true">
      {getInitials(profile.name)}
    </div>
  )
}

function RatingInput({ label, value, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="rating-row">
        {[1, 2, 3, 4, 5].map((step) => (
          <button
            key={`${label}-${step}`}
            type="button"
            className={value === step ? 'rating-pill rating-pill--active' : 'rating-pill'}
            onClick={() => onChange(step)}
          >
            {step}
          </button>
        ))}
      </div>
    </label>
  )
}

export default App

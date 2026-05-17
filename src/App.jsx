import { useEffect, useState } from 'react'
import './App.css'
import {
  arrivalSlots,
  indianLanguages,
  initialLocations,
  initialOrders,
  partnerJobTemplates,
  repairCatalog,
  serviceCategories,
  serviceSuggestions,
} from './data.js'

const STORAGE_KEYS = {
  customerSession: 'workven.customer.session',
  customerProfile: 'workven.customer.profile',
  partnerSession: 'workven.partner.session',
  partnerProfile: 'workven.partner.profile',
  savedLocations: 'workven.customer.locations',
  selectedLocation: 'workven.customer.selectedLocation',
  recipientContact: 'workven.customer.recipientContact',
  orders: 'workven.customer.orders',
  language: 'workven.customer.language',
  feedbackEntries: 'workven.customer.feedbackEntries',
  partnerLeads: 'workven.partner.leads',
}

const defaultCustomerProfile = {
  name: 'Sai Kiran',
  mobile: '+91 98765 43210',
  email: 'saikiran@example.com',
  city: 'Hyderabad',
  avatar: '',
  memberSince: 'May 2026',
}

const defaultPartnerProfile = {
  name: 'Ravi Teja',
  mobile: '+91 91234 56789',
  city: 'Hyderabad',
  skill: 'Electrical',
  experience: '4 years',
  avatar: '',
}

function readStorage(key, fallbackValue) {
  if (typeof window === 'undefined') {
    return fallbackValue
  }

  try {
    const raw = window.localStorage.getItem(key)

    if (!raw) {
      return fallbackValue
    }

    return JSON.parse(raw)
  } catch (error) {
    return fallbackValue
  }
}

function getRouteFromHash() {
  if (typeof window === 'undefined') {
    return '/customer'
  }

  const rawHash = window.location.hash.replace(/^#/, '')

  if (!rawHash) {
    return '/customer'
  }

  return rawHash.startsWith('/') ? rawHash : `/${rawHash}`
}

function formatDisplayDate(value = new Date()) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function getInitials(name = '') {
  const segments = name
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)

  if (!segments.length) {
    return 'WV'
  }

  return segments.map((segment) => segment[0].toUpperCase()).join('')
}

function createId(prefix) {
  return `${prefix}-${Date.now().toString().slice(-6)}`
}

function sortJobsByDistance(jobs) {
  return [...jobs].sort((left, right) => left.distanceKm - right.distanceKm)
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

function App() {
  const [route, setRoute] = useState(getRouteFromHash)
  const [customerSession, setCustomerSession] = useState(() =>
    readStorage(STORAGE_KEYS.customerSession, false),
  )
  const [partnerSession, setPartnerSession] = useState(() =>
    readStorage(STORAGE_KEYS.partnerSession, false),
  )
  const [customerProfile, setCustomerProfile] = useState(() =>
    readStorage(STORAGE_KEYS.customerProfile, defaultCustomerProfile),
  )
  const [partnerProfile, setPartnerProfile] = useState(() =>
    readStorage(STORAGE_KEYS.partnerProfile, defaultPartnerProfile),
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
  const [orders, setOrders] = useState(() => readStorage(STORAGE_KEYS.orders, initialOrders))
  const [language, setLanguage] = useState(() => readStorage(STORAGE_KEYS.language, 'English'))
  const [feedbackEntries, setFeedbackEntries] = useState(() =>
    readStorage(STORAGE_KEYS.feedbackEntries, []),
  )
  const [partnerLeads, setPartnerLeads] = useState(() =>
    readStorage(STORAGE_KEYS.partnerLeads, []),
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
    document.title = route.startsWith('/partner') ? 'Workven Partner' : 'Workven'
  }, [route])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.customerSession, JSON.stringify(customerSession))
  }, [customerSession])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.partnerSession, JSON.stringify(partnerSession))
  }, [partnerSession])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.customerProfile, JSON.stringify(customerProfile))
  }, [customerProfile])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.partnerProfile, JSON.stringify(partnerProfile))
  }, [partnerProfile])

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
    window.localStorage.setItem(
      STORAGE_KEYS.feedbackEntries,
      JSON.stringify(feedbackEntries),
    )
  }, [feedbackEntries])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.partnerLeads, JSON.stringify(partnerLeads))
  }, [partnerLeads])

  useEffect(() => {
    if (recipientContact.mode === 'self') {
      setRecipientContact((current) => ({
        ...current,
        name: customerProfile.name,
        mobile: customerProfile.mobile,
      }))
    }
  }, [customerProfile.mobile, customerProfile.name, recipientContact.mode])

  const navigate = (nextRoute) => {
    window.location.hash = nextRoute
  }

  const portal = route.startsWith('/partner') ? 'partner' : 'customer'

  return (
    <div className="app-shell">
      <header className="portal-switcher">
        <div>
          <p className="eyebrow">On-demand home services</p>
          <h1>Workven</h1>
        </div>

        <div className="portal-switcher__actions">
          <button
            type="button"
            className={portal === 'customer' ? 'chip-button chip-button--active' : 'chip-button'}
            onClick={() => navigate('/customer')}
          >
            Workven
          </button>
          <button
            type="button"
            className={portal === 'partner' ? 'chip-button chip-button--active' : 'chip-button'}
            onClick={() => navigate('/partner')}
          >
            Workven Partner
          </button>
        </div>
      </header>

      {portal === 'customer' ? (
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
          setPartnerLeads={setPartnerLeads}
        />
      ) : (
        <PartnerPortal
          partnerSession={partnerSession}
          setPartnerSession={setPartnerSession}
          partnerProfile={partnerProfile}
          setPartnerProfile={setPartnerProfile}
          partnerLeads={partnerLeads}
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
  setPartnerLeads,
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
        language={language}
        setLanguage={setLanguage}
        feedbackEntries={feedbackEntries}
        setFeedbackEntries={setFeedbackEntries}
        setOrders={setOrders}
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
      setPartnerLeads={setPartnerLeads}
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

  const handleSubmit = (event) => {
    event.preventDefault()

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
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Customer experience</p>
          <h2>Book trusted home repairs with fast arrival planning.</h2>
          <p>
            Search electrical, plumbing, AC and appliance work, save multiple
            addresses, and track orders with invoice-ready history.
          </p>

          <div className="hero-highlights">
            <div className="stat-card">
              <strong>45 min</strong>
              <span>Fastest arrival slot</span>
            </div>
            <div className="stat-card">
              <strong>14</strong>
              <span>Indian language options</span>
            </div>
            <div className="stat-card">
              <strong>2 views</strong>
              <span>Customer and partner portals</span>
            </div>
          </div>
        </div>

        <form className="panel card form-card" onSubmit={handleSubmit}>
          <div className="section-heading">
            <div>
              <p className="eyebrow">Sign in</p>
              <h3>Workven customer login</h3>
            </div>
          </div>

          <label className="field">
            <span>Name</span>
            <input
              type="text"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
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

          <button type="submit" className="primary-button">
            Enter Workven
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
  setPartnerLeads,
}) {
  const [searchQuery, setSearchQuery] = useState('Electrical repair')
  const [selectedService, setSelectedService] = useState('Electrical')
  const [repairIssue, setRepairIssue] = useState('Switch board sparking')
  const [timeSlotId, setTimeSlotId] = useState(arrivalSlots[0].id)
  const [notes, setNotes] = useState('')
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

  const suggestions = serviceSuggestions.filter((item) =>
    item.toLowerCase().includes(searchQuery.toLowerCase()),
  )
  const repairs = repairCatalog[selectedService]
  const matchingLocations = savedLocations.filter((location) => {
    const target = `${location.label} ${location.address} ${location.city}`.toLowerCase()
    return target.includes(locationSearch.toLowerCase())
  })
  const selectedSlot = arrivalSlots.find((slot) => slot.id === timeSlotId) ?? arrivalSlots[0]

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

  const applyLocation = (location, nextRecipientContact) => {
    setSelectedLocation(location)
    setRecipientContact(nextRecipientContact)
    setPendingFarLocation(null)
    setLocationPanelOpen(false)
  }

  const handleLocationSelect = (location) => {
    if (location.distanceKm > 20) {
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
      city: manualLocation.city,
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

    const serviceName = selectedService
    const issueName = repairIssue || searchQuery
    const orderId = createId('WV')
    const invoiceNumber = `INV-${orderId}`
    const nextOrder = {
      id: orderId,
      invoiceNumber,
      service: serviceName,
      issue: issueName,
      status: 'Scheduled',
      arrivalWindow: selectedSlot.label,
      workerName: 'Matching specialist',
      address: selectedLocation.address,
      total: 'Estimate after inspection',
      lineItems: [{ label: 'Slot reserve', amount: '₹199' }],
      notes,
    }

    setOrders((current) => [nextOrder, ...current])
    setPartnerLeads((current) =>
      sortJobsByDistance([
        {
          id: createId('JOB'),
          service: serviceName,
          issue: issueName,
          customerName: recipientContact.name,
          locationLabel: selectedLocation.label,
          address: selectedLocation.address,
          distanceKm: Math.max(1, Number(selectedLocation.distanceKm) || 3),
          arrivalWindow: selectedSlot.label,
          priority:
            Number(selectedLocation.distanceKm) <= 5 ? 'Nearby first' : 'Next circle',
          status: 'New',
        },
        ...current,
      ]),
    )
    setBookingMessage(
      `${serviceName} booking created for ${selectedSlot.label}. A nearby partner will be notified first.`,
    )
    setNotes('')
  }

  return (
    <main className="portal-page">
      <section className="customer-home">
        <div className="mobile-home-header panel">
          <button
            type="button"
            className="location-button"
            onClick={() => setLocationPanelOpen(true)}
          >
            <span className="eyebrow">Location</span>
            <strong>{selectedLocation.label}</strong>
            <small>{selectedLocation.address}</small>
          </button>

          <button
            type="button"
            className="profile-button"
            onClick={() => navigate('/customer/profile')}
          >
            <Avatar profile={customerProfile} size="md" />
          </button>
        </div>

        <section className="panel hero-banner">
          <div>
            <p className="eyebrow">Welcome back</p>
            <h2>{customerProfile.name}</h2>
            <p>
              Book service support for your home or for someone else. When you
              choose a far-away location, Workven captures the right contact
              details before assigning the job.
            </p>
          </div>

          <div className="hero-pill-grid">
            <div className="soft-pill">
              <strong>{recipientContact.name}</strong>
              <span>Active contact for this booking</span>
            </div>
            <div className="soft-pill">
              <strong>{selectedSlot.label}</strong>
              <span>Current arrival plan</span>
            </div>
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="dashboard-main">
            <section className="panel card search-card">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Search repairs</p>
                  <h3>What needs repair today?</h3>
                </div>
              </div>

              <label className="field">
                <span>Search services</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Electrical, plumbing, AC and more"
                />
              </label>

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
                    onClick={() => {
                      setSelectedService(service.name)
                      setRepairIssue(repairCatalog[service.name][0])
                      setSearchQuery(`${service.name} repair`)
                    }}
                  >
                    <span className="service-mark">{service.shortLabel}</span>
                    <strong>{service.name}</strong>
                    <small>{service.blurb}</small>
                    <span>{service.eta}</span>
                  </button>
                ))}
              </div>
            </section>

            <form className="panel card" onSubmit={handleBooking}>
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Schedule arrival</p>
                  <h3>Choose repair type and arrival time</h3>
                </div>
              </div>

              <label className="field">
                <span>Repair issue</span>
                <input
                  type="text"
                  value={repairIssue}
                  onChange={(event) => setRepairIssue(event.target.value)}
                  placeholder="Describe the problem"
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

              <div className="slot-grid">
                {arrivalSlots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    className={timeSlotId === slot.id ? 'slot-card slot-card--active' : 'slot-card'}
                    onClick={() => setTimeSlotId(slot.id)}
                  >
                    <strong>{slot.label}</strong>
                    <small>{slot.caption}</small>
                  </button>
                ))}
              </div>

              <label className="field">
                <span>Extra notes</span>
                <textarea
                  rows="4"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Example: The kitchen switch sparks only when the chimney is turned on."
                />
              </label>

              <div className="booking-summary">
                <div>
                  <span>Arrival estimate</span>
                  <strong>{selectedSlot.label}</strong>
                </div>
                <div>
                  <span>Job contact</span>
                  <strong>
                    {recipientContact.name} | {recipientContact.mobile}
                  </strong>
                </div>
                <div>
                  <span>Service address</span>
                  <strong>{selectedLocation.address}</strong>
                </div>
              </div>

              <button type="submit" className="primary-button">
                Book appointment
              </button>

              {bookingMessage ? <p className="success-note">{bookingMessage}</p> : null}
            </form>
          </div>

          <aside className="dashboard-side">
            <section className="panel card">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Active location</p>
                  <h3>Address and contact</h3>
                </div>
              </div>

              <div className="detail-stack">
                <div className="detail-item">
                  <span>Address</span>
                  <strong>{selectedLocation.address}</strong>
                </div>
                <div className="detail-item">
                  <span>Contact for this job</span>
                  <strong>
                    {recipientContact.name} | {recipientContact.mobile}
                  </strong>
                </div>
                <div className="detail-item">
                  <span>Relation</span>
                  <strong>{recipientContact.relation}</strong>
                </div>
              </div>
            </section>

            <section className="panel card">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Orders</p>
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
                      <span className="status-badge">{order.total}</span>
                    </div>
                    <p>{order.issue}</p>
                    <small>{order.arrivalWindow}</small>
                  </article>
                ))}
              </div>

              <button
                type="button"
                className="secondary-button"
                onClick={() => navigate('/customer/profile')}
              >
                Open profile and invoices
              </button>
            </section>
          </aside>
        </section>
      </section>

      {locationPanelOpen ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setLocationPanelOpen(false)}>
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
              <button
                type="button"
                className="ghost-button"
                onClick={() => setLocationPanelOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="current-location-card">
              <span className="eyebrow">Detected address</span>
              <strong>{selectedLocation.address}</strong>
              <small>Tap use current location to refresh this automatically.</small>
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
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setManualLocation((current) => ({
                    ...current,
                    label: current.label || 'New address',
                  }))
                }
              >
                Add location manually
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
                    setManualLocation((current) => ({
                      ...current,
                      label: event.target.value,
                    }))
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
                    setManualLocation((current) => ({
                      ...current,
                      address: event.target.value,
                    }))
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
                      setManualLocation((current) => ({
                        ...current,
                        city: event.target.value,
                      }))
                    }
                    placeholder="City"
                  />
                </label>
                <label className="field">
                  <span>Distance</span>
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
              <form className="panel card far-location-card" onSubmit={handleFarLocationConfirm}>
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Far-away location</p>
                    <h3>Is this booking for you?</h3>
                  </div>
                </div>

                <p>
                  {pendingFarLocation.address} is far from your usual area. Use your
                  own details or enter the contact details of the person staying there.
                </p>

                <div className="quick-chip-list">
                  <button
                    type="button"
                    className={contactMode === 'self' ? 'quick-chip quick-chip--active' : 'quick-chip'}
                    onClick={() => setContactMode('self')}
                  >
                    Yes, use my details
                  </button>
                  <button
                    type="button"
                    className={contactMode === 'guest' ? 'quick-chip quick-chip--active' : 'quick-chip'}
                    onClick={() => setContactMode('guest')}
                  >
                    No, another person lives there
                  </button>
                </div>

                {contactMode === 'guest' ? (
                  <div className="field-row field-row--stackable">
                    <label className="field">
                      <span>Contact name</span>
                      <input
                        type="text"
                        value={contactDraft.name}
                        onChange={(event) =>
                          setContactDraft((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                        placeholder="Person receiving the service"
                        required
                      />
                    </label>
                    <label className="field">
                      <span>Mobile number</span>
                      <input
                        type="tel"
                        value={contactDraft.mobile}
                        onChange={(event) =>
                          setContactDraft((current) => ({
                            ...current,
                            mobile: event.target.value,
                          }))
                        }
                        placeholder="+91 90000 00000"
                        required
                      />
                    </label>
                    <label className="field">
                      <span>Relation</span>
                      <input
                        type="text"
                        value={contactDraft.relation}
                        onChange={(event) =>
                          setContactDraft((current) => ({
                            ...current,
                            relation: event.target.value,
                          }))
                        }
                        placeholder="Family, Tenant, Office admin"
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
      ) : null}
    </main>
  )
}

function CustomerProfilePage({
  customerProfile,
  setCustomerProfile,
  selectedLocation,
  savedLocations,
  recipientContact,
  orders,
  language,
  setLanguage,
  feedbackEntries,
  setFeedbackEntries,
  setOrders,
  navigate,
  setCustomerSession,
}) {
  const [feedbackForm, setFeedbackForm] = useState({
    orderId: orders[0]?.id ?? '',
    workRating: 5,
    workerRating: 5,
    qualityRating: 5,
    comments: '',
    beforeImage: '',
    afterImage: '',
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
          ? { ...order, feedbackSubmitted: true }
          : order,
      ),
    )
    setFeedbackForm({
      orderId: orders[0]?.id ?? '',
      workRating: 5,
      workerRating: 5,
      qualityRating: 5,
      comments: '',
      beforeImage: '',
      afterImage: '',
    })
    setProfileMessage('Feedback saved with before and after images.')
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
                Preferred service location: {selectedLocation.label} | Member since{' '}
                {customerProfile.memberSince}
              </small>
            </div>
          </div>
        </div>

        <section className="profile-grid">
          <article className="panel card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">1. Profile</p>
                <h3>Edit customer details</h3>
              </div>
            </div>

            <div className="field-row field-row--stackable">
              <label className="field">
                <span>Name</span>
                <input
                  type="text"
                  value={customerProfile.name}
                  onChange={(event) =>
                    setCustomerProfile((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="field">
                <span>Mobile</span>
                <input
                  type="tel"
                  value={customerProfile.mobile}
                  onChange={(event) =>
                    setCustomerProfile((current) => ({
                      ...current,
                      mobile: event.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <div className="field-row field-row--stackable">
              <label className="field">
                <span>Email</span>
                <input
                  type="email"
                  value={customerProfile.email}
                  onChange={(event) =>
                    setCustomerProfile((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="field">
                <span>City</span>
                <input
                  type="text"
                  value={customerProfile.city}
                  onChange={(event) =>
                    setCustomerProfile((current) => ({
                      ...current,
                      city: event.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <label className="field">
              <span>Profile image</span>
              <input type="file" accept="image/*" onChange={handleAvatarUpload} />
            </label>
          </article>

          <article className="panel card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">2. Address</p>
                <h3>Saved addresses</h3>
              </div>
            </div>

            <div className="address-stack">
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

          <article className="panel card profile-wide-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">3. Orders</p>
                <h3>Previous orders and invoices</h3>
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
                  <p>{order.issue}</p>
                  <small>
                    {order.arrivalWindow} | {order.workerName}
                  </small>

                  <div className="invoice-line-items">
                    {order.lineItems.map((item) => (
                      <div key={`${order.id}-${item.label}`} className="invoice-line-item">
                        <span>{item.label}</span>
                        <strong>{item.amount}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="invoice-total">
                    <span>Total</span>
                    <strong>{order.total}</strong>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <article className="panel card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">4. Language</p>
                <h3>Choose app language</h3>
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
          </article>

          <article className="panel card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">5. Support</p>
                <h3>Need help?</h3>
              </div>
            </div>

            <p>
              Reach support at{' '}
              <a href="mailto:sankusaikiran93@gmail.com">sankusaikiran93@gmail.com</a>.
            </p>

            <button type="button" className="secondary-button" onClick={() => setCustomerSession(false)}>
              Sign out
            </button>
          </article>

          <article className="panel card profile-wide-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">6. Feedback</p>
                <h3>Rate work quality with before and after images</h3>
              </div>
            </div>

            <form className="feedback-form" onSubmit={handleFeedbackSubmit}>
              <label className="field">
                <span>Completed order</span>
                <select
                  value={feedbackForm.orderId}
                  onChange={(event) =>
                    setFeedbackForm((current) => ({
                      ...current,
                      orderId: event.target.value,
                    }))
                  }
                >
                  {orders.map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.id} | {order.service} | {order.issue}
                    </option>
                  ))}
                </select>
              </label>

              <div className="field-row field-row--stackable">
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

              <div className="rating-grid">
                <RatingInput
                  label="Work"
                  value={feedbackForm.workRating}
                  onChange={(value) =>
                    setFeedbackForm((current) => ({
                      ...current,
                      workRating: value,
                    }))
                  }
                />
                <RatingInput
                  label="Worker"
                  value={feedbackForm.workerRating}
                  onChange={(value) =>
                    setFeedbackForm((current) => ({
                      ...current,
                      workerRating: value,
                    }))
                  }
                />
                <RatingInput
                  label="Quality"
                  value={feedbackForm.qualityRating}
                  onChange={(value) =>
                    setFeedbackForm((current) => ({
                      ...current,
                      qualityRating: value,
                    }))
                  }
                />
              </div>

              <label className="field">
                <span>Comments</span>
                <textarea
                  rows="4"
                  value={feedbackForm.comments}
                  onChange={(event) =>
                    setFeedbackForm((current) => ({
                      ...current,
                      comments: event.target.value,
                    }))
                  }
                  placeholder="Share feedback on the work, worker behaviour and quality."
                />
              </label>

              <button type="submit" className="primary-button">
                Submit feedback
              </button>
            </form>

            {profileMessage ? <p className="success-note">{profileMessage}</p> : null}

            {feedbackEntries.length ? (
              <div className="feedback-log">
                {feedbackEntries.slice(0, 3).map((feedback) => (
                  <article key={feedback.id} className="feedback-log-card">
                    <strong>{feedback.orderId}</strong>
                    <p>
                      Work {feedback.workRating}/5 | Worker {feedback.workerRating}/5 | Quality{' '}
                      {feedback.qualityRating}/5
                    </p>
                    <small>{feedback.createdAt}</small>
                  </article>
                ))}
              </div>
            ) : null}
          </article>
        </section>
      </section>
    </main>
  )
}

function PartnerPortal({
  partnerSession,
  setPartnerSession,
  partnerProfile,
  setPartnerProfile,
  partnerLeads,
}) {
  if (!partnerSession) {
    return (
      <PartnerLogin
        partnerProfile={partnerProfile}
        setPartnerProfile={setPartnerProfile}
        setPartnerSession={setPartnerSession}
      />
    )
  }

  return (
    <PartnerDashboard
      partnerProfile={partnerProfile}
      partnerLeads={partnerLeads}
      setPartnerSession={setPartnerSession}
    />
  )
}

function PartnerLogin({ partnerProfile, setPartnerProfile, setPartnerSession }) {
  const [form, setForm] = useState(partnerProfile)

  const handleSubmit = (event) => {
    event.preventDefault()
    setPartnerProfile(form)
    setPartnerSession(true)
  }

  return (
    <main className="portal-page portal-page--hero">
      <section className="hero-panel hero-panel--partner">
        <div className="hero-copy">
          <p className="eyebrow">Worker experience</p>
          <h2>Workven Partner routes nearby jobs first and alerts specialists with sound.</h2>
          <p>
            Accept bookings from customers, capture before and after work photos,
            and keep a ready queue of nearby service appointments.
          </p>

          <div className="hero-highlights">
            <div className="stat-card">
              <strong>Nearby first</strong>
              <span>Closest skilled partners are notified first</span>
            </div>
            <div className="stat-card">
              <strong>Before / After</strong>
              <span>Capture proof of work quality</span>
            </div>
            <div className="stat-card">
              <strong>Live queue</strong>
              <span>Sound-backed appointment alerts</span>
            </div>
          </div>
        </div>

        <form className="panel card form-card" onSubmit={handleSubmit}>
          <div className="section-heading">
            <div>
              <p className="eyebrow">Partner sign in</p>
              <h3>Workven Partner login</h3>
            </div>
          </div>

          <label className="field">
            <span>Name</span>
            <input
              type="text"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
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
              required
            />
          </label>

          <div className="field-row">
            <label className="field">
              <span>Skill</span>
              <select
                value={form.skill}
                onChange={(event) =>
                  setForm((current) => ({ ...current, skill: event.target.value }))
                }
              >
                {['Electrical', 'Plumbing', 'AC', 'Carpentry', 'Appliance', 'Multi-Skill'].map(
                  (skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="field">
              <span>Experience</span>
              <input
                type="text"
                value={form.experience}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    experience: event.target.value,
                  }))
                }
              />
            </label>
          </div>

          <button type="submit" className="primary-button">
            Enter Partner Site
          </button>
        </form>
      </section>
    </main>
  )
}

function PartnerDashboard({ partnerProfile, partnerLeads, setPartnerSession }) {
  const [online, setOnline] = useState(true)
  const [releasedIndex, setReleasedIndex] = useState(2)
  const [highlightJobId, setHighlightJobId] = useState('')
  const [jobPhotos, setJobPhotos] = useState({})
  const [jobStatuses, setJobStatuses] = useState({})
  const [soundReady, setSoundReady] = useState(false)

  const liveTemplateJobs = partnerJobTemplates.slice(0, releasedIndex)
  const mergedJobs = sortJobsByDistance([...partnerLeads, ...liveTemplateJobs])
  const filteredJobs =
    partnerProfile.skill === 'Multi-Skill'
      ? mergedJobs
      : mergedJobs.filter((job) => job.service === partnerProfile.skill)
  const nearbyJobs = filteredJobs.filter((job) => job.distanceKm <= 5)
  const nextCircleJobs = filteredJobs.filter((job) => job.distanceKm > 5)

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
    if (!partnerLeads.length || !online) {
      return
    }

    const latestLead = sortJobsByDistance(partnerLeads)[0]
    setHighlightJobId(latestLead.id)

    if (soundReady) {
      playNotificationTone()
    }
  }, [online, partnerLeads, soundReady])

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

  const handleSoundEnable = () => {
    setSoundReady(true)
    playNotificationTone()
  }

  const updateJobStatus = (jobId, status) => {
    setJobStatuses((current) => ({
      ...current,
      [jobId]: status,
    }))
  }

  const renderJobCard = (job) => {
    const status = jobStatuses[job.id] || job.status
    const media = jobPhotos[job.id] || {}
    const highlighted = highlightJobId === job.id

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
          {job.arrivalWindow} | {job.priority}
        </small>

        <div className="job-card__actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => updateJobStatus(job.id, 'Accepted')}
          >
            Accept
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => updateJobStatus(job.id, 'On the way')}
          >
            On the way
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => updateJobStatus(job.id, 'Completed')}
          >
            Complete
          </button>
        </div>

        <div className="field-row field-row--stackable">
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
      <section className="partner-home">
        <div className="partner-banner panel">
          <div className="profile-hero">
            <Avatar profile={partnerProfile} size="lg" />
            <div>
              <p className="eyebrow">Partner dashboard</p>
              <h2>{partnerProfile.name}</h2>
              <p>
                {partnerProfile.skill} specialist | {partnerProfile.experience}
              </p>
              <small>{partnerProfile.mobile}</small>
            </div>
          </div>

          <div className="hero-pill-grid">
            <button
              type="button"
              className={online ? 'soft-pill soft-pill--active' : 'soft-pill'}
              onClick={() => setOnline((current) => !current)}
            >
              <strong>{online ? 'Online for jobs' : 'Offline'}</strong>
              <span>Toggle availability</span>
            </button>
            <button type="button" className="soft-pill" onClick={handleSoundEnable}>
              <strong>{soundReady ? 'Sound enabled' : 'Enable alert sound'}</strong>
              <span>Play a quick notification tone</span>
            </button>
            <button type="button" className="soft-pill" onClick={() => setPartnerSession(false)}>
              <strong>Sign out</strong>
              <span>Leave Workven Partner</span>
            </button>
          </div>
        </div>

        <section className="dashboard-grid">
          <div className="dashboard-main">
            <section className="panel card">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Nearby first</p>
                  <h3>Immediate bookings for {partnerProfile.skill}</h3>
                </div>
              </div>

              {nearbyJobs.length ? (
                <div className="job-grid">{nearbyJobs.map(renderJobCard)}</div>
              ) : (
                <p className="info-note">
                  No nearby jobs are waiting for this skill right now. New bookings
                  will ring here first when customers schedule them.
                </p>
              )}
            </section>
          </div>

          <aside className="dashboard-side">
            <section className="panel card">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Notification queue</p>
                  <h3>How the routing works</h3>
                </div>
              </div>

              <div className="detail-stack">
                <div className="detail-item">
                  <span>Step 1</span>
                  <strong>Only matching service partners receive the request.</strong>
                </div>
                <div className="detail-item">
                  <span>Step 2</span>
                  <strong>Nearby partners are notified with sound first.</strong>
                </div>
                <div className="detail-item">
                  <span>Step 3</span>
                  <strong>Wider radius partners get the booking if still unclaimed.</strong>
                </div>
              </div>
            </section>

            <section className="panel card">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Next circle</p>
                  <h3>Extended radius jobs</h3>
                </div>
              </div>

              {nextCircleJobs.length ? (
                <div className="job-grid job-grid--compact">{nextCircleJobs.map(renderJobCard)}</div>
              ) : (
                <p className="info-note">
                  Nearby jobs are available first. Extended radius jobs will appear
                  here afterwards.
                </p>
              )}
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

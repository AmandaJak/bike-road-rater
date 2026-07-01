import { useState, useCallback, useRef } from 'react'
import AddressPanel from './components/AddressPanel'
import FilterPanel from './components/FilterPanel'
import RouteList from './components/RouteList'
import MapView from './components/MapView'
import { useRoutes } from './hooks/useRoutes'
import translations from './i18n/translations'

const DEFAULT_FILTERS = { preferCycleways: 0.5, avoidLargeRoads: 0.5 }
const DEFAULT_HARD_EXCLUDES = { avoidStateRoads: false }
const ACCENT = '#3B6D11'

export default function App() {
  const [lang, setLang] = useState('da')
  const t = translations[lang]

  const [fromAddress, setFromAddress] = useState('')
  const [toAddress, setToAddress] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [hardExcludes, setHardExcludes] = useState(DEFAULT_HARD_EXCLUDES)

  // Feedback form state
  const [usable, setUsable] = useState(null)
  const [priorities, setPriorities] = useState([])
  const [otherChecked, setOtherChecked] = useState(false)
  const [otherText, setOtherText] = useState('')
  const [needText, setNeedText] = useState('')
  const [routeIssue, setRouteIssue] = useState('')
  const [routeSuggest, setRouteSuggest] = useState('')
  const [thoughts, setThoughts] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [copied, setCopied] = useState(false)
  const copyTimerRef = useRef(null)

  const {
    fromCoords,
    toCoords,
    routes,
    selectedRouteIndex,
    setSelectedRouteIndex,
    status,
    errorKey,
    suggestedAddress,
    search,
    reScore,
  } = useRoutes()

  const handleSearch = useCallback(() => {
    search(fromAddress, toAddress, hardExcludes)
  }, [fromAddress, toAddress, hardExcludes, search])

  const handleFilterChange = useCallback(
    (newFilters) => {
      setFilters(newFilters)
      reScore(newFilters)
    },
    [reScore],
  )

  const handleUseSuggestion = useCallback(() => {
    if (!suggestedAddress) return
    const newFrom = suggestedAddress.from ?? fromAddress
    const newTo = suggestedAddress.to ?? toAddress
    setFromAddress(newFrom)
    setToAddress(newTo)
    search(newFrom, newTo, hardExcludes)
  }, [suggestedAddress, fromAddress, toAddress, hardExcludes, search])

  const handleHardExcludeChange = useCallback(
    (newHardExcludes) => {
      setHardExcludes(newHardExcludes)
      if (fromAddress && toAddress) {
        search(fromAddress, toAddress, newHardExcludes)
      }
    },
    [fromAddress, toAddress, search],
  )

  const shareUrl = () => {
    const p = new URLSearchParams()
    if (fromAddress) p.set('from', fromAddress)
    if (toAddress) p.set('to', toAddress)
    p.set('cycle', filters.preferCycleways)
    p.set('avoid', filters.avoidLargeRoads)
    return window.location.origin + '/?' + p.toString()
  }

  const handleCopyRoute = () => {
    const url = shareUrl()
    const done = () => {
      setCopied(true)
      clearTimeout(copyTimerRef.current)
      copyTimerRef.current = setTimeout(() => setCopied(false), 2200)
    }
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(done).catch(done)
    } else {
      const ta = document.createElement('textarea')
      ta.value = url
      document.body.appendChild(ta)
      ta.select()
      try { document.execCommand('copy') } catch (_) {}
      document.body.removeChild(ta)
      done()
    }
  }

  const togglePriority = (key) => {
    setPriorities((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    )
  }

  const showBottomPanel =
    status === 'loading' || status === 'error' || status === 'no_route' || routes.length > 0

  const PRIORITY_KEYS = [
    { key: 'separatedLanes', label: t.feedbackPrioritySeparatedLanes },
    { key: 'lowTraffic', label: t.feedbackPriorityLowTraffic },
    { key: 'surfaceQuality', label: t.feedbackPrioritySurfaceQuality },
    { key: 'lighting', label: t.feedbackPriorityLighting },
    { key: 'safeCrossings', label: t.feedbackPrioritySafeCrossings },
  ]

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #d3d0c6',
    borderRadius: '7px',
    fontSize: '15px',
    fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
    color: '#1c2530',
    outline: 'none',
    background: '#fff',
    boxSizing: 'border-box',
    resize: 'vertical',
  }

  const sectionLabelStyle = {
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#8a929c',
    marginBottom: '16px',
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f1efe9',
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        color: '#1c2530',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* ── HERO ── */}
      <div style={{ background: '#173d29' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 24px' }}>
          {/* Navbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap', padding: '26px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: '#6cc08a' }} />
              <span style={{ fontSize: '21px', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}>Trygvej</span>
            </div>
            <div style={{ display: 'flex', border: '1px solid rgba(255,255,255,0.28)', borderRadius: '7px', overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setLang('da')}
                style={{
                  padding: '7px 16px',
                  border: 'none',
                  fontFamily: 'inherit',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: lang === 'da' ? '#fff' : 'transparent',
                  color: lang === 'da' ? '#173d29' : 'rgba(255,255,255,0.6)',
                  transition: 'background 0.15s',
                }}
              >
                DA
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                style={{
                  padding: '7px 16px',
                  border: 'none',
                  fontFamily: 'inherit',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: lang === 'en' ? '#fff' : 'transparent',
                  color: lang === 'en' ? '#173d29' : 'rgba(255,255,255,0.6)',
                  transition: 'background 0.15s',
                }}
              >
                EN
              </button>
            </div>
          </div>
          {/* Headline + subline */}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '22px', padding: '72px 0 84px' }}>
            <h1
              style={{
                margin: 0,
                maxWidth: '18ch',
                fontSize: 'clamp(40px, 5.2vw, 58px)',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                lineHeight: 1.08,
                color: '#ffffff',
                textWrap: 'balance',
              }}
            >
              {t.heroHeadline}
            </h1>
            <p style={{ margin: 0, maxWidth: '600px', fontSize: '19px', lineHeight: 1.55, color: '#9cc6ab', fontWeight: 400 }}>
              {t.heroSubline}
            </p>
          </div>
        </div>
      </div>

      {/* ── LIGHT CONTENT ── */}
      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 24px 72px' }}>

        {/* DEMO BANNER */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginTop: '24px',
            background: '#fff',
            border: '1px solid #e2dfd5',
            borderLeft: `3px solid ${ACCENT}`,
            borderRadius: '0 12px 12px 0',
            padding: '18px 22px',
          }}
        >
          <div
            style={{
              flexShrink: 0,
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              border: `1.5px solid ${ACCENT}`,
              color: ACCENT,
              fontWeight: 700,
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            i
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '14px', color: '#1c2530', marginBottom: '2px' }}>{t.demoTitle}</div>
            <div style={{ fontSize: '14px', lineHeight: 1.5, color: '#5b6672' }}>{t.demoBody}</div>
          </div>
          <a
            href="#feedback"
            style={{
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              padding: '7px 14px',
              background: 'transparent',
              border: `1px solid ${ACCENT}`,
              borderRadius: '7px',
              textDecoration: 'none',
              color: ACCENT,
              fontSize: '13px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(59,109,17,0.07)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            {t.demoCta}
          </a>
        </div>

        {/* HOW TO USE */}
        <div style={{ marginTop: '24px', background: '#fff', border: '1px solid #e6e3d9', borderRadius: '12px', padding: '32px 36px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8a929c', marginBottom: '18px' }}>
            {t.howToLabel}
          </div>
          <p style={{ margin: 0, maxWidth: '820px', fontSize: '19px', lineHeight: 1.7, color: '#3a4450', fontWeight: 400 }}>
            {lang === 'da' ? (
              <>
                Indtast en{' '}
                <span style={{ color: ACCENT, fontWeight: 500 }}>start- og slutadresse</span>
                , justér{' '}
                <span style={{ color: ACCENT, fontWeight: 500 }}>filtrene</span>
                {' '}efter dine ønsker, og hold musen over ruten for at se{' '}
                <span style={{ color: ACCENT, fontWeight: 500 }}>vejtypen</span>
                {' '}for hver strækning. Brug det som vejledning til at gennemgå ruter — inden du lader dit barn cykle alene.
              </>
            ) : (
              <>
                Enter a{' '}
                <span style={{ color: ACCENT, fontWeight: 500 }}>start and end address</span>
                , adjust the{' '}
                <span style={{ color: ACCENT, fontWeight: 500 }}>filters</span>
                {' '}to your preference, and hover the route to see the{' '}
                <span style={{ color: ACCENT, fontWeight: 500 }}>road type</span>
                {' '}of each segment. Use it as guidance to review routes — before letting your child ride alone.
              </>
            )}
          </p>
          <p style={{ margin: '20px 0 0', fontSize: '14px', lineHeight: 1.5, color: '#9aa1aa' }}>{t.howToDisclaimer}</p>
        </div>

        {/* APP PANEL */}
        <div
          style={{
            marginTop: '24px',
            background: '#fff',
            border: '1px solid #d7d4ca',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 1px 2px rgba(20,30,40,0.04)',
          }}
        >
          {/* Top row: sidebar + map */}
          <div style={{ display: 'flex', height: '620px' }}>
            {/* Sidebar */}
            <div
              style={{
                width: '348px',
                flexShrink: 0,
                borderRight: '1px solid #e5e2d8',
                padding: '24px',
                overflowY: 'auto',
              }}
            >
              <div style={sectionLabelStyle}>{t.appPanelTitle}</div>
              <AddressPanel
                t={t}
                fromAddress={fromAddress}
                toAddress={toAddress}
                onFromChange={setFromAddress}
                onToChange={setToAddress}
                onSearch={handleSearch}
                loading={status === 'loading'}
              />
              <div style={{ height: '1px', background: '#e5e2d8', margin: '24px 0' }} />
              <FilterPanel
                t={t}
                filters={filters}
                hardExcludes={hardExcludes}
                onFilterChange={handleFilterChange}
                onHardExcludeChange={handleHardExcludeChange}
              />
            </div>

            {/* Map */}
            <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
              {status === 'loading' && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255,255,255,0.6)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: '#5b6672' }}>
                    <svg className="animate-spin" style={{ width: '32px', height: '32px', color: ACCENT }} fill="none" viewBox="0 0 24 24">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>{t.calculating}</span>
                  </div>
                </div>
              )}
              <MapView
                t={t}
                routes={routes}
                selectedRouteIndex={selectedRouteIndex}
                fromCoords={fromCoords}
                toCoords={toCoords}
              />
            </div>
          </div>

          {/* Bottom panel: route cards */}
          {showBottomPanel && (
            <div style={{ borderTop: '1px solid #e5e2d8', padding: '20px 24px' }}>
              <RouteList
                t={t}
                routes={routes}
                selectedRouteIndex={selectedRouteIndex}
                onSelect={setSelectedRouteIndex}
                status={status}
                errorKey={errorKey}
                suggestedAddress={suggestedAddress}
                onUseSuggestion={handleUseSuggestion}
                fromAddress={fromAddress}
                toAddress={toAddress}
              />
            </div>
          )}
        </div>

        {/* RESOURCE CARDS */}
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.01em', color: '#1c2530' }}>
            {t.resourcesTitle}
          </h2>
          <p style={{ margin: '0 0 20px', fontSize: '15px', color: '#5b6672', lineHeight: 1.5 }}>
            {t.resourcesSubtitle}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <ResourceCard
              href="https://www.sikkertrafik.dk/rad-og-viden/cykel/born-pa-cykel/"
              icon={<ShieldIcon />}
              title={t.resource1Title}
              desc={t.resource1Desc}
            />
            <ResourceCard
              href="https://www.cyklistforbundet.dk/alt-om-cykling/til-foraeldre"
              icon={<BikeIcon />}
              title={t.resource2Title}
              desc={t.resource2Desc}
            />
          </div>
        </div>

        {/* FEEDBACK FORM */}
        <div id="feedback" style={{ marginTop: '40px', scrollMarginTop: '24px', maxWidth: '580px' }}>
          <h2 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.01em', color: '#1c2530' }}>
            {t.feedbackTitle}
          </h2>
          <p style={{ margin: '0 0 24px', fontSize: '15px', color: '#5b6672', lineHeight: 1.5 }}>
            {t.feedbackSubtitle}
          </p>

          {submitted ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                background: '#eaf2ec',
                border: '1px solid #bcd6c4',
                borderRadius: '10px',
                padding: '22px 24px',
              }}
            >
              <div
                style={{
                  flexShrink: 0,
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: ACCENT,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '16px',
                }}
              >
                ✓
              </div>
              <div style={{ fontSize: '16px', color: '#2b4a36', fontWeight: 500 }}>{t.feedbackConfirm}</div>
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); setSubmitted(true) }}
              style={{ background: '#fff', border: '1px solid #e2dfd5', borderRadius: '12px', padding: '28px 32px' }}
            >
              {/* Q1: Usable? */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#2b333d', marginBottom: '12px' }}>{t.feedbackQ1}</div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {[
                    { k: 'yes', label: t.feedbackUsableYes },
                    { k: 'somewhat', label: t.feedbackUsableSomewhat },
                    { k: 'no', label: t.feedbackUsableNo },
                  ].map(({ k, label }) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setUsable(k)}
                      style={{
                        padding: '10px 18px',
                        border: usable === k ? `1.5px solid ${ACCENT}` : '1.5px solid #d3d0c6',
                        borderRadius: '7px',
                        background: usable === k ? ACCENT : '#fff',
                        color: usable === k ? '#fff' : '#39414c',
                        fontFamily: 'inherit',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q2: What do you need (shown if somewhat/no) */}
              {(usable === 'somewhat' || usable === 'no') && (
                <div style={{ marginBottom: '28px' }}>
                  <label style={{ display: 'block', fontSize: '15px', fontWeight: 600, color: '#2b333d', marginBottom: '10px' }}>
                    {t.feedbackNeedQ}
                  </label>
                  <textarea
                    value={needText}
                    onChange={(e) => setNeedText(e.target.value)}
                    rows={3}
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = ACCENT }}
                    onBlur={(e) => { e.target.style.borderColor = '#d3d0c6' }}
                  />
                </div>
              )}

              {/* Q3: Priorities */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#2b333d', marginBottom: '12px' }}>{t.feedbackPrioritiesQ}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                  {PRIORITY_KEYS.map(({ key, label }) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '11px', cursor: 'pointer', fontSize: '15px', color: '#39414c' }}>
                      <input
                        type="checkbox"
                        checked={priorities.includes(key)}
                        onChange={() => togglePriority(key)}
                        style={{ width: '17px', height: '17px', accentColor: ACCENT, cursor: 'pointer' }}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '11px', cursor: 'pointer', fontSize: '15px', color: '#39414c' }}>
                    <input
                      type="checkbox"
                      checked={otherChecked}
                      onChange={(e) => setOtherChecked(e.target.checked)}
                      style={{ width: '17px', height: '17px', accentColor: ACCENT, cursor: 'pointer' }}
                    />
                    <span>{t.feedbackOtherLabel}</span>
                  </label>
                  {otherChecked && (
                    <input
                      type="text"
                      value={otherText}
                      onChange={(e) => setOtherText(e.target.value)}
                      placeholder={t.feedbackOtherPh}
                      style={{ ...inputStyle, marginLeft: '28px', width: 'calc(100% - 28px)', resize: 'none', padding: '10px 12px', fontSize: '14px' }}
                      onFocus={(e) => { e.target.style.borderColor = ACCENT }}
                      onBlur={(e) => { e.target.style.borderColor = '#d3d0c6' }}
                    />
                  )}
                </div>
              </div>

              {/* Route feedback section */}
              <div style={{ marginBottom: '28px', paddingTop: '24px', borderTop: '1px solid #e5e2d8' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#2b333d' }}>{t.feedbackRouteSection}</div>
                  <button
                    type="button"
                    onClick={handleCopyRoute}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      padding: '7px 13px',
                      border: `1px solid ${ACCENT}`,
                      borderRadius: '7px',
                      background: 'transparent',
                      color: ACCENT,
                      fontFamily: 'inherit',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(59,109,17,0.07)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  >
                    ⧉ {copied ? t.feedbackCopied : t.feedbackCopyBtn}
                  </button>
                </div>
                <div style={{ fontSize: '13px', color: '#8a929c', marginBottom: '16px' }}>{t.feedbackCopyHint}</div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#39414c', marginBottom: '8px' }}>{t.feedbackRouteIssueQ}</label>
                  <textarea
                    value={routeIssue}
                    onChange={(e) => setRouteIssue(e.target.value)}
                    rows={2}
                    style={{ ...inputStyle, fontSize: '14px' }}
                    onFocus={(e) => { e.target.style.borderColor = ACCENT }}
                    onBlur={(e) => { e.target.style.borderColor = '#d3d0c6' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#39414c', marginBottom: '8px' }}>{t.feedbackRouteSuggestQ}</label>
                  <textarea
                    value={routeSuggest}
                    onChange={(e) => setRouteSuggest(e.target.value)}
                    rows={2}
                    style={{ ...inputStyle, fontSize: '14px' }}
                    onFocus={(e) => { e.target.style.borderColor = ACCENT }}
                    onBlur={(e) => { e.target.style.borderColor = '#d3d0c6' }}
                  />
                </div>
              </div>

              {/* Free thoughts */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '15px', fontWeight: 600, color: '#2b333d', marginBottom: '4px' }}>{t.feedbackThoughtsQ}</label>
                <div style={{ fontSize: '13px', color: '#8a929c', marginBottom: '10px' }}>{t.feedbackOptional}</div>
                <textarea
                  value={thoughts}
                  onChange={(e) => setThoughts(e.target.value)}
                  rows={3}
                  placeholder={t.feedbackThoughtsPh}
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = ACCENT }}
                  onBlur={(e) => { e.target.style.borderColor = '#d3d0c6' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '7px',
                  background: ACCENT,
                  color: '#fff',
                  fontFamily: 'inherit',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'filter 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.93)' }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = '' }}
              >
                {t.feedbackSubmit}
              </button>
            </form>
          )}
        </div>

        {/* FOOTER */}
        <div
          style={{
            marginTop: '48px',
            paddingTop: '24px',
            borderTop: '1px solid #e2dfd5',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '13px',
            color: '#8a929c',
          }}
        >
          <span>{t.footerTagline}</span>
          <span dangerouslySetInnerHTML={{ __html: t.mapAttribution }} />
        </div>
      </div>
    </div>
  )
}

function ResourceCard({ href, icon, title, desc }) {
  const [hovered, setHovered] = useState(false)
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'block',
        textDecoration: 'none',
        background: '#fff',
        border: `1px solid ${hovered ? ACCENT : '#e2dfd5'}`,
        borderRadius: '12px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'border-color 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ color: ACCENT }}>{icon}</div>
        <span style={{ color: '#8a929c' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17L17 7" /><path d="M7 7h10v10" />
          </svg>
        </span>
      </div>
      <div style={{ fontSize: '14px', fontWeight: 600, color: '#1c2530', marginBottom: '4px' }}>{title}</div>
      <div style={{ fontSize: '13px', color: '#5b6672', lineHeight: 1.45 }}>{desc}</div>
    </a>
  )
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

function BikeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="18.5" cy="17.5" r="3.5" />
      <circle cx="15" cy="5" r="1" />
      <path d="M12 17.5V14l-3-3 4-3 2 3h2" />
    </svg>
  )
}

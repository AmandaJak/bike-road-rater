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
}

export default function AddressPanel({ t, fromAddress, toAddress, onFromChange, onToChange, onSearch, loading }) {
  function handleSubmit(e) {
    e.preventDefault()
    onSearch()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <input
        type="text"
        value={fromAddress}
        onChange={(e) => onFromChange(e.target.value)}
        placeholder={t.fromPlaceholder}
        disabled={loading}
        style={inputStyle}
        onFocus={(e) => { e.target.style.borderColor = '#3B6D11' }}
        onBlur={(e) => { e.target.style.borderColor = '#d3d0c6' }}
      />
      <input
        type="text"
        value={toAddress}
        onChange={(e) => onToChange(e.target.value)}
        placeholder={t.toPlaceholder}
        disabled={loading}
        style={inputStyle}
        onFocus={(e) => { e.target.style.borderColor = '#3B6D11' }}
        onBlur={(e) => { e.target.style.borderColor = '#d3d0c6' }}
      />
      <button
        type="submit"
        disabled={loading || !fromAddress.trim() || !toAddress.trim()}
        style={{
          width: '100%',
          padding: '13px',
          border: 'none',
          borderRadius: '7px',
          background: '#3B6D11',
          color: '#fff',
          fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
          fontSize: '15px',
          fontWeight: 600,
          cursor: loading || !fromAddress.trim() || !toAddress.trim() ? 'not-allowed' : 'pointer',
          opacity: loading || !fromAddress.trim() || !toAddress.trim() ? 0.5 : 1,
          transition: 'filter 0.15s',
        }}
        onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.filter = 'brightness(0.93)' }}
        onMouseLeave={(e) => { e.currentTarget.style.filter = '' }}
      >
        {loading ? t.calculating : t.searchButton}
      </button>
    </form>
  )
}

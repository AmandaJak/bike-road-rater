export default function FilterPanel({ t, filters, hardExcludes, onFilterChange, onHardExcludeChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8a929c', marginBottom: '18px' }}>
        {t.filterTitle}
      </div>

      <SliderField
        label={t.preferCycleways}
        value={filters.preferCycleways}
        onChange={(v) => onFilterChange({ ...filters, preferCycleways: v })}
      />
      <div style={{ marginTop: '16px' }}>
        <SliderField
          label={t.avoidLargeRoads}
          value={filters.avoidLargeRoads}
          onChange={(v) => onFilterChange({ ...filters, avoidLargeRoads: v })}
        />
      </div>

      <div style={{ height: '1px', background: '#e5e2d8', margin: '20px 0' }} />

      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: '#39414c' }}>
        <input
          type="checkbox"
          checked={hardExcludes.avoidStateRoads}
          onChange={(e) => onHardExcludeChange({ ...hardExcludes, avoidStateRoads: e.target.checked })}
          style={{ width: '17px', height: '17px', accentColor: '#3B6D11', cursor: 'pointer' }}
        />
        {t.avoidStateRoads}
      </label>
    </div>
  )
}

function SliderField({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: '14px', color: '#39414c' }}>{label}</span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '13px', fontWeight: 500, color: '#3B6D11' }}>
          {Math.round(value * 100)}%
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: '#3B6D11' }}
      />
    </div>
  )
}

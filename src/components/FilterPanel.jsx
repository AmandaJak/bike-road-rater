export default function FilterPanel({ t, filters, hardExcludes, onFilterChange, onHardExcludeChange }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t.filterTitle}</p>

      <SliderField
        label={t.preferCycleways}
        value={filters.preferCycleways}
        onChange={(v) => onFilterChange({ ...filters, preferCycleways: v })}
      />
      <SliderField
        label={t.avoidLargeRoads}
        value={filters.avoidLargeRoads}
        onChange={(v) => onFilterChange({ ...filters, avoidLargeRoads: v })}
      />

      <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
        <input
          type="checkbox"
          checked={hardExcludes.avoidStateRoads}
          onChange={(e) =>
            onHardExcludeChange({ ...hardExcludes, avoidStateRoads: e.target.checked })
          }
          className="mt-0.5 accent-green-600"
        />
        {t.avoidStateRoads}
      </label>
    </div>
  )
}

function SliderField({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-gray-600">
        <span>{label}</span>
        <span>{Math.round(value * 100)}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="accent-green-600"
      />
    </div>
  )
}

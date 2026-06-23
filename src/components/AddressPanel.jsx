export default function AddressPanel({ t, fromAddress, toAddress, onFromChange, onToChange, onSearch, loading }) {
  function handleSubmit(e) {
    e.preventDefault()
    onSearch()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        type="text"
        value={fromAddress}
        onChange={(e) => onFromChange(e.target.value)}
        placeholder={t.fromPlaceholder}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
        disabled={loading}
      />
      <input
        type="text"
        value={toAddress}
        onChange={(e) => onToChange(e.target.value)}
        placeholder={t.toPlaceholder}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading || !fromAddress.trim() || !toAddress.trim()}
        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? t.calculating : t.searchButton}
      </button>
    </form>
  )
}

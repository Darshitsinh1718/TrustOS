// src/components/AlertTable.jsx
export default function AlertTable({ alerts, onResolve }) {
  const typeColor = (t) => {
    if (t === 'SESSION_FROZEN') return 'bg-red-900 text-red-300'
    if (t === 'TRANSACTION_BLOCKED') return 'bg-orange-900 text-orange-300'
    return 'bg-gray-800 text-gray-300'
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-800">
        <h3 className="text-white font-semibold">Live Alerts</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b border-gray-800">
              <th className="px-6 py-3 text-left">Type</th>
              <th className="px-6 py-3 text-left">Message</th>
              <th className="px-6 py-3 text-left">Time</th>
              <th className="px-6 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((a) => (
              <tr key={a.id} className={`border-b border-gray-800 ${a.resolved ? 'opacity-40' : ''}`}>
                <td className="px-6 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${typeColor(a.alert_type)}`}>
                    {a.alert_type}
                  </span>
                </td>
                <td className="px-6 py-3 text-gray-300 max-w-xs truncate">{a.message}</td>
                <td className="px-6 py-3 text-gray-500">
                  {new Date(a.timestamp).toLocaleTimeString()}
                </td>
                <td className="px-6 py-3">
                  {!a.resolved && onResolve && (
                    <button
                      onClick={() => onResolve(a.id)}
                      className="text-xs text-indigo-400 hover:text-indigo-300"
                    >
                      Resolve
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {alerts.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-600">No alerts</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
function Status() {
    const statuses = [
      { name: 'API Server', status: 'Running', lastChecked: '2025-01-24 12:30 PM' },
      { name: 'Database', status: 'Running', lastChecked: '2025-01-24 12:30 PM' },
      { name: 'Frontend', status: 'Running', lastChecked: '2025-01-24 12:30 PM' },
      { name: 'Background Jobs', status: 'Paused', lastChecked: '2025-01-24 12:25 PM' }
    ];
  
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">System Status</h1>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Component
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Checked
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {statuses.map((status, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">{status.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        status.status === 'Running'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {status.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {status.lastChecked}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  
  export default Status
  
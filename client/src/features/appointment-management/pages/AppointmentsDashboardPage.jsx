import { useTodaySummary } from "../hooks/useAppointments";

const statusColors = {
  BOOKED: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CHECKED_IN: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
  NO_SHOW: "bg-orange-100 text-orange-800",
  RESCHEDULED: "bg-indigo-100 text-indigo-800"
};

export function AppointmentsDashboardPage() {
  const { data: summaryData, isLoading, error } = useTodaySummary();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error loading dashboard: {error.message}</p>
      </div>
    );
  }

  const summary = summaryData?.data || {};
  const byStatus = summary.byStatus || {};

  const stats = [
    { label: "Total Appointments", value: summary.total || 0, color: "bg-gray-500" },
    { label: "Booked", value: byStatus.booked || 0, color: "bg-blue-500" },
    { label: "Confirmed", value: byStatus.confirmed || 0, color: "bg-green-500" },
    { label: "Checked In", value: byStatus.checkedIn || 0, color: "bg-yellow-500" },
    { label: "Completed", value: byStatus.completed || 0, color: "bg-gray-500" },
    { label: "Cancelled", value: byStatus.cancelled || 0, color: "bg-red-500" },
    { label: "No Show", value: byStatus.noShow || 0, color: "bg-orange-500" }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Appointments Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Today's appointments overview - {new Date(summary.date).toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg shadow p-4 border-l-4"
            style={{ borderColor: stat.color.replace("bg-", "") }}
          >
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${stat.color} mr-3`}></div>
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-3">
            <a
              href="/appointments/book"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Book Appointment
            </a>
            <a
              href="/appointments/check-in"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
            >
              Check-In
            </a>
            <a
              href="/appointments/calendar"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Calendar
            </a>
            <a
              href="/appointments/reports"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Reports
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppointmentsDashboardPage;

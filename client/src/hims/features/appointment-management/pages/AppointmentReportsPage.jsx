import { useState } from "react";
import { Download, Calendar, User, Building, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useTodaySummary, useAppointments } from "../hooks/useAppointments";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";

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

export function AppointmentReportsPage() {
  const [reportType, setReportType] = useState("summary");
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  const { data: summaryData } = useTodaySummary();
  const { data: appointmentsData, isLoading } = useAppointments({
    startDate,
    endDate
  });

  const summary = summaryData?.data || {};
  const appointments = appointmentsData?.data || [];

  const stats = [
    { label: "Total Appointments", value: appointments.length, icon: Calendar },
    { label: "Completed", value: appointments.filter(a => a.status === "COMPLETED").length, icon: CheckCircle },
    { label: "Cancelled", value: appointments.filter(a => a.status === "CANCELLED").length, icon: XCircle },
    { label: "No Shows", value: appointments.filter(a => a.status === "NO_SHOW").length, icon: AlertCircle }
  ];

  const noShowRate = appointments.length > 0
    ? ((appointments.filter(a => a.status === "NO_SHOW").length / appointments.length) * 100).toFixed(1)
    : 0;

  const cancellationRate = appointments.length > 0
    ? ((appointments.filter(a => a.status === "CANCELLED").length / appointments.length) * 100).toFixed(1)
    : 0;

  const completionRate = appointments.length > 0
    ? ((appointments.filter(a => a.status === "COMPLETED").length / appointments.length) * 100).toFixed(1)
    : 0;

  const handleExportCSV = () => {
    const headers = [
      "Appointment Number",
      "Patient Name",
      "Date",
      "Time",
      "Type",
      "Status",
      "Doctor",
      "Department"
    ];

    const rows = appointments.map(apt => [
      apt.appointmentNumber,
      `${apt.patient?.firstName} ${apt.patient?.lastName}`,
      new Date(apt.scheduledStartAt).toLocaleDateString(),
      new Date(apt.scheduledStartAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      apt.appointmentType?.replace(/_/g, " "),
      apt.status,
      apt.doctor ? `Dr. ${apt.doctor.firstName} ${apt.doctor.lastName}` : "",
      apt.department?.name || ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell || ""}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `appointments-report-${startDate}-to-${endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Appointment Reports</h1>
            <p className="text-gray-600 mt-1">View and analyze appointment data</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => window.history.back()}>
              Back
            </Button>
            <Button onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Report Filters */}
      <Card className="mb-6">
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="summary">Summary Report</option>
                <option value="no-shows">No-Show Report</option>
                <option value="cancellations">Cancellation Report</option>
                <option value="doctor-utilization">Doctor Utilization</option>
                <option value="clinic-utilization">Clinic Utilization</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <Button className="w-full" onClick={() => {}}>
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Rates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-600">Completion Rate</p>
            <p className="text-2xl font-bold text-green-600">{completionRate}%</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-600">Cancellation Rate</p>
            <p className="text-2xl font-bold text-red-600">{cancellationRate}%</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-600">No-Show Rate</p>
            <p className="text-2xl font-bold text-orange-600">{noShowRate}%</p>
          </div>
        </Card>
      </div>

      {/* Appointments Table */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Appointments List</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Appointment #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No appointments found for this date range
                  </td>
                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {appointment.appointmentNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {appointment.patient?.firstName} {appointment.patient?.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{new Date(appointment.scheduledStartAt).toLocaleDateString()}</div>
                      <div className="text-gray-500">
                        {new Date(appointment.scheduledStartAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {appointment.appointmentType?.replace(/_/g, " ")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={statusColors[appointment.status]}>
                        {appointment.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {appointment.doctor
                        ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                        : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// Simple Input component for local use
function Input(props) {
  return (
    <input
      {...props}
      className={`rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${props.className || ""}`}
    />
  );
}

export default AppointmentReportsPage;

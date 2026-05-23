import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, User, Building } from "lucide-react";
import { useAppointments } from "../hooks/useAppointments";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";

const statusColors = {
  BOOKED: "bg-blue-100 text-blue-800 border-blue-200",
  CONFIRMED: "bg-green-100 text-green-800 border-green-200",
  CHECKED_IN: "bg-yellow-100 text-yellow-800 border-yellow-200",
  IN_PROGRESS: "bg-purple-100 text-purple-800 border-purple-200",
  COMPLETED: "bg-gray-100 text-gray-800 border-gray-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
  NO_SHOW: "bg-orange-100 text-orange-800 border-orange-200",
  RESCHEDULED: "bg-indigo-100 text-indigo-800 border-indigo-200"
};

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function AppointmentCalendarPage() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("week"); // day, week
  const [selectedDoctor, setSelectedDoctor] = useState("");

  // Get start of week
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const startOfWeek = getStartOfWeek(currentDate);
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  const { data: appointmentsData, isLoading } = useAppointments({
    startDate: weekDates[0].toISOString(),
    endDate: weekDates[6].toISOString(),
    doctorId: selectedDoctor || undefined
  });

  const appointments = appointmentsData?.data || [];

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  const getAppointmentsForSlot = (date, hour) => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.scheduledStartAt);
      return (
        aptDate.toDateString() === date.toDateString() &&
        aptDate.getHours() === hour
      );
    });
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 7); // 7 AM to 6 PM

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Appointment Calendar</h1>
            <p className="text-gray-600 mt-1">View and manage appointments by day or week</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate("/appointments")}>
              Back to Appointments
            </Button>
            <Button onClick={() => navigate("/appointments/book")}>
              Book Appointment
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Controls */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={navigateToday}>
                Today
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigateWeek(-1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigateWeek(1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
              </select>

              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Doctors</option>
                {/* Would need doctors API */}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <div className="p-4">
          {viewMode === "week" ? (
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Week Header */}
                <div className="grid grid-cols-8 border-b border-gray-200">
                  <div className="p-3 text-xs font-medium text-gray-500 border-r border-gray-200">
                    Time
                  </div>
                  {weekDates.map((date, i) => (
                    <div
                      key={i}
                      className={`p-3 text-center border-r border-gray-200 ${
                        date.toDateString() === new Date().toDateString()
                          ? "bg-blue-50"
                          : ""
                      }`}
                    >
                      <div className="text-xs font-medium text-gray-500">
                        {weekDays[date.getDay()]}
                      </div>
                      <div
                        className={`text-lg font-semibold ${
                          date.toDateString() === new Date().toDateString()
                            ? "text-blue-600"
                            : "text-gray-900"
                        }`}
                      >
                        {date.getDate()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Time Slots */}
                <div className="divide-y divide-gray-200">
                  {hours.map((hour) => (
                    <div key={hour} className="grid grid-cols-8 min-h-[60px]">
                      <div className="p-2 text-xs text-gray-500 border-r border-gray-200">
                        {hour}:00
                      </div>
                      {weekDates.map((date, i) => {
                        const slotAppointments = getAppointmentsForSlot(date, hour);
                        return (
                          <div
                            key={i}
                            className="border-r border-gray-200 p-1 relative"
                          >
                            {slotAppointments.map((apt) => (
                              <button
                                key={apt.id}
                                onClick={() => navigate(`/appointments/${apt.id}`)}
                                className={`w-full mb-1 p-1 rounded text-xs text-left truncate ${
                                  statusColors[apt.status]
                                }`}
                                title={`${apt.patient?.firstName} ${apt.patient?.lastName}`}
                              >
                                <div className="font-medium truncate">
                                  {new Date(apt.scheduledStartAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </div>
                                <div className="truncate">
                                  {apt.patient?.firstName} {apt.patient?.lastName?.charAt(0)}.
                                </div>
                              </button>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Day View */
            <div>
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {weekDays[currentDate.getDay()]}, {currentDate.getDate()} {monthNames[currentDate.getMonth()]}
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {hours.map((hour) => {
                  const slotAppointments = getAppointmentsForSlot(currentDate, hour);
                  return (
                    <div key={hour} className="p-4 min-h-[80px]">
                      <div className="flex items-start gap-4">
                        <div className="w-16 text-sm font-medium text-gray-500">
                          {hour}:00
                        </div>
                        <div className="flex-1 flex flex-wrap gap-2">
                          {slotAppointments.map((apt) => (
                            <button
                              key={apt.id}
                              onClick={() => navigate(`/appointments/${apt.id}`)}
                              className={`flex-1 min-w-[200px] p-3 rounded-lg text-left ${
                                statusColors[apt.status]
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium">
                                  {new Date(apt.scheduledStartAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </span>
                                <Badge className={statusColors[apt.status]}>
                                  {apt.status.replace("_", " ")}
                                </Badge>
                              </div>
                              <div className="font-semibold text-sm">
                                {apt.patient?.firstName} {apt.patient?.lastName}
                              </div>
                              {apt.doctor && (
                                <div className="text-xs mt-1">
                                  Dr. {apt.doctor.firstName} {apt.doctor.lastName}
                                </div>
                              )}
                              {apt.appointmentType && (
                                <div className="text-xs mt-1">
                                  {apt.appointmentType.replace(/_/g, " ")}
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Legend */}
      <Card className="mt-6">
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Status Legend</h4>
          <div className="flex flex-wrap gap-4">
            {Object.entries(statusColors).map(([status, color]) => (
              <div key={status} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${color.split(" ")[0]}`}></div>
                <span className="text-sm text-gray-600">
                  {status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default AppointmentCalendarPage;

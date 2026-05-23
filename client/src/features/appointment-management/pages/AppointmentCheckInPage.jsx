import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useAppointments, useCheckInAppointment, useNoShowAppointment, useConfirmAppointment } from "../hooks/useAppointments";
import { PatientSearchBox } from "../../patient-management/components/PatientSearchBox";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
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

const statusLabels = {
  BOOKED: "Booked",
  CONFIRMED: "Confirmed",
  CHECKED_IN: "Checked In",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No Show",
  RESCHEDULED: "Rescheduled"
};

export function AppointmentCheckInPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [statusFilter, setStatusFilter] = useState("BOOKED,CONFIRMED");

  const { data: appointmentsData, isLoading, refetch } = useAppointments({
    date: selectedDate,
    status: statusFilter
  });

  const checkInMutation = useCheckInAppointment();
  const noShowMutation = useNoShowAppointment();
  const confirmMutation = useConfirmAppointment();

  const appointments = appointmentsData?.data || [];

  const handleCheckIn = async (appointment) => {
    try {
      await checkInMutation.mutateAsync({ id: appointment.id });
      toast.success(`Patient checked in successfully`);
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to check in patient");
    }
  };

  const handleNoShow = async (appointment) => {
    if (!window.confirm(`Mark ${appointment.patientName} as no-show?`)) {
      return;
    }

    try {
      await noShowMutation.mutateAsync({ id: appointment.id });
      toast.success("Appointment marked as no-show");
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to mark no-show");
    }
  };

  const handleConfirm = async (appointment) => {
    try {
      await confirmMutation.mutateAsync({ id: appointment.id });
      toast.success("Appointment confirmed");
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to confirm appointment");
    }
  };

  const handlePatientSelect = (patient) => {
    setSearchTerm(patient.hospitalNumber || patient.id);
  };

  const canCheckIn = (appointment) => {
    return ["BOOKED", "CONFIRMED"].includes(appointment.status);
  };

  const canMarkNoShow = (appointment) => {
    return ["BOOKED", "CONFIRMED"].includes(appointment.status);
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Appointment Check-In</h1>
            <p className="text-gray-600 mt-1">Check in patients who have arrived for their appointments</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/appointments")}>
            Back to Appointments
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Patient
              </label>
              <PatientSearchBox
                onPatientSelect={handlePatientSelect}
                placeholder="Search and select patient..."
                initialValue={searchTerm}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="BOOKED,CONFIRMED">Booked & Confirmed</option>
                <option value="CHECKED_IN">Checked In</option>
                <option value="ALL">All Statuses</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Appointments List */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Today's Appointments ({appointments.length})
          </h3>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            Refresh
          </Button>
        </div>

        <div className="divide-y divide-gray-200">
          {appointments.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No appointments found for this date</p>
            </div>
          ) : (
            appointments.map((appointment) => (
              <div key={appointment.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-gray-500">
                        {appointment.appointmentNumber}
                      </span>
                      <Badge className={statusColors[appointment.status]}>
                        {statusLabels[appointment.status]}
                      </Badge>
                      {appointment.priority === "URGENT" && (
                        <Badge className="bg-red-100 text-red-800">Urgent</Badge>
                      )}
                      {appointment.priority === "EMERGENCY" && (
                        <Badge className="bg-red-600 text-white">Emergency</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Patient</p>
                        <p className="font-medium text-gray-900">
                          {appointment.patient?.firstName} {appointment.patient?.lastName}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500">Time</p>
                        <div className="flex items-center gap-1 text-gray-900">
                          <Clock className="w-4 h-4" />
                          {new Date(appointment.scheduledStartAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>

                      <div>
                        <p className="text-gray-500">Type</p>
                        <p className="text-gray-900">
                          {appointment.appointmentType?.replace(/_/g, " ")}
                        </p>
                      </div>

                      {appointment.doctor && (
                        <div>
                          <p className="text-gray-500">Doctor</p>
                          <p className="text-gray-900">
                            Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                          </p>
                        </div>
                      )}
                    </div>

                    {appointment.reason && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">Reason: {appointment.reason}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {canCheckIn(appointment) && (
                      <Button
                        size="sm"
                        onClick={() => handleCheckIn(appointment)}
                        disabled={checkInMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Check In
                      </Button>
                    )}

                    {appointment.status === "BOOKED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleConfirm(appointment)}
                        disabled={confirmMutation.isPending}
                      >
                        Confirm
                      </Button>
                    )}

                    {canMarkNoShow(appointment) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleNoShow(appointment)}
                        disabled={noShowMutation.isPending}
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        No Show
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/appointments/${appointment.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

export default AppointmentCheckInPage;

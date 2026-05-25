import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Clock, User, Building, Stethoscope, FileText, CheckCircle, XCircle, RotateCcw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAppointment, useConfirmAppointment, useCancelAppointment, useRescheduleAppointment, useCheckInAppointment, useNoShowAppointment, useCompleteAppointment } from "../hooks/useAppointments";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Input from "../../../components/ui/Input";
import Label from "../../../components/ui/Label";
import Textarea from "../../../components/ui/Textarea";
import Dialog from "../../../components/ui/Dialog";

const statusColors = {
  DRAFT: "bg-gray-100 text-gray-800",
  BOOKED: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CHECKED_IN: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-gray-100 text-gray-800",
  RESCHEDULED: "bg-indigo-100 text-indigo-800",
  CANCELLED: "bg-red-100 text-red-800",
  NO_SHOW: "bg-orange-100 text-orange-800"
};

const statusLabels = {
  DRAFT: "Draft",
  BOOKED: "Booked",
  CONFIRMED: "Confirmed",
  CHECKED_IN: "Checked In",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  RESCHEDULED: "Rescheduled",
  CANCELLED: "Cancelled",
  NO_SHOW: "No Show"
};

export function AppointmentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: appointmentData, isLoading, refetch } = useAppointment(id);
  
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [rescheduleData, setRescheduleData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    reason: ""
  });

  const confirmMutation = useConfirmAppointment();
  const cancelMutation = useCancelAppointment();
  const rescheduleMutation = useRescheduleAppointment();
  const checkInMutation = useCheckInAppointment();
  const noShowMutation = useNoShowAppointment();
  const completeMutation = useCompleteAppointment();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const appointment = appointmentData?.data;

  if (!appointment) {
    return (
      <div className="p-6">
        <Card>
          <div className="p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Appointment not found</h3>
            <p className="mt-1 text-sm text-gray-500">The appointment you're looking for doesn't exist.</p>
            <Button className="mt-4" onClick={() => navigate("/appointments")}>
              Back to Appointments
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const handleConfirm = async () => {
    try {
      await confirmMutation.mutateAsync({ id: appointment.id });
      toast.success("Appointment confirmed");
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to confirm appointment");
    }
  };

  const handleCheckIn = async () => {
    try {
      await checkInMutation.mutateAsync({ id: appointment.id });
      toast.success("Patient checked in successfully");
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to check in patient");
    }
  };

  const handleNoShow = async () => {
    try {
      await noShowMutation.mutateAsync({ id: appointment.id });
      toast.success("Appointment marked as no-show");
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to mark no-show");
    }
  };

  const handleComplete = async () => {
    try {
      await completeMutation.mutateAsync({ id: appointment.id });
      toast.success("Appointment completed");
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to complete appointment");
    }
  };

  const handleCancelSubmit = async () => {
    if (!cancellationReason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }

    try {
      await cancelMutation.mutateAsync({ 
        id: appointment.id, 
        data: { cancellationReason } 
      });
      toast.success("Appointment cancelled");
      setShowCancelDialog(false);
      setCancellationReason("");
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel appointment");
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!rescheduleData.date || !rescheduleData.startTime || !rescheduleData.endTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!rescheduleData.reason.trim()) {
      toast.error("Please provide a reschedule reason");
      return;
    }

    const startDateTime = new Date(`${rescheduleData.date}T${rescheduleData.startTime}`);
    const endDateTime = new Date(`${rescheduleData.date}T${rescheduleData.endTime}`);

    if (endDateTime <= startDateTime) {
      toast.error("End time must be after start time");
      return;
    }

    try {
      await rescheduleMutation.mutateAsync({
        id: appointment.id,
        data: {
          scheduledStartAt: startDateTime.toISOString(),
          scheduledEndAt: endDateTime.toISOString(),
          rescheduleReason: rescheduleData.reason
        }
      });
      toast.success("Appointment rescheduled");
      setShowRescheduleDialog(false);
      setRescheduleData({ date: "", startTime: "", endTime: "", reason: "" });
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reschedule appointment");
    }
  };

  const canCancel = ["BOOKED", "CONFIRMED"].includes(appointment.status);
  const canReschedule = ["BOOKED", "CONFIRMED"].includes(appointment.status);
  const canCheckIn = ["BOOKED", "CONFIRMED"].includes(appointment.status);
  const canConfirm = appointment.status === "BOOKED";
  const canMarkNoShow = ["BOOKED", "CONFIRMED"].includes(appointment.status);
  const canComplete = ["CHECKED_IN", "IN_PROGRESS"].includes(appointment.status);

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/appointments")}>
                Back
              </Button>
              <span className="text-sm text-gray-500">{appointment.appointmentNumber}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Appointment Details</h1>
          </div>
          <div className="flex items-center gap-2">
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Information */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5" />
                Patient Information
              </h3>
            </div>
            <div className="p-6">
              {appointment.patient ? (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                    {appointment.patient.firstName?.[0]}{appointment.patient.lastName?.[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-gray-900">
                      {appointment.patient.firstName} {appointment.patient.middleName} {appointment.patient.lastName}
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Hospital Number</p>
                        <p className="font-medium text-gray-900">{appointment.patient.hospitalNumber}</p>
                      </div>
                      {appointment.patient.phone && (
                        <div>
                          <p className="text-gray-500">Phone</p>
                          <p className="font-medium text-gray-900">{appointment.patient.phone}</p>
                        </div>
                      )}
                      {appointment.patient.dateOfBirth && (
                        <div>
                          <p className="text-gray-500">Date of Birth</p>
                          <p className="font-medium text-gray-900">
                            {new Date(appointment.patient.dateOfBirth).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {appointment.patient.gender && (
                        <div>
                          <p className="text-gray-500">Gender</p>
                          <p className="font-medium text-gray-900 capitalize">{appointment.patient.gender.toLowerCase()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Patient information not available</p>
              )}
            </div>
          </Card>

          {/* Appointment Details */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Appointment Details
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Appointment Type</p>
                  <p className="font-medium text-gray-900">
                    {appointment.appointmentType?.replace(/_/g, " ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Source</p>
                  <p className="font-medium text-gray-900">
                    {appointment.source?.replace(/_/g, " ")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Scheduled Start</p>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Calendar className="w-4 h-4" />
                    {new Date(appointment.scheduledStartAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Clock className="w-4 h-4" />
                    {new Date(appointment.scheduledStartAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                    {new Date(appointment.scheduledEndAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              {appointment.department && (
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Building className="w-4 h-4" />
                    {appointment.department.name}
                  </div>
                </div>
              )}

              {appointment.doctor && (
                <div>
                  <p className="text-sm text-gray-500">Doctor</p>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Stethoscope className="w-4 h-4" />
                    Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                  </div>
                </div>
              )}

              {appointment.reason && (
                <div>
                  <p className="text-sm text-gray-500">Reason</p>
                  <p className="text-gray-900">{appointment.reason}</p>
                </div>
              )}

              {appointment.notes && (
                <div>
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="text-gray-900">{appointment.notes}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Timeline / Status History */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Status History</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Created</p>
                    <p className="text-xs text-gray-500">
                      {new Date(appointment.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {appointment.confirmedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-600"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Confirmed</p>
                      <p className="text-xs text-gray-500">
                        {new Date(appointment.confirmedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                {appointment.checkedInAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-600"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Checked In</p>
                      <p className="text-xs text-gray-500">
                        {new Date(appointment.checkedInAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                {appointment.completedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Completed</p>
                      <p className="text-xs text-gray-500">
                        {new Date(appointment.completedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                {appointment.cancelledAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-600"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Cancelled</p>
                      <p className="text-xs text-gray-500">
                        {new Date(appointment.cancelledAt).toLocaleString()}
                      </p>
                      {appointment.cancellationReason && (
                        <p className="text-xs text-gray-500 mt-1">
                          Reason: {appointment.cancellationReason}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {appointment.noShowAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-600"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">No Show</p>
                      <p className="text-xs text-gray-500">
                        {new Date(appointment.noShowAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-4">
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Actions</h3>
            </div>
            <div className="p-4 space-y-3">
              {canConfirm && (
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handleConfirm}
                  disabled={confirmMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm Appointment
                </Button>
              )}

              {canCheckIn && (
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={handleCheckIn}
                  disabled={checkInMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Check In Patient
                </Button>
              )}

              {canComplete && (
                <Button
                  className="w-full bg-gray-600 hover:bg-gray-700"
                  onClick={handleComplete}
                  disabled={completeMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Appointment
                </Button>
              )}

              {canMarkNoShow && (
                <Button
                  className="w-full text-orange-600 border-orange-600 hover:bg-orange-50"
                  variant="outline"
                  onClick={handleNoShow}
                  disabled={noShowMutation.isPending}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Mark No Show
                </Button>
              )}

              {canReschedule && (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => setShowRescheduleDialog(true)}
                  disabled={rescheduleMutation.isPending}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reschedule
                </Button>
              )}

              {canCancel && (
                <Button
                  className="w-full text-red-600 border-red-600 hover:bg-red-50"
                  variant="outline"
                  onClick={() => setShowCancelDialog(true)}
                  disabled={cancelMutation.isPending}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Appointment
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Cancel Dialog */}
      <Dialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        title="Cancel Appointment"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to cancel this appointment? This action cannot be undone.
          </p>
          <div>
            <Label>Cancellation Reason *</Label>
            <Textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              rows={3}
              placeholder="Please provide a reason for cancellation"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubmit}
              disabled={!cancellationReason.trim() || cancelMutation.isPending}
            >
              {cancelMutation.isPending ? "Cancelling..." : "Cancel Appointment"}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog
        isOpen={showRescheduleDialog}
        onClose={() => setShowRescheduleDialog(false)}
        title="Reschedule Appointment"
      >
        <div className="space-y-4">
          <div>
            <Label>New Date *</Label>
            <Input
              type="date"
              value={rescheduleData.date}
              onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Time *</Label>
              <Input
                type="time"
                value={rescheduleData.startTime}
                onChange={(e) => setRescheduleData({ ...rescheduleData, startTime: e.target.value })}
              />
            </div>
            <div>
              <Label>End Time *</Label>
              <Input
                type="time"
                value={rescheduleData.endTime}
                onChange={(e) => setRescheduleData({ ...rescheduleData, endTime: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>Reschedule Reason *</Label>
            <Textarea
              value={rescheduleData.reason}
              onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
              rows={3}
              placeholder="Please provide a reason for rescheduling"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowRescheduleDialog(false)}>
              Close
            </Button>
            <Button
              onClick={handleRescheduleSubmit}
              disabled={!rescheduleData.date || !rescheduleData.startTime || !rescheduleData.reason || rescheduleMutation.isPending}
            >
              {rescheduleMutation.isPending ? "Rescheduling..." : "Reschedule Appointment"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default AppointmentDetailsPage;

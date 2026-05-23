import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Clock, User, Building, Stethoscope, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { PatientSearchBox } from "../../patient-management/components/PatientSearchBox";
import { useCreateAppointment } from "../hooks/useAppointments";
import { createAppointmentSchema, appointmentTypes, appointmentPriorities, appointmentSources } from "../schemas/appointment.schema";
import { useDepartments } from "../../departments/hooks/useDepartments";
import { useUsers } from "../../users/hooks/useUsers";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Label from "../../../components/ui/Label";
import Select from "../../../components/ui/Select";
import Textarea from "../../../components/ui/Textarea";
import Card from "../../../components/ui/Card";

export function BookAppointmentPage() {
  const navigate = useNavigate();
  const createMutation = useCreateAppointment();
  const { data: departmentsData } = useDepartments({});
  const { data: usersData } = useUsers({});

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:30");

  const departments = departmentsData?.data || [];
  const doctors = usersData?.data?.filter(u => u.role === "DOCTOR" || u.role === "CLINICIAN") || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: {
      appointmentType: "NEW_CONSULTATION",
      priority: "ROUTINE",
      source: "FRONT_DESK",
      reason: "",
      notes: ""
    }
  });

  const watchedDepartment = watch("departmentId");
  const watchedClinic = watch("clinicId");
  const watchedDoctor = watch("doctorId");

  const onSubmit = async (data) => {
    if (!selectedPatient) {
      toast.error("Please select a patient");
      return;
    }

    const startDateTime = new Date(`${appointmentDate}T${startTime}`);
    const endDateTime = new Date(`${appointmentDate}T${endTime}`);

    if (endDateTime <= startDateTime) {
      toast.error("End time must be after start time");
      return;
    }

    try {
      await createMutation.mutateAsync({
        ...data,
        patientId: selectedPatient.id,
        scheduledStartAt: startDateTime.toISOString(),
        scheduledEndAt: endDateTime.toISOString()
      });

      toast.success("Appointment booked successfully");
      navigate("/appointments");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to book appointment");
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setValue("patientId", patient.id);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
            <p className="text-gray-600 mt-1">Schedule a new appointment for a patient</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/appointments")}>
            Back to Appointments
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Patient Selection */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5" />
              Patient Information
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <Label>Search Patient *</Label>
              <PatientSearchBox
                onPatientSelect={handlePatientSelect}
                placeholder="Search by UHID, name, phone, or ID..."
              />
              {errors.patientId && (
                <p className="mt-1 text-sm text-red-600">{errors.patientId.message}</p>
              )}
            </div>

            {selectedPatient && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                    {selectedPatient.firstName?.[0]}{selectedPatient.lastName?.[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {selectedPatient.firstName} {selectedPatient.middleName} {selectedPatient.lastName}
                    </p>
                    <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
                      <p>Hospital Number: {selectedPatient.hospitalNumber}</p>
                      {selectedPatient.phone && <p>Phone: {selectedPatient.phone}</p>}
                      {selectedPatient.dateOfBirth && (
                        <p>Date of Birth: {new Date(selectedPatient.dateOfBirth).toLocaleDateString()}</p>
                      )}
                      {selectedPatient.gender && (
                        <p className="capitalize">Gender: {selectedPatient.gender.toLowerCase()}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
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
                <Label>Appointment Type *</Label>
                <Select {...register("appointmentType")}>
                  <option value="">Select type</option>
                  {appointmentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, " ")}
                    </option>
                  ))}
                </Select>
                {errors.appointmentType && (
                  <p className="mt-1 text-sm text-red-600">{errors.appointmentType.message}</p>
                )}
              </div>

              <div>
                <Label>Priority</Label>
                <Select {...register("priority")}>
                  {appointmentPriorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Source</Label>
                <Select {...register("source")}>
                  {appointmentSources.map((source) => (
                    <option key={source} value={source}>
                      {source.replace(/_/g, " ")}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label>Department</Label>
                <Select
                  {...register("departmentId")}
                  onChange={(e) => {
                    register("departmentId").onChange(e);
                    setValue("clinicId", "");
                    setValue("doctorId", "");
                  }}
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Clinic</Label>
                <Select {...register("clinicId")}>
                  <option value="">Select clinic (optional)</option>
                  {/* Would need clinics API */}
                </Select>
              </div>

              <div>
                <Label>Doctor</Label>
                <Select {...register("doctorId")}>
                  <option value="">Select doctor (optional)</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.firstName} {doctor.lastName}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
                {!appointmentDate && (
                  <p className="mt-1 text-sm text-red-600">Date is required</p>
                )}
              </div>

              <div>
                <Label>Start Time *</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    // Auto-set end time to 30 mins later
                    const [hours, minutes] = e.target.value.split(":");
                    const endDate = new Date();
                    endDate.setHours(parseInt(hours));
                    endDate.setMinutes(parseInt(minutes) + 30);
                    setEndTime(endDate.toTimeString().slice(0, 5));
                  }}
                />
              </div>

              <div>
                <Label>End Time *</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Reason for Appointment</Label>
              <Textarea
                {...register("reason")}
                rows={3}
                placeholder="Brief description of why the appointment is needed"
              />
              {errors.reason && (
                <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
              )}
            </div>

            <div>
              <Label>Additional Notes</Label>
              <Textarea
                {...register("notes")}
                rows={3}
                placeholder="Any additional information or special requirements"
              />
              {errors.notes && (
                <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/appointments")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!selectedPatient || !appointmentDate || createMutation.isPending}
            className="min-w-[150px]"
          >
            {createMutation.isPending ? "Booking..." : "Book Appointment"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default BookAppointmentPage;

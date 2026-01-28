import { Layout } from "@/components/Layout";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, AlertCircle, Clock, User, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import {
  getAllAppointments,
  addAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentsByDate,
  Appointment,
} from "@/services/appointmentService";
import { getAllPatients, PatientData } from "@/services/patientService";

export default function Appointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [formData, setFormData] = useState<Appointment>({
    patientId: "",
    patientName: "",
    patientPhone: "",
    date: selectedDate,
    time: "09:00",
    duration: 30,
    type: "consultation",
    status: "scheduled",
    notes: "",
  });

  // Fetch appointments and patients on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [appointmentsData, patientsData] = await Promise.all([
          getAllAppointments(),
          getAllPatients(),
        ]);
        setAppointments(appointmentsData);
        setPatients(patientsData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load data";
        setError(errorMessage);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    if (name === "patientId") {
      const patient = patients.find((p) => p.id === value);
      setFormData((prev) => ({
        ...prev,
        patientId: value,
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : "",
        patientPhone: patient ? patient.phone : "",
      }));
    } else if (name === "date") {
      setSelectedDate(value);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId) {
      setError("Please select a patient");
      return;
    }

    try {
      setError(null);
      await addAppointment(formData);
      const updatedAppointments = await getAllAppointments();
      setAppointments(updatedAppointments);
      setShowForm(false);
      setFormData({
        patientId: "",
        patientName: "",
        patientPhone: "",
        date: selectedDate,
        time: "09:00",
        duration: 30,
        type: "consultation",
        status: "scheduled",
        notes: "",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create appointment";
      setError(errorMessage);
    }
  };

  const handleDelete = async (appointmentId: string | undefined) => {
    if (!appointmentId) return;
    if (
      !window.confirm("Are you sure you want to delete this appointment?")
    ) {
      return;
    }

    try {
      setError(null);
      await deleteAppointment(appointmentId);
      const updatedAppointments = await getAllAppointments();
      setAppointments(updatedAppointments);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete appointment";
      setError(errorMessage);
    }
  };

  const handleStatusChange = async (
    appointmentId: string | undefined,
    newStatus: string,
  ) => {
    if (!appointmentId) return;

    try {
      setError(null);
      await updateAppointment(appointmentId, {
        status: newStatus as
          | "scheduled"
          | "completed"
          | "cancelled"
          | "no-show",
      });
      const updatedAppointments = await getAllAppointments();
      setAppointments(updatedAppointments);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update appointment";
      setError(errorMessage);
    }
  };

  const appointmentsByDate = appointments.filter((a) => a.date === selectedDate);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "no-show":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Link
                to="/"
                className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
              >
                <ArrowLeft size={20} />
                Back to Dashboard
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
            <p className="text-muted-foreground mt-1">
              Manage and schedule patient appointments
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <Plus size={20} />
            New Appointment
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-red-600 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* New Appointment Form */}
        {showForm && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              Schedule New Appointment
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Patient *
                  </label>
                  <select
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  >
                    <option value="">Select a patient...</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Appointment Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  >
                    <option value="consultation">Consultation</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="prescription-exam">Prescription Exam</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    min="15"
                    max="120"
                    step="15"
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no-show">No-show</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-6 py-2.5 rounded-lg border border-border text-foreground hover:bg-muted transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Schedule Appointment
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Calendar and Appointments */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Date Picker */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">
                Select Date
              </h3>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background mb-4"
              />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-2">
                  {new Date(selectedDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p>{appointmentsByDate.length} appointment(s)</p>
              </div>
            </div>

            {/* Appointments List */}
            <div className="lg:col-span-3">
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Appointments for{" "}
                  {new Date(selectedDate).toLocaleDateString()}
                </h3>

                {appointmentsByDate.length > 0 ? (
                  <div className="space-y-3">
                    {appointmentsByDate
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map((appointment) => (
                        <div
                          key={appointment.id}
                          className="border border-border rounded-lg p-4 space-y-3 hover:border-primary/50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground flex items-center gap-2">
                                <User size={18} className="text-primary" />
                                {appointment.patientName}
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                                <Clock size={16} />
                                {appointment.time} ({appointment.duration} min) •{" "}
                                {appointment.type}
                              </p>
                            </div>
                            <span
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(appointment.status)}`}
                            >
                              {appointment.status}
                            </span>
                          </div>

                          {appointment.notes && (
                            <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                              {appointment.notes}
                            </p>
                          )}

                          <div className="flex gap-2 pt-2">
                            <select
                              value={appointment.status}
                              onChange={(e) =>
                                handleStatusChange(
                                  appointment.id,
                                  e.target.value,
                                )
                              }
                              className="flex-1 px-3 py-1.5 text-sm border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="scheduled">Scheduled</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                              <option value="no-show">No-show</option>
                            </select>
                            <button
                              onClick={() => handleDelete(appointment.id)}
                              className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock size={32} className="mx-auto mb-3 opacity-50" />
                    <p>No appointments scheduled for this date</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
              <p className="text-muted-foreground">Loading appointments...</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

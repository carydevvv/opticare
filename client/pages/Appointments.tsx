import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Calendar,
  Clock,
  User,
  Phone,
  Search,
  X,
  Check,
  AlertCircle,
  Bell,
} from "lucide-react";
import { useState } from "react";
import { getAllPatients, PatientData } from "@/services/patientService";
import { useEffect } from "react";

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  date: string;
  time: string;
  type: "consultation" | "follow-up" | "eye-test" | "fitting";
  notes: string;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  reminders: boolean;
}

export default function Appointments() {
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [formData, setFormData] = useState({
    patientId: "",
    date: "",
    time: "",
    type: "consultation" as const,
    notes: "",
    reminders: true,
  });

  // Fetch patients on mount
  useEffect(() => {
    let isMounted = true;
    let requestInFlight = false;

    const fetchPatients = async () => {
      // Prevent duplicate requests
      if (requestInFlight) return;
      requestInFlight = true;

      try {
        if (!isMounted) return;
        const data = await getAllPatients();
        if (isMounted) {
          setPatients(data);
        }
      } catch (err) {
        // Gracefully handle AbortError (expected when component unmounts)
        if (
          err instanceof Error &&
          (err.message.includes("AbortError") ||
            err.message.includes("aborted") ||
            err.message.includes("signal is aborted"))
        ) {
          return;
        }
        if ((err as any)?.name === "AbortError") {
          return;
        }
        console.error("Error fetching patients:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
        requestInFlight = false;
      }
    };

    // Small delay to ensure component is mounted before fetching
    const timer = setTimeout(() => {
      if (isMounted) {
        fetchPatients();
      }
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  // Load appointments from localStorage (in a real app, this would be from Firebase)
  useEffect(() => {
    const savedAppointments = localStorage.getItem("appointments");
    if (savedAppointments) {
      setAppointments(JSON.parse(savedAppointments));
    }
  }, []);

  // Save appointments to localStorage
  const saveAppointments = (newAppointments: Appointment[]) => {
    setAppointments(newAppointments);
    localStorage.setItem("appointments", JSON.stringify(newAppointments));
  };

  // Handle adding appointment
  const handleAddAppointment = () => {
    if (!formData.patientId || !formData.date || !formData.time) {
      alert("Please fill in all required fields");
      return;
    }

    const selectedPatient = patients.find((p) => p.id === formData.patientId);
    if (!selectedPatient) return;

    const newAppointment: Appointment = {
      id: `apt_${Date.now()}`,
      patientId: formData.patientId,
      patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      patientPhone: selectedPatient.phone,
      date: formData.date,
      time: formData.time,
      type: formData.type,
      notes: formData.notes,
      status: "scheduled",
      reminders: formData.reminders,
    };

    const updated = [...appointments, newAppointment];
    saveAppointments(updated);

    setFormData({
      patientId: "",
      date: "",
      time: "",
      type: "consultation",
      notes: "",
      reminders: true,
    });
    setShowModal(false);
  };

  // Handle appointment status change
  const handleStatusChange = (id: string, status: Appointment["status"]) => {
    const updated = appointments.map((apt) =>
      apt.id === id ? { ...apt, status } : apt,
    );
    saveAppointments(updated);
  };

  // Handle delete appointment
  const handleDeleteAppointment = (id: string) => {
    const updated = appointments.filter((apt) => apt.id !== id);
    saveAppointments(updated);
  };

  // Filter appointments
  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patientPhone?.includes(searchTerm) ||
      apt.notes.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || apt.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Upcoming appointments (next 7 days)
  const upcomingAppointments = filteredAppointments
    .filter((apt) => {
      const aptDate = new Date(apt.date);
      const today = new Date();
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return (
        aptDate >= today && aptDate <= weekFromNow && apt.status === "scheduled"
      );
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calendar days
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const calendarDays = [];
  const firstDay = getFirstDayOfMonth(currentMonth);
  const daysInMonth = getDaysInMonth(currentMonth);

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const getAppointmentsForDate = (day: number | null) => {
    if (!day) return [];
    const dateStr = `${currentMonth.getFullYear()}-${String(
      currentMonth.getMonth() + 1,
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return appointments.filter(
      (apt) => apt.date === dateStr && apt.status === "scheduled",
    );
  };

  const monthName = currentMonth.toLocaleString("default", { month: "long" });
  const year = currentMonth.getFullYear();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Link
                to="/"
                className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm"
              >
                <ArrowLeft size={18} />
                Back to Dashboard
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
            <p className="text-muted-foreground mt-1">
              Schedule, manage, and track patient appointments
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <Plus size={18} />
            Schedule Appointment
          </button>
        </div>

        {/* Upcoming Appointments Alert */}
        {upcomingAppointments.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Bell className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-blue-900">
                {upcomingAppointments.length} Upcoming Appointment
                {upcomingAppointments.length !== 1 ? "s" : ""}
              </h3>
              <p className="text-sm text-blue-800">
                {upcomingAppointments
                  .slice(0, 2)
                  .map((apt) => `${apt.patientName} on ${apt.date}`)
                  .join(", ")}
                {upcomingAppointments.length > 2 && "..."}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-foreground">
                  {monthName} {year}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setCurrentMonth(
                        new Date(
                          currentMonth.setMonth(currentMonth.getMonth() - 1),
                        ),
                      )
                    }
                    className="p-1.5 hover:bg-muted rounded transition-colors"
                  >
                    ←
                  </button>
                  <button
                    onClick={() =>
                      setCurrentMonth(
                        new Date(
                          currentMonth.setMonth(currentMonth.getMonth() + 1),
                        ),
                      )
                    }
                    className="p-1.5 hover:bg-muted rounded transition-colors"
                  >
                    →
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-bold text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => {
                  const aptsForDay = getAppointmentsForDate(day);
                  const isToday =
                    day &&
                    new Date().toDateString() ===
                      new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth(),
                        day,
                      ).toDateString();

                  return (
                    <div
                      key={index}
                      className={`aspect-square flex items-center justify-center rounded text-sm font-medium transition-colors ${
                        day
                          ? isToday
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground hover:bg-muted/80"
                          : ""
                      } ${aptsForDay.length > 0 ? "ring-2 ring-secondary" : ""}`}
                    >
                      {day ? (
                        <div className="text-center">
                          <div>{day}</div>
                          {aptsForDay.length > 0 && (
                            <div className="text-xs mt-0.5 text-secondary font-bold">
                              {aptsForDay.length}
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Appointments List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search and Filter */}
            <div className="space-y-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by patient name, phone, or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {["all", "scheduled", "completed", "cancelled", "no-show"].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                        filterStatus === status
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground hover:bg-muted/80"
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* Appointments */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                  <p className="text-muted-foreground">Loading patients...</p>
                </div>
              </div>
            ) : filteredAppointments.length > 0 ? (
              <div className="space-y-3">
                {filteredAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">
                            {appointment.patientName}
                          </h3>
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              appointment.status === "scheduled"
                                ? "bg-blue-100 text-blue-800"
                                : appointment.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : appointment.status === "cancelled"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {appointment.status.charAt(0).toUpperCase() +
                              appointment.status.slice(1)}
                          </span>
                          {appointment.reminders && (
                            <Bell size={14} className="text-secondary" />
                          )}
                        </div>

                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            {new Date(appointment.date).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={14} />
                            {appointment.time}
                          </div>
                          {appointment.patientPhone && (
                            <div className="flex items-center gap-2">
                              <Phone size={14} />
                              {appointment.patientPhone}
                            </div>
                          )}
                          {appointment.notes && (
                            <div className="mt-2 p-2 bg-muted rounded text-xs">
                              {appointment.notes}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        {appointment.status === "scheduled" && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusChange(appointment.id, "completed")
                              }
                              className="p-2 hover:bg-green-100 text-green-600 rounded transition-colors"
                              title="Mark as completed"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={() =>
                                handleStatusChange(appointment.id, "cancelled")
                              }
                              className="p-2 hover:bg-red-100 text-red-600 rounded transition-colors"
                              title="Cancel appointment"
                            >
                              <X size={18} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() =>
                            handleDeleteAppointment(appointment.id)
                          }
                          className="p-2 hover:bg-red-100 text-red-600 rounded transition-colors"
                          title="Delete appointment"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl p-12 text-center">
                <Calendar
                  size={48}
                  className="mx-auto mb-4 text-muted-foreground opacity-50"
                />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Appointments Found
                </h3>
                <p className="text-muted-foreground">
                  {appointments.length === 0
                    ? "Schedule your first appointment to get started"
                    : "No appointments match your search filters"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Schedule Appointment Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">
                  Schedule Appointment
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Patient *
                  </label>
                  <select
                    value={formData.patientId}
                    onChange={(e) =>
                      setFormData({ ...formData, patientId: e.target.value })
                    }
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Time *
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) =>
                        setFormData({ ...formData, time: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Appointment Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as Appointment["type"],
                      })
                    }
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  >
                    <option value="consultation">Consultation</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="eye-test">Eye Test</option>
                    <option value="fitting">Glasses/Lens Fitting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                    placeholder="Add any notes for this appointment..."
                    rows={3}
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.reminders}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reminders: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded border-border accent-primary"
                  />
                  <span className="text-sm text-foreground">
                    Send reminder notifications
                  </span>
                </label>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddAppointment}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                  >
                    Schedule
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

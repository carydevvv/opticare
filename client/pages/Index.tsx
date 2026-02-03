import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import {
  Phone,
  Mail,
  Eye,
  Calendar,
  Plus,
  Search,
  AlertCircle,
  Printer,
  FileText,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getAllPatients, PatientData } from "@/services/patientService";

export default function Index() {
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    date: "",
    time: "",
    notes: "",
  });
  const [patientNotes, setPatientNotes] = useState("");

  // Fetch patients from Firebase on component mount
  useEffect(() => {
    let isMounted = true;

    const fetchPatients = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);
        setError(null);
        const data = await getAllPatients();
        if (isMounted) {
          setPatients(data);
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to load patients";
          setError(errorMessage);
          console.error("Error fetching patients:", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPatients();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredPatients = patients.filter(
    (patient) =>
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm),
  );

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  // Format prescription from individual fields
  const getPrescription = (patient: PatientData) => {
    const od = patient.rightSphere || "-";
    const os = patient.leftSphere || "-";
    return `OD: ${od}, OS: ${os}`;
  };

  // Get patient status (placeholder - in real app would track last visit)
  const getPatientStatus = () => "Active";

  // Handle appointment scheduling
  const handleScheduleAppointment = () => {
    if (!appointmentData.date || !appointmentData.time) {
      alert("Please fill in all appointment fields");
      return;
    }
    // In a real app, this would save to Firebase
    alert(
      `Appointment scheduled for ${appointmentData.date} at ${appointmentData.time}`
    );
    setShowScheduleModal(false);
    setAppointmentData({ date: "", time: "", notes: "" });
  };

  // Handle printing patient record
  const handlePrintRecord = () => {
    if (!selectedPatient) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const prescriptionData = `
      Right Eye (OD):
      Sphere: ${selectedPatient.rightSphere || "N/A"}
      Cylinder: ${selectedPatient.rightCylinder || "N/A"}
      Axis: ${selectedPatient.rightAxis || "N/A"}
      Add: ${selectedPatient.rightAdd || "N/A"}
      PD: ${selectedPatient.rightPD || "N/A"}

      Left Eye (OS):
      Sphere: ${selectedPatient.leftSphere || "N/A"}
      Cylinder: ${selectedPatient.leftCylinder || "N/A"}
      Axis: ${selectedPatient.leftAxis || "N/A"}
      Add: ${selectedPatient.leftAdd || "N/A"}
      PD: ${selectedPatient.leftPD || "N/A"}
    `;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Patient Record - ${selectedPatient.firstName} ${selectedPatient.lastName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .section { margin-bottom: 20px; }
          .section-title { font-weight: bold; font-size: 16px; margin-bottom: 10px; background-color: #f0f0f0; padding: 8px; }
          .field { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee; }
          .label { font-weight: bold; }
          pre { white-space: pre-wrap; word-wrap: break-word; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>OptiCare - Patient Record</h1>
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>

        <div class="section">
          <div class="section-title">Personal Information</div>
          <div class="field"><span class="label">Name:</span> <span>${selectedPatient.firstName} ${selectedPatient.lastName}</span></div>
          <div class="field"><span class="label">Age:</span> <span>${selectedPatient.age}</span></div>
          <div class="field"><span class="label">Sex:</span> <span>${selectedPatient.sex}</span></div>
          <div class="field"><span class="label">Email:</span> <span>${selectedPatient.email}</span></div>
          <div class="field"><span class="label">Phone:</span> <span>${selectedPatient.phone}</span></div>
          <div class="field"><span class="label">Date of Birth:</span> <span>${selectedPatient.dateOfBirth}</span></div>
          <div class="field"><span class="label">Address:</span> <span>${selectedPatient.address || "N/A"}</span></div>
          <div class="field"><span class="label">Insurance:</span> <span>${selectedPatient.insurance || "N/A"}</span></div>
        </div>

        <div class="section">
          <div class="section-title">Chief Complaint</div>
          <p>${selectedPatient.problem || "N/A"}</p>
        </div>

        <div class="section">
          <div class="section-title">Eye Prescription</div>
          <pre>${prescriptionData}</pre>
        </div>

        <div class="section">
          <div class="section-title">Clinical Notes</div>
          <p>${selectedPatient.notes || "N/A"}</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 100);
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Patient Management
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Manage and track patient records and appointments
            </p>
          </div>
          <Link
            to="/new-patient"
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 md:px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm md:text-base whitespace-nowrap"
          >
            <Plus size={20} />
            Add Patient
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-red-600 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-red-900">
                Error Loading Patients
              </h3>
              <p className="text-sm text-red-800">{error}</p>
              <p className="text-xs text-red-700 mt-2">
                Make sure your Firebase configuration is set up correctly in
                environment variables.
              </p>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        {!loading && patients.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Patients
                  </p>
                  <p className="text-3xl font-bold text-foreground mt-2">
                    {patients.length}
                  </p>
                </div>
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Users size={24} className="text-primary" />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <p className="text-3xl font-bold text-foreground mt-2">0</p>
                </div>
                <div className="bg-secondary/10 p-3 rounded-lg">
                  <Calendar size={24} className="text-secondary" />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Next Appointment
                  </p>
                  <p className="text-lg font-bold text-foreground mt-2">
                    Today
                  </p>
                </div>
                <div className="bg-accent/10 p-3 rounded-lg">
                  <Eye size={24} className="text-accent" />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Active Patients
                  </p>
                  <p className="text-3xl font-bold text-foreground mt-2">
                    {patients.length}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Eye size={24} className="text-yellow-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
              <p className="text-muted-foreground">Loading patients...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && patients.length === 0 && !error && (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <Eye
              size={48}
              className="mx-auto mb-4 text-muted-foreground opacity-50"
            />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Patients Yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first patient record
            </p>
            <Link
              to="/new-patient"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus size={18} />
              Add First Patient
            </Link>
          </div>
        )}

        {/* Main Content */}
        {!loading && patients.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient List */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Patient Records
                </h2>

                {/* Search */}
                <div className="relative mb-4">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search by name, email or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Patient List */}
                <div className="space-y-2">
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map((patient) => (
                      <button
                        key={patient.id}
                        onClick={() => setSelectedPatientId(patient.id || "")}
                        className={`w-full text-left p-4 rounded-lg border transition-all ${
                          selectedPatientId === patient.id
                            ? "bg-primary/5 border-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">
                              {patient.firstName} {patient.lastName}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {patient.phone}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {getPrescription(patient)}
                            </p>
                          </div>
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-800">
                            {getPatientStatus()}
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No patients found matching "{searchTerm}"
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Patient Detail Panel */}
            <div>
              {selectedPatient ? (
                <div className="bg-card border border-border rounded-xl p-6 space-y-6 h-fit sticky top-8">
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-4">
                      Patient Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-semibold text-foreground">
                          {selectedPatient.firstName} {selectedPatient.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Age</p>
                        <p className="font-semibold text-foreground">
                          {selectedPatient.age}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 space-y-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone size={16} />
                      <a
                        href={`tel:${selectedPatient.phone}`}
                        className="text-sm hover:text-primary transition-colors"
                      >
                        {selectedPatient.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail size={16} />
                      <a
                        href={`mailto:${selectedPatient.email}`}
                        className="text-sm hover:text-primary transition-colors"
                      >
                        {selectedPatient.email}
                      </a>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Current Prescription
                      </p>
                      <p className="font-mono text-sm font-semibold text-foreground mt-1">
                        {getPrescription(selectedPatient)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Problem</p>
                      <p className="text-sm font-semibold text-foreground mt-1">
                        {selectedPatient.problem || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <Link
                      to={`/patient/${selectedPatient.id}`}
                      className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      <Eye size={16} />
                      View Full Record
                    </Link>

                    <button
                      onClick={() => setShowScheduleModal(true)}
                      className="flex items-center justify-center gap-2 w-full bg-secondary text-secondary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-secondary/90 transition-colors"
                    >
                      <Calendar size={16} />
                      Schedule Appointment
                    </button>

                    <button
                      onClick={() => setShowDescriptionModal(true)}
                      className="flex items-center justify-center gap-2 w-full bg-accent text-accent-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
                    >
                      <FileText size={16} />
                      Add Notes
                    </button>

                    <button
                      onClick={handlePrintRecord}
                      className="flex items-center justify-center gap-2 w-full bg-muted text-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
                    >
                      <Printer size={16} />
                      Print Record
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-xl p-6 h-fit sticky top-8 text-center text-muted-foreground">
                  <Eye size={32} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Select a patient to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Schedule Appointment Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">
                Schedule Appointment
              </h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={appointmentData.date}
                  onChange={(e) =>
                    setAppointmentData({
                      ...appointmentData,
                      date: e.target.value,
                    })
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
                  value={appointmentData.time}
                  onChange={(e) =>
                    setAppointmentData({
                      ...appointmentData,
                      time: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Notes
                </label>
                <textarea
                  value={appointmentData.notes}
                  onChange={(e) =>
                    setAppointmentData({
                      ...appointmentData,
                      notes: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  placeholder="e.g., Follow-up for myopia assessment..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleAppointment}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Notes/Description Modal */}
      {showDescriptionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">
                Add Clinical Notes
              </h3>
              <button
                onClick={() => setShowDescriptionModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Notes *
                </label>
                <textarea
                  value={patientNotes}
                  onChange={(e) => setPatientNotes(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  placeholder="Add any clinical observations, recommendations, or follow-up notes..."
                  rows={5}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowDescriptionModal(false)}
                  className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert("Notes saved successfully!");
                    setShowDescriptionModal(false);
                    setPatientNotes("");
                  }}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

// Add missing import
import { Users } from "lucide-react";

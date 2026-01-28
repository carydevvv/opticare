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
  Users,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getAllPatients, PatientData } from "@/services/patientService";
import {
  getAllAppointments,
  getAppointmentStats,
} from "@/services/appointmentService";

export default function Index() {
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );

  // Fetch patients from Firebase on component mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllPatients();
        setPatients(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load patients";
        setError(errorMessage);
        console.error("Error fetching patients:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
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

                  <div className="pt-4 flex gap-2">
                    <Link
                      to={`/patient/${selectedPatient.id}`}
                      className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors text-center"
                    >
                      View Full Record
                    </Link>
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
    </Layout>
  );
}

// Add missing import
import { Users } from "lucide-react";

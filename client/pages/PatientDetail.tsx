import { Layout } from "@/components/Layout";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Phone,
  Mail,
  Calendar,
  Eye,
  FileText,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getPatientById, PatientData } from "@/services/patientService";

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPatient = async () => {
      if (!id) {
        if (isMounted) {
          setError("No patient ID provided");
          setLoading(false);
        }
        return;
      }

      try {
        if (!isMounted) return;
        setLoading(true);
        setError(null);
        const data = await getPatientById(id);
        if (isMounted) {
          if (data) {
            setPatient(data);
          } else {
            setError("Patient not found");
          }
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to load patient";
          setError(errorMessage);
          console.error("Error fetching patient:", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPatient();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground">Loading patient...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !patient) {
    return (
      <Layout>
        <div className="space-y-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-4">
            <AlertCircle className="text-red-600 mt-1" size={24} />
            <div>
              <h2 className="text-lg font-semibold text-red-900 mb-2">
                Error Loading Patient
              </h2>
              <p className="text-sm text-red-800 mb-4">
                {error || "Patient not found"}
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
            <Edit size={18} />
            Edit Patient
          </button>
        </div>

        {/* Patient Header Card */}
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground">
                {patient.firstName} {patient.lastName}
              </h1>
              <p className="text-muted-foreground mt-2">
                Age: {patient.age} years old
              </p>
              <div className="mt-4 flex gap-4">
                <a
                  href={`tel:${patient.phone}`}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <Phone size={18} />
                  {patient.phone}
                </a>
                <a
                  href={`mailto:${patient.email}`}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <Mail size={18} />
                  {patient.email}
                </a>
              </div>
            </div>
            <span className="text-sm font-semibold px-3 py-1.5 rounded-full bg-green-100 text-green-800">
              Active
            </span>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Primary Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText size={20} className="text-primary" />
                Personal Information
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="text-foreground font-medium mt-1">
                    {patient.dateOfBirth}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="text-foreground font-medium mt-1">
                    {patient.age} years
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="text-foreground font-medium mt-1">
                    {patient.address}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">
                    Insurance Provider
                  </p>
                  <p className="text-foreground font-medium mt-1">
                    {patient.insurance}
                  </p>
                </div>
              </div>
            </div>

            {/* Vision Prescription */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Eye size={20} className="text-secondary" />
                Current Prescription
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Right Eye */}
                <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-6">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    Right Eye (OD)
                  </p>
                  <div className="space-y-2 text-sm font-mono">
                    <div>
                      <span className="text-muted-foreground">SPH:</span>{" "}
                      <span className="font-bold text-foreground">
                        {patient.rightSphere || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">CYL:</span>{" "}
                      <span className="font-bold text-foreground">
                        {patient.rightCylinder || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">AXIS:</span>{" "}
                      <span className="font-bold text-foreground">
                        {patient.rightAxis || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ADD:</span>{" "}
                      <span className="font-bold text-foreground">
                        {patient.rightAdd || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">PD:</span>{" "}
                      <span className="font-bold text-foreground">
                        {patient.rightPD || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Left Eye */}
                <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-6">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    Left Eye (OS)
                  </p>
                  <div className="space-y-2 text-sm font-mono">
                    <div>
                      <span className="text-muted-foreground">SPH:</span>{" "}
                      <span className="font-bold text-foreground">
                        {patient.leftSphere || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">CYL:</span>{" "}
                      <span className="font-bold text-foreground">
                        {patient.leftCylinder || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">AXIS:</span>{" "}
                      <span className="font-bold text-foreground">
                        {patient.leftAxis || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ADD:</span>{" "}
                      <span className="font-bold text-foreground">
                        {patient.leftAdd || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">PD:</span>{" "}
                      <span className="font-bold text-foreground">
                        {patient.leftPD || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical Notes */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Clinical Notes
              </h2>
              <p className="text-foreground leading-relaxed">
                {patient.notes || "No clinical notes available"}
              </p>
            </div>
          </div>

          {/* Right Column - Info & Actions */}
          <div className="space-y-6">
            {/* Problem/Complaint */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Chief Complaint
              </h3>
              <p className="text-foreground leading-relaxed">
                {patient.problem || "No chief complaint recorded"}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-2">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Quick Actions
              </h3>
              <button className="w-full text-left px-4 py-2.5 rounded-lg bg-primary/5 text-primary hover:bg-primary/10 transition-colors text-sm font-medium">
                Schedule Appointment
              </button>
              <button className="w-full text-left px-4 py-2.5 rounded-lg bg-secondary/5 text-secondary hover:bg-secondary/10 transition-colors text-sm font-medium">
                Add Prescription
              </button>
              <button className="w-full text-left px-4 py-2.5 rounded-lg bg-accent/5 text-accent hover:bg-accent/10 transition-colors text-sm font-medium">
                Print Record
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

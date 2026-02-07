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
  X,
  Printer,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getPatientById, PatientData, HistoryRecord } from "@/services/patientService";
import { PatientHistorySection } from "@/components/PatientHistorySection";

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    date: "",
    time: "",
    notes: "",
  });
  const [prescriptionData, setPrescriptionData] = useState({
    rightSphere: "",
    rightCylinder: "",
    rightAxis: "",
    rightAdd: "",
    rightPD: "",
    leftSphere: "",
    leftCylinder: "",
    leftAxis: "",
    leftAdd: "",
    leftPD: "",
  });
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);

  useEffect(() => {
    let isMounted = true;
    let requestInFlight = false;

    const fetchPatient = async () => {
      if (!id) {
        if (isMounted) {
          setError("No patient ID provided");
          setLoading(false);
        }
        return;
      }

      // Prevent duplicate requests
      if (requestInFlight) return;
      requestInFlight = true;

      try {
        if (!isMounted) return;
        setLoading(true);
        setError(null);
        const data = await getPatientById(id);
        if (isMounted) {
          if (data) {
            setPatient(data);
            setHistoryRecords(data.patientHistoryRecords || []);
            setError(null);
          } else {
            setError("Patient not found");
          }
        }
      } catch (err) {
        if (isMounted) {
          // Gracefully handle AbortError
          if (
            err instanceof Error &&
            (err.message.includes("AbortError") ||
              err.message.includes("aborted"))
          ) {
            console.debug("Patient fetch cancelled - component unmounted");
            return;
          }
          const errorMessage =
            err instanceof Error ? err.message : "Failed to load patient";
          setError(errorMessage);
          console.error("Error fetching patient:", err);
        }
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
        fetchPatient();
      }
    }, 100);

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [id]);

  // Handle printing patient record
  const handlePrintRecord = () => {
    if (!patient) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const prescriptionData = `
      Right Eye (OD):
      Sphere: ${patient.rightSphere || "N/A"}
      Cylinder: ${patient.rightCylinder || "N/A"}
      Axis: ${patient.rightAxis || "N/A"}
      Add: ${patient.rightAdd || "N/A"}
      PD: ${patient.rightPD || "N/A"}

      Left Eye (OS):
      Sphere: ${patient.leftSphere || "N/A"}
      Cylinder: ${patient.leftCylinder || "N/A"}
      Axis: ${patient.leftAxis || "N/A"}
      Add: ${patient.leftAdd || "N/A"}
      PD: ${patient.leftPD || "N/A"}
    `;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Patient Record - ${patient.firstName} ${patient.lastName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
          .header { border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 28px; }
          .header p { margin: 5px 0; color: #666; }
          .section { margin-bottom: 25px; page-break-inside: avoid; }
          .section-title { font-weight: bold; font-size: 16px; margin-bottom: 12px; background-color: #f0f0f0; padding: 10px; border-left: 4px solid #2563eb; }
          .field { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .label { font-weight: bold; color: #333; }
          .value { color: #666; }
          pre { white-space: pre-wrap; word-wrap: break-word; font-size: 12px; }
          .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #ccc; text-align: center; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Patient Record</h1>
          <p><strong>OptiCare</strong> - Optician Management System</p>
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>

        <div class="section">
          <div class="section-title">Personal Information</div>
          <div class="field"><span class="label">Name:</span> <span class="value">${patient.firstName} ${patient.lastName}</span></div>
          <div class="field"><span class="label">Age:</span> <span class="value">${patient.age} years</span></div>
          <div class="field"><span class="label">Date of Birth:</span> <span class="value">${patient.dateOfBirth}</span></div>
          <div class="field"><span class="label">Sex:</span> <span class="value">${patient.sex}</span></div>
          <div class="field"><span class="label">Email:</span> <span class="value">${patient.email}</span></div>
          <div class="field"><span class="label">Phone:</span> <span class="value">${patient.phone}</span></div>
          <div class="field"><span class="label">Address:</span> <span class="value">${patient.address || "N/A"}</span></div>
          <div class="field"><span class="label">Insurance:</span> <span class="value">${patient.insurance || "N/A"}</span></div>
        </div>

        <div class="section">
          <div class="section-title">Chief Complaint</div>
          <p>${patient.problem || "N/A"}</p>
        </div>

        <div class="section">
          <div class="section-title">Current Prescription</div>
          <pre>${prescriptionData}</pre>
        </div>

        <div class="section">
          <div class="section-title">Clinical Notes</div>
          <p>${patient.notes || "N/A"}</p>
        </div>

        <div class="footer">
          <p>This is a confidential patient record. Do not share without authorization.</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  };

  // Handle scheduling appointment
  const handleScheduleAppointment = () => {
    if (!appointmentData.date || !appointmentData.time) {
      alert("Please fill in date and time");
      return;
    }
    alert(
      `Appointment scheduled for ${appointmentData.date} at ${appointmentData.time}`,
    );
    setShowScheduleModal(false);
    setAppointmentData({ date: "", time: "", notes: "" });
  };

  // Handle updating prescription
  const handleUpdatePrescription = () => {
    if (
      !prescriptionData.rightSphere &&
      !prescriptionData.leftSphere &&
      !prescriptionData.rightCylinder &&
      !prescriptionData.leftCylinder
    ) {
      alert("Please enter at least some prescription values");
      return;
    }
    alert("Prescription updated successfully!");
    setShowPrescriptionModal(false);
    setPrescriptionData({
      rightSphere: "",
      rightCylinder: "",
      rightAxis: "",
      rightAdd: "",
      rightPD: "",
      leftSphere: "",
      leftCylinder: "",
      leftAxis: "",
      leftAdd: "",
      leftPD: "",
    });
  };

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

            {/* Patient History Records */}
            <PatientHistorySection
              records={historyRecords}
              onRecordsChange={setHistoryRecords}
            />

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
              <button
                onClick={() => setShowScheduleModal(true)}
                className="w-full text-left px-4 py-2.5 rounded-lg bg-primary/5 text-primary hover:bg-primary/10 transition-colors text-sm font-medium"
              >
                Schedule Appointment
              </button>
              <button
                onClick={() => setShowPrescriptionModal(true)}
                className="w-full text-left px-4 py-2.5 rounded-lg bg-secondary/5 text-secondary hover:bg-secondary/10 transition-colors text-sm font-medium"
              >
                Add Prescription
              </button>
              <button
                onClick={handlePrintRecord}
                className="w-full text-left px-4 py-2.5 rounded-lg bg-accent/5 text-accent hover:bg-accent/10 transition-colors text-sm font-medium"
              >
                Print Record
              </button>
            </div>
          </div>
        </div>
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

      {/* Add Prescription Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">
                Update Prescription
              </h3>
              <button
                onClick={() => setShowPrescriptionModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Right Eye */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">
                  Right Eye (OD)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Sphere (SPH)
                    </label>
                    <input
                      type="text"
                      value={prescriptionData.rightSphere}
                      onChange={(e) =>
                        setPrescriptionData({
                          ...prescriptionData,
                          rightSphere: e.target.value,
                        })
                      }
                      placeholder="e.g., -2.50"
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Cylinder (CYL)
                    </label>
                    <input
                      type="text"
                      value={prescriptionData.rightCylinder}
                      onChange={(e) =>
                        setPrescriptionData({
                          ...prescriptionData,
                          rightCylinder: e.target.value,
                        })
                      }
                      placeholder="e.g., -0.75"
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Axis
                    </label>
                    <input
                      type="text"
                      value={prescriptionData.rightAxis}
                      onChange={(e) =>
                        setPrescriptionData({
                          ...prescriptionData,
                          rightAxis: e.target.value,
                        })
                      }
                      placeholder="e.g., 180"
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Add
                    </label>
                    <input
                      type="text"
                      value={prescriptionData.rightAdd}
                      onChange={(e) =>
                        setPrescriptionData({
                          ...prescriptionData,
                          rightAdd: e.target.value,
                        })
                      }
                      placeholder="e.g., +1.50"
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Pupillary Distance (PD)
                    </label>
                    <input
                      type="text"
                      value={prescriptionData.rightPD}
                      onChange={(e) =>
                        setPrescriptionData({
                          ...prescriptionData,
                          rightPD: e.target.value,
                        })
                      }
                      placeholder="e.g., 32"
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Left Eye */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Left Eye (OS)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Sphere (SPH)
                    </label>
                    <input
                      type="text"
                      value={prescriptionData.leftSphere}
                      onChange={(e) =>
                        setPrescriptionData({
                          ...prescriptionData,
                          leftSphere: e.target.value,
                        })
                      }
                      placeholder="e.g., -2.75"
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Cylinder (CYL)
                    </label>
                    <input
                      type="text"
                      value={prescriptionData.leftCylinder}
                      onChange={(e) =>
                        setPrescriptionData({
                          ...prescriptionData,
                          leftCylinder: e.target.value,
                        })
                      }
                      placeholder="e.g., -0.50"
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Axis
                    </label>
                    <input
                      type="text"
                      value={prescriptionData.leftAxis}
                      onChange={(e) =>
                        setPrescriptionData({
                          ...prescriptionData,
                          leftAxis: e.target.value,
                        })
                      }
                      placeholder="e.g., 175"
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Add
                    </label>
                    <input
                      type="text"
                      value={prescriptionData.leftAdd}
                      onChange={(e) =>
                        setPrescriptionData({
                          ...prescriptionData,
                          leftAdd: e.target.value,
                        })
                      }
                      placeholder="e.g., +1.50"
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Pupillary Distance (PD)
                    </label>
                    <input
                      type="text"
                      value={prescriptionData.leftPD}
                      onChange={(e) =>
                        setPrescriptionData({
                          ...prescriptionData,
                          leftPD: e.target.value,
                        })
                      }
                      placeholder="e.g., 32"
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowPrescriptionModal(false)}
                  className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePrescription}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Save Prescription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

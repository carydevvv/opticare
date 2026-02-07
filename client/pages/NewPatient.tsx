import { Layout } from "@/components/Layout";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, AlertCircle } from "lucide-react";
import { useState } from "react";
import { addPatient, HistoryRecord } from "@/services/patientService";
import { PatientHistorySection } from "@/components/PatientHistorySection";

interface PatientFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: string;
  sex: string;
  dateOfBirth: string;
  address: string;
  insurance: string;

  // Chief Complaint
  problem: string;

  // Patient History Records
  patientHistoryRecords: HistoryRecord[];

  // Right Eye (OD)
  rightSphere: string;
  rightCylinder: string;
  rightAxis: string;
  rightAdd: string;
  rightPD: string;

  // Left Eye (OS)
  leftSphere: string;
  leftCylinder: string;
  leftAxis: string;
  leftAdd: string;
  leftPD: string;

  // Notes
  notes: string;
}

export default function NewPatient() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PatientFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    age: "",
    sex: "",
    dateOfBirth: "",
    address: "",
    insurance: "",
    problem: "",
    patientHistoryRecords: [],
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
    notes: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleHistoryRecordsChange = (records: HistoryRecord[]) => {
    setFormData((prev) => ({
      ...prev,
      patientHistoryRecords: records,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Add patient to Firebase
      await addPatient(formData);
      setSubmitted(true);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create patient record";
      setError(errorMessage);
      setSubmitted(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link>
        </div>

        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Add New Patient
          </h1>
          <p className="text-muted-foreground">
            Complete all fields to create a new patient record with vision
            prescription details
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-red-600 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {submitted && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <div className="text-green-600 mt-0.5">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-green-900">Success!</h3>
              <p className="text-sm text-green-800">
                {formData.firstName} {formData.lastName} has been added.
                Redirecting to dashboard...
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  placeholder="Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Age *
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  placeholder="35"
                  min="0"
                  max="150"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Sex *
                </label>
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  placeholder="123 Main St, City, State 12345"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Insurance Provider
                </label>
                <input
                  type="text"
                  name="insurance"
                  value={formData.insurance}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  placeholder="Blue Cross Blue Shield"
                />
              </div>
            </div>
          </div>

          {/* Chief Complaint Section */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <div className="bg-secondary/10 p-2 rounded-lg">
                <svg
                  className="w-5 h-5 text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              Chief Complaint / Problem
            </h2>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Problem / Chief Complaint *
              </label>
              <textarea
                name="problem"
                value={formData.problem}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                placeholder="e.g., Blurred vision, difficulty reading, eye strain..."
                rows={3}
              />
            </div>
          </div>

          {/* Patient History Section */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <div className="bg-secondary/10 p-2 rounded-lg">
                <svg
                  className="w-5 h-5 text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              Patient History
            </h2>

            <p className="text-sm text-muted-foreground">
              Select any relevant patient history items
            </p>

            <div className="space-y-3">
              {[
                { label: "PM hx", value: "PM hx" },
                { label: "PO hx", value: "PO hx" },
                { label: "VDU (Visual Display Unit)", value: "VDU" },
                { label: "Strabismus (Eye Alignment Issue)", value: "Strabismus" },
                { label: "NPC (Near Point of Convergence)", value: "NPC" },
              ].map((item) => (
                <label
                  key={item.value}
                  className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.patientHistory.includes(item.value)}
                    onChange={() => handleHistoryToggle(item.value)}
                    className="w-4 h-4 rounded border-border cursor-pointer accent-primary"
                  />
                  <span className="text-foreground font-medium">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Eye Measurements Section */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <div className="bg-accent/10 p-2 rounded-lg">
                <svg
                  className="w-5 h-5 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              Eye Measurements
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Right Eye (OD) */}
              <div className="space-y-4 p-4 bg-accent/5 rounded-lg border border-accent/20">
                <h3 className="font-semibold text-foreground text-lg">
                  Right Eye (OD)
                </h3>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Sphere (SPH)
                  </label>
                  <input
                    type="text"
                    name="rightSphere"
                    value={formData.rightSphere}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background"
                    placeholder="e.g., -2.50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Cylinder (CYL)
                  </label>
                  <input
                    type="text"
                    name="rightCylinder"
                    value={formData.rightCylinder}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background"
                    placeholder="e.g., -0.75"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Axis
                  </label>
                  <input
                    type="text"
                    name="rightAxis"
                    value={formData.rightAxis}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background"
                    placeholder="e.g., 180"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Add (Addition)
                  </label>
                  <input
                    type="text"
                    name="rightAdd"
                    value={formData.rightAdd}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background"
                    placeholder="e.g., +1.50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Pupillary Distance (PD)
                  </label>
                  <input
                    type="text"
                    name="rightPD"
                    value={formData.rightPD}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background"
                    placeholder="e.g., 32"
                  />
                </div>
              </div>

              {/* Left Eye (OS) */}
              <div className="space-y-4 p-4 bg-accent/5 rounded-lg border border-accent/20">
                <h3 className="font-semibold text-foreground text-lg">
                  Left Eye (OS)
                </h3>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Sphere (SPH)
                  </label>
                  <input
                    type="text"
                    name="leftSphere"
                    value={formData.leftSphere}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background"
                    placeholder="e.g., -2.75"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Cylinder (CYL)
                  </label>
                  <input
                    type="text"
                    name="leftCylinder"
                    value={formData.leftCylinder}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background"
                    placeholder="e.g., -0.50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Axis
                  </label>
                  <input
                    type="text"
                    name="leftAxis"
                    value={formData.leftAxis}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background"
                    placeholder="e.g., 175"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Add (Addition)
                  </label>
                  <input
                    type="text"
                    name="leftAdd"
                    value={formData.leftAdd}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background"
                    placeholder="e.g., +1.50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Pupillary Distance (PD)
                  </label>
                  <input
                    type="text"
                    name="leftPD"
                    value={formData.leftPD}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background"
                    placeholder="e.g., 32"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Notes Section */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              Additional Notes
            </h2>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Clinical Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                placeholder="Any additional observations or notes..."
                rows={4}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-6 border-t border-border">
            <Link
              to="/"
              className="flex-1 px-6 py-2.5 rounded-lg border border-border text-foreground hover:bg-muted transition-colors font-medium text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-foreground border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Create Patient
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

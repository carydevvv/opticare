import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { getAllPatients, PatientData } from "@/services/patientService";

export default function Patients() {
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  return (
    <Layout>
      <div className="space-y-6">
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

        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            All Patients
          </h1>
          <p className="text-muted-foreground">
            Manage all patient records in your system
          </p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
              <p className="text-muted-foreground">Loading patients...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
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
            <div className="grid gap-3">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <Link
                    key={patient.id}
                    to={`/patient/${patient.id}`}
                    className="block p-4 bg-card border border-border rounded-lg hover:border-primary/50 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {patient.email} • {patient.phone}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Age: {patient.age} • {patient.sex}
                        </p>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-12 bg-card border border-border rounded-lg">
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? `No patients found matching "${searchTerm}"`
                      : "No patients found"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

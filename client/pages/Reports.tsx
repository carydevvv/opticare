import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { getAllPatients, PatientData } from "@/services/patientService";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Reports() {
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Calculate statistics
  const stats = {
    totalPatients: patients.length,
    avgAge:
      patients.length > 0
        ? Math.round(
            patients.reduce((sum, p) => sum + parseInt(p.age || "0"), 0) /
              patients.length,
          )
        : 0,
    sexDistribution: {
      male: patients.filter((p) => p.sex === "male").length,
      female: patients.filter((p) => p.sex === "female").length,
      other: patients.filter((p) => p.sex === "other").length,
    },
    ageDistribution: {
      "0-18": patients.filter(
        (p) => parseInt(p.age || "0") >= 0 && parseInt(p.age || "0") <= 18,
      ).length,
      "19-35": patients.filter(
        (p) => parseInt(p.age || "0") >= 19 && parseInt(p.age || "0") <= 35,
      ).length,
      "36-50": patients.filter(
        (p) => parseInt(p.age || "0") >= 36 && parseInt(p.age || "0") <= 50,
      ).length,
      "51-65": patients.filter(
        (p) => parseInt(p.age || "0") >= 51 && parseInt(p.age || "0") <= 65,
      ).length,
      "65+": patients.filter((p) => parseInt(p.age || "0") > 65).length,
    },
    insuranceDistribution: Object.entries(
      patients.reduce((acc: Record<string, number>, p) => {
        const insurance = p.insurance || "Not Specified";
        acc[insurance] = (acc[insurance] || 0) + 1;
        return acc;
      }, {}),
    ).map(([name, count]) => ({ name, count })),
  };

  const sexData = [
    { name: "Male", value: stats.sexDistribution.male, fill: "#3b82f6" },
    { name: "Female", value: stats.sexDistribution.female, fill: "#ec4899" },
    { name: "Other", value: stats.sexDistribution.other, fill: "#8b5cf6" },
  ];

  const ageData = Object.entries(stats.ageDistribution).map(
    ([range, count]) => ({
      range,
      count,
    }),
  );

  const insuranceData = stats.insuranceDistribution.slice(0, 5);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
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
          <h1 className="text-3xl font-bold text-foreground">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Patient statistics and demographic insights
          </p>
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

        {!loading && patients.length > 0 && (
          <>
            {/* Key Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-xl p-6">
                <p className="text-sm text-muted-foreground">Total Patients</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {stats.totalPatients}
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <p className="text-sm text-muted-foreground">Average Age</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {stats.avgAge} years
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <p className="text-sm text-muted-foreground">Most Common Sex</p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {stats.sexDistribution.female > stats.sexDistribution.male
                    ? "Female"
                    : "Male"}
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sex Distribution */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Patient Distribution by Sex
                </h3>
                {sexData.filter((d) => d.value > 0).length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sexData.filter((d) => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) =>
                          `${name}: ${value} (${Math.round((value / stats.totalPatients) * 100)}%)`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {sexData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </div>

              {/* Age Distribution */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Patient Distribution by Age Group
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Insurance Distribution */}
              <div className="bg-card border border-border rounded-xl p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Top Insurance Providers
                </h3>
                {insuranceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={insuranceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No insurance data available
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Statistics Table */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Detailed Statistics
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        Metric
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-foreground">
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 text-muted-foreground">
                        Total Patients
                      </td>
                      <td className="text-right py-3 px-4 font-semibold text-foreground">
                        {stats.totalPatients}
                      </td>
                    </tr>
                    <tr className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 text-muted-foreground">
                        Average Age
                      </td>
                      <td className="text-right py-3 px-4 font-semibold text-foreground">
                        {stats.avgAge} years
                      </td>
                    </tr>
                    <tr className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 text-muted-foreground">Male</td>
                      <td className="text-right py-3 px-4 font-semibold text-foreground">
                        {stats.sexDistribution.male} (
                        {Math.round(
                          (stats.sexDistribution.male / stats.totalPatients) *
                            100,
                        )}
                        %)
                      </td>
                    </tr>
                    <tr className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 text-muted-foreground">
                        Female
                      </td>
                      <td className="text-right py-3 px-4 font-semibold text-foreground">
                        {stats.sexDistribution.female} (
                        {Math.round(
                          (stats.sexDistribution.female / stats.totalPatients) *
                            100,
                        )}
                        %)
                      </td>
                    </tr>
                    <tr className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 text-muted-foreground">Other</td>
                      <td className="text-right py-3 px-4 font-semibold text-foreground">
                        {stats.sexDistribution.other} (
                        {Math.round(
                          (stats.sexDistribution.other / stats.totalPatients) *
                            100,
                        )}
                        %)
                      </td>
                    </tr>
                    {Object.entries(stats.ageDistribution).map(
                      ([range, count]) => (
                        <tr
                          key={range}
                          className="border-b border-border hover:bg-muted/50"
                        >
                          <td className="py-3 px-4 text-muted-foreground">
                            Age {range}
                          </td>
                          <td className="text-right py-3 px-4 font-semibold text-foreground">
                            {count} (
                            {Math.round((count / stats.totalPatients) * 100)}
                            %)
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {!loading && patients.length === 0 && (
          <div className="bg-card border border-border rounded-xl p-8 text-center py-16">
            <p className="text-muted-foreground mb-4">No patients found</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
              <p className="text-muted-foreground">Loading reports...</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Eye,
  Calendar,
  Download,
  BarChart3,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getAllPatients, PatientData } from "@/services/patientService";

export default function Reports() {
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);

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
        // Gracefully handle AbortError
        if (err instanceof Error && (err.message.includes("AbortError") || err.message.includes("aborted"))) {
          console.debug("Report fetch cancelled - component unmounted");
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

  // Calculate statistics
  const calculateStats = () => {
    const stats = {
      totalPatients: patients.length,
      malePatients: patients.filter((p) => p.sex === "male").length,
      femalePatients: patients.filter((p) => p.sex === "female").length,
      otherPatients: patients.filter((p) => p.sex === "other").length,
      avgAge:
        patients.length > 0
          ? Math.round(
              patients.reduce((sum, p) => sum + parseInt(p.age || "0"), 0) /
                patients.length
            )
          : 0,
      withRefractiveLens: patients.filter((p) => p.rightSphere).length,
      withAstigmatism: patients.filter(
        (p) => p.rightCylinder && p.rightCylinder !== "0"
      ).length,
      withAddition: patients.filter((p) => p.rightAdd && p.rightAdd !== "0")
        .length,
    };
    return stats;
  };

  const stats = calculateStats();

  // Handle exporting report
  const handleExportReport = () => {
    const csv = generateReportCSV();
    downloadCSV(csv, `opticare-report-${new Date().toISOString().split('T')[0]}.csv`);
  };

  // Generate CSV report
  const generateReportCSV = () => {
    const ageDistribution = getAgeDistribution();

    const rows = [
      ["OptiCare - Patient Report"],
      [`Generated on: ${new Date().toLocaleString()}`],
      [],
      ["KEY METRICS"],
      ["Metric", "Value"],
      ["Total Patients", stats.totalPatients],
      ["Average Age", stats.avgAge],
      ["Patients with Refractive Error", stats.withRefractiveLens],
      ["Patients with Astigmatism", stats.withAstigmatism],
      ["Patients with Presbyopia", stats.withAddition],
      [],
      ["GENDER DISTRIBUTION"],
      ["Gender", "Count", "Percentage"],
      ["Male", stats.malePatients, stats.totalPatients > 0 ? `${Math.round((stats.malePatients / stats.totalPatients) * 100)}%` : "0%"],
      ["Female", stats.femalePatients, stats.totalPatients > 0 ? `${Math.round((stats.femalePatients / stats.totalPatients) * 100)}%` : "0%"],
      ["Other", stats.otherPatients, stats.totalPatients > 0 ? `${Math.round((stats.otherPatients / stats.totalPatients) * 100)}%` : "0%"],
      [],
      ["AGE DISTRIBUTION"],
      ["Age Range", "Count"],
      ["0-18", ageDistribution["0-18"]],
      ["19-35", ageDistribution["19-35"]],
      ["36-50", ageDistribution["36-50"]],
      ["51-65", ageDistribution["51-65"]],
      ["65+", ageDistribution["65+"]],
      [],
      ["CLINICAL CONDITIONS"],
      ["Condition", "Count"],
      ["Myopia/Sphere Error", stats.withRefractiveLens],
      ["Astigmatism (Cylinder)", stats.withAstigmatism],
      ["Presbyopia (Addition)", stats.withAddition],
    ];

    return rows.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
  };

  // Download CSV file
  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate age distribution
  const getAgeDistribution = () => {
    const ranges = {
      "0-18": 0,
      "19-35": 0,
      "36-50": 0,
      "51-65": 0,
      "65+": 0,
    };

    patients.forEach((p) => {
      const age = parseInt(p.age || "0");
      if (age <= 18) ranges["0-18"]++;
      else if (age <= 35) ranges["19-35"]++;
      else if (age <= 50) ranges["36-50"]++;
      else if (age <= 65) ranges["51-65"]++;
      else ranges["65+"]++;
    });

    return ranges;
  };

  const ageDistribution = getAgeDistribution();
  const genderData = {
    male: stats.malePatients,
    female: stats.femalePatients,
    other: stats.otherPatients,
  };

  // Simple pie chart component using CSS
  const PieChart = ({ data, title }: { data: Record<string, number>; title: string }) => {
    const total = Object.values(data).reduce((a, b) => a + b, 0);
    const colors = ["#2563eb", "#059669", "#9333ea"];
    let cumulativePercent = 0;

    const slices = Object.entries(data).map(([key, value], index) => {
      const percent = total > 0 ? (value / total) * 100 : 0;
      const startPercent = cumulativePercent;
      cumulativePercent += percent;

      return {
        label: key,
        value,
        percent: Math.round(percent),
        startPercent,
        endPercent: cumulativePercent,
        color: colors[index % colors.length],
      };
    });

    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4">{title}</h3>
        <div className="flex items-center justify-between gap-6">
          <div className="flex-shrink-0">
            <svg width="150" height="150" viewBox="0 0 150 150">
              {slices.map((slice, index) => {
                const radius = 60;
                const circumference = 2 * Math.PI * radius;
                const offset =
                  (circumference * (100 - slice.endPercent)) / 100;

                return (
                  <circle
                    key={index}
                    cx="75"
                    cy="75"
                    r={radius}
                    fill="none"
                    stroke={slice.color}
                    strokeWidth="20"
                    strokeDasharray={
                      (circumference * slice.percent) / 100 + " " + circumference
                    }
                    strokeDashoffset={offset}
                    transform={`rotate(${slice.startPercent * 3.6} 75 75)`}
                  />
                );
              })}
              <text
                x="75"
                y="75"
                textAnchor="middle"
                dy="0.3em"
                fontSize="14"
                fontWeight="bold"
                fill="currentColor"
                className="text-foreground"
              >
                {total}
              </text>
            </svg>
          </div>
          <div className="flex-1 space-y-3">
            {slices.map((slice, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="text-sm font-medium text-foreground capitalize">
                    {slice.label}
                  </span>
                </div>
                <span className="text-sm font-bold text-muted-foreground">
                  {slice.value} ({slice.percent}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Bar chart component
  const BarChart = ({ data, title }: { data: Record<string, number>; title: string }) => {
    const maxValue = Math.max(...Object.values(data), 1);
    const colors = ["#2563eb", "#059669", "#9333ea", "#dc2626", "#ea580c"];

    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4">{title}</h3>
        <div className="space-y-4">
          {Object.entries(data).map(([label, value], index) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">
                  {label}
                </span>
                <span className="text-sm font-bold text-muted-foreground">
                  {value}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(value / maxValue) * 100}%`,
                    backgroundColor: colors[index % colors.length],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

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
            <h1 className="text-3xl font-bold text-foreground">
              Reports & Analytics
            </h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive patient statistics and practice insights
            </p>
          </div>
          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <Download size={18} />
            Export Report
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Patients</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {stats.totalPatients}
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
                <p className="text-sm text-muted-foreground">Average Age</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {stats.avgAge}
                </p>
              </div>
              <div className="bg-secondary/10 p-3 rounded-lg">
                <TrendingUp size={24} className="text-secondary" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  With Refractive Error
                </p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {stats.withRefractiveLens}
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
                  With Astigmatism
                </p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {stats.withAstigmatism}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <BarChart3 size={24} className="text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gender Distribution */}
          <PieChart
            data={genderData}
            title="Patient Distribution by Gender"
          />

          {/* Age Distribution */}
          <BarChart
            data={ageDistribution}
            title="Patients by Age Group"
          />
        </div>

        {/* Additional Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Refractive Errors
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-foreground">
                      Myopia / Sphere
                    </span>
                    <span className="font-bold text-foreground">
                      {stats.withRefractiveLens}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-foreground">Astigmatism</span>
                    <span className="font-bold text-foreground">
                      {stats.withAstigmatism}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-foreground">
                      Presbyopia
                    </span>
                    <span className="font-bold text-foreground">
                      {stats.withAddition}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Gender Breakdown
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-foreground">Male</span>
                    <span className="font-bold text-foreground">
                      {stats.malePatients} (
                      {stats.totalPatients > 0
                        ? Math.round(
                            (stats.malePatients / stats.totalPatients) * 100
                          )
                        : 0}
                      %)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-foreground">Female</span>
                    <span className="font-bold text-foreground">
                      {stats.femalePatients} (
                      {stats.totalPatients > 0
                        ? Math.round(
                            (stats.femalePatients / stats.totalPatients) * 100
                          )
                        : 0}
                      %)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-foreground">Other</span>
                    <span className="font-bold text-foreground">
                      {stats.otherPatients}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Conditions Summary
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-foreground">
                      Patient Records
                    </span>
                    <span className="font-bold text-foreground">
                      {stats.totalPatients}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-foreground">
                      Avg Patient Age
                    </span>
                    <span className="font-bold text-foreground">
                      {stats.avgAge} yrs
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-foreground">
                      Optical Issues
                    </span>
                    <span className="font-bold text-foreground">
                      {stats.withRefractiveLens}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State Message */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
              <p className="text-muted-foreground">Loading analytics...</p>
            </div>
          </div>
        ) : patients.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <BarChart3
              size={48}
              className="mx-auto mb-4 text-muted-foreground opacity-50"
            />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Data Available
            </h3>
            <p className="text-muted-foreground">
              Add some patient records to see analytics and statistics here.
            </p>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}

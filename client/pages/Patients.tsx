import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Patients() {
  return (
    <Layout>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link>
        </div>

        {/* Content */}
        <div className="bg-card border border-border rounded-xl p-8 text-center py-16">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 12H9m6 0a6 6 0 01-6 6H9m0-12h6a6 6 0 01-6 6m0 0H9m-3 6h12"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">All Patients</h2>
          <p className="text-muted-foreground">
            This page will provide a comprehensive view of all your patients with advanced
            filtering, sorting, and bulk management options.
          </p>
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              💡 Go back to the Dashboard to see all patients or create a new patient record!
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

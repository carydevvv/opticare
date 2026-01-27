import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NewPatient() {
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
                  d="M12 6v6m0 0v6m0-6h6m0 0h6m-6-6H6m0 0H0"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Add New Patient</h2>
          <p className="text-muted-foreground">
            This page will include a comprehensive form to add new patient records with personal
            information, contact details, and initial vision prescription data.
          </p>
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              💡 Tell us what specific fields you'd like in the patient form and we'll build it
              out for you!
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

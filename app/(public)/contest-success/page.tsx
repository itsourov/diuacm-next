import contestHistory from "./data/contest-history.json";
import SemesterSection from "./components/SemesterSection";
import { Trophy } from "lucide-react";

export const metadata = {
  title: "Contest Success | DIUACM",
  description: "Achievements of DIU ACM teams in various programming contests",
};

export default function ContestSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-blue-50/20 to-transparent dark:from-blue-900/10">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-grid-gray-900/[0.02] dark:bg-grid-white/[0.02] bg-[size:60px_60px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/20 via-transparent to-transparent dark:from-blue-900/20" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-500/10 dark:bg-blue-400/10 backdrop-blur-xl">
              <Trophy className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
              Contest Success
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Celebrating our teams&apos; achievements in competitive programming
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-20">
          {contestHistory.semesters.map((semester, index) => (
            <SemesterSection
              key={index}
              semester={semester}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
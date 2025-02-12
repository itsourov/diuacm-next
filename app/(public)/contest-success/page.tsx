import contestHistory from "./data/contest-history.json";
import SemesterSection from "./components/SemesterSection";

export const metadata = {
  title: "Contest Success | DIUACM",
  description: "Achievements of DIU ACM teams in various programming contests",
};

export default function ContestSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}

      <section className="relative py-20 bg-gradient-to-b from-blue-50/20 to-transparent dark:from-blue-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Contest Success
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
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
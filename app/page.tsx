"use client"

export default function Home() {
  return (
    <div className="border-b border-gray-200 pb-5 dark:border-gray-400 mb-4">
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-600">PR Thematic Analyser</h3>
      <p className="mt-2 max-w-4xl text-sm text-gray-500 dark:text-gray-400">
        Head to Pull Requests to select and analyse GitHub pull request comments, or Analysis Results to review past analyses.
      </p>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">Executive Copilot</h1>
      <p className="text-lg text-gray-600 mb-8">
        AI-powered executive decision support system
      </p>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Megatrend Analysis</h2>
          <p className="text-gray-500">Track and analyze global megatrends</p>
        </div>

        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Value Templates</h2>
          <p className="text-gray-500">Access proven value proposition frameworks</p>
        </div>

        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Hidden Needs</h2>
          <p className="text-gray-500">Discover underlying customer needs</p>
        </div>
      </section>
    </main>
  );
}

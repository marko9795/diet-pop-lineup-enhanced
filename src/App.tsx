function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Diet Pop NHL Lineup Enhanced
          </h1>
          <p className="text-blue-200 text-lg">
            Organize your favorite diet sodas into hockey-style lineups with 3D visualization
          </p>
        </header>
        
        <main className="text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-white mb-4">
              🏒 Coming Soon
            </h2>
            <p className="text-blue-100 mb-6">
              We're building an amazing experience with 3D pop visualization and PDF exports.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white/5 rounded p-4">
                <div className="text-2xl mb-2">🥤</div>
                <div className="text-white font-medium">3D Pop Models</div>
                <div className="text-blue-200">Realistic can visualization</div>
              </div>
              <div className="bg-white/5 rounded p-4">
                <div className="text-2xl mb-2">🏒</div>
                <div className="text-white font-medium">NHL Lineups</div>
                <div className="text-blue-200">18 hockey positions</div>
              </div>
              <div className="bg-white/5 rounded p-4">
                <div className="text-2xl mb-2">📄</div>
                <div className="text-white font-medium">PDF Export</div>
                <div className="text-blue-200">Share your lineups</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
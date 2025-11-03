export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] overflow-x-hidden">
      <div className="p-4 sm:p-6 lg:p-8 lg:pl-72 max-w-full">
        <div className="mb-6 sm:mb-8">
          <div className="h-8 w-48 bg-white/10 rounded animate-pulse mb-2" />
          <div className="h-4 w-96 bg-white/10 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white/10 rounded-lg animate-pulse" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 h-96 bg-white/10 rounded-lg animate-pulse" />
          <div className="h-96 bg-white/10 rounded-lg animate-pulse" />
        </div>

        <div className="h-96 bg-white/10 rounded-lg animate-pulse" />
      </div>
    </div>
  )
}

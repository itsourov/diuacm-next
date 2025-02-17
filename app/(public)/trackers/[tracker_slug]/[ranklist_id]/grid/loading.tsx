export default function Loading() {
  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
      
      <div className="flex-1 p-6 space-y-4">
        <div className="w-full h-16 bg-white dark:bg-gray-800 rounded-xl animate-pulse" />
        
        <div className="grid gap-4">
          {[...Array(10)].map((_, i) => (
            <div 
              key={i}
              className="h-20 bg-white dark:bg-gray-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

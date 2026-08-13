'use client';

function PathSkeleton() {
  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-3 sm:px-4 py-6 sm:py-8 flex flex-col items-center animate-pulse">
      <div className="w-full max-w-lg h-28 bg-gray-200 dark:bg-duo-dark-card rounded-3xl mb-10" />
      <div className="flex flex-col items-center space-y-7 py-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{ transform: `translateX(${[0, -30, 0, 30, 0][i]}px)` }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-200 dark:bg-duo-dark-card" />
            <div className="mt-2 h-3 w-16 bg-gray-200 dark:bg-duo-dark-card rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default PathSkeleton;

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Placeholder shown while the special draw data loads.
 * Mirrors the real modal layout (hero, countdown, date, highlights, CTA)
 * so the transition feels seamless.
 */
export function MegaSena30ModalSkeleton() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-t-lg"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, #1f6b3a 0%, #0f3d22 45%, #051a0e 100%)",
        }}
      >
        <div className="relative px-4 sm:px-6 pt-5 sm:pt-7 pb-5 sm:pb-7 flex flex-col items-center gap-3">
          {/* Badge */}
          <Skeleton className="h-5 w-40 rounded-full bg-emerald-700/40" />

          {/* Title block */}
          <div className="flex items-end justify-center gap-2 sm:gap-3 mt-1">
            <div className="space-y-1.5">
              <Skeleton className="h-7 sm:h-9 w-20 sm:w-24 bg-emerald-700/40" />
              <Skeleton className="h-7 sm:h-9 w-20 sm:w-24 bg-emerald-700/40" />
            </div>
            <Skeleton className="h-14 sm:h-20 w-20 sm:w-28 bg-emerald-700/50" />
          </div>

          {/* Prize */}
          <div className="mt-3 sm:mt-4 w-full flex flex-col items-center gap-2">
            <Skeleton className="h-3 w-32 bg-emerald-700/40" />
            <Skeleton className="h-12 sm:h-14 w-48 sm:w-56 bg-amber-700/40" />
            <Skeleton className="h-6 sm:h-7 w-32 bg-amber-700/40" />
          </div>
        </div>
        <div className="relative h-1 bg-gradient-to-r from-lime-400/40 via-amber-300/40 to-lime-400/40" />
      </div>

      {/* Body */}
      <div className="px-4 sm:px-6 pt-4 pb-4 sm:pb-6 space-y-3 sm:space-y-4">
        {/* Countdown */}
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-3 w-32" />
          <div className="flex items-end justify-center gap-1 sm:gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg sm:rounded-xl" />
                <Skeleton className="h-2.5 w-7" />
              </div>
            ))}
          </div>
        </div>

        {/* Date pill */}
        <Skeleton className="h-9 w-full rounded-lg" />

        {/* Description */}
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5 mx-auto" />
        </div>

        {/* Highlights */}
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10"
            >
              <Skeleton className="w-5 h-5 sm:w-6 sm:h-6 rounded-full" />
              <Skeleton className="h-3 flex-1" />
            </div>
          ))}
        </div>

        {/* CTA */}
        <Skeleton className="h-11 sm:h-12 w-full rounded-md" />
      </div>
    </div>
  );
}

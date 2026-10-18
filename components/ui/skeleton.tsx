import { cx } from "./cx";

/** Neutral placeholder lines shown while saved data loads, so no screen flashes. */
export function Skeleton({ lines = 6, className }: { lines?: number; className?: string }) {
  return (
    <div aria-busy="true" aria-label="Loading" className={cx("space-y-3", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className="h-4 animate-pulse rounded bg-rule/70 motion-reduce:animate-none"
          style={{ width: `${[92, 100, 85, 97, 70, 88][i % 6]}%` }}
        />
      ))}
    </div>
  );
}

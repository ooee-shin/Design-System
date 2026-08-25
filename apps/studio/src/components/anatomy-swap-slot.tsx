type AnatomySwapSlotProps = {
  className?: string;
};

export function AnatomySwapSlot({ className = "" }: AnatomySwapSlotProps) {
  return (
    <span
      aria-hidden="true"
      className={`block size-4 rounded border border-dashed border-pink-400 bg-pink-50 dark:bg-pink-950 ${className}`}
    />
  );
}

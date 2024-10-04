import * as React from "react";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  color?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value, color = "bg-blue-600", className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        className={`w-full h-2 bg-gray-200 rounded-full overflow-hidden ${className}`}
        {...props}
      >
        <div
          className={`h-full transition-all duration-300 ease-in-out ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress };

import * as React from "react"

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  min: number;
  max: number;
  step: number;
  value: number[];
  onValueChange: (value: number[]) => void;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, min, max, step, value, onValueChange, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onValueChange([parseFloat(event.target.value)]);
    };

    return (
      <input
        type="range"
        ref={ref}
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={handleChange}
        className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${className}`}
        {...props}
      />
    )
  }
)

Slider.displayName = "Slider"

export { Slider }
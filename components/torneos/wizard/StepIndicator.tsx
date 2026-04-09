type Props = {
  currentStep: 1 | 2 | 3 | 4
  labels: string[]
}

export function StepIndicator({ currentStep, labels }: Props) {
  return (
    <div className="flex items-center justify-center gap-0 px-6 py-5">
      {labels.map((label, i) => {
        const stepNum = (i + 1) as 1 | 2 | 3 | 4
        const isDone = stepNum < currentStep
        const isActive = stepNum === currentStep

        return (
          <div key={stepNum} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                style={{
                  backgroundColor: isDone
                    ? "#bcff00"
                    : isActive
                    ? "#0f172a"
                    : "#e2e8f0",
                  color: isDone ? "#0f172a" : isActive ? "#ffffff" : "#64748b",
                }}
              >
                {isDone ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2 7L5.5 10.5L12 3.5"
                      stroke="#0f172a"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              <span
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  color: isActive ? "#0f172a" : "#64748b",
                }}
              >
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div
                className="w-12 h-0.5 mb-5 mx-1"
                style={{
                  backgroundColor: isDone ? "#bcff00" : "#e2e8f0",
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

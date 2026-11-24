
import { Check } from "lucide-react";

const steps = [
  "Create Organization",
  "Invite Members",
  "Set Up Project",
];

export function OnboardingSteps({
  currentStep = 1,
}: {
  currentStep?: number;
}) {
  return (
    <div className="flex w-full items-start justify-between gap-2">
      {steps.map((step, index) => {
        const number = index + 1;
        const active = number === currentStep;
        const completed = number < currentStep;

        return (
          <div
            key={step}
            className="flex min-w-0 flex-1 flex-col items-center gap-2"
          >
            <div className="flex w-full items-center gap-2">
              {index > 0 && (
                <div
                  className={`h-px flex-1 ${
                    completed ? "bg-[#9160EF]" : "bg-[#DED9E9]"
                  }`}
                />
              )}

              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
                  active || completed
                    ? "border-[#9160EF] bg-[#9160EF] text-white"
                    : "border-[#D9D4E6] bg-white text-[#8E87A1]"
                }`}
              >
                {completed ? <Check size={17} /> : number}
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`h-px flex-1 ${
                    completed ? "bg-[#9160EF]" : "bg-[#DED9E9]"
                  }`}
                />
              )}
            </div>

            <span
              className={`text-center text-xs sm:text-sm ${
                active
                  ? "font-semibold text-[#17152B]"
                  : "text-[#77718E]"
              }`}
            >
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}

import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface TimelineStep {
  stepNumber: number;
  title: string;
  description: string;
  status?: "completed" | "current" | "upcoming";
}

interface TimelineProps {
  steps: TimelineStep[];
}

export function Timeline({ steps }: TimelineProps) {
  return (
    <div className="space-y-6">
      {steps.map((step, index) => (
        <div key={step.stepNumber} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border-2",
                step.status === "completed"
                  ? "border-success bg-success text-success-foreground"
                  : step.status === "current"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground bg-background text-muted-foreground"
              )}
            >
              {step.status === "completed" ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <span className="text-sm font-bold">{step.stepNumber}</span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-0.5 flex-1 min-h-[40px]",
                  step.status === "completed" ? "bg-success" : "bg-border"
                )}
              />
            )}
          </div>
          <div className="flex-1 pb-6">
            <h4 className="font-semibold">{step.title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

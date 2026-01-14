import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Clock } from "lucide-react";

interface ProcessStep {
  stepNumber: number;
  title: string;
  description: string;
}

interface CaseProgressProps {
  steps: ProcessStep[];
  currentStep: number;
  status: string;
}

const statusConfig = {
  new: { label: "New", variant: "default" as const, color: "text-muted-foreground" },
  in_progress: { label: "In Progress", variant: "default" as const, color: "text-warning" },
  completed: { label: "Completed", variant: "success" as const, color: "text-success" },
  cancelled: { label: "Cancelled", variant: "destructive" as const, color: "text-destructive" },
};

export function CaseProgress({ steps, currentStep, status }: CaseProgressProps) {
  const statusInfo = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
  const progressPercentage = status === "completed" ? 100 : ((currentStep - 1) / steps.length) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Case Progress</h3>
          <p className="text-sm text-muted-foreground">
            Step {currentStep} of {steps.length}
          </p>
        </div>
        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      </div>

      <div className="space-y-2">
        <Progress value={progressPercentage} className="h-2" />
        <p className="text-xs text-muted-foreground text-right">{Math.round(progressPercentage)}% Complete</p>
      </div>

      <div className="space-y-4">
        {steps.map((step) => {
          const isCompleted = step.stepNumber < currentStep || status === "completed";
          const isCurrent = step.stepNumber === currentStep && status !== "completed";
          const isUpcoming = step.stepNumber > currentStep && status !== "completed";

          return (
            <div key={step.stepNumber} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2",
                    isCompleted && "border-success bg-success text-success-foreground",
                    isCurrent && "border-primary bg-primary text-primary-foreground",
                    isUpcoming && "border-muted-foreground bg-background text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : isCurrent ? (
                    <Clock className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </div>
                {step.stepNumber < steps.length && (
                  <div
                    className={cn(
                      "w-0.5 flex-1 min-h-[40px]",
                      isCompleted ? "bg-success" : "bg-border"
                    )}
                  />
                )}
              </div>
              <div className="flex-1 pb-6">
                <h4 className={cn("font-semibold", isCurrent && "text-primary")}>
                  {step.title}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

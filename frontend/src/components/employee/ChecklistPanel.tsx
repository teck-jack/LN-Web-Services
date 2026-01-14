import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Circle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

interface ChecklistItem {
    _id: string;
    title: string;
    description?: string;
    isOptional: boolean;
    order: number;
}

interface WorkflowStep {
    _id: string;
    stepName: string;
    description?: string;
    order: number;
    estimatedDuration: number;
    checklistItems: ChecklistItem[];
}

interface ChecklistProgress {
    stepId: string;
    itemId: string;
    isCompleted: boolean;
    completedAt?: string;
    completedBy?: string;
}

interface ChecklistPanelProps {
    caseId: string;
    workflowTemplateId: string;
    steps: WorkflowStep[];
    progress: ChecklistProgress[];
    onUpdate: (itemId: string, completed: boolean) => Promise<void>;
    className?: string;
}

export const ChecklistPanel: React.FC<ChecklistPanelProps> = ({
    caseId,
    workflowTemplateId,
    steps,
    progress,
    onUpdate,
    className,
}) => {
    const queryClient = useQueryClient();

    const updateMutation = useMutation({
        mutationFn: ({ itemId, completed }: { itemId: string; completed: boolean }) =>
            onUpdate(itemId, completed),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['case', caseId] });
        },
        onError: () => {
            toast.error('Failed to update checklist');
        },
    });

    const isItemCompleted = (stepId: string, itemId: string) => {
        return progress.some(
            (p) => p.stepId === stepId && p.itemId === itemId && p.isCompleted
        );
    };

    const getStepProgress = (step: WorkflowStep) => {
        const totalItems = step.checklistItems.length;
        const completedItems = step.checklistItems.filter((item) =>
            isItemCompleted(step._id, item._id)
        ).length;
        return { total: totalItems, completed: completedItems };
    };

    const getTotalProgress = () => {
        const totalItems = steps.reduce((sum, step) => sum + step.checklistItems.length, 0);
        const completedItems = steps.reduce(
            (sum, step) =>
                sum +
                step.checklistItems.filter((item) => isItemCompleted(step._id, item._id)).length,
            0
        );
        return { total: totalItems, completed: completedItems };
    };

    const totalProgress = getTotalProgress();
    const progressPercentage =
        totalProgress.total > 0 ? (totalProgress.completed / totalProgress.total) * 100 : 0;

    return (
        <Card className={className}>
            <CardHeader>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Workflow Checklist</CardTitle>
                        <Badge variant="secondary">
                            {totalProgress.completed} / {totalProgress.total}
                        </Badge>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Overall Progress</span>
                            <span className="font-medium">{Math.round(progressPercentage)}%</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" className="space-y-2">
                    {steps
                        .sort((a, b) => a.order - b.order)
                        .map((step) => {
                            const stepProgress = getStepProgress(step);
                            const stepPercentage =
                                stepProgress.total > 0
                                    ? (stepProgress.completed / stepProgress.total) * 100
                                    : 0;
                            const isStepComplete = stepProgress.completed === stepProgress.total;

                            return (
                                <AccordionItem
                                    key={step._id}
                                    value={step._id}
                                    className="border rounded-lg px-4"
                                >
                                    <AccordionTrigger className="hover:no-underline">
                                        <div className="flex items-center gap-3 flex-1">
                                            {isStepComplete ? (
                                                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                                            ) : (
                                                <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                            )}
                                            <div className="flex-1 text-left">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium">{step.stepName}</span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {stepProgress.completed}/{stepProgress.total}
                                                    </Badge>
                                                </div>
                                                {step.description && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {step.description}
                                                    </p>
                                                )}
                                                <div className="mt-2">
                                                    <Progress value={stepPercentage} className="h-1" />
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-3 pt-3">
                                            {step.checklistItems
                                                .sort((a, b) => a.order - b.order)
                                                .map((item) => {
                                                    const isCompleted = isItemCompleted(step._id, item._id);
                                                    return (
                                                        <div
                                                            key={item._id}
                                                            className={cn(
                                                                'flex items-start gap-3 p-3 rounded-lg border transition-colors',
                                                                isCompleted && 'bg-green-50 border-green-200'
                                                            )}
                                                        >
                                                            <Checkbox
                                                                checked={isCompleted}
                                                                onCheckedChange={(checked) =>
                                                                    updateMutation.mutate({
                                                                        itemId: item._id,
                                                                        completed: !!checked,
                                                                    })
                                                                }
                                                                disabled={updateMutation.isPending}
                                                                className="mt-0.5"
                                                            />
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span
                                                                        className={cn(
                                                                            'text-sm font-medium',
                                                                            isCompleted && 'line-through text-muted-foreground'
                                                                        )}
                                                                    >
                                                                        {item.title}
                                                                    </span>
                                                                    {item.isOptional && (
                                                                        <Badge variant="secondary" className="text-xs">
                                                                            Optional
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                {item.description && (
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {item.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                </Accordion>

                {totalProgress.completed === totalProgress.total && totalProgress.total > 0 && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                        <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-green-900">
                            All checklist items completed!
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

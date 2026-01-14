import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, AlertCircle, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface SLATimerProps {
    deadline: string | Date | null;
    status: 'on_time' | 'at_risk' | 'breached' | 'not_set';
    compact?: boolean;
    showProgress?: boolean;
    className?: string;
}

export const SLATimer: React.FC<SLATimerProps> = ({
    deadline,
    status,
    compact = false,
    showProgress = false,
    className,
}) => {
    const [timeRemaining, setTimeRemaining] = useState<string>('');
    const [progress, setProgress] = useState<number>(100);

    useEffect(() => {
        if (!deadline || status === 'not_set') {
            setTimeRemaining('Not set');
            return;
        }

        const updateTimer = () => {
            const now = new Date();
            const deadlineDate = new Date(deadline);
            const diff = deadlineDate.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeRemaining('Breached');
                setProgress(0);
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            if (days > 0) {
                setTimeRemaining(`${days}d ${hours}h`);
            } else if (hours > 0) {
                setTimeRemaining(`${hours}h ${minutes}m`);
            } else {
                setTimeRemaining(`${minutes}m`);
            }

            // Calculate progress (assuming 7 days total SLA)
            const totalTime = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
            const elapsed = totalTime - diff;
            const progressPercent = Math.max(0, Math.min(100, (diff / totalTime) * 100));
            setProgress(progressPercent);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [deadline, status]);

    const getStatusConfig = () => {
        switch (status) {
            case 'on_time':
                return {
                    icon: Clock,
                    color: 'bg-green-500',
                    textColor: 'text-green-700',
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200',
                    label: 'On Time',
                };
            case 'at_risk':
                return {
                    icon: AlertTriangle,
                    color: 'bg-yellow-500',
                    textColor: 'text-yellow-700',
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-200',
                    label: 'At Risk',
                };
            case 'breached':
                return {
                    icon: AlertCircle,
                    color: 'bg-red-500',
                    textColor: 'text-red-700',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    label: 'Breached',
                };
            default:
                return {
                    icon: Minus,
                    color: 'bg-gray-400',
                    textColor: 'text-gray-600',
                    bgColor: 'bg-gray-50',
                    borderColor: 'border-gray-200',
                    label: 'Not Set',
                };
        }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    if (compact) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Badge
                            variant="outline"
                            className={cn(
                                'gap-1.5',
                                config.textColor,
                                config.bgColor,
                                config.borderColor,
                                className
                            )}
                        >
                            <Icon className="h-3 w-3" />
                            <span className="text-xs font-medium">{timeRemaining}</span>
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                        <div className="text-sm">
                            <p className="font-semibold">{config.label}</p>
                            {deadline && status !== 'not_set' && (
                                <p className="text-muted-foreground">
                                    Deadline: {new Date(deadline).toLocaleString()}
                                </p>
                            )}
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return (
        <div className={cn('space-y-2', className)}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={cn('rounded-full p-1.5', config.color)}>
                        <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-medium">SLA Status</p>
                        <p className={cn('text-xs', config.textColor)}>{config.label}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold">{timeRemaining}</p>
                    {deadline && status !== 'not_set' && (
                        <p className="text-xs text-muted-foreground">
                            {new Date(deadline).toLocaleDateString()}
                        </p>
                    )}
                </div>
            </div>

            {showProgress && status !== 'not_set' && (
                <div className="space-y-1">
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-right">
                        {Math.round(progress)}% time remaining
                    </p>
                </div>
            )}
        </div>
    );
};

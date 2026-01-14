import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    FileText,
    CheckCircle,
    XCircle,
    Upload,
    DollarSign,
    UserPlus,
    MessageSquare,
    AlertTriangle,
    Clock,
    RefreshCw,
    Filter,
    User,
    Calendar,
    Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getTimeline, TimelineEvent } from '@/services/timelineService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';

interface ActivityTimelineProps {
    caseId: string;
    userView?: boolean;
    showFilters?: boolean;
    maxItems?: number;
    className?: string;
}

const eventIcons: Record<string, any> = {
    case_created: FileText,
    case_assigned: UserPlus,
    status_changed: RefreshCw,
    document_uploaded: Upload,
    document_verified: CheckCircle,
    document_rejected: XCircle,
    payment_received: DollarSign,
    note_added: MessageSquare,
    sla_warning: AlertTriangle,
    sla_breach: AlertTriangle,
    case_completed: CheckCircle,
    case_reopened: RefreshCw,
    checklist_updated: CheckCircle,
    internal_note_added: MessageSquare,
};

const eventColors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    gray: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
};

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
    caseId,
    userView = false,
    showFilters = true,
    maxItems = 50,
    className,
}) => {
    const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
    const [page, setPage] = useState(1);

    const { data, isLoading, error } = useQuery({
        queryKey: ['timeline', caseId, userView, page, eventTypeFilter],
        queryFn: () =>
            getTimeline(
                caseId,
                userView,
                page,
                maxItems,
                eventTypeFilter !== 'all' ? eventTypeFilter : undefined
            ),
    });

    const events: TimelineEvent[] = data?.data || [];
    const totalPages = data?.pagination?.total
        ? Math.ceil(data.pagination.total / maxItems)
        : 1;

    if (isLoading) {
        return (
            <Card className={className}>
                <CardContent className="flex items-center justify-center p-8">
                    <LoadingSpinner />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className={className}>
                <CardContent className="text-center p-8 text-red-600">
                    Failed to load timeline. Please try again.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn("h-full", className)}>
            <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        Activity Timeline
                    </CardTitle>
                    {showFilters && (
                        <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Filter events" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Events</SelectItem>
                                <SelectItem value="status_changed">Status Changes</SelectItem>
                                <SelectItem value="document_uploaded">Documents</SelectItem>
                                <SelectItem value="payment_received">Payments</SelectItem>
                                <SelectItem value="case_assigned">Assignments</SelectItem>
                                <SelectItem value="note_added">Notes</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {events.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <div className="bg-muted/50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Clock className="h-8 w-8 opacity-50" />
                        </div>
                        <p className="font-medium">No activity yet</p>
                        <p className="text-sm mt-1">Events will appear here as the case progresses.</p>
                    </div>
                ) : (
                    <div className="relative space-y-0 pl-4 sm:pl-6">
                        {/* Vertical line */}
                        <div className="absolute left-4 sm:left-6 top-2 bottom-6 w-px bg-border -ml-px" />

                        {events.map((event, index) => {
                            const Icon = eventIcons[event.eventType] || FileText;
                            const colorClass = eventColors[event.color] || eventColors.gray;
                            const isLast = index === events.length - 1;

                            return (
                                <div key={event._id} className={cn("relative pl-8 sm:pl-10 py-4", !isLast && "border-b border-border/40")}>
                                    {/* Timeline dot */}
                                    <div className={cn(
                                        "absolute left-0 top-5 w-8 h-8 rounded-full flex items-center justify-center ring-4 ring-background z-10",
                                        colorClass
                                    )}>
                                        <Icon className="h-4 w-4" />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                            <div>
                                                <h4 className="text-sm font-semibold text-foreground">
                                                    {event.title}
                                                </h4>
                                                <p className="text-sm text-muted-foreground mt-0.5">
                                                    {event.description}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Badge variant="outline" className="text-xs font-normal bg-muted/50">
                                                    <Calendar className="h-3 w-3 mr-1 opacity-70" />
                                                    {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                                                </Badge>
                                                {event.priority === 'high' && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        High Priority
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        {/* Metadata & User Info */}
                                        <div className="flex flex-wrap items-center gap-3 mt-1">
                                            {/* User Info */}
                                            <div className="flex items-center gap-2 bg-muted/30 rounded-full pr-3 pl-1 py-0.5 border border-border/50">
                                                <Avatar className="h-5 w-5">
                                                    <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(event.performedBy.name)}&background=random`} />
                                                    <AvatarFallback><User className="h-3 w-3" /></AvatarFallback>
                                                </Avatar>
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    {event.performedBy.name}
                                                </span>
                                            </div>

                                            {/* Metadata Tags */}
                                            {event.metadata && Object.keys(event.metadata).length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {event.metadata.documentType && (
                                                        <Badge variant="secondary" className="text-[10px] h-6 font-normal">
                                                            <Tag className="h-3 w-3 mr-1 opacity-70" />
                                                            {event.metadata.documentType.replace(/_/g, ' ')}
                                                        </Badge>
                                                    )}
                                                    {event.metadata.documentVersion && (
                                                        <Badge variant="outline" className="text-[10px] h-6 font-normal">
                                                            v{event.metadata.documentVersion}
                                                        </Badge>
                                                    )}
                                                    {event.metadata.oldStatus && event.metadata.newStatus && (
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-md">
                                                            <span>{event.metadata.oldStatus}</span>
                                                            <span>→</span>
                                                            <span className="font-medium text-foreground">{event.metadata.newStatus}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Load more button */}
                        {page < totalPages && (
                            <div className="text-center pt-6 pb-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => p + 1)}
                                    className="w-full sm:w-auto"
                                >
                                    Load More Activity
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

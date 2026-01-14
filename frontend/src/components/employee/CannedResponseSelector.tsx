import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Search, Star, TrendingUp, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    getResponses,
    getPopularResponses,
    useResponse,
    CannedResponse,
} from '@/services/cannedResponseService';

interface CannedResponseSelectorProps {
    onSelect: (content: string) => void;
    category?: string;
    className?: string;
}

const categoryLabels: Record<string, string> = {
    greeting: 'Greeting',
    document_request: 'Document Request',
    status_update: 'Status Update',
    clarification: 'Clarification',
    approval: 'Approval',
    rejection: 'Rejection',
    closing: 'Closing',
    follow_up: 'Follow Up',
    general: 'General',
};

export const CannedResponseSelector: React.FC<CannedResponseSelectorProps> = ({
    onSelect,
    category,
    className,
}) => {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>(category || 'all');

    const { data: allResponses } = useQuery({
        queryKey: ['cannedResponses', selectedCategory],
        queryFn: () =>
            getResponses(selectedCategory !== 'all' ? selectedCategory : undefined),
    });

    const { data: popularResponses } = useQuery({
        queryKey: ['popularCannedResponses'],
        queryFn: () => getPopularResponses(5),
    });

    const useMutation = useMutation({
        mutationFn: (id: string) => useResponse(id),
    });

    const responses: CannedResponse[] = allResponses?.data || [];
    const popular: CannedResponse[] = popularResponses?.data || [];

    const filteredResponses = responses.filter((response) => {
        const matchesSearch =
            response.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            response.content.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const handleSelect = (response: CannedResponse) => {
        // Replace variables with placeholders
        let content = response.content;
        if (response.variables && response.variables.length > 0) {
            response.variables.forEach((variable) => {
                content = content.replace(
                    new RegExp(`{{${variable.name}}}`, 'g'),
                    variable.placeholder
                );
            });
        }

        onSelect(content);
        useMutation.mutate(response._id);
        setOpen(false);
        toast.success('Template inserted');
    };

    const groupedResponses = filteredResponses.reduce((acc, response) => {
        const cat = response.category;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(response);
        return acc;
    }, {} as Record<string, CannedResponse[]>);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className={cn('w-full justify-start', className)}>
                    <Search className="h-4 w-4 mr-2" />
                    Select canned response...
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[500px] p-0" align="start">
                <Command>
                    <CommandInput
                        placeholder="Search templates..."
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                    />
                    <CommandList>
                        <CommandEmpty>No templates found.</CommandEmpty>

                        {/* Popular responses */}
                        {popular.length > 0 && searchQuery === '' && (
                            <CommandGroup heading="Popular">
                                {popular.map((response) => (
                                    <CommandItem
                                        key={response._id}
                                        onSelect={() => handleSelect(response)}
                                        className="flex items-start gap-2 py-3"
                                    >
                                        <TrendingUp className="h-4 w-4 mt-0.5 text-primary" />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium">{response.title}</span>
                                                <Badge variant="secondary" className="text-xs">
                                                    {categoryLabels[response.category]}
                                                </Badge>
                                                {response.isGlobal && (
                                                    <Badge variant="outline" className="text-xs">
                                                        Global
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {response.content}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-muted-foreground">
                                                    Used {response.usageCount} times
                                                </span>
                                            </div>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}

                        {/* Grouped by category */}
                        {Object.entries(groupedResponses).map(([cat, items]) => (
                            <CommandGroup key={cat} heading={categoryLabels[cat] || cat}>
                                {items.map((response) => (
                                    <CommandItem
                                        key={response._id}
                                        onSelect={() => handleSelect(response)}
                                        className="flex items-start gap-2 py-3"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium">{response.title}</span>
                                                {response.isGlobal && (
                                                    <Badge variant="outline" className="text-xs">
                                                        Global
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {response.content}
                                            </p>
                                            {response.variables && response.variables.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {response.variables.map((variable) => (
                                                        <TooltipProvider key={variable.name}>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        {`{{${variable.name}}}`}
                                                                    </Badge>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p className="text-xs">{variable.description}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        ))}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import contactQueryService, { ContactQuery } from '@/services/contactQueryService';
import { Search, Filter, MessageSquare, Clock, CheckCircle2, XCircle, AlertCircle, Mail, Phone, User } from 'lucide-react';
import { format } from 'date-fns';

const ContactQueries = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [queries, setQueries] = useState<ContactQuery[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        search: ''
    });

    useEffect(() => {
        fetchQueries();
    }, [filters]);

    const fetchQueries = async () => {
        try {
            setLoading(true);
            const response = await contactQueryService.getAllQueries(filters);
            setQueries(response.data);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.error || 'Failed to fetch queries',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            new: { variant: 'default' as const, icon: AlertCircle },
            in_progress: { variant: 'secondary' as const, icon: Clock },
            resolved: { variant: 'success' as const, icon: CheckCircle2 },
            closed: { variant: 'outline' as const, icon: XCircle }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className="flex items-center gap-1">
                <Icon className="h-3 w-3" />
                {status.replace('_', ' ').toUpperCase()}
            </Badge>
        );
    };

    const getPriorityBadge = (priority: string) => {
        const priorityVariant = {
            low: 'secondary',
            medium: 'warning',
            high: 'destructive'
        } as const;

        return (
            <Badge variant={priorityVariant[priority as keyof typeof priorityVariant] || 'outline'}>
                {priority.toUpperCase()}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Contact Queries
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Manage and respond to customer inquiries
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-8 w-8 text-primary" />
                    <span className="text-2xl font-bold">
                        {queries.length}
                    </span>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or email..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="pl-10"
                            />
                        </div>

                        <Select
                            value={filters.status || 'all'}
                            onValueChange={(value) => setFilters({ ...filters, status: value === 'all' ? '' : value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.priority || 'all'}
                            onValueChange={(value) => setFilters({ ...filters, priority: value === 'all' ? '' : value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Priorities</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Queries List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : queries.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">
                            No queries found
                        </h3>
                        <p className="text-muted-foreground">
                            There are no contact queries matching your filters.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {queries.map((query) => (
                        <Card
                            key={query._id}
                            className="group hover:bg-accent/50 transition-colors cursor-pointer"
                            onClick={() => navigate(`/admin/contact-queries/${query._id}`)}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                                                {query.name}
                                            </h3>
                                            {getStatusBadge(query.status)}
                                            {getPriorityBadge(query.priority)}
                                        </div>

                                        <div className="space-y-1 text-sm text-muted-foreground mb-3">
                                            <p className="flex items-center gap-2">
                                                <Mail className="h-4 w-4" />
                                                {query.email}
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <Phone className="h-4 w-4" />
                                                {query.phone}
                                            </p>
                                            {query.userRole && query.userRole !== 'guest' && (
                                                <p className="flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    Role: <span className="font-medium capitalize">{query.userRole.replace('_', ' ')}</span>
                                                </p>
                                            )}
                                        </div>

                                        <p className="line-clamp-2">
                                            {query.query}
                                        </p>

                                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {format(new Date(query.createdAt), 'MMM dd, yyyy HH:mm')}
                                            </span>
                                            {query.responses && query.responses.length > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <MessageSquare className="h-4 w-4" />
                                                    {query.responses.length} {query.responses.length === 1 ? 'response' : 'responses'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ContactQueries;

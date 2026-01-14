import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import contactQueryService, { ContactQuery } from '@/services/contactQueryService';
import { Search, Filter, MessageSquare, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
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
            new: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: AlertCircle },
            in_progress: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
            resolved: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
            closed: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', icon: XCircle }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
        const Icon = config.icon;

        return (
            <Badge className={`${config.color} flex items-center gap-1 px-3 py-1`}>
                <Icon className="h-3 w-3" />
                {status.replace('_', ' ').toUpperCase()}
            </Badge>
        );
    };

    const getPriorityBadge = (priority: string) => {
        const priorityColors = {
            low: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
            medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
            high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        };

        return (
            <Badge className={`${priorityColors[priority as keyof typeof priorityColors]} px-3 py-1`}>
                {priority.toUpperCase()}
            </Badge>
        );
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Contact Queries
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Manage and respond to customer inquiries
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-8 w-8 text-purple-600" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {queries.length}
                    </span>
                </div>
            </div>

            {/* Filters */}
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
            ) : queries.length === 0 ? (
                <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
                    <CardContent className="py-12 text-center">
                        <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No queries found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            There are no contact queries matching your filters.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {queries.map((query) => (
                        <Card
                            key={query._id}
                            className="group hover:shadow-xl transition-all duration-300 cursor-pointer backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-2 hover:border-purple-300 dark:hover:border-purple-700"
                            onClick={() => navigate(`/employee/contact-queries/${query._id}`)}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                                {query.name}
                                            </h3>
                                            {getStatusBadge(query.status)}
                                            {getPriorityBadge(query.priority)}
                                        </div>

                                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                            <p>📧 {query.email}</p>
                                            <p>📱 {query.phone}</p>
                                            {query.userRole && query.userRole !== 'guest' && (
                                                <p>👤 Role: <span className="font-medium capitalize">{query.userRole.replace('_', ' ')}</span></p>
                                            )}
                                        </div>

                                        <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
                                            {query.query}
                                        </p>

                                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
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

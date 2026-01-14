import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import contactQueryService, { ContactQuery } from '@/services/contactQueryService';
import { MessageSquare, Clock, CheckCircle2, XCircle, AlertCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';

const MyQueries = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [queries, setQueries] = useState<ContactQuery[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyQueries();
    }, []);

    const fetchMyQueries = async () => {
        try {
            setLoading(true);
            const response = await contactQueryService.getMyQueries();
            setQueries(response.data);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.error || 'Failed to fetch your queries',
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

    return (
        <div className="space-y-6 p-6">


            {/* Header */}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        My Queries
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Track your submitted queries and responses
                    </p>
                </div>
                <Button
                    onClick={() => navigate('/contact')}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Submit New Query
                </Button>
            </div>

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
                            No queries yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            You haven't submitted any queries yet. Click the button above to get started.
                        </p>
                        <Button
                            onClick={() => navigate('/contact')}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Submit Your First Query
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {queries.map((query) => (
                        <Card
                            key={query._id}
                            className="group hover:shadow-xl transition-all duration-300 cursor-pointer backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-2 hover:border-purple-300 dark:hover:border-purple-700"
                            onClick={() => navigate(`/end-user/my-queries/${query._id}`)}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                                Query #{query._id.slice(-6).toUpperCase()}
                                            </h3>
                                            {getStatusBadge(query.status)}
                                        </div>

                                        <p className="text-gray-700 dark:text-gray-300 line-clamp-2 mb-3">
                                            {query.query}
                                        </p>

                                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {format(new Date(query.createdAt), 'MMM dd, yyyy HH:mm')}
                                            </span>
                                            {query.responses && query.responses.length > 0 && (
                                                <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                                                    <MessageSquare className="h-4 w-4" />
                                                    {query.responses.length} {query.responses.length === 1 ? 'response' : 'responses'}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30"
                                    >
                                        <Eye className="h-5 w-5" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyQueries;

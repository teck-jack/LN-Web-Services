import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import contactQueryService, { ContactQuery } from '@/services/contactQueryService';
import { ArrowLeft, User, Mail, Phone, MessageSquare, CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const MyQueryDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [query, setQuery] = useState<ContactQuery | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQueryDetails();
    }, [id]);

    const fetchQueryDetails = async () => {
        try {
            setLoading(true);
            const response = await contactQueryService.getQueryById(id!);
            setQuery(response.data);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.error || 'Failed to fetch query details',
                variant: 'destructive'
            });
            navigate('/end-user/my-queries');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        const icons = {
            new: AlertCircle,
            in_progress: Clock,
            resolved: CheckCircle2,
            closed: XCircle
        };
        return icons[status as keyof typeof icons] || AlertCircle;
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            new: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
            in_progress: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
            resolved: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
            closed: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;

        return (
            <Badge className={`${config.color} px-3 py-1`}>
                {status.replace('_', ' ').toUpperCase()}
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!query) {
        return null;
    }

    const StatusIcon = getStatusIcon(query.status);

    return (
        <div className="space-y-6 p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/end-user/my-queries')}
                    className="hover:bg-purple-100 dark:hover:bg-purple-900/30"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to My Queries
                </Button>
            </div>

            {/* Query Details */}
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-2">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <StatusIcon className="h-6 w-6 text-purple-600" />
                                Query #{query._id.slice(-6).toUpperCase()}
                            </CardTitle>
                            <CardDescription className="mt-2">
                                Submitted on {format(new Date(query.createdAt), 'MMMM dd, yyyy at HH:mm')}
                            </CardDescription>
                        </div>
                        {getStatusBadge(query.status)}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <User className="h-5 w-5 text-purple-600" />
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                                <p className="font-medium">{query.name}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <Mail className="h-5 w-5 text-purple-600" />
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                <p className="font-medium">{query.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <Phone className="h-5 w-5 text-purple-600" />
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                                <p className="font-medium">{query.phone}</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-purple-600" />
                            Your Query
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg whitespace-pre-wrap">
                            {query.query}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Responses */}
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-purple-600" />
                        Responses from Our Team
                    </CardTitle>
                    <CardDescription>
                        {query.responses?.length || 0} {query.responses?.length === 1 ? 'response' : 'responses'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {query.responses && query.responses.length > 0 ? (
                        <div className="space-y-4">
                            {query.responses.map((response, index) => (
                                <div
                                    key={response._id || index}
                                    className="border-l-4 border-purple-500 pl-4 py-3 bg-purple-50 dark:bg-purple-900/10 rounded-r-lg"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-purple-900 dark:text-purple-100">
                                                {response.responderName}
                                            </span>
                                            <Badge variant="outline" className="capitalize">
                                                {response.responderRole}
                                            </Badge>
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {format(new Date(response.timestamp), 'MMM dd, yyyy HH:mm')}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300">{response.message}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                No responses yet
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Our team will respond to your query soon. You'll be notified when there's an update.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Status Information */}
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-2">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h4 className="font-semibold mb-1">Query Status Information</h4>
                            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <li>• <strong>New:</strong> Your query has been received and is awaiting review</li>
                                <li>• <strong>In Progress:</strong> Our team is actively working on your query</li>
                                <li>• <strong>Resolved:</strong> Your query has been addressed</li>
                                <li>• <strong>Closed:</strong> This query has been completed and closed</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default MyQueryDetails;

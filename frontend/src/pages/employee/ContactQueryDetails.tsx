import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import contactQueryService, { ContactQuery } from '@/services/contactQueryService';
import { ArrowLeft, Send, User, Mail, Phone, MessageSquare, CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const ContactQueryDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [query, setQuery] = useState<ContactQuery | null>(null);
    const [loading, setLoading] = useState(true);
    const [responseMessage, setResponseMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedPriority, setSelectedPriority] = useState('');

    useEffect(() => {
        fetchQueryDetails();
    }, [id]);

    const fetchQueryDetails = async () => {
        try {
            setLoading(true);
            const response = await contactQueryService.getQueryById(id!);
            setQuery(response.data);
            setSelectedStatus(response.data.status);
            setSelectedPriority(response.data.priority);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.error || 'Failed to fetch query details',
                variant: 'destructive'
            });
            navigate('/employee/contact-queries');
        } finally {
            setLoading(false);
        }
    };

    const handleAddResponse = async () => {
        if (!responseMessage.trim()) {
            toast({
                title: 'Error',
                description: 'Please enter a response message',
                variant: 'destructive'
            });
            return;
        }

        try {
            setSubmitting(true);
            const response = await contactQueryService.addResponse(id!, responseMessage);
            setQuery(response.data);
            setResponseMessage('');
            toast({
                title: 'Success',
                description: 'Response added successfully',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.error || 'Failed to add response',
                variant: 'destructive'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateStatus = async () => {
        try {
            const response = await contactQueryService.updateQueryStatus(id!, selectedStatus, selectedPriority);
            setQuery(response.data);
            toast({
                title: 'Success',
                description: 'Query updated successfully',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.error || 'Failed to update query',
                variant: 'destructive'
            });
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
        <div className="space-y-6 p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/employee/contact-queries')}
                    className="hover:bg-purple-100 dark:hover:bg-purple-900/30"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Queries
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Query Details */}
                    <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-2">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-2xl flex items-center gap-2">
                                        <StatusIcon className="h-6 w-6 text-purple-600" />
                                        Query Details
                                    </CardTitle>
                                    <CardDescription className="mt-2">
                                        Submitted on {format(new Date(query.createdAt), 'MMMM dd, yyyy at HH:mm')}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                    <User className="h-5 w-5 text-purple-600" />
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">User Role</p>
                                        <p className="font-medium capitalize">{query.userRole?.replace('_', ' ') || 'Guest'}</p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="font-semibold mb-2 flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-purple-600" />
                                    Query Message
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg whitespace-pre-wrap">
                                    {query.query}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Responses Timeline */}
                    <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-purple-600" />
                                Response Timeline
                            </CardTitle>
                            <CardDescription>
                                {query.responses?.length || 0} {query.responses?.length === 1 ? 'response' : 'responses'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {query.responses && query.responses.length > 0 ? (
                                <div className="space-y-4">
                                    {query.responses.map((response, index) => (
                                        <div key={response._id || index} className="border-l-4 border-purple-500 pl-4 py-2">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">{response.responderName}</span>
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
                                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                    No responses yet. Be the first to respond!
                                </p>
                            )}

                            <Separator />

                            {/* Add Response Form */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium">Add Response</label>
                                <Textarea
                                    placeholder="Type your response here..."
                                    value={responseMessage}
                                    onChange={(e) => setResponseMessage(e.target.value)}
                                    rows={4}
                                    className="resize-none"
                                />
                                <Button
                                    onClick={handleAddResponse}
                                    disabled={submitting || !responseMessage.trim()}
                                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                                >
                                    <Send className="h-4 w-4 mr-2" />
                                    {submitting ? 'Sending...' : 'Send Response'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Status & Priority */}
                    <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-2">
                        <CardHeader>
                            <CardTitle>Status & Priority</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="new">New</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Priority</label>
                                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                onClick={handleUpdateStatus}
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            >
                                Update Status & Priority
                            </Button>
                        </CardContent>
                    </Card>

                    {query.assignedTo && (
                        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-2">
                            <CardHeader>
                                <CardTitle>Assignment</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <p className="text-sm text-green-800 dark:text-green-400">
                                        Assigned to:{' '}
                                        <span className="font-semibold">
                                            {typeof query.assignedTo === 'object' && query.assignedTo !== null ? query.assignedTo.name : 'Employee'}
                                        </span>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactQueryDetails;

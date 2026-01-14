import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import contactQueryService from '@/services/contactQueryService';
import { Mail, Phone, MessageSquare, Send, CheckCircle2, ArrowLeft } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ContactUs = () => {
    const navigate = useNavigate();

    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        query: ''
    });

    // Pre-populate form if user is authenticated
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || ''
            }));
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await contactQueryService.submitQuery(formData);

            toast({
                title: 'Success!',
                description: 'Your query has been submitted successfully. We will get back to you soon!',
                variant: 'default'
            });

            setSubmitted(true);

            // Reset form if not authenticated
            if (!user) {
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    query: ''
                });
            } else {
                setFormData(prev => ({
                    ...prev,
                    query: ''
                }));
            }

            // Reset submitted state after 5 seconds
            setTimeout(() => setSubmitted(false), 5000);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.error || 'Failed to submit query. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const contactInfo = {
        email: 'support@serveassist.com',
        phone: '+1 (555) 123-4567',
        whatsapp: '+15551234567' // WhatsApp number in international format without + or spaces
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="hover:bg-purple-100 dark:hover:bg-purple-900/30"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>

                </div>


                <div className="text-center mb-12 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
                        Get in Touch
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Have a question or need assistance? We're here to help! Reach out to us through any of the channels below.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Information Cards */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Email Card */}
                        <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-300 dark:hover:border-purple-700 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
                            <CardHeader>
                                <div className="flex items-center space-x-3">
                                    <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                        <Mail className="h-6 w-6 text-white" />
                                    </div>
                                    <CardTitle className="text-lg">Email Us</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <a
                                    href={`mailto:${contactInfo.email}`}
                                    className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
                                >
                                    {contactInfo.email}
                                </a>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    We'll respond within 24 hours
                                </p>
                            </CardContent>
                        </Card>

                        {/* Phone Card */}
                        <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-700 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
                            <CardHeader>
                                <div className="flex items-center space-x-3">
                                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                        <Phone className="h-6 w-6 text-white" />
                                    </div>
                                    <CardTitle className="text-lg">Call Us</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <a
                                    href={`tel:${contactInfo.phone}`}
                                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                >
                                    {contactInfo.phone}
                                </a>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    Mon-Fri, 9AM-6PM EST
                                </p>
                            </CardContent>
                        </Card>

                        {/* WhatsApp Card */}
                        <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-green-300 dark:hover:border-green-700 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
                            <CardHeader>
                                <div className="flex items-center space-x-3">
                                    <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                        <FaWhatsapp className="h-6 w-6 text-white" />
                                    </div>
                                    <CardTitle className="text-lg">WhatsApp</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <a
                                    href={`https://wa.me/${contactInfo.whatsapp}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-green-600 dark:text-green-400 hover:underline font-medium"
                                >
                                    Chat with us
                                </a>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    Quick responses, anytime
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-2 shadow-2xl">
                            <CardHeader>
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
                                        <MessageSquare className="h-6 w-6 text-white" />
                                    </div>
                                    <CardTitle className="text-2xl">Send us a Message</CardTitle>
                                </div>
                                <CardDescription>
                                    Fill out the form below and we'll get back to you as soon as possible.
                                    {user && (
                                        <span className="block mt-1 text-purple-600 dark:text-purple-400 font-medium">
                                            Logged in as {user.name}
                                        </span>
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {submitted ? (
                                    <div className="text-center py-12 animate-fade-in">
                                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                                            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                            Thank You!
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            Your message has been sent successfully. We'll be in touch soon!
                                        </p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Full Name *
                                                </label>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    type="text"
                                                    required
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="John Doe"
                                                    className="transition-all duration-300 focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Email Address *
                                                </label>
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="john@example.com"
                                                    className="transition-all duration-300 focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Phone Number *
                                            </label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                required
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="+1 (555) 123-4567"
                                                className="transition-all duration-300 focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="query" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Your Message *
                                            </label>
                                            <Textarea
                                                id="query"
                                                name="query"
                                                required
                                                value={formData.query}
                                                onChange={handleChange}
                                                placeholder="Tell us how we can help you..."
                                                rows={6}
                                                className="transition-all duration-300 focus:ring-2 focus:ring-purple-500 resize-none"
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                                        >
                                            {loading ? (
                                                <span className="flex items-center justify-center">
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Sending...
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center">
                                                    <Send className="mr-2 h-5 w-5" />
                                                    Send Message
                                                </span>
                                            )}
                                        </Button>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;

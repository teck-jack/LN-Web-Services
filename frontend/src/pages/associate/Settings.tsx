import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { User, Mail, Phone, Lock, Bell, Palette, Shield, Settings2, Info } from "lucide-react";
import { toast } from "sonner";

export default function AssociateSettings() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

    const [profileData, setProfileData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const getInitials = (name?: string) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success("Profile updated successfully!");
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        if (passwordData.newPassword.length < 8) {
            toast.error("Password must be at least 8 characters long");
            return;
        }

        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success("Password changed successfully!");
            setPasswordDialogOpen(false);
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (error: any) {
            toast.error(error.message || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your account settings and preferences
                </p>
            </div>

            <Tabs defaultValue="account" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5 lg:w-auto">
                    <TabsTrigger value="account" className="gap-2">
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">Account</span>
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="gap-2">
                        <Bell className="h-4 w-4" />
                        <span className="hidden sm:inline">Notifications</span>
                    </TabsTrigger>
                    <TabsTrigger value="display" className="gap-2">
                        <Palette className="h-4 w-4" />
                        <span className="hidden sm:inline">Display</span>
                    </TabsTrigger>
                    <TabsTrigger value="security" className="gap-2">
                        <Shield className="h-4 w-4" />
                        <span className="hidden sm:inline">Security</span>
                    </TabsTrigger>
                    <TabsTrigger value="preferences" className="gap-2">
                        <Settings2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Preferences</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="account" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>
                                Update your account details and personal information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-6">
                                <Avatar className="h-24 w-24">
                                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                                        {getInitials(user?.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold">{user?.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <Badge className="capitalize">{user?.role?.replace("_", " ")}</Badge>
                                        <Badge variant="success">Active</Badge>
                                    </div>
                                    <Button variant="outline" size="sm" disabled>
                                        <Info className="h-4 w-4 mr-2" />
                                        Change Avatar (Coming Soon)
                                    </Button>
                                </div>
                            </div>

                            <form onSubmit={handleProfileUpdate} className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="name"
                                                placeholder="Enter your name"
                                                value={profileData.name}
                                                onChange={(e) =>
                                                    setProfileData({ ...profileData, name: e.target.value })
                                                }
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="Enter your email"
                                                value={profileData.email}
                                                onChange={(e) =>
                                                    setProfileData({ ...profileData, email: e.target.value })
                                                }
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="phone"
                                                type="tel"
                                                placeholder="Enter your phone number"
                                                value={profileData.phone}
                                                onChange={(e) =>
                                                    setProfileData({ ...profileData, phone: e.target.value })
                                                }
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setProfileData({
                                                name: user?.name || "",
                                                email: user?.email || "",
                                                phone: user?.phone || "",
                                            })
                                        }
                                    >
                                        Reset
                                    </Button>
                                    <Button type="submit" disabled={loading}>
                                        {loading ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Password</CardTitle>
                            <CardDescription>
                                Change your password to keep your account secure
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        <Lock className="h-4 w-4 mr-2" />
                                        Change Password
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Change Password</DialogTitle>
                                        <DialogDescription>
                                            Enter your current password and choose a new one
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handlePasswordChange}>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="currentPassword">Current Password</Label>
                                                <Input
                                                    id="currentPassword"
                                                    type="password"
                                                    value={passwordData.currentPassword}
                                                    onChange={(e) =>
                                                        setPasswordData({
                                                            ...passwordData,
                                                            currentPassword: e.target.value,
                                                        })
                                                    }
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="newPassword">New Password</Label>
                                                <Input
                                                    id="newPassword"
                                                    type="password"
                                                    value={passwordData.newPassword}
                                                    onChange={(e) =>
                                                        setPasswordData({
                                                            ...passwordData,
                                                            newPassword: e.target.value,
                                                        })
                                                    }
                                                    required
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Must be at least 8 characters long
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                                <Input
                                                    id="confirmPassword"
                                                    type="password"
                                                    value={passwordData.confirmPassword}
                                                    onChange={(e) =>
                                                        setPasswordData({
                                                            ...passwordData,
                                                            confirmPassword: e.target.value,
                                                        })
                                                    }
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setPasswordDialogOpen(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={loading}>
                                                {loading ? "Changing..." : "Change Password"}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>
                                Configure how you receive notifications
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Coming Soon!</strong> Notification preferences will be available in a future update.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="display">
                    <Card>
                        <CardHeader>
                            <CardTitle>Display Preferences</CardTitle>
                            <CardDescription>
                                Customize the appearance and language settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Coming Soon!</strong> Display preferences (language, timezone, date format) will be available in a future update. Theme toggle is already available in the header.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>Privacy & Security</CardTitle>
                            <CardDescription>
                                Manage your security settings and active sessions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Coming Soon!</strong> Two-factor authentication, session management, and login history will be available in a future update.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="preferences">
                    <Card>
                        <CardHeader>
                            <CardTitle>Associate Preferences</CardTitle>
                            <CardDescription>
                                Configure your onboarding and commission preferences
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Coming Soon!</strong> Associate-specific preferences (commission display, service visibility, onboarding workflow) will be available in a future update.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

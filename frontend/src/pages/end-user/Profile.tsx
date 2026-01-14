import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getProfile } from "@/store/slices/endUserSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { User, Mail, Phone, Calendar, Shield, Edit } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function Profile() {
  const dispatch = useAppDispatch();
  const { profile, loading } = useAppSelector((state) => state.endUser);

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  const handleEditProfile = () => {
    toast.info("Edit profile feature coming soon!");
  };

  const handleChangePassword = () => {
    toast.info("Change password feature coming soon!");
  };

  if (loading || !profile) {
    return <LoadingSpinner />;
  }

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground mt-2">Manage your account information and settings</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your account details and preferences</CardDescription>
              </div>
              <Button onClick={handleEditProfile}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold">{profile.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={profile.isActive ? "success" : "destructive"}>
                      {profile.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="secondary">{profile.role.replace("_", " ")}</Badge>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{profile.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{profile.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="font-medium">
                      {format(new Date(profile.createdAt), "MMMM dd, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Source</p>
                    <p className="font-medium">{profile.sourceTag}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Activity</CardTitle>
              <CardDescription>Recent login history and account activity</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Activity tracking feature coming soon
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <Shield className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="font-medium">Account Verified</p>
                  <p className="text-xs text-muted-foreground">Your account is secure</p>
                </div>
              </div>
              <Button className="w-full" variant="outline" onClick={handleChangePassword}>
                Change Password
              </Button>
            </CardContent>
          </Card>

          {profile.agentId && (
            <Card>
              <CardHeader>
                <CardTitle>Onboarded By</CardTitle>
                <CardDescription>Your account was created by an agent</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Agent ID: {profile.agentId}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

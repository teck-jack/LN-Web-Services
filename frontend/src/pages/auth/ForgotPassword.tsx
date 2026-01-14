import { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Mail, Shield, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = () => {
    if (!email) {
      setError("Email is required");
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Email is invalid");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail()) return;

    setLoading(true);
    try {
      const response = await authService.forgotPassword(email);

      if (response.success) {
        setEmailSent(true);
        toast.success("Password reset email sent successfully!");
      } else {
        throw new Error(response.error || "Failed to send reset email");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset email");
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 sm:p-6 md:p-8">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-2 text-center p-6 sm:p-8">
            <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-success rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-success-foreground" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold">Check Your Email</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              We've sent password reset instructions to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6 sm:p-8 pt-0">
            <p className="text-sm text-muted-foreground text-center">
              Please check your email and follow the instructions to reset your password.
            </p>
            <Link to="/auth/login">
              <Button className="w-full h-11" variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-2 text-center p-6 sm:p-8">
          <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-primary rounded-full flex items-center justify-center mb-2">
            <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold">Forgot Password?</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Enter your email address and we'll send you instructions to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11"
                  disabled={loading}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <Button type="submit" className="w-full h-11" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>

            <Link to="/auth/login">
              <Button type="button" variant="ghost" className="w-full h-11">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

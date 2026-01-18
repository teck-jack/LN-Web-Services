import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "@/store";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { ThemeProvider } from "@/components/theme-provider";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import EmployeeManagement from "./pages/admin/EmployeeManagement";
import AgentManagement from "./pages/admin/AgentManagement";
import CaseManagement from "./pages/admin/CaseManagement";
import CaseDetailsAdmin from "./pages/admin/CaseDetails";
import ServiceManagement from "./pages/admin/ServiceManagement";
import Reports from "./pages/admin/Reports";
import AdminNotifications from "./pages/admin/Notifications";
import AdminProfile from "./pages/admin/Profile";
import AdminSettings from "./pages/admin/Settings";
import CouponManagement from "./pages/admin/CouponManagement";
import AdminEndUsers from "./pages/admin/EndUsers";

// Agent pages
import AgentDashboard from "./pages/agent/Dashboard";
import OnboardedUsers from "./pages/agent/OnboardedUsers";
import CreateUser from "./pages/agent/CreateUser";
import UserDetails from "./pages/agent/UserDetails";
import Services from "./pages/agent/Services";
import ServiceDetails from "./pages/agent/ServiceDetails";
import AgentReports from "./pages/agent/Reports";
import AgentNotifications from "./pages/agent/Notifications";
import AgentProfile from "./pages/agent/Profile";
import AgentSettings from "./pages/agent/Settings";

// Associate pages
import AssociateDashboard from "./pages/associate/Dashboard";
import AssociateOnboardedUsers from "./pages/associate/OnboardedUsers";
import AssociateCreateUser from "./pages/associate/CreateUser";
import AssociateUserDetails from "./pages/associate/UserDetails";
import AssociateServices from "./pages/associate/Services";
import AssociateServiceDetails from "./pages/associate/ServiceDetails";
import AssociateReports from "./pages/associate/Reports";
import AssociateNotifications from "./pages/associate/Notifications";
import AssociateProfile from "./pages/associate/Profile";
import AssociateSettings from "./pages/associate/Settings";

// Employee pages
import EmployeeDashboard from "./pages/employee/Dashboard";
import EmployeeCases from "./pages/employee/Cases";
import CaseDetails from "./pages/employee/CaseDetails";
import EmployeeNotifications from "./pages/employee/Notifications";
import EmployeeProfile from "./pages/employee/Profile";
import EmployeeSettings from "./pages/employee/Settings";
import EmployeeEndUsers from "./pages/employee/EndUsers";

// End user pages
import EndUserDashboard from "./pages/end-user/Dashboard";
import EndUserServices from "./pages/end-user/Services";
import EndUserServiceDetails from "./pages/end-user/ServiceDetails";
import EndUserPayment from "./pages/end-user/Payment";
import EndUserCases from "./pages/end-user/Cases";
import EndUserCaseDetails from "./pages/end-user/CaseDetails";
import EndUserPayments from "./pages/end-user/Payments";
import EndUserNotifications from "./pages/end-user/Notifications";
import EndUserProfile from "./pages/end-user/Profile";
import EndUserSettings from "./pages/end-user/Settings";
import NotFound from "./pages/NotFound";

// Contact Us pages
import ContactUs from "./pages/ContactUs";
import AdminContactQueries from "./pages/admin/ContactQueries";
import AdminContactQueryDetails from "./pages/admin/ContactQueryDetails";
import EmployeeContactQueries from "./pages/employee/ContactQueries";
import EmployeeContactQueryDetails from "./pages/employee/ContactQueryDetails";
import MyQueries from "./pages/end-user/MyQueries";
import MyQueryDetails from "./pages/end-user/MyQueryDetails";

const queryClient = new QueryClient();

const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) return null;

  const dashboardMap: Record<string, string> = {
    admin: "/admin/dashboard",
    agent: "/agent/dashboard",
    associate: "/associate/dashboard",
    employee: "/employee/dashboard",
    end_user: "/end-user/dashboard",
  };

  return <Navigate to={dashboardMap[user.role] || "/end-user/dashboard"} replace />;
};

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <BrowserRouter>
          <AuthProvider>
            <TooltipProvider>
              <>
                <Toaster />
                <Sonner />
                <Routes>
                  {/* Auth routes */}
                  <Route path="/auth/login" element={<Login />} />
                  <Route path="/auth/register" element={<Register />} />
                  <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                  <Route path="/auth/reset-password/:resetToken" element={<ResetPassword />} />

                  {/* Public Contact Us route */}
                  <Route path="/contact" element={<ContactUs />} />

                  {/* Protected routes with layout */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <MainLayout>
                          <DashboardRouter />
                        </MainLayout>
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin routes */}
                  <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><MainLayout><AdminDashboard /></MainLayout></ProtectedRoute>} />
                  <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><MainLayout><UserManagement /></MainLayout></ProtectedRoute>} />
                  <Route path="/admin/employees" element={<ProtectedRoute allowedRoles={["admin"]}><MainLayout><EmployeeManagement /></MainLayout></ProtectedRoute>} />
                  <Route path="/admin/agents" element={<ProtectedRoute allowedRoles={["admin"]}><MainLayout><AgentManagement /></MainLayout></ProtectedRoute>} />
                  <Route path="/admin/cases" element={<ProtectedRoute allowedRoles={["admin"]}><MainLayout><CaseManagement /></MainLayout></ProtectedRoute>} />
                  <Route path="/admin/cases/:id" element={<ProtectedRoute allowedRoles={["admin"]}><MainLayout><CaseDetailsAdmin /></MainLayout></ProtectedRoute>} />
                  <Route path="/admin/services" element={<ProtectedRoute allowedRoles={["admin"]}><MainLayout><ServiceManagement /></MainLayout></ProtectedRoute>} />
                  <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={["admin"]}><MainLayout><Reports /></MainLayout></ProtectedRoute>} />
                  <Route path="/admin/contact-queries" element={<ProtectedRoute allowedRoles={["admin"]}><MainLayout><AdminContactQueries /></MainLayout></ProtectedRoute>} />
                  <Route path="/admin/contact-queries/:id" element={<ProtectedRoute allowedRoles={["admin"]}><MainLayout><AdminContactQueryDetails /></MainLayout></ProtectedRoute>} />
                  <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={["admin"]}><MainLayout><AdminNotifications /></MainLayout></ProtectedRoute>} />
                  <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={["admin"]}><MainLayout><AdminProfile /></MainLayout></ProtectedRoute>} />
                  <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={["admin"]}><MainLayout><AdminSettings /></MainLayout></ProtectedRoute>} />
                  <Route path="/admin/coupons" element={<ProtectedRoute allowedRoles={["admin"]}><MainLayout><CouponManagement /></MainLayout></ProtectedRoute>} />
                  <Route path="/admin/end-users" element={<ProtectedRoute allowedRoles={["admin"]}><MainLayout><AdminEndUsers /></MainLayout></ProtectedRoute>} />

                  {/* Agent routes */}
                  <Route path="/agent/dashboard" element={<ProtectedRoute allowedRoles={["agent"]}><MainLayout><AgentDashboard /></MainLayout></ProtectedRoute>} />
                  <Route path="/agent/users" element={<ProtectedRoute allowedRoles={["agent"]}><MainLayout><OnboardedUsers /></MainLayout></ProtectedRoute>} />
                  <Route path="/agent/users/create" element={<ProtectedRoute allowedRoles={["agent"]}><MainLayout><CreateUser /></MainLayout></ProtectedRoute>} />
                  <Route path="/agent/users/:id" element={<ProtectedRoute allowedRoles={["agent"]}><MainLayout><UserDetails /></MainLayout></ProtectedRoute>} />
                  <Route path="/agent/services" element={<ProtectedRoute allowedRoles={["agent"]}><MainLayout><Services /></MainLayout></ProtectedRoute>} />
                  <Route path="/agent/services/:id" element={<ProtectedRoute allowedRoles={["agent"]}><MainLayout><ServiceDetails /></MainLayout></ProtectedRoute>} />
                  <Route path="/agent/reports" element={<ProtectedRoute allowedRoles={["agent"]}><MainLayout><AgentReports /></MainLayout></ProtectedRoute>} />
                  <Route path="/agent/notifications" element={<ProtectedRoute allowedRoles={["agent"]}><MainLayout><AgentNotifications /></MainLayout></ProtectedRoute>} />
                  <Route path="/agent/profile" element={<ProtectedRoute allowedRoles={["agent"]}><MainLayout><AgentProfile /></MainLayout></ProtectedRoute>} />
                  <Route path="/agent/settings" element={<ProtectedRoute allowedRoles={["agent"]}><MainLayout><AgentSettings /></MainLayout></ProtectedRoute>} />

                  {/* Associate routes */}
                  <Route path="/associate/dashboard" element={<ProtectedRoute allowedRoles={["associate"]}><MainLayout><AssociateDashboard /></MainLayout></ProtectedRoute>} />
                  <Route path="/associate/users" element={<ProtectedRoute allowedRoles={["associate"]}><MainLayout><AssociateOnboardedUsers /></MainLayout></ProtectedRoute>} />
                  <Route path="/associate/users/create" element={<ProtectedRoute allowedRoles={["associate"]}><MainLayout><AssociateCreateUser /></MainLayout></ProtectedRoute>} />
                  <Route path="/associate/users/:id" element={<ProtectedRoute allowedRoles={["associate"]}><MainLayout><AssociateUserDetails /></MainLayout></ProtectedRoute>} />
                  <Route path="/associate/services" element={<ProtectedRoute allowedRoles={["associate"]}><MainLayout><AssociateServices /></MainLayout></ProtectedRoute>} />
                  <Route path="/associate/services/:id" element={<ProtectedRoute allowedRoles={["associate"]}><MainLayout><AssociateServiceDetails /></MainLayout></ProtectedRoute>} />
                  <Route path="/associate/reports" element={<ProtectedRoute allowedRoles={["associate"]}><MainLayout><AssociateReports /></MainLayout></ProtectedRoute>} />
                  <Route path="/associate/notifications" element={<ProtectedRoute allowedRoles={["associate"]}><MainLayout><AssociateNotifications /></MainLayout></ProtectedRoute>} />
                  <Route path="/associate/profile" element={<ProtectedRoute allowedRoles={["associate"]}><MainLayout><AssociateProfile /></MainLayout></ProtectedRoute>} />
                  <Route path="/associate/settings" element={<ProtectedRoute allowedRoles={["associate"]}><MainLayout><AssociateSettings /></MainLayout></ProtectedRoute>} />

                  {/* Employee routes */}
                  <Route path="/employee/dashboard" element={<ProtectedRoute allowedRoles={["employee"]}><MainLayout><EmployeeDashboard /></MainLayout></ProtectedRoute>} />
                  <Route path="/employee/cases" element={<ProtectedRoute allowedRoles={["employee"]}><MainLayout><EmployeeCases /></MainLayout></ProtectedRoute>} />
                  <Route path="/employee/cases/:id" element={<ProtectedRoute allowedRoles={["employee"]}><MainLayout><CaseDetails /></MainLayout></ProtectedRoute>} />
                  <Route path="/employee/notifications" element={<ProtectedRoute allowedRoles={["employee"]}><MainLayout><EmployeeNotifications /></MainLayout></ProtectedRoute>} />
                  <Route path="/employee/profile" element={<ProtectedRoute allowedRoles={["employee"]}><MainLayout><EmployeeProfile /></MainLayout></ProtectedRoute>} />
                  <Route path="/employee/settings" element={<ProtectedRoute allowedRoles={["employee"]}><MainLayout><EmployeeSettings /></MainLayout></ProtectedRoute>} />
                  <Route path="/employee/contact-queries" element={<ProtectedRoute allowedRoles={["employee"]}><MainLayout><EmployeeContactQueries /></MainLayout></ProtectedRoute>} />
                  <Route path="/employee/contact-queries/:id" element={<ProtectedRoute allowedRoles={["employee"]}><MainLayout><EmployeeContactQueryDetails /></MainLayout></ProtectedRoute>} />
                  <Route path="/employee/end-users" element={<ProtectedRoute allowedRoles={["employee"]}><MainLayout><EmployeeEndUsers /></MainLayout></ProtectedRoute>} />

                  {/* End User routes */}
                  <Route path="/end-user/dashboard" element={<ProtectedRoute allowedRoles={["end_user"]}><MainLayout><EndUserDashboard /></MainLayout></ProtectedRoute>} />
                  <Route path="/end-user/services" element={<ProtectedRoute allowedRoles={["end_user"]}><MainLayout><EndUserServices /></MainLayout></ProtectedRoute>} />
                  <Route path="/end-user/services/:id" element={<ProtectedRoute allowedRoles={["end_user"]}><MainLayout><EndUserServiceDetails /></MainLayout></ProtectedRoute>} />
                  <Route path="/end-user/payment/:id" element={<ProtectedRoute allowedRoles={["end_user"]}><MainLayout><EndUserPayment /></MainLayout></ProtectedRoute>} />
                  <Route path="/end-user/cases" element={<ProtectedRoute allowedRoles={["end_user"]}><MainLayout><EndUserCases /></MainLayout></ProtectedRoute>} />
                  <Route path="/end-user/cases/:id" element={<ProtectedRoute allowedRoles={["end_user"]}><MainLayout><EndUserCaseDetails /></MainLayout></ProtectedRoute>} />
                  <Route path="/end-user/payments" element={<ProtectedRoute allowedRoles={["end_user"]}><MainLayout><EndUserPayments /></MainLayout></ProtectedRoute>} />
                  <Route path="/end-user/notifications" element={<ProtectedRoute allowedRoles={["end_user"]}><MainLayout><EndUserNotifications /></MainLayout></ProtectedRoute>} />
                  <Route path="/end-user/profile" element={<ProtectedRoute allowedRoles={["end_user"]}><MainLayout><EndUserProfile /></MainLayout></ProtectedRoute>} />
                  <Route path="/end-user/settings" element={<ProtectedRoute allowedRoles={["end_user"]}><MainLayout><EndUserSettings /></MainLayout></ProtectedRoute>} />
                  <Route path="/end-user/my-queries" element={<ProtectedRoute allowedRoles={["end_user"]}><MainLayout><MyQueries /></MainLayout></ProtectedRoute>} />
                  <Route path="/end-user/my-queries/:id" element={<ProtectedRoute allowedRoles={["end_user"]}><MainLayout><MyQueryDetails /></MainLayout></ProtectedRoute>} />

                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </>
            </TooltipProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;

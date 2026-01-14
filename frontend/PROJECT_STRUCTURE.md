# LN Services - Project Structure

This document outlines the folder structure and organization of the LN Services application.

## Project Structure

```
src/
├── assets/                 # Static assets (images, fonts)
├── components/            # Reusable components
│   ├── common/           # Common components
│   │   ├── LoadingSpinner.tsx
│   │   └── ProtectedRoute.tsx
│   ├── layout/           # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── MainLayout.tsx
│   └── ui/               # shadcn-ui components
├── context/              # React context providers
│   └── AuthContext.tsx   # Authentication context
├── hooks/                # Custom hooks
│   └── use-mobile.tsx
├── lib/                  # Utility libraries
│   └── utils.ts
├── pages/                # Page components
│   ├── admin/           # Admin pages
│   │   └── Dashboard.tsx
│   ├── agent/           # Agent pages
│   │   └── Dashboard.tsx
│   ├── employee/        # Employee pages
│   │   └── Dashboard.tsx
│   ├── end-user/        # End User pages
│   │   └── Dashboard.tsx
│   ├── auth/            # Authentication pages
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── ForgotPassword.tsx
│   │   └── ResetPassword.tsx
│   └── NotFound.tsx     # 404 page
├── services/             # API services
│   ├── api.ts           # Axios instance with interceptors
│   └── authService.ts   # Authentication API calls
├── App.tsx              # Main App component with routing
├── main.tsx             # Entry point
└── index.css            # Global styles with design system
```

## Key Features

### Authentication System
- **Login/Register**: Complete authentication flow with validation
- **Password Reset**: Forgot password and reset password functionality
- **Protected Routes**: Role-based route protection
- **JWT Token Management**: Automatic token handling with Axios interceptors

### Layout Components
- **Header**: Sticky header with notifications and user profile dropdown
- **Sidebar**: Collapsible navigation with role-based menu items
- **Footer**: Company information and social links
- **MainLayout**: Wrapper component combining Header, Sidebar, and Footer

### Role-Based Dashboards
- **Admin Dashboard**: Full platform management and analytics
- **Agent Dashboard**: User onboarding and case tracking
- **Employee Dashboard**: Assigned case management
- **End User Dashboard**: Personal service requests and tracking

### Design System
- **Color Palette**: Professional blue primary, emerald accent, semantic colors
- **Typography**: Clean hierarchy with proper font weights
- **Components**: Reusable shadcn-ui components with custom variants
- **Responsive Design**: Mobile-first approach with breakpoints

## User Roles

1. **Admin**: Full platform access, user management, reports
2. **Agent**: User onboarding, case tracking
3. **Employee**: Case management for assigned services
4. **End User**: Create and track service requests

## API Integration

The application is configured to work with a backend API. Set the API URL in your environment:

```env
VITE_API_URL=http://localhost:5000/api
```

## Next Steps (Phase 2)

- Admin module implementation with full CRUD operations
- User, Employee, and Agent management
- Case management system
- Service catalog
- Reports and analytics
- Redux store integration for state management

## Technologies Used

- **React 18**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **shadcn-ui**: Component library
- **React Router v6**: Routing
- **Axios**: HTTP client
- **React Query**: Server state management
- **Lucide React**: Icons

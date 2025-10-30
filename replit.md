# SOMVI Somalia - Construction Supply Chain Platform

## Overview

SOMVI Somalia is a web-based platform that simplifies construction supply chains by connecting contractors with verified suppliers and logistics providers. The platform enables users to request quotes (RFQs), compare supplier prices, and manage construction material orders through a unified interface. Built with React, TypeScript, and modern UI components, the application provides both a client-facing platform for material ordering and an admin dashboard for managing RFQs, suppliers, clients, and financial tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **Styling**: Tailwind CSS with HSL color system for consistent theming
- **Routing**: React Router for client-side navigation
- **State Management**: React Context API (CartContext for shopping cart state)
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers

**Design System:**
- Brand colors defined in CSS custom properties (HSL format)
- Primary: Blue-Gray (#1E293B)
- Accent: Orange (#F97316)
- Responsive design with mobile-first approach
- Custom animations and hover effects
- Inter font family for typography

**Key Application Routes:**
- `/` - Landing page with marketing content
- `/platform` - Material browsing and ordering interface
- `/my-rfqs` - Client RFQ tracking (phone number-based lookup)
- `/admin/*` - Admin dashboard routes for management functions

**Component Architecture:**
- Reusable UI components in `src/components/ui/`
- Feature-specific components (e.g., `Cart`, `AdminLayout`)
- Page components in `src/pages/`
- Marketing components (Hero, About, Services, etc.)

### Data Management

**Client-Side Storage:**
- LocalStorage for persisting RFQs and user data
- No server-side database currently implemented
- JSON file (`/public/data/materials.json`) for material catalog

**Data Models:**
- **RFQ**: Contains client info, items, status, pricing, delivery fees, and taxes
- **Material**: ID, name, description, unit, category, image, price range, delivery days
- **CartItem**: Material with quantity
- **Supplier Pricing**: Base price plus markup structure for up to 5 suppliers

**State Flow:**
- Shopping cart managed via React Context
- Form submissions stored to localStorage
- RFQ status workflow: Pending → Quoted → Completed

### Authentication & Authorization

**Current Implementation:**
- No authentication system implemented
- Admin routes are publicly accessible
- RFQ lookup uses phone number matching (no password protection)

**Considerations:**
- Authentication would need to be added for production use
- Role-based access control needed for admin vs. client users

### PDF Generation

**Implementation:**
- jsPDF with jspdf-autotable for generating RFQ quotation PDFs
- Admin can export RFQs with supplier pricing breakdowns
- Includes client information, itemized materials, and total calculations

### File Handling

**Upload Support:**
- Client can attach files (PDF, Excel, Word) when creating RFQs
- 10MB file size limit
- File validation for type and size
- Files stored as File objects (not persisted to server)

### Responsive Design

**Breakpoints:**
- Mobile-first approach with Tailwind's default breakpoints
- Custom mobile detection hook (`use-mobile.tsx`)
- Responsive navigation with mobile menu
- Adaptive layouts for cards, tables, and forms

### Admin Dashboard Features

**Modules:**
- Dashboard overview with statistics
- RFQ Management (view, edit pricing, update status)
- Supplier Management
- Client Management  
- Material Management
- Finance Tracking (delivery fees, taxes, totals)
- Reports generation
- Completed Orders archive

**Supplier Pricing Model:**
- Each RFQ item can have up to 5 supplier quotes
- Base price + markup structure
- Admin controls displayed pricing to clients

## External Dependencies

### UI Component Libraries
- **Radix UI**: Accessible component primitives (dialogs, dropdowns, accordions, etc.)
- **shadcn/ui**: Pre-built component library built on Radix UI
- **Lucide React**: Icon library for consistent iconography

### Data Fetching & State
- **TanStack Query** (React Query): Async state management and caching
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation (via @hookform/resolvers)

### Styling & Utilities
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: Component variant styling
- **clsx & tailwind-merge**: Conditional class utilities
- **cmdk**: Command palette component

### Carousel & Interactions
- **Embla Carousel**: Carousel component with autoplay plugin
- **Vaul**: Drawer component primitive
- **next-themes**: Theme management (light/dark mode support)

### PDF & Document Generation
- **jsPDF**: PDF generation library
- **jspdf-autotable**: Table plugin for jsPDF

### Date Handling
- **date-fns**: Date utility library for formatting and manipulation

### Development Tools
- **TypeScript**: Type safety and developer experience
- **ESLint**: Code linting with TypeScript support
- **PostCSS**: CSS processing with Tailwind and Autoprefixer
- **Vite**: Build tool and dev server

### Third-Party Integrations
- **WhatsApp Business**: Primary communication channel for quotes (hardcoded link to +252615401195)
- **Google Fonts**: Inter font family loaded from CDN
- **Lovable Platform**: Associated with project metadata and component tagging in development

### Communication Channels
- WhatsApp link for instant quote requests
- Email contact: info@somvi.so
- Phone: +252 615 401 195
- Floating WhatsApp button with Somali language CTA

### Asset Management
- Images stored in `src/assets/` (illustrations, hero images, step diagrams)
- Material images referenced via external URLs (Unsplash)
- Open Graph images hosted externally
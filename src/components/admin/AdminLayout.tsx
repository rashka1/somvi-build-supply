import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Package, 
  TrendingUp, 
  FileBarChart,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "RFQ Management", href: "/admin/rfqs", icon: FileText },
  { name: "Suppliers", href: "/admin/suppliers", icon: Building2 },
  { name: "Clients", href: "/admin/clients", icon: Users },
  { name: "Materials", href: "/admin/materials", icon: Package },
  { name: "Finance", href: "/admin/finance", icon: TrendingUp },
  { name: "Reports", href: "/admin/reports", icon: FileBarChart },
];

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-50">
        <div className="section-container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-xl">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">SOMVI Admin</h1>
                <p className="text-xs opacity-80">Procurement Management System</p>
              </div>
            </div>
            <Link to="/platform" className="text-sm hover:text-accent transition-colors">
              View Client Portal →
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Side Navigation */}
        <aside className="w-64 bg-card border-r border-border min-h-[calc(100vh-80px)] sticky top-20">
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                              (item.href !== "/admin" && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

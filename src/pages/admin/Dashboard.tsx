import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, CheckCircle, DollarSign, TrendingUp, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import AdminLayout from "@/components/admin/AdminLayout";

interface RFQ {
  id: string;
  date: string;
  client: {
    name: string;
    company: string;
  };
  items: any[];
  status: "Pending" | "Quoted" | "Completed";
  completedDate?: string;
}

const Dashboard = () => {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [stats, setStats] = useState({
    totalRFQs: 0,
    completedOrders: 0,
    totalProfit: 0,
    pendingRFQs: 0,
  });

  useEffect(() => {
    const storedRFQs = JSON.parse(localStorage.getItem("rfqs") || "[]");
    setRfqs(storedRFQs);

    // Calculate stats
    const completed = storedRFQs.filter((r: RFQ) => r.status === "Completed");
    const pending = storedRFQs.filter((r: RFQ) => r.status === "Pending");
    
    // Calculate total profit from completed orders
    let totalProfit = 0;
    completed.forEach((rfq: any) => {
      rfq.items?.forEach((item: any) => {
        if (item.suppliers) {
          Object.values(item.suppliers).forEach((supplier: any) => {
            totalProfit += (supplier.markup || 0) * (item.quantity || 0);
          });
        }
      });
    });

    setStats({
      totalRFQs: storedRFQs.length,
      completedOrders: completed.length,
      totalProfit,
      pendingRFQs: pending.length,
    });
  }, []);

  // Sales by month data (mock data)
  const salesByMonth = [
    { month: "Jan", sales: 45000 },
    { month: "Feb", sales: 52000 },
    { month: "Mar", sales: 48000 },
    { month: "Apr", sales: 61000 },
    { month: "May", sales: 55000 },
    { month: "Jun", sales: 67000 },
  ];

  // Category performance (mock data)
  const categoryData = [
    { name: "Cement", value: 35 },
    { name: "Steel", value: 28 },
    { name: "Aggregates", value: 22 },
    { name: "Others", value: 15 },
  ];

  const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(24 95% 63%)", "hsl(215 16% 47%)"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500";
      case "Quoted":
        return "bg-blue-500";
      case "Completed":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <AdminLayout>
      <div className="section-container py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total RFQs</CardTitle>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRFQs}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.pendingRFQs} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
              <CheckCircle className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                All time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalProfit.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                From completed orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Margin</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18.5%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Last 30 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales by Month</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent RFQs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent RFQs</CardTitle>
            <Link to="/admin/rfqs">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {rfqs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No RFQs yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>RFQ ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rfqs.slice(0, 5).map((rfq) => (
                    <TableRow key={rfq.id}>
                      <TableCell className="font-medium">{rfq.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{rfq.client.name}</p>
                          {rfq.client.company && (
                            <p className="text-xs text-muted-foreground">{rfq.client.company}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(rfq.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(rfq.status)}>{rfq.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to={`/admin/rfq/${rfq.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;

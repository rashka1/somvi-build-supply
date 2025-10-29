import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface RFQ {
  id: string;
  date: string;
  client: {
    name: string;
    company: string;
    email: string;
    phone: string;
  };
  items: any[];
  status: "Pending" | "Quoted" | "Completed";
  completedDate?: string;
}

const AdminDashboard = () => {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedRFQs = JSON.parse(localStorage.getItem("rfqs") || "[]");
    setRfqs(storedRFQs);
  }, []);

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
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="section-container py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => navigate("/admin/completed")}>
                <FileCheck className="w-4 h-4 mr-2" />
                Completed Orders
              </Button>
              <Link to="/platform">
                <Button variant="secondary">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Platform
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="section-container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Request for Quotations (RFQs)</CardTitle>
          </CardHeader>
          <CardContent>
            {rfqs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No RFQs submitted yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>RFQ ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rfqs.map((rfq) => (
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
                      <TableCell>{rfq.items.length} items</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(rfq.status)}>{rfq.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => navigate(`/admin/rfq/${rfq.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;

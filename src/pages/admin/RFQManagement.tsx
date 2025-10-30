import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Plus, Trash2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
}

const RFQManagement = () => {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadRFQs();
  }, []);

  const loadRFQs = () => {
    const storedRFQs = JSON.parse(localStorage.getItem("rfqs") || "[]");
    setRfqs(storedRFQs);
  };

  const deleteRFQ = (id: string) => {
    const updatedRFQs = rfqs.filter((rfq) => rfq.id !== id);
    localStorage.setItem("rfqs", JSON.stringify(updatedRFQs));
    setRfqs(updatedRFQs);
    
    toast({
      title: "RFQ Deleted",
      description: "The RFQ has been removed successfully.",
    });
  };

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

  const calculateProfit = (rfq: any) => {
    let profit = 0;
    rfq.items?.forEach((item: any) => {
      if (item.suppliers) {
        Object.values(item.suppliers).forEach((supplier: any) => {
          profit += (supplier.markup || 0) * (item.quantity || 0);
        });
      }
    });
    return profit;
  };

  const calculateMargin = (rfq: any) => {
    let totalCost = 0;
    let profit = 0;
    
    rfq.items?.forEach((item: any) => {
      if (item.suppliers) {
        Object.values(item.suppliers).forEach((supplier: any) => {
          const basePrice = supplier.basePrice || 0;
          const markup = supplier.markup || 0;
          const qty = item.quantity || 0;
          
          totalCost += basePrice * qty;
          profit += markup * qty;
        });
      }
    });
    
    return totalCost > 0 ? ((profit / totalCost) * 100).toFixed(1) : "0";
  };

  return (
    <AdminLayout>
      <div className="section-container py-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>RFQ Management</CardTitle>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create RFQ
            </Button>
          </CardHeader>
          <CardContent>
            {rfqs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No RFQs found.</p>
                <Button onClick={() => navigate("/platform")}>
                  Go to Client Portal
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>RFQ ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Profit</TableHead>
                    <TableHead>Margin %</TableHead>
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
                      <TableCell className="font-medium text-green-600">
                        ${calculateProfit(rfq).toFixed(2)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {calculateMargin(rfq)}%
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/admin/rfq/${rfq.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete RFQ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the RFQ.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteRFQ(rfq.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
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

export default RFQManagement;

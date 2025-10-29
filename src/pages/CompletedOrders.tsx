import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface RFQ {
  id: string;
  date: string;
  completedDate?: string;
  client: {
    name: string;
    company: string;
  };
  items: any[];
  status: string;
  deliveryFee?: number;
  taxes?: number;
}

const CompletedOrders = () => {
  const [completedRFQs, setCompletedRFQs] = useState<RFQ[]>([]);

  useEffect(() => {
    const storedRFQs = JSON.parse(localStorage.getItem("rfqs") || "[]");
    const completed = storedRFQs.filter((rfq: RFQ) => rfq.status === "Completed");
    setCompletedRFQs(completed);
  }, []);

  const calculateTotalValue = (rfq: RFQ) => {
    let total = 0;
    
    rfq.items.forEach((item: any) => {
      if (item.suppliers) {
        const suppliers = ["supplier1", "supplier2", "supplier3", "supplier4", "supplier5"];
        suppliers.forEach((supplier) => {
          const supplierData = item.suppliers[supplier];
          if (supplierData) {
            const displayedPrice = supplierData.basePrice + supplierData.markup;
            total += displayedPrice * item.quantity;
          }
        });
      }
    });

    total += rfq.deliveryFee || 0;
    total += rfq.taxes || 0;

    return total;
  };

  const calculateTotalProfit = (rfq: RFQ) => {
    let profit = 0;

    rfq.items.forEach((item: any) => {
      if (item.suppliers) {
        const suppliers = ["supplier1", "supplier2", "supplier3", "supplier4", "supplier5"];
        suppliers.forEach((supplier) => {
          const supplierData = item.suppliers[supplier];
          if (supplierData) {
            profit += supplierData.markup * item.quantity;
          }
        });
      }
    });

    return profit;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="section-container py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Completed Orders</h1>
            <Link to="/admin">
              <Button variant="secondary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="section-container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Completed RFQs</CardTitle>
          </CardHeader>
          <CardContent>
            {completedRFQs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No completed orders yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>RFQ ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Submitted Date</TableHead>
                    <TableHead>Completed Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Total Value</TableHead>
                    <TableHead className="text-right">SOMVI Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedRFQs.map((rfq) => (
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
                        {rfq.completedDate
                          ? new Date(rfq.completedDate).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>{rfq.items.length} items</TableCell>
                      <TableCell className="text-right font-medium">
                        ${calculateTotalValue(rfq).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        ${calculateTotalProfit(rfq).toFixed(2)}
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

export default CompletedOrders;

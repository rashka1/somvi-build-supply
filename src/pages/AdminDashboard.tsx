import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import jsPDF from "jspdf";
import "jspdf-autotable";

interface RFQItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  price?: number;
}

interface RFQ {
  id: string;
  date: string;
  client: {
    name: string;
    company: string;
    email: string;
    phone: string;
  };
  items: RFQItem[];
  status: string;
}

const AdminDashboard = () => {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [selectedRFQ, setSelectedRFQ] = useState<RFQ | null>(null);
  const [prices, setPrices] = useState<{ [key: string]: number }>({});
  const [markup, setMarkup] = useState(15);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const storedRFQs = JSON.parse(localStorage.getItem("rfqs") || "[]");
    setRfqs(storedRFQs);
  }, []);

  const handleSelectRFQ = (rfq: RFQ) => {
    setSelectedRFQ(rfq);
    const initialPrices: { [key: string]: number } = {};
    rfq.items.forEach((item) => {
      initialPrices[item.id] = item.price || 0;
    });
    setPrices(initialPrices);
  };

  const calculateSubtotal = () => {
    if (!selectedRFQ) return 0;
    return selectedRFQ.items.reduce((sum, item) => {
      const price = prices[item.id] || 0;
      return sum + price * item.quantity;
    }, 0);
  };

  const calculateMarkupAmount = () => {
    return (calculateSubtotal() * markup) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateMarkupAmount() + deliveryFee;
  };

  const generatePDF = () => {
    if (!selectedRFQ) return;

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(26, 86, 219);
    doc.text("SOMVI", 20, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Construction Materials & Logistics", 20, 27);

    // Title
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text("QUOTATION", 20, 45);

    // RFQ Details
    doc.setFontSize(10);
    doc.text(`RFQ ID: ${selectedRFQ.id}`, 20, 55);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 62);
    doc.text(`Valid for: 7 days`, 20, 69);

    // Client Info
    doc.setFontSize(11);
    doc.text("Bill To:", 20, 82);
    doc.setFontSize(10);
    doc.text(selectedRFQ.client.name, 20, 89);
    if (selectedRFQ.client.company) {
      doc.text(selectedRFQ.client.company, 20, 96);
    }
    doc.text(selectedRFQ.client.email, 20, 103);
    doc.text(selectedRFQ.client.phone, 20, 110);

    // Items Table
    const tableData = selectedRFQ.items.map((item) => [
      item.name,
      item.quantity.toString(),
      item.unit,
      `$${(prices[item.id] || 0).toFixed(2)}`,
      `$${((prices[item.id] || 0) * item.quantity).toFixed(2)}`,
    ]);

    (doc as any).autoTable({
      startY: 125,
      head: [["Material Name", "Qty", "Unit", "Unit Price", "Total"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [26, 86, 219] },
    });

    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.text(`Subtotal: $${calculateSubtotal().toFixed(2)}`, 140, finalY);
    doc.text(`Delivery Fee: $${deliveryFee.toFixed(2)}`, 140, finalY + 7);
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text(`Grand Total: $${calculateTotal().toFixed(2)}`, 140, finalY + 18);

    // Footer
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.setTextColor(100);
    doc.text("Quotation prepared by SOMVI Procurement Team", 20, 270);
    doc.text("Valid for 7 days.", 20, 277);

    doc.save(`${selectedRFQ.id}-Quotation.pdf`);
    
    toast({
      title: "PDF Generated",
      description: "Quotation has been downloaded successfully.",
    });
  };

  const shareViaWhatsApp = () => {
    if (!selectedRFQ) return;

    const phone = selectedRFQ.client.phone.replace(/\D/g, "");
    const itemsList = selectedRFQ.items
      .map((item) => `• ${item.name}: ${item.quantity} ${item.unit} @ $${(prices[item.id] || 0).toFixed(2)} = $${((prices[item.id] || 0) * item.quantity).toFixed(2)}`)
      .join("\n");

    const message = `Hello ${selectedRFQ.client.name},

Thank you for your RFQ (${selectedRFQ.id}).

Here is your quotation from SOMVI:

*Materials:*
${itemsList}

*Summary:*
Subtotal: $${calculateSubtotal().toFixed(2)}
Delivery Fee: $${deliveryFee.toFixed(2)}
*Grand Total: $${calculateTotal().toFixed(2)}*

This quotation is valid for 7 days.

For any questions, please contact our procurement team.

Best regards,
SOMVI Procurement Team`;

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");

    toast({
      title: "WhatsApp Opened",
      description: "Share the quotation with your client.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="section-container py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <Link to="/platform">
              <Button variant="secondary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Platform
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="section-container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* RFQs List */}
          <Card>
            <CardHeader>
              <CardTitle>Received RFQs</CardTitle>
            </CardHeader>
            <CardContent>
              {rfqs.length === 0 ? (
                <p className="text-muted-foreground">No RFQs submitted yet.</p>
              ) : (
                <div className="space-y-3">
                  {rfqs.map((rfq) => (
                    <div
                      key={rfq.id}
                      onClick={() => handleSelectRFQ(rfq)}
                      className={`p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors ${
                        selectedRFQ?.id === rfq.id ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">{rfq.id}</p>
                          <p className="text-sm text-muted-foreground">{rfq.client.name}</p>
                        </div>
                        <Badge>{rfq.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(rfq.date).toLocaleDateString()} • {rfq.items.length} items
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quotation Form */}
          <Card>
            <CardHeader>
              <CardTitle>Generate Quotation</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedRFQ ? (
                <p className="text-muted-foreground">Select an RFQ to generate quotation</p>
              ) : (
                <div className="space-y-6">
                  {/* Client Info */}
                  <div>
                    <h3 className="font-semibold mb-2">Client Information</h3>
                    <div className="text-sm space-y-1">
                      <p><strong>Name:</strong> {selectedRFQ.client.name}</p>
                      {selectedRFQ.client.company && (
                        <p><strong>Company:</strong> {selectedRFQ.client.company}</p>
                      )}
                      <p><strong>Email:</strong> {selectedRFQ.client.email}</p>
                      <p><strong>Phone:</strong> {selectedRFQ.client.phone}</p>
                    </div>
                  </div>

                  {/* Items with Pricing */}
                  <div>
                    <h3 className="font-semibold mb-3">Items & Pricing</h3>
                    <div className="space-y-3">
                      {selectedRFQ.items.map((item) => (
                        <div key={item.id} className="border p-3 rounded-lg">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground mb-2">
                            Qty: {item.quantity} {item.unit}
                          </p>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">Unit Price ($):</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={prices[item.id] || ""}
                              onChange={(e) =>
                                setPrices({ ...prices, [item.id]: parseFloat(e.target.value) || 0 })
                              }
                              className="w-24 h-8"
                            />
                            <span className="text-sm font-medium">
                              Total: ${((prices[item.id] || 0) * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Charges */}
                  <div className="space-y-3 border-t pt-4">
                    <div className="flex items-center gap-3">
                      <Label>Markup (%):</Label>
                      <Input
                        type="number"
                        value={markup}
                        onChange={(e) => setMarkup(parseFloat(e.target.value) || 0)}
                        className="w-24"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Label>Delivery Fee ($):</Label>
                      <Input
                        type="number"
                        value={deliveryFee}
                        onChange={(e) => setDeliveryFee(parseFloat(e.target.value) || 0)}
                        className="w-24"
                      />
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Markup ({markup}%):</span>
                      <span>${calculateMarkupAmount().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Delivery:</span>
                      <span>${deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>TOTAL:</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={generatePDF} className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button onClick={shareViaWhatsApp} variant="secondary" className="w-full">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Share via WhatsApp
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

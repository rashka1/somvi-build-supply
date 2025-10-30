import { useState } from "react";
import { X, Trash2, Send, Upload, MessageCircle, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface CartProps {
  open: boolean;
  onClose: () => void;
}

const Cart = ({ open, onClose }: CartProps) => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { toast } = useToast();
  const [clientInfo, setClientInfo] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
  });
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size (max 10MB)
      const validTypes = ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or Excel file.",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "File size must be less than 10MB.",
          variant: "destructive",
        });
        return;
      }
      setAttachedFile(file);
    }
  };

  const handleSubmitRFQ = () => {
    // Validation
    if (!clientInfo.name || !clientInfo.email || !clientInfo.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (Name, Email, Phone).",
        variant: "destructive",
      });
      return;
    }

    // Validate phone format (basic check for Somalia format)
    const phoneRegex = /^(\+252|252)?[0-9]{9,10}$/;
    if (!phoneRegex.test(clientInfo.phone.replace(/\s/g, ''))) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Somali phone number (e.g., +252615401195)",
        variant: "destructive",
      });
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientInfo.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add materials to your cart before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Save RFQ to localStorage for admin dashboard
    const rfq = {
      id: `RFQ-${Date.now()}`,
      date: new Date().toISOString(),
      client: clientInfo,
      items: cart,
      status: "Pending",
      attachedFileName: attachedFile?.name || null,
    };

    const existingRFQs = JSON.parse(localStorage.getItem("rfqs") || "[]");
    localStorage.setItem("rfqs", JSON.stringify([...existingRFQs, rfq]));

    // Prepare WhatsApp message
    const itemsList = cart.map((item) => `• ${item.name} - ${item.quantity} ${item.unit}`).join('\n');
    const whatsappMessage = `🎉 *RFQ Submitted Successfully!*\n\n*RFQ ID:* ${rfq.id}\n*Client:* ${clientInfo.name}\n${clientInfo.company ? `*Company:* ${clientInfo.company}\n` : ''}\n*Materials Requested:*\n${itemsList}\n\nThank you for using SOMVI! Our procurement team will review your request and send you a quotation shortly.`;
    
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const cleanPhone = clientInfo.phone.replace(/\s/g, '').replace(/^\+/, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "RFQ Submitted Successfully! ✅",
        description: "Sending confirmation via WhatsApp...",
      });
      
      // Open WhatsApp with confirmation message
      window.open(whatsappUrl, '_blank');
      
      clearCart();
      setClientInfo({ name: "", company: "", email: "", phone: "" });
      setAttachedFile(null);
      onClose();
    }, 1000);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">Your Cart</SheetTitle>
          <SheetDescription>
            Review your materials and submit a Request for Quotation
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Cart Items */}
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Your cart is empty</p>
              <p className="text-sm text-muted-foreground mt-1">Add materials to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b">
                <h3 className="font-semibold text-sm">Cart Items ({cart.length})</h3>
                <p className="text-xs text-muted-foreground">Total: {cart.reduce((sum, item) => sum + item.quantity, 0)} units</p>
              </div>
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 border rounded-lg hover:border-accent transition-colors">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.category}</p>
                    <p className="text-xs text-muted-foreground">{item.unit}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Label className="text-xs">Qty:</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                        className="w-16 h-8 text-sm"
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Client Information Form */}
          {cart.length > 0 && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-base">Your Information</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name" className="text-sm">Full Name *</Label>
                  <Input
                    id="name"
                    value={clientInfo.name}
                    onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                    placeholder="John Doe"
                    className="mt-1.5"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="company" className="text-sm">Company Name</Label>
                  <Input
                    id="company"
                    value={clientInfo.company}
                    onChange={(e) => setClientInfo({ ...clientInfo, company: e.target.value })}
                    placeholder="Optional"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={clientInfo.email}
                    onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                    placeholder="john@example.com"
                    className="mt-1.5"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm">WhatsApp Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={clientInfo.phone}
                    onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                    placeholder="+252 615 401 195"
                    className="mt-1.5"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    You'll receive confirmation via WhatsApp
                  </p>
                </div>

                {/* File Upload */}
                <div>
                  <Label htmlFor="file" className="text-sm">Attach Document (Optional)</Label>
                  <div className="mt-1.5">
                    <label htmlFor="file" className="flex items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:border-accent transition-colors">
                      <div className="text-center">
                        {attachedFile ? (
                          <div className="flex flex-col items-center gap-1">
                            <Upload className="w-5 h-5 text-accent" />
                            <p className="text-xs font-medium text-accent truncate max-w-[200px]">{attachedFile.name}</p>
                            <p className="text-xs text-muted-foreground">{(attachedFile.size / 1024).toFixed(1)} KB</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <Upload className="w-5 h-5 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Upload PDF or Excel (Max 10MB)</p>
                          </div>
                        )}
                      </div>
                    </label>
                    <input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.xls,.xlsx"
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSubmitRFQ}
                disabled={isSubmitting}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-12 font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Submit RFQ via WhatsApp
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                By submitting, you agree to receive quotations from SOMVI
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Cart;

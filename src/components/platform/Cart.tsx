import { useState } from "react";
import { X, Trash2, Send } from "lucide-react";
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitRFQ = () => {
    if (!clientInfo.name || !clientInfo.email || !clientInfo.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
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
      status: "pending",
    };

    const existingRFQs = JSON.parse(localStorage.getItem("rfqs") || "[]");
    localStorage.setItem("rfqs", JSON.stringify([...existingRFQs, rfq]));

    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "RFQ Submitted Successfully!",
        description: "Your materials request has been sent to SOMVI Procurement Team.",
      });
      clearCart();
      setClientInfo({ name: "", company: "", email: "", phone: "" });
      onClose();
    }, 1000);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
          <SheetDescription>
            Review your materials and submit an RFQ
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Cart Items */}
          {cart.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Your cart is empty</p>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">{item.unit}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Label className="text-sm">Qty:</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                        className="w-20"
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
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
              <h3 className="font-semibold">Your Information</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={clientInfo.name}
                    onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={clientInfo.company}
                    onChange={(e) => setClientInfo({ ...clientInfo, company: e.target.value })}
                    placeholder="Company name (optional)"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={clientInfo.email}
                    onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={clientInfo.phone}
                    onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                    placeholder="+252 XX XXX XXXX"
                  />
                </div>
              </div>

              <Button
                onClick={handleSubmitRFQ}
                disabled={isSubmitting}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? "Submitting..." : "Submit RFQ"}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Cart;

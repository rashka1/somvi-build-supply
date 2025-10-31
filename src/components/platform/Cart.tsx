import { useState } from "react";
import { Trash2, MessageCircle, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
    whatsapp: "",
    projectName: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitRFQ = async () => {
    // Validation
    if (!clientInfo.name || !clientInfo.whatsapp || !clientInfo.projectName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Validate WhatsApp format (must start with country code)
    const whatsappRegex = /^(\+\d{1,4})\d{8,12}$/;
    if (!whatsappRegex.test(clientInfo.whatsapp.replace(/\s/g, ''))) {
      toast({
        title: "Invalid WhatsApp Number",
        description: "WhatsApp number must start with country code (e.g., +252615401195, +254712345678, +971501234567)",
        variant: "destructive",
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add materials to your RFQ before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create or get client
      const cleanWhatsapp = clientInfo.whatsapp.replace(/\s/g, '');
      
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('whatsapp', cleanWhatsapp)
        .single();

      let clientId = existingClient?.id;

      if (!clientId) {
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            name: clientInfo.name,
            company: clientInfo.company || null,
            whatsapp: cleanWhatsapp,
          })
          .select()
          .single();

        if (clientError) throw clientError;
        clientId = newClient.id;
      }

      // Generate RFQ number
      const { data: rfqNumberData } = await supabase.rpc('generate_rfq_number');
      const rfqNumber = rfqNumberData || `SOMVI-RFQ-${Date.now()}`;

      // Create RFQ
      const { data: rfq, error: rfqError } = await supabase
        .from('rfqs')
        .insert({
          rfq_number: rfqNumber,
          client_id: clientId,
          project_name: clientInfo.projectName,
          status: 'pending',
        })
        .select()
        .single();

      if (rfqError) throw rfqError;

      // Create RFQ items
      const rfqItems = cart.map(item => ({
        rfq_id: rfq.id,
        material_id: item.id,
        quantity: item.quantity,
        unit: item.unit,
      }));

      const { error: itemsError } = await supabase
        .from('rfq_items')
        .insert(rfqItems);

      if (itemsError) throw itemsError;

      // Create lead for CRM
      await supabase
        .from('leads')
        .insert({
          rfq_id: rfq.id,
          client_name: clientInfo.name,
          whatsapp: cleanWhatsapp,
          project_name: clientInfo.projectName,
          stage: 'new',
        });

      // Prepare WhatsApp message
      const itemsList = cart.map((item) => `• ${item.name} - ${item.quantity} ${item.unit}`).join('\n');
      const whatsappMessage = `🎉 *Your request has been received!*\n\n*RFQ Number:* ${rfqNumber}\n*Project:* ${clientInfo.projectName}\n*Client:* ${clientInfo.name}\n${clientInfo.company ? `*Company:* ${clientInfo.company}\n` : ''}\n\n*Materials Requested:*\n${itemsList}\n\n_Our team will contact you via WhatsApp with your quotation._\n\nThank you for choosing SOMVI Somalia Build Supply!`;
      
      const encodedMessage = encodeURIComponent(whatsappMessage);
      const cleanPhone = cleanWhatsapp.replace(/^\+/, '');
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

      toast({
        title: "RFQ Submitted Successfully! ✅",
        description: "Your request has been received. Our team will contact you via WhatsApp.",
      });
      
      // Open WhatsApp with confirmation message
      window.open(whatsappUrl, '_blank');
      
      clearCart();
      setClientInfo({ name: "", company: "", whatsapp: "", projectName: "" });
      onClose();
    } catch (error: any) {
      console.error('Error submitting RFQ:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit RFQ. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
                    placeholder="Ahmed Mohamed"
                    className="mt-1.5"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="company" className="text-sm">Company Name (Optional)</Label>
                  <Input
                    id="company"
                    value={clientInfo.company}
                    onChange={(e) => setClientInfo({ ...clientInfo, company: e.target.value })}
                    placeholder="Your company name"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp" className="text-sm">WhatsApp Number *</Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    value={clientInfo.whatsapp}
                    onChange={(e) => setClientInfo({ ...clientInfo, whatsapp: e.target.value })}
                    placeholder="+252 615 401 195"
                    className="mt-1.5"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Must start with country code (e.g., +252, +254, +971)
                  </p>
                </div>
                <div>
                  <Label htmlFor="projectName" className="text-sm">Project Name *</Label>
                  <Input
                    id="projectName"
                    value={clientInfo.projectName}
                    onChange={(e) => setClientInfo({ ...clientInfo, projectName: e.target.value })}
                    placeholder="Villa Construction Project"
                    className="mt-1.5"
                    required
                  />
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

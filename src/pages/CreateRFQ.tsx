import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Upload, MessageCircle, FileText, ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const CreateRFQ = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    description: "",
    projectDetails: "",
  });
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        'application/pdf',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF, Excel, or Word document.",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (Name, Email, Phone).",
        variant: "destructive",
      });
      return;
    }

    const phoneRegex = /^(\+252|252)?[0-9]{9,10}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Somali phone number (e.g., +252615401195)",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.description && !attachedFile) {
      toast({
        title: "Missing Details",
        description: "Please describe your material needs or upload a document.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const rfq = {
      id: `RFQ-${Date.now()}`,
      date: new Date().toISOString(),
      client: {
        name: formData.name,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
      },
      items: [],
      description: formData.description,
      projectDetails: formData.projectDetails,
      status: "Pending",
      attachedFileName: attachedFile?.name || null,
      type: "direct",
    };

    const existingRFQs = JSON.parse(localStorage.getItem("rfqs") || "[]");
    localStorage.setItem("rfqs", JSON.stringify([...existingRFQs, rfq]));

    const whatsappMessage = `🎉 *RFQ Submitted Successfully!*\n\n*RFQ ID:* ${rfq.id}\n*Client:* ${formData.name}\n${formData.company ? `*Company:* ${formData.company}\n` : ''}\n*Project Details:*\n${formData.projectDetails || 'Not specified'}\n\n*Material Requirements:*\n${formData.description || 'See attached document'}\n${attachedFile ? `\n*Attached:* ${attachedFile.name}` : ''}\n\nThank you for using SOMVI! Our procurement team will review your request and send you a quotation shortly.`;
    
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const cleanPhone = formData.phone.replace(/\s/g, '').replace(/^\+/, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "RFQ Submitted Successfully! ✅",
        description: "Sending confirmation via WhatsApp...",
      });
      
      window.open(whatsappUrl, '_blank');
      
      setFormData({
        name: "",
        company: "",
        email: "",
        phone: "",
        description: "",
        projectDetails: "",
      });
      setAttachedFile(null);
      
      setTimeout(() => navigate('/my-rfqs'), 2000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg border-b border-primary/10">
        <div className="section-container py-4 md:py-5">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity" data-testid="link-home">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-lg md:text-xl">S</span>
              </div>
              <span className="text-xl md:text-2xl font-bold">SOMVI</span>
            </Link>
            <Link to="/">
              <Button
                variant="outline"
                className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                size="lg"
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="section-container py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-primary">Create RFQ</h1>
                <p className="text-muted-foreground">Submit your material requirements</p>
              </div>
            </div>
          </div>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>Request for Quotation</CardTitle>
              <CardDescription>
                Fill in the details below and we'll send you a customized quotation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-base">Contact Information</h3>
                  
                  <div>
                    <Label htmlFor="name" className="text-sm">Full Name *</Label>
                    <Input
                      id="name"
                      data-testid="input-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="mt-1.5"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="company" className="text-sm">Company Name</Label>
                    <Input
                      id="company"
                      data-testid="input-company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Optional"
                      className="mt-1.5"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" className="text-sm">Email Address *</Label>
                      <Input
                        id="email"
                        data-testid="input-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        className="mt-1.5"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-sm">WhatsApp Number *</Label>
                      <Input
                        id="phone"
                        data-testid="input-phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+252 615 401 195"
                        className="mt-1.5"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-base">Project Details</h3>
                  
                  <div>
                    <Label htmlFor="projectDetails" className="text-sm">Project Name / Description</Label>
                    <Input
                      id="projectDetails"
                      data-testid="input-project"
                      value={formData.projectDetails}
                      onChange={(e) => setFormData({ ...formData, projectDetails: e.target.value })}
                      placeholder="e.g., Villa Construction in Mogadishu"
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-sm">
                      Material Requirements {!attachedFile && "*"}
                    </Label>
                    <Textarea
                      id="description"
                      data-testid="input-description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the materials you need&#10;&#10;Example:&#10;- 100 bags of Portland Cement (50kg)&#10;- 50 pieces of Steel Rebar 10mm (6m)&#10;- 10 cubic meters of River Sand"
                      className="mt-1.5 min-h-[150px] resize-none"
                      rows={8}
                    />
                    <p className="text-xs text-muted-foreground mt-1.5">
                      List the materials, quantities, and specifications you need
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="file" className="text-sm">
                      Attach Document (BOQ, Material List) {!formData.description && "*"}
                    </Label>
                    <div className="mt-1.5">
                      <label
                        htmlFor="file"
                        data-testid="button-upload"
                        className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-accent transition-colors"
                      >
                        <div className="text-center">
                          {attachedFile ? (
                            <div className="flex flex-col items-center gap-2">
                              <Upload className="w-6 h-6 text-accent" />
                              <p className="text-sm font-medium text-accent truncate max-w-[250px]">
                                {attachedFile.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {(attachedFile.size / 1024).toFixed(1)} KB
                              </p>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                data-testid="button-remove-file"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setAttachedFile(null);
                                }}
                                className="text-xs"
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <Upload className="w-6 h-6 text-muted-foreground" />
                              <div className="space-y-1">
                                <p className="text-sm font-medium">Click to upload</p>
                                <p className="text-xs text-muted-foreground">
                                  PDF, Excel, or Word (Max 10MB)
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </label>
                      <input
                        id="file"
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.xls,.xlsx,.doc,.docx"
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    data-testid="button-submit"
                    className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground h-12 font-semibold"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Submit RFQ
                      </>
                    )}
                  </Button>
                  <Link to="/platform" className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      data-testid="button-platform"
                      className="w-full h-12 font-semibold"
                    >
                      Browse Catalog Instead
                    </Button>
                  </Link>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  By submitting, you agree to receive quotations from SOMVI via WhatsApp and email
                </p>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <div className="flex items-start gap-3">
              <MessageCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold mb-1">What happens next?</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>You'll receive an instant WhatsApp confirmation</li>
                  <li>Our team will review your requirements within 2-4 hours</li>
                  <li>We'll send you a detailed quotation with pricing and delivery timelines</li>
                  <li>You can approve and track your order through the platform</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateRFQ;

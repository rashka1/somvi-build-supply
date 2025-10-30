import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Plus, Trash2, Upload, Search, X, ShoppingCart } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface Material {
  id: string;
  name: string;
  description: string;
  unit: string;
  category: string;
  image?: string;
}

interface SelectedItem {
  id: string;
  name: string;
  unit: string;
  category: string;
  quantity: number;
}

const RFQManagement = () => {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    description: "",
    projectDetails: "",
  });
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadRFQs();
    loadMaterials();
  }, []);

  useEffect(() => {
    let filtered = materials;

    if (searchTerm) {
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter((m) => m.category === selectedCategory);
    }

    setFilteredMaterials(filtered);
  }, [searchTerm, selectedCategory, materials]);

  const loadRFQs = () => {
    const storedRFQs = JSON.parse(localStorage.getItem("rfqs") || "[]");
    setRfqs(storedRFQs);
  };

  const loadMaterials = () => {
    fetch("/data/materials.json")
      .then((res) => res.json())
      .then((data) => {
        setMaterials(data);
        setFilteredMaterials(data);
      })
      .catch((error) => {
        console.error("Error loading materials:", error);
        toast({
          title: "Error Loading Materials",
          description: "Could not load the materials catalog.",
          variant: "destructive",
        });
      });
  };

  const addMaterialToSelection = (material: Material) => {
    const existing = selectedItems.find((item) => item.id === material.id);
    if (existing) {
      toast({
        title: "Already Added",
        description: `${material.name} is already in the selection.`,
        variant: "destructive",
      });
      return;
    }
    
    setSelectedItems([
      ...selectedItems,
      {
        id: material.id,
        name: material.name,
        unit: material.unit,
        category: material.category,
        quantity: 1,
      },
    ]);
    
    toast({
      title: "Material Added",
      description: `${material.name} has been added to the RFQ.`,
    });
  };

  const removeItemFromSelection = (id: string) => {
    setSelectedItems(selectedItems.filter((item) => item.id !== id));
  };

  const updateItemQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromSelection(id);
      return;
    }
    setSelectedItems(
      selectedItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

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

  const resetForm = () => {
    setFormData({
      name: "",
      company: "",
      email: "",
      phone: "",
      description: "",
      projectDetails: "",
    });
    setAttachedFile(null);
    setSelectedItems([]);
    setSearchTerm("");
    setSelectedCategory("All");
  };

  const handleCreateRFQ = () => {
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

    if (selectedItems.length === 0 && !formData.description && !attachedFile) {
      toast({
        title: "Missing Materials",
        description: "Please select materials from the catalog or add description/document.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const newRFQ = {
      id: `RFQ-${Date.now()}`,
      date: new Date().toISOString(),
      client: {
        name: formData.name,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
      },
      items: selectedItems,
      description: formData.description,
      projectDetails: formData.projectDetails,
      status: "Pending" as const,
      attachedFileName: attachedFile?.name || null,
      type: "admin-created",
    };

    const existingRFQs = JSON.parse(localStorage.getItem("rfqs") || "[]");
    const updatedRFQs = [...existingRFQs, newRFQ];
    localStorage.setItem("rfqs", JSON.stringify(updatedRFQs));

    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "RFQ Created Successfully! ✅",
        description: `RFQ ${newRFQ.id} has been added to the system.`,
      });
      
      setRfqs(updatedRFQs);
      resetForm();
      setIsCreateDialogOpen(false);
    }, 500);
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
            <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-rfq">
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

        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New RFQ</DialogTitle>
              <DialogDescription>
                Enter client information and material requirements
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Client Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="admin-name" className="text-sm">Full Name *</Label>
                    <Input
                      id="admin-name"
                      data-testid="input-admin-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="admin-company" className="text-sm">Company Name</Label>
                    <Input
                      id="admin-company"
                      data-testid="input-admin-company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Optional"
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="admin-email" className="text-sm">Email Address *</Label>
                    <Input
                      id="admin-email"
                      data-testid="input-admin-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="admin-phone" className="text-sm">Phone Number *</Label>
                    <Input
                      id="admin-phone"
                      data-testid="input-admin-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+252 615 401 195"
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-sm">Project Details</h3>
                
                <div>
                  <Label htmlFor="admin-project" className="text-sm">Project Name</Label>
                  <Input
                    id="admin-project"
                    data-testid="input-admin-project"
                    value={formData.projectDetails}
                    onChange={(e) => setFormData({ ...formData, projectDetails: e.target.value })}
                    placeholder="e.g., Villa Construction"
                    className="mt-1.5"
                  />
                </div>

                {/* Selected Materials */}
                {selectedItems.length > 0 && (
                  <div>
                    <Label className="text-sm">Selected Materials ({selectedItems.length})</Label>
                    <div className="mt-1.5 space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                      {selectedItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-2 p-2 bg-muted rounded-md">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.category} • {item.unit}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                              className="w-16 h-8 text-sm"
                              data-testid={`input-quantity-${item.id}`}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 flex-shrink-0"
                              onClick={() => removeItemFromSelection(item.id)}
                              data-testid={`button-remove-${item.id}`}
                            >
                              <X className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-sm">Material Catalog *</Label>
                  <div className="mt-1.5 space-y-3">
                    {/* Search and Filter */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search materials..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9 h-9"
                          data-testid="input-search-materials"
                        />
                      </div>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-40 h-9" data-testid="select-category">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All</SelectItem>
                          {Array.from(new Set(materials.map((m) => m.category))).map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Materials List */}
                    <div className="border rounded-lg max-h-60 overflow-y-auto">
                      {filteredMaterials.length === 0 ? (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                          No materials found
                        </div>
                      ) : (
                        <div className="divide-y">
                          {filteredMaterials.map((material) => (
                            <div
                              key={material.id}
                              className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{material.name}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {material.category} • {material.unit}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => addMaterialToSelection(material)}
                                disabled={selectedItems.some((item) => item.id === material.id)}
                                data-testid={`button-add-${material.id}`}
                                className="ml-2 flex-shrink-0"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="admin-description" className="text-sm">
                    Additional Notes (Optional)
                  </Label>
                  <Textarea
                    id="admin-description"
                    data-testid="input-admin-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Any special requirements or notes..."
                    className="mt-1.5 min-h-[80px]"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="admin-file" className="text-sm">
                    Attach Document (Optional)
                  </Label>
                  <div className="mt-1.5">
                    <label
                      htmlFor="admin-file"
                      data-testid="button-admin-upload"
                      className="flex items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:border-accent transition-colors"
                    >
                      <div className="text-center">
                        {attachedFile ? (
                          <div className="flex flex-col items-center gap-1">
                            <Upload className="w-5 h-5 text-accent" />
                            <p className="text-xs font-medium text-accent truncate max-w-[200px]">
                              {attachedFile.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(attachedFile.size / 1024).toFixed(1)} KB
                            </p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              data-testid="button-admin-remove-file"
                              onClick={(e) => {
                                e.preventDefault();
                                setAttachedFile(null);
                              }}
                              className="text-xs mt-1"
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <Upload className="w-5 h-5 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              Upload PDF, Excel, or Word (Max 10MB)
                            </p>
                          </div>
                        )}
                      </div>
                    </label>
                    <input
                      id="admin-file"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.xls,.xlsx,.doc,.docx"
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateRFQ}
                disabled={isSubmitting}
                data-testid="button-submit-rfq"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create RFQ
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default RFQManagement;

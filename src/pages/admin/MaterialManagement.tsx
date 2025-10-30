import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Package, Power } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";

interface Material {
  id: string;
  name: string;
  category: string;
  description: string;
  unit: string;
  image: string;
  priceRange: string;
  sellingPrice: number;
  deliveryDays: string;
  enabled: boolean;
}

const MaterialManagement = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    unit: "pieces",
    image: "",
    priceRange: "",
    sellingPrice: 0,
    deliveryDays: "",
    enabled: true,
  });

  useEffect(() => {
    fetch("/data/materials.json")
      .then((res) => res.json())
      .then((data) => {
        const materialsWithStatus = data.map((m: any) => ({
          ...m,
          id: m.id || `MAT-${Date.now()}-${Math.random()}`,
          enabled: m.enabled !== undefined ? m.enabled : true,
        }));
        setMaterials(materialsWithStatus);
      });
  }, []);

  const categories = ["Cement", "Steel & Metal", "Aggregates", "Finishing Materials", "Tools & Equipment"];
  const units = ["pieces", "boxes", "bags", "tons", "meters", "m²"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingMaterial) {
      const updatedMaterials = materials.map((m) =>
        m.id === editingMaterial.id ? { ...formData, id: editingMaterial.id } : m
      );
      setMaterials(updatedMaterials);
      toast({ title: "Material updated successfully" });
    } else {
      const newMaterial = {
        ...formData,
        id: `MAT-${Date.now()}`,
      };
      setMaterials([...materials, newMaterial]);
      toast({ title: "Material added successfully" });
    }

    resetForm();
  };

  const deleteMaterial = (id: string) => {
    setMaterials(materials.filter((m) => m.id !== id));
    toast({ title: "Material deleted successfully" });
  };

  const toggleMaterial = (id: string) => {
    const updatedMaterials = materials.map((m) =>
      m.id === id ? { ...m, enabled: !m.enabled } : m
    );
    setMaterials(updatedMaterials);
    toast({ title: "Material status updated" });
  };

  const editMaterial = (material: Material) => {
    setEditingMaterial(material);
    setFormData(material);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      description: "",
      unit: "pieces",
      image: "",
      priceRange: "",
      sellingPrice: 0,
      deliveryDays: "",
      enabled: true,
    });
    setEditingMaterial(null);
    setIsDialogOpen(false);
  };

  return (
    <AdminLayout>
      <div className="section-container py-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Material Management</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingMaterial(null)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Material
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingMaterial ? "Edit Material" : "Add New Material"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Material Name</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Unit</Label>
                      <Select
                        value={formData.unit}
                        onValueChange={(value) => setFormData({ ...formData, unit: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Delivery Duration</Label>
                      <Input
                        value={formData.deliveryDays}
                        onChange={(e) => setFormData({ ...formData, deliveryDays: e.target.value })}
                        placeholder="e.g., 3-5 days"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Price Range (Display)</Label>
                      <Input
                        value={formData.priceRange}
                        onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
                        placeholder="e.g., 6.50-7.00"
                        required
                      />
                    </div>
                    <div>
                      <Label>Selling Price ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.sellingPrice}
                        onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Image URL</Label>
                    <Input
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.enabled}
                      onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
                    />
                    <Label>Enable in catalog</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingMaterial ? "Update" : "Add"} Material
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {materials.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No materials found.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Price Range</TableHead>
                    <TableHead>Selling Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium">{material.id}</TableCell>
                      <TableCell className="font-medium">{material.name}</TableCell>
                      <TableCell>{material.category}</TableCell>
                      <TableCell>{material.unit}</TableCell>
                      <TableCell>${material.priceRange}</TableCell>
                      <TableCell className="font-medium">${material.sellingPrice}</TableCell>
                      <TableCell>
                        <Badge variant={material.enabled ? "default" : "secondary"}>
                          {material.enabled ? "Active" : "Disabled"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleMaterial(material.id)}
                          >
                            <Power className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editMaterial(material)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteMaterial(material.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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

export default MaterialManagement;

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import Cart from "@/components/platform/Cart";
import { useToast } from "@/hooks/use-toast";

interface Material {
  id: string;
  name: string;
  description: string;
  unit: string;
  category: string;
  image?: string;
}

const Platform = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showCart, setShowCart] = useState(false);
  const { addToCart, cartCount } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    fetch("/data/materials.json")
      .then((res) => res.json())
      .then((data) => {
        setMaterials(data);
        setFilteredMaterials(data);
      });
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

  const categories = ["All", ...Array.from(new Set(materials.map((m) => m.category)))];

  const handleAddToCart = (material: Material) => {
    addToCart(material);
    toast({
      title: "Added to cart",
      description: `${material.name} has been added to your cart.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
        <div className="section-container py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold">
              SOMVI Platform
            </Link>
            <Button
              variant="secondary"
              onClick={() => setShowCart(true)}
              className="relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  {cartCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="section-container py-8">
        <h1 className="text-4xl font-bold mb-8">Construction Materials Catalog</h1>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat)}
                size="sm"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <Card key={material.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {material.image && (
                <div className="h-48 overflow-hidden bg-muted">
                  <img
                    src={material.image}
                    alt={material.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle>{material.name}</CardTitle>
                <CardDescription>{material.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">{material.description}</p>
                <p className="text-sm font-medium">Unit: {material.unit}</p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleAddToCart(material)} className="w-full">
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredMaterials.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No materials found matching your criteria.</p>
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      <Cart open={showCart} onClose={() => setShowCart(false)} />
    </div>
  );
};

export default Platform;

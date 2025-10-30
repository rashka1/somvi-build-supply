import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Search, FileText } from "lucide-react";
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
  priceRange?: string;
  deliveryDays?: string;
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
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg border-b border-primary/10">
        <div className="section-container py-4 md:py-5">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-lg md:text-xl">S</span>
              </div>
              <span className="text-xl md:text-2xl font-bold">SOMVI Platform</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link to="/my-rfqs">
                <Button
                  variant="outline"
                  className="hidden sm:flex border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                  size="lg"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Track RFQs
                </Button>
              </Link>
              <Button
                onClick={() => setShowCart(true)}
                className="relative bg-accent hover:bg-accent/90 text-accent-foreground"
                size="lg"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="hidden sm:inline ml-2">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                    {cartCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="section-container py-6 md:py-10">
        <div className="mb-8 md:mb-12 animate-fade-in">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 text-primary">
            Construction Materials Catalog
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Browse our collection of quality construction materials with competitive pricing
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 md:mb-8 space-y-4 animate-fade-in">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search materials by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat)}
                size="sm"
                className={selectedCategory === cat ? "bg-primary hover:bg-primary/90" : ""}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredMaterials.map((material) => (
            <Card key={material.id} className="overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
              {material.image && (
                <div className="h-40 md:h-48 overflow-hidden bg-muted relative group">
                  <img
                    src={material.image}
                    alt={material.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {material.deliveryDays && (
                    <div className="absolute top-2 right-2 bg-accent text-accent-foreground text-xs font-semibold px-2 py-1 rounded shadow-md">
                      {material.deliveryDays}
                    </div>
                  )}
                </div>
              )}
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">{material.name}</CardTitle>
                <CardDescription className="text-xs">{material.category}</CardDescription>
              </CardHeader>
              <CardContent className="pb-3 flex-grow">
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{material.description}</p>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Unit: <span className="font-medium text-foreground">{material.unit}</span></p>
                  {material.priceRange && (
                    <p className="text-sm font-bold text-primary">
                      ${material.priceRange} USD
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  onClick={() => handleAddToCart(material)} 
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
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

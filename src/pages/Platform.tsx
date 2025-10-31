import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Search, FileText, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import Cart from "@/components/platform/Cart";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Material {
  id: string;
  name: string;
  somali_name: string;
  description: string;
  unit: string;
  category: string;
  subcategory?: string;
  image_url?: string;
  active: boolean;
}

interface CategoryGroup {
  [key: string]: string[];
}

const Platform = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const { addToCart, cartCount } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching materials:', error);
      toast({
        title: "Error",
        description: "Failed to load materials. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      setMaterials(data);
      setFilteredMaterials(data);

      // Group by category and subcategory
      const groups: CategoryGroup = {};
      data.forEach((m) => {
        if (!groups[m.category]) {
          groups[m.category] = [];
        }
        if (m.subcategory && !groups[m.category].includes(m.subcategory)) {
          groups[m.category].push(m.subcategory);
        }
      });
      setCategoryGroups(groups);
    }
  };

  useEffect(() => {
    let filtered = materials;

    if (searchTerm) {
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.somali_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter((m) => m.category === selectedCategory);
    }

    if (selectedSubcategory) {
      filtered = filtered.filter((m) => m.subcategory === selectedSubcategory);
    }

    setFilteredMaterials(filtered);
  }, [searchTerm, selectedCategory, selectedSubcategory, materials]);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

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

      <div className="flex">
        {/* Categories Sidebar */}
        <aside className="hidden lg:block w-72 bg-card border-r border-border min-h-[calc(100vh-80px)] sticky top-20 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-bold text-lg mb-4">Categories</h3>
            <div className="space-y-2">
              <Button
                variant={selectedCategory === "All" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedSubcategory(null);
                }}
              >
                All Materials
              </Button>
              {Object.keys(categoryGroups).map((category) => (
                <div key={category}>
                  <Collapsible
                    open={expandedCategories.has(category)}
                    onOpenChange={() => toggleCategory(category)}
                  >
                    <div className="flex items-center">
                      <Button
                        variant={selectedCategory === category && !selectedSubcategory ? "default" : "ghost"}
                        className="flex-1 justify-start"
                        onClick={() => {
                          setSelectedCategory(category);
                          setSelectedSubcategory(null);
                        }}
                      >
                        {category}
                      </Button>
                      {categoryGroups[category].length > 0 && (
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                            {expandedCategories.has(category) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      )}
                    </div>
                    <CollapsibleContent className="pl-4 mt-1 space-y-1">
                      {categoryGroups[category].map((sub) => (
                        <Button
                          key={sub}
                          variant={selectedSubcategory === sub ? "secondary" : "ghost"}
                          className="w-full justify-start text-sm"
                          onClick={() => {
                            setSelectedCategory(category);
                            setSelectedSubcategory(sub);
                          }}
                        >
                          {sub}
                        </Button>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 section-container py-6 md:py-10">
          <div className="mb-8 md:mb-12 animate-fade-in">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 text-primary">
              Construction Materials Catalog
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Browse our collection of quality construction materials
            </p>
          </div>

          {/* Search */}
          <div className="mb-6 md:mb-8 animate-fade-in">
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search materials by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
          </div>

          {/* Materials Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {filteredMaterials.map((material) => (
              <Card key={material.id} className="overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                {material.image_url && (
                  <div className="h-40 md:h-48 overflow-hidden bg-muted relative group">
                    <img
                      src={material.image_url}
                      alt={material.somali_name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader className="pb-3">
                  <CardTitle className="text-base md:text-lg">{material.somali_name}</CardTitle>
                  <CardDescription className="text-xs">{material.category}</CardDescription>
                </CardHeader>
                <CardContent className="pb-3 flex-grow">
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{material.description}</p>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Unit: <span className="font-medium text-foreground">{material.unit}</span></p>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    onClick={() => {
                      addToCart({
                        id: material.id,
                        name: material.somali_name,
                        description: material.description || '',
                        unit: material.unit,
                        category: material.category,
                      });
                      toast({
                        title: "Added to RFQ",
                        description: `${material.somali_name} has been added to your request.`,
                      });
                    }} 
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to RFQ
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
      </div>

      {/* Cart Drawer */}
      <Cart open={showCart} onClose={() => setShowCart(false)} />
    </div>
  );
};

export default Platform;

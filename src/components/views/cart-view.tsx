"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useSaved, navigate } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PremiumCard } from "@/components/shared/enterprise";
import { SectionShell, SectionHeading } from "@/components/shared/section";
import { captureSafeEvent } from "@/lib/analytics-client";
import { 
  ShoppingBag, 
  Trash2, 
  ArrowLeft, 
  ArrowRight, 
  Tag, 
  Percent, 
  Loader2, 
  Bookmark,
  FlaskConical,
  Activity,
  Syringe,
  Droplet,
  Armchair,
  Stethoscope,
  HeartPulse,
  Video,
  Monitor,
  CreditCard,
  BadgeCheck,
  ShieldCheck,
  Megaphone,
  Users,
  MessageSquare,
  Package
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { colorClasses } from "@/lib/constants";

function CategoryIcon({ category, className }: { category: string; className?: string }) {
  switch (category) {
    case "Laboratory Services":
    case "Laboratory and Diagnostics":
      return <FlaskConical className={className} />;
    case "Diagnostic Equipment":
    case "Medical Equipment":
      return <Activity className={className} />;
    case "Injection Supplies":
    case "Clinical Supplies":
      return <Syringe className={className} />;
    case "Phlebotomy Supplies":
      return <Droplet className={className} />;
    case "Medical Furniture":
    case "Exam Room and Facility":
      return <Armchair className={className} />;
    case "Body-Composition Systems":
      return <Stethoscope className={className} />;
    case "Recovery Technology":
    case "Wellness and Recovery":
      return <HeartPulse className={className} />;
    case "Telehealth Tools":
    case "Telehealth Technology":
      return <Video className={className} />;
    case "Clinic Software":
    case "Healthcare Software":
      return <Monitor className={className} />;
    case "Billing Services":
    case "Billing and Revenue Cycle":
      return <CreditCard className={className} />;
    case "Credentialing Services":
    case "Credentialing and Compliance":
      return <BadgeCheck className={className} />;
    case "Compliance Support":
      return <ShieldCheck className={className} />;
    case "Marketing Services":
    case "Marketing and Patient Growth":
      return <Megaphone className={className} />;
    case "Staffing Services":
    case "Staffing and Workforce Services":
      return <Users className={className} />;
    case "Patient Engagement Tools":
      return <MessageSquare className={className} />;
    default:
      return <Package className={className} />;
  }
}

export function CartView() {
  const { items, updateQuantity, removeItem } = useCart();
  const savedProducts = useSaved((s) => s.products);
  const toggleSaved = useSaved((s) => s.toggle);

  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0); // in dollars
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  // Subtotal calculations
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  // Shipping calculation
  const shipping = subtotal > 500 || subtotal === 0 ? 0 : 25; // free over $500
  
  // Tax estimate
  const tax = subtotal * 0.0825; // 8.25% mock tax
  
  const finalTotal = subtotal + shipping + tax - discount;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    setPromoLoading(true);
    setTimeout(() => {
      setPromoLoading(false);
      const code = promoCode.trim().toUpperCase();
      if (code === "HEALTH10" || code === "NOVALYTE") {
        const discVal = subtotal * 0.1; // 10% off subtotal
        setDiscount(discVal);
        setAppliedPromo(code);
        toast.success(`Promo code ${code} applied successfully! (10% off)`);
      } else {
        toast.error("Invalid promo code. Try 'HEALTH10' or 'NOVALYTE'.");
      }
    }, 800);
  };

  const handleSaveForLater = (item: any) => {
    // Add to saved list if not already saved
    if (!savedProducts.includes(item.id)) {
      toggleSaved("product", item.id);
      toast.success(`"${item.title}" saved to your list.`);
    } else {
      toast.info(`"${item.title}" is already in your saved list.`);
    }
  };

  if (items.length === 0) {
    return (
      <SectionShell className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-50 border border-neutral-200 shadow-premium-sm mb-4">
          <ShoppingBag className="h-8 w-8 text-neutral-400" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Your shopping cart is empty</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          Browse our catalog of clinical supplies, laboratory tools, telehealth technology, and office essentials.
        </p>
        <Button 
          className="mt-6 bg-teal-600 hover:bg-teal-700 text-white font-semibold"
          onClick={() => navigate("marketplace")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Continue Sourcing
        </Button>
      </SectionShell>
    );
  }

  return (
    <SectionShell className="!py-12 bg-neutral-50/30">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center gap-3 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-foreground font-semibold"
            onClick={() => navigate("marketplace")}
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Marketplace
          </Button>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-8">Shopping Cart</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const c = colorClasses(item.imageColor);
              return (
                <PremiumCard key={`${item.id}-${item.variant}`} className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white">
                  {/* Category icon image wrapper */}
                  <div className={cn("flex h-16 w-16 shrink-0 items-center justify-center rounded-xl", c.bg)}>
                    <CategoryIcon category={item.category} className="h-8 w-8 text-white/90" />
                  </div>

                  {/* Item metadata */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <button 
                      onClick={() => navigate("product-detail", undefined, { id: item.id })}
                      className="text-left font-semibold text-foreground hover:text-teal-700 leading-snug line-clamp-1"
                    >
                      {item.title}
                    </button>
                    <p className="text-xs text-muted-foreground">{item.vendorName}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-800">
                        {item.variant}
                      </span>
                    </div>
                  </div>

                  {/* Quantity and Actions */}
                  <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    {/* Quantity selectors */}
                    <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden h-9 bg-white">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.variant, item.quantity - 1)}
                        className="px-3 hover:bg-neutral-50 text-neutral-500 font-bold transition-colors"
                      >
                        -
                      </button>
                      <span className="w-10 text-center text-sm font-semibold text-foreground">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.variant, item.quantity + 1)}
                        className="px-3 hover:bg-neutral-50 text-neutral-500 font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>

                    {/* Price display */}
                    <div className="text-right min-w-[80px]">
                      <p className="text-sm font-bold text-foreground">
                        ${(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        ${item.price.toFixed(2)} ea
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-teal-700 hover:bg-teal-50"
                        onClick={() => handleSaveForLater(item)}
                        title="Save for Later"
                      >
                        <Bookmark className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
                        onClick={() => {
                          removeItem(item.id, item.variant);
                          toast.success(`Removed "${item.title}" from cart.`);
                        }}
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </PremiumCard>
              );
            })}
          </div>

          {/* Cart Summary Card */}
          <div className="space-y-4">
            <PremiumCard className="p-6 bg-white space-y-6">
              <h3 className="text-lg font-bold text-foreground">Order Summary</h3>
              
              <div className="space-y-3.5 text-sm border-b border-neutral-100 pb-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-foreground">
                    {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Estimated Tax</span>
                  <span className="font-semibold text-foreground">${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span className="flex items-center gap-1"><Percent className="h-3.5 w-3.5" /> Discount ({appliedPromo})</span>
                    <span>-${discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-end">
                <span className="text-base font-bold text-foreground">Total</span>
                <span className="text-xl font-bold text-teal-700">
                  ${finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Promo code form */}
              <form onSubmit={handleApplyPromo} className="space-y-2">
                <Label htmlFor="promo" className="text-xs font-semibold text-muted-foreground">Promo Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="promo"
                    placeholder="e.g. HEALTH10"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={appliedPromo !== null}
                    className="bg-white border-neutral-200 h-9 text-xs"
                  />
                  <Button 
                    type="submit" 
                    variant="outline" 
                    disabled={promoLoading || appliedPromo !== null}
                    className="h-9 px-3 text-xs font-bold border-neutral-200 hover:border-teal-300"
                  >
                    {promoLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Apply"}
                  </Button>
                </div>
              </form>

              <Button 
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold h-11 flex items-center justify-center gap-2 rounded-xl"
                onClick={() => {
                  captureSafeEvent("marketplace_checkout_started", {
                    item_count: items.length,
                  });
                  navigate("checkout");
                }}
              >
                Proceed to Checkout <ArrowRight className="h-4 w-4" />
              </Button>
            </PremiumCard>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

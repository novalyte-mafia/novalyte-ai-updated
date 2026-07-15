"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import { navigate } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PremiumCard } from "@/components/shared/enterprise";
import { SectionShell } from "@/components/shared/section";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  CreditCard, 
  Truck, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  Building,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, name: "Contact" },
  { id: 2, name: "Shipping" },
  { id: 3, name: "Delivery" },
  { id: 4, name: "Billing" },
  { id: 5, name: "Payment" },
  { id: 6, name: "Review" },
];

export function CheckoutView() {
  const { items, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [orderNumber] = useState(() => `NV-${Math.floor(100000 + Math.random() * 900000)}`);

  // Step 1: Contact
  const [contact, setContact] = useState({
    name: "",
    email: "",
    phone: "",
    orgName: "",
    orgType: "clinic", // clinic | hospital | practice | wellness | other
  });

  // Step 2: Shipping
  const [shipping, setShipping] = useState({
    address: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
    deliveryInstructions: "",
  });

  // Step 3: Shipping Method
  const [shippingMethod, setShippingMethod] = useState("standard"); // standard | expedited | freight | supplier-arranged

  // Step 4: Billing
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billing, setBilling] = useState({
    address: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
    taxExempt: false,
    poNumber: "",
    taxId: "",
  });

  // Step 5: Payment
  const [paymentMethod, setPaymentMethod] = useState("card"); // card | po | invoice
  const [paymentCard, setPaymentCard] = useState({
    number: "",
    expiry: "",
    cvc: "",
    nameOnCard: "",
  });

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingCost = shippingMethod === "expedited" ? 45 : shippingMethod === "freight" ? 150 : subtotal > 500 || subtotal === 0 ? 0 : 25;
  const tax = subtotal * 0.0825;
  const finalTotal = subtotal + shippingCost + tax;

  const nextStep = () => {
    // Basic validation
    if (currentStep === 1) {
      if (!contact.name || !contact.email || !contact.phone || !contact.orgName) {
        toast.error("Please fill in all contact information.");
        return;
      }
    }
    if (currentStep === 2) {
      if (!shipping.address || !shipping.city || !shipping.state || !shipping.zip) {
        toast.error("Please complete the shipping address.");
        return;
      }
    }
    if (currentStep === 4 && !billingSameAsShipping) {
      if (!billing.address || !billing.city || !billing.state || !billing.zip) {
        toast.error("Please complete the billing address.");
        return;
      }
    }
    if (currentStep === 5 && paymentMethod === "card") {
      if (!paymentCard.number || !paymentCard.expiry || !paymentCard.cvc) {
        toast.error("Please complete the payment details.");
        return;
      }
    }

    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handlePlaceOrder = () => {
    // Place simulated order
    toast.success("Order placed successfully!", {
      description: `Order number: ${orderNumber}`,
    });
    setCurrentStep(7); // Show confirmation step
  };

  // Step 7: Order Confirmation View
  if (currentStep === 7) {
    return (
      <SectionShell className="min-h-[70vh] flex flex-col items-center justify-center py-16 px-4">
        <div className="w-full max-w-xl text-center space-y-6 bg-white border border-neutral-200/80 p-8 rounded-3xl shadow-premium-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200 shadow-premium-sm mx-auto">
            <Check className="h-8 w-8 text-emerald-600" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Thank you for your order!</h2>
            <p className="text-sm text-muted-foreground">
              Your order has been placed and routed to the corresponding suppliers.
            </p>
          </div>

          <div className="border border-neutral-100 bg-neutral-50/50 rounded-2xl p-5 text-left space-y-3.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-medium">Order Number:</span>
              <span className="font-bold text-foreground font-mono">{orderNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-medium">Fulfillment Email:</span>
              <span className="font-semibold text-foreground">{contact.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-medium">Ship To:</span>
              <span className="font-semibold text-foreground text-right max-w-xs truncate">
                {shipping.address}, {shipping.city}, {shipping.state}
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-neutral-100">
              <span className="text-muted-foreground font-medium">Fulfillment Timeline:</span>
              <span className="font-semibold text-teal-700">Estimated 3–7 business days</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
            A confirmation email notice has been sent to your registered address. For questions or order modifications, please reference your order number in contacts.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold h-11 rounded-xl"
              onClick={() => {
                clearCart();
                navigate("marketplace");
              }}
            >
              Continue Sourcing
            </Button>
          </div>
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell className="!py-12 bg-neutral-50/30">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Checkout</h1>
          <Button variant="ghost" size="sm" onClick={() => navigate("cart")} className="font-semibold text-muted-foreground">
            <ArrowLeft className="mr-1 h-4 w-4" /> Cart
          </Button>
        </div>

        {/* Step indicator bar */}
        <div className="mb-10 max-w-3xl mx-auto">
          <div className="flex items-center justify-between relative">
            {STEPS.map((s, idx) => (
              <div key={s.id} className="flex flex-col items-center z-10">
                <div 
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold transition-all duration-300",
                    currentStep > s.id 
                      ? "bg-teal-600 border-teal-600 text-white"
                      : currentStep === s.id 
                      ? "border-teal-600 bg-white text-teal-700 shadow-premium-sm"
                      : "border-neutral-200 bg-white text-muted-foreground"
                  )}
                >
                  {currentStep > s.id ? <Check className="h-4 w-4" /> : s.id}
                </div>
                <span className="text-[10px] font-bold text-muted-foreground mt-1.5 hidden sm:block">
                  {s.name}
                </span>
              </div>
            ))}
            {/* Background progress line */}
            <div className="absolute left-4 right-4 top-4.5 h-[2px] bg-neutral-200 -z-10" />
            <div 
              className="absolute left-4 top-4.5 h-[2px] bg-teal-600 -z-10 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 96}%` }}
            />
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form Step Section */}
          <div className="lg:col-span-2 space-y-6">
            <PremiumCard className="p-6 bg-white border-neutral-200/80">
              
              {/* Step 1: Contact Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-foreground">Contact Information</h3>
                  <p className="text-xs text-muted-foreground">Please provide clinical workspace identifiers for delivery checks.</p>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="contactName">Full Name *</Label>
                      <Input
                        id="contactName"
                        value={contact.name}
                        onChange={(e) => setContact({ ...contact, name: e.target.value })}
                        placeholder="Dr. Jordan Carter"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="contactEmail">Work Email *</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={contact.email}
                        onChange={(e) => setContact({ ...contact, email: e.target.value })}
                        placeholder="jordan.carter@novalyte.io"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="contactPhone">Telephone *</Label>
                      <Input
                        id="contactPhone"
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                        placeholder="(555) 019-2834"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="contactOrg">Organization Name *</Label>
                      <Input
                        id="contactOrg"
                        value={contact.orgName}
                        onChange={(e) => setContact({ ...contact, orgName: e.target.value })}
                        placeholder="Novalyte Wellness Clinic"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="contactOrgType">Organization Type *</Label>
                    <select
                      id="contactOrgType"
                      value={contact.orgType}
                      onChange={(e) => setContact({ ...contact, orgType: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="clinic">Outpatient Clinic</option>
                      <option value="practice">Private Medical Practice</option>
                      <option value="hospital">Hospital Facility</option>
                      <option value="wellness">Wellness or Longevity Center</option>
                      <option value="telehealth">Telehealth Care Provider</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Step 2: Shipping Address */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-foreground">Shipping Address</h3>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="shipAddress">Address *</Label>
                    <Input
                      id="shipAddress"
                      value={shipping.address}
                      onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                      placeholder="1204 Pine St"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="shipAddress2">Address Line 2</Label>
                    <Input
                      id="shipAddress2"
                      value={shipping.address2}
                      onChange={(e) => setShipping({ ...shipping, address2: e.target.value })}
                      placeholder="Suite 400"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="shipCity">City *</Label>
                      <Input
                        id="shipCity"
                        value={shipping.city}
                        onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                        placeholder="Austin"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="shipState">State *</Label>
                      <Input
                        id="shipState"
                        value={shipping.state}
                        onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                        placeholder="TX"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="shipZip">ZIP / Postal Code *</Label>
                      <Input
                        id="shipZip"
                        value={shipping.zip}
                        onChange={(e) => setShipping({ ...shipping, zip: e.target.value })}
                        placeholder="78701"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="shipInstructions">Delivery Instructions</Label>
                    <Textarea
                      id="shipInstructions"
                      value={shipping.deliveryInstructions}
                      onChange={(e) => setShipping({ ...shipping, deliveryInstructions: e.target.value })}
                      placeholder="Deliver to clinic loading dock or front desk."
                      className="resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Shipping Method */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-foreground">Delivery Method</h3>
                  
                  <div className="space-y-3">
                    {[
                      { id: "standard", label: "Standard Delivery (3-5 days)", desc: "Ground dispatch. Free over $500 orders.", cost: subtotal > 500 ? "FREE" : "$25.00" },
                      { id: "expedited", label: "Expedited Dispatch (1-2 days)", desc: "Priority clinical courier routing.", cost: "$45.00" },
                      { id: "freight", label: "Special Freight Delivery", desc: "For clinical equipment requiring tailgates or white-glove setup.", cost: "$150.00" },
                    ].map((method) => (
                      <label 
                        key={method.id}
                        className={cn(
                          "flex items-start justify-between p-4 border rounded-2xl cursor-pointer hover:bg-neutral-50 transition-colors",
                          shippingMethod === method.id ? "border-teal-600 bg-teal-50/20" : "border-neutral-200"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="shippingMethod"
                            checked={shippingMethod === method.id}
                            onChange={() => setShippingMethod(method.id)}
                            className="mt-1 accent-teal-600"
                          />
                          <div>
                            <p className="font-semibold text-sm text-foreground">{method.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{method.desc}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-teal-700">{method.cost}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Billing */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-foreground">Billing Information</h3>
                  
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={billingSameAsShipping}
                      onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                      className="accent-teal-600"
                    />
                    <span>Billing address same as shipping</span>
                  </label>

                  {!billingSameAsShipping && (
                    <div className="space-y-4 pt-3 border-t border-neutral-100">
                      <div className="space-y-1.5">
                        <Label htmlFor="billAddress">Billing Address *</Label>
                        <Input
                          id="billAddress"
                          value={billing.address}
                          onChange={(e) => setBilling({ ...billing, address: e.target.value })}
                          placeholder="405 Congress Ave"
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <Input
                          placeholder="City"
                          value={billing.city}
                          onChange={(e) => setBilling({ ...billing, city: e.target.value })}
                        />
                        <Input
                          placeholder="State"
                          value={billing.state}
                          onChange={(e) => setBilling({ ...billing, state: e.target.value })}
                        />
                        <Input
                          placeholder="ZIP"
                          value={billing.zip}
                          onChange={(e) => setBilling({ ...billing, zip: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 pt-4 border-t border-neutral-100">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={billing.taxExempt}
                        onChange={(e) => setBilling({ ...billing, taxExempt: e.target.checked })}
                        className="accent-teal-600"
                      />
                      <span>My organization is Tax-Exempt</span>
                    </label>

                    {billing.taxExempt && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label htmlFor="billTaxId">Tax ID or Exemption Number</Label>
                          <Input
                            id="billTaxId"
                            value={billing.taxId}
                            onChange={(e) => setBilling({ ...billing, taxId: e.target.value })}
                            placeholder="TX-EX-998811"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="billPO">Purchase Order (PO) Number</Label>
                          <Input
                            id="billPO"
                            value={billing.poNumber}
                            onChange={(e) => setBilling({ ...billing, poNumber: e.target.value })}
                            placeholder="PO-2026-09"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 5: Payment */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-foreground">Payment Method</h3>
                  
                  <div className="flex gap-3 mb-6">
                    {[
                      { id: "card", label: "Credit Card", icon: CreditCard },
                      { id: "po", label: "Purchase Order", icon: FileText },
                      { id: "invoice", label: "Net 30 Invoice", icon: Building },
                    ].map((p) => {
                      const Icon = p.icon;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPaymentMethod(p.id)}
                          className={cn(
                            "flex-1 flex flex-col items-center justify-center p-4 border rounded-2xl text-xs font-bold transition-all",
                            paymentMethod === p.id 
                              ? "border-teal-600 bg-teal-50/20 text-teal-800" 
                              : "border-neutral-200 text-muted-foreground hover:bg-neutral-50"
                          )}
                        >
                          <Icon className="h-5 w-5 mb-1.5" />
                          {p.label}
                        </button>
                      );
                    })}
                  </div>

                  {paymentMethod === "card" && (
                    <div className="space-y-3.5">
                      <div className="space-y-1.5">
                        <Label htmlFor="cardNum">Card Number *</Label>
                        <Input
                          id="cardNum"
                          value={paymentCard.number}
                          onChange={(e) => setPaymentCard({ ...paymentCard, number: e.target.value })}
                          placeholder="4111 2222 3333 4444"
                          maxLength={19}
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="space-y-1.5 sm:col-span-2">
                          <Label htmlFor="cardExpiry">Expiration *</Label>
                          <Input
                            id="cardExpiry"
                            value={paymentCard.expiry}
                            onChange={(e) => setPaymentCard({ ...paymentCard, expiry: e.target.value })}
                            placeholder="MM / YY"
                            maxLength={5}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="cardCvc">CVC / CVV *</Label>
                          <Input
                            id="cardCvc"
                            value={paymentCard.cvc}
                            onChange={(e) => setPaymentCard({ ...paymentCard, cvc: e.target.value })}
                            placeholder="321"
                            maxLength={4}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="cardName">Cardholder Name</Label>
                        <Input
                          id="cardName"
                          value={paymentCard.nameOnCard}
                          onChange={(e) => setPaymentCard({ ...paymentCard, nameOnCard: e.target.value })}
                          placeholder="Jordan Carter"
                        />
                      </div>
                      <div className="p-3 bg-neutral-50 border border-neutral-100 rounded-xl flex items-start gap-2.5 mt-2">
                        <Info className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-muted-foreground leading-normal">
                          Novalyte B2B gateway is in sandbox mode. Stripe Integration is staging; card details are parsed but not charged live.
                        </p>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "po" && (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="poNumberInput">PO Number *</Label>
                        <Input
                          id="poNumberInput"
                          placeholder="PO-991823"
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Purchase orders will be reviewed by suppliers. Subject to credential checks and account standing.
                      </p>
                    </div>
                  )}

                  {paymentMethod === "invoice" && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">Net 30 Invoicing</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Invoices will be sent to the billing email address. Please make sure your organization is approved for direct invoicing terms before completing purchase.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 6: Review */}
              {currentStep === 6 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-foreground">Order Review</h3>
                  
                  <div className="grid gap-6 sm:grid-cols-2 text-sm text-muted-foreground border-b border-neutral-100 pb-4">
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground text-xs uppercase tracking-wider">Shipping Destination</p>
                      <p className="text-foreground font-medium">{contact.name}</p>
                      <p className="text-xs leading-normal">{shipping.address}, Suite: {shipping.address2 || "—"}, {shipping.city}, {shipping.state} {shipping.zip}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground text-xs uppercase tracking-wider">Billing &amp; Payment</p>
                      <p className="text-xs capitalize font-medium text-foreground">Method: {paymentMethod === "card" ? "Credit Card" : paymentMethod === "po" ? "Purchase Order" : "Invoice Request"}</p>
                      <p className="text-xs leading-normal">Billing address: {billingSameAsShipping ? "Same as shipping" : `${billing.address}, ${billing.city}, ${billing.state}`}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="font-semibold text-foreground text-xs uppercase tracking-wider">Items in Order</p>
                    {items.map((item) => (
                      <div key={`${item.id}-${item.variant}`} className="flex justify-between items-center text-sm border-b border-neutral-50 pb-2">
                        <div>
                          <p className="font-medium text-foreground">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.vendorName} · {item.variant}</p>
                        </div>
                        <span className="font-bold text-foreground text-xs">
                          {item.quantity} x ${item.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation button panel */}
              <div className="flex justify-between mt-8 pt-4 border-t border-neutral-100">
                {currentStep > 1 ? (
                  <Button variant="outline" onClick={prevStep} className="font-semibold">
                    Back
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep < 6 ? (
                  <Button 
                    className="bg-teal-600 hover:bg-teal-700 text-white font-semibold flex items-center gap-1.5"
                    onClick={nextStep}
                  >
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center gap-1.5"
                    onClick={handlePlaceOrder}
                  >
                    Place Order
                  </Button>
                )}
              </div>
            </PremiumCard>
          </div>

          {/* Right Column: Mini Cart Summary */}
          <div className="space-y-4">
            <PremiumCard className="p-6 bg-white border-neutral-200/80">
              <h3 className="text-base font-bold text-foreground mb-4">Cart Summary</h3>
              <div className="space-y-3 border-b border-neutral-100 pb-4 mb-4 max-h-48 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={`${item.id}-${item.variant}`} className="flex justify-between text-xs">
                    <span className="text-muted-foreground truncate max-w-[160px]">
                      {item.title}
                    </span>
                    <span className="font-semibold text-foreground">
                      {item.quantity} x ${item.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-xs text-muted-foreground border-b border-neutral-100 pb-3 mb-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax</span>
                  <span>${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-foreground">Final Total</span>
                <span className="text-lg font-bold text-teal-700">
                  ${finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </PremiumCard>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

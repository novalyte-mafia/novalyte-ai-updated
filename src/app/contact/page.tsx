"use client";

import { useState } from "react";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { captureSafeEvent } from "@/lib/analytics-client";
import { 
  Loader2, CheckCircle2, User, Building2, Stethoscope, 
  Briefcase, ShoppingBag, ShieldAlert, Globe, FileText, 
  HelpCircle, ChevronRight, Mail, MapPin, AlertCircle
} from "lucide-react";

// Types
type SenderType =
  | "patient"
  | "clinic"
  | "professional"
  | "employer"
  | "vendor"
  | "seller"
  | "technology"
  | "press"
  | "investor"
  | "legal"
  | "general"
  | "other";

interface FormFields {
  senderType: SenderType | "";
  inquiryCategory: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  organizationName: string;
  organizationWebsite: string;
  jobTitle: string;
  city: string;
  state: string;
  preferredContactMethod: string;
  hasExistingAccount: boolean;
  relevantUrl: string;
  subject: string;
  message: string;
}

// Config lists
const SENDER_IDENTITIES = [
  { id: "patient", label: "Patient or Prospective Patient", icon: User, desc: "Find care or support using the platform." },
  { id: "clinic", label: "Clinic Owner or Representative", icon: Building2, desc: "List your clinic, claim a listing, or grow." },
  { id: "professional", label: "Healthcare Professional", icon: Stethoscope, desc: "Apply for jobs or manage your credentials." },
  { id: "employer", label: "Employer or Hiring Organization", icon: Briefcase, desc: "Source specialized talent and medical staff." },
  { id: "vendor", label: "Vendor or Service Provider", icon: Globe, desc: "Propose equipment, supplies, or services." },
  { id: "seller", label: "Marketplace Brand or Seller", icon: ShoppingBag, desc: "Partner or list products on our marketplace." },
  { id: "technology", label: "Technology or Integration Partner", icon: Globe, desc: "API integrations, security, or database partnership." },
  { id: "press", label: "Media or Press", icon: FileText, desc: "Interview requests or company information." },
  { id: "investor", label: "Investor or Strategic Partner", icon: HelpCircle, desc: "Strategic or business development inquiries." },
  { id: "legal", label: "Privacy or Legal Inquiry", icon: ShieldAlert, desc: "Data privacy requests, terms, or legal notices." },
  { id: "general", label: "General Inquiry", icon: HelpCircle, desc: "General questions about Novalyte AI." },
  { id: "other", label: "Other", icon: HelpCircle, desc: "Any other type of request." },
];

const CATEGORIES_BY_SENDER: Record<SenderType, string[]> = {
  patient: [
    "Finding a clinic",
    "Help using the provider directory",
    "Patient assessment support",
    "Questions about a clinic listing",
    "Privacy or personal-data request",
    "Technical issue",
    "General question"
  ],
  clinic: [
    "Apply to list a clinic",
    "Claim an existing clinic listing",
    "Update clinic information",
    "Patient-growth partnership",
    "Directory support",
    "Marketplace partnership",
    "Workforce hiring support",
    "Technical support",
    "Billing or account question",
    "General clinic inquiry"
  ],
  professional: [
    "Professional account support",
    "Profile or credential support",
    "Job application support",
    "Opportunity inquiry",
    "Login or password issue",
    "Privacy request",
    "General workforce inquiry"
  ],
  employer: [
    "Employer account access",
    "Hiring support",
    "Post a role",
    "Applicant support",
    "Workforce partnership",
    "Employer portal question",
    "Technical issue",
    "General inquiry"
  ],
  vendor: [
    "Vendor introduction",
    "Clinical services",
    "Equipment or supplies",
    "Operational services",
    "Technology services",
    "Partnership proposal",
    "Existing vendor support"
  ],
  seller: [
    "Apply to sell",
    "Product listing support",
    "Brand partnership",
    "Affiliate partnership",
    "Existing listing issue",
    "Marketplace policy question"
  ],
  technology: [
    "API integration",
    "Data partnership",
    "Supabase or infrastructure inquiry",
    "Platform integration",
    "Security inquiry",
    "Technical partnership"
  ],
  press: [
    "Interview request",
    "Founder inquiry",
    "Company information",
    "Press partnership",
    "Brand assets"
  ],
  investor: [
    "Investment inquiry",
    "Strategic partnership",
    "Business-development inquiry",
    "Corporate partnership"
  ],
  legal: [
    "Data access request",
    "Data correction request",
    "Data deletion request",
    "Privacy question",
    "Terms question",
    "Legal notice"
  ],
  general: [
    "General feedback",
    "Partnership questions",
    "General support request"
  ],
  other: [
    "Other general inquiry"
  ],
};

const INITIAL_FIELDS: FormFields = {
  senderType: "",
  inquiryCategory: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  organizationName: "",
  organizationWebsite: "",
  jobTitle: "",
  city: "",
  state: "",
  preferredContactMethod: "email",
  hasExistingAccount: false,
  relevantUrl: "",
  subject: "",
  message: "",
};

export default function ContactPage() {
  const [fields, setFields] = useState<FormFields>(INITIAL_FIELDS);
  const [charCount, setCharCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [refNum, setRefNum] = useState("");
  const [consentAccepted, setConsentAccepted] = useState(false);

  // Honeypot & Timing
  const [honeypot, setHoneypot] = useState("");
  const [loadTime] = useState(() => Date.now());

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));

    if (name === "message") {
      setCharCount(value.length);
    }
  };

  const handleCheckboxChange = (name: keyof FormFields, checked: boolean) => {
    setFields((prev) => ({ ...prev, [name]: checked }));
  };

  const selectSenderType = (type: SenderType) => {
    setFields((prev) => ({
      ...prev,
      senderType: type,
      inquiryCategory: CATEGORIES_BY_SENDER[type][0] || "",
    }));
  };

  const resetForm = () => {
    setFields(INITIAL_FIELDS);
    setCharCount(0);
    setConsentAccepted(false);
    setSuccess(false);
  };

  const subscribeToNewsletter = async (email: string) => {
    const response = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error("Newsletter subscription failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot spam check
    if (honeypot) {
      console.warn("Spam detected");
      toast.success("Inquiry received. Thank you!");
      setSuccess(true);
      setRefNum("REF-20260715-SPAM");
      return;
    }

    // Minimum timing check (reject bots submitting under 2 seconds)
    const timeElapsed = Date.now() - loadTime;
    if (timeElapsed < 2000) {
      console.warn("Spam timing detected");
      toast.error("Form submitted too quickly. Please try again.");
      return;
    }

    // Client-side validations
    if (!fields.senderType) {
      toast.error("Please select which best describes you.");
      return;
    }
    if (!fields.inquiryCategory) {
      toast.error("Please select an inquiry category.");
      return;
    }
    if (!fields.firstName || !fields.lastName) {
      toast.error("First name and Last name are required.");
      return;
    }
    if (!fields.email || !fields.email.includes("@")) {
      toast.error("A valid email address is required.");
      return;
    }
    if (!fields.subject.trim()) {
      toast.error("Please enter a subject.");
      return;
    }
    if (fields.message.length < 10) {
      toast.error("Message must be at least 10 characters long.");
      return;
    }
    if (fields.message.length > 5000) {
      toast.error("Message exceeds the 5,000 character limit.");
      return;
    }
    if (!consentAccepted) {
      toast.error("You must accept the privacy policy to submit.");
      return;
    }

    setLoading(true);
    captureSafeEvent("contact_form_started", { form_type: "contact" });

    try {
      // Extract query parameters for UTM tracking
      const urlParams = new URLSearchParams(window.location.search);
      const utm_source = urlParams.get("utm_source") || null;
      const utm_medium = urlParams.get("utm_medium") || null;
      const utm_campaign = urlParams.get("utm_campaign") || null;

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fields,
          utm_source,
          utm_medium,
          utm_campaign,
          sourcePage: window.location.href,
        }),
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        toast.success("Inquiry submitted successfully!");
        setRefNum(data.referenceNumber);
        setSuccess(true);
        captureSafeEvent("contact_form_submitted", {
          form_type: "contact",
          sender_type: fields.senderType,
        });
      } else {
        captureSafeEvent("form_submission_error", { form_type: "contact" });
        toast.error(data.error || "Failed to submit inquiry. Please try again.");
      }
    } catch (err) {
      console.error("Submission error", err);
      captureSafeEvent("form_submission_error", { form_type: "contact" });
      toast.error("A connection error occurred. Your input was preserved so you can try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header onGetStarted={() => {}} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-border bg-gradient-to-b from-accent/45 via-background to-background px-4 py-14 sm:py-16">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl">
              How can Novalyte <span className="text-primary">help?</span>
            </h1>
            <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
              Tell us who you are and what you need. We’ll route your message to the appropriate Novalyte team immediately.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-[1240px] w-full">
            {success ? (
              // Success Screen
              <div className="mx-auto max-w-xl bg-white border border-neutral-200 p-8 rounded-3xl shadow-premium-md text-center space-y-6">
                <div className="flex justify-center">
                  <CheckCircle2 className="h-16 w-16 animate-pulse text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900">Inquiry Received</h2>
                <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100 space-y-2 text-left">
                  <p className="text-sm text-neutral-600">
                    <span className="font-semibold text-neutral-800">Reference Number:</span> {refNum}
                  </p>
                  <p className="text-sm text-neutral-600">
                    <span className="font-semibold text-neutral-800">Category:</span> {fields.inquiryCategory}
                  </p>
                  <p className="text-sm text-neutral-600">
                    <span className="font-semibold text-neutral-800">Status:</span> We have routed your request to our team. A confirmation email copy has been dispatched to <span className="font-medium text-neutral-800">{fields.email}</span>.
                  </p>
                </div>

                {/* Emergency Warning */}
                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex gap-3 text-left">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-normal">
                    <strong>Medical Warning:</strong> Novalyte AI does not provide emergency or medical care. If you are experiencing a medical emergency, contact emergency services (like 911) immediately.
                  </p>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button
                    className="flex-1 bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
                    onClick={() => { window.location.href = "/"; }}
                  >
                    Return to Home
                  </Button>
                  <Button
                    variant="outline"
                    className="border-neutral-200 hover:bg-neutral-50 text-neutral-700"
                    onClick={resetForm}
                  >
                    Send Another message
                  </Button>
                </div>
              </div>
            ) : (
              // Form Layout
              <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(18rem,3fr)] lg:gap-10">
                {/* Form Main Area (left 7 cols) */}
                <div className="space-y-8 rounded-3xl border border-border bg-card p-5 shadow-premium-sm sm:p-8">
                  {/* Honeypot field (hidden from users) */}
                  <div className="hidden" aria-hidden="true">
                    <input
                      type="text"
                      name="hp_phone_field"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Identity Select Cards */}
                    <div className="space-y-3">
                      <Label className="text-base font-bold text-neutral-900">
                        1. Which best describes you? <span className="text-primary">*</span>
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {SENDER_IDENTITIES.map((identity) => {
                          const Icon = identity.icon;
                          const isSelected = fields.senderType === identity.id;
                          return (
                            <button
                              key={identity.id}
                              type="button"
                              onClick={() => selectSenderType(identity.id as SenderType)}
                              aria-label={`${identity.label}: ${identity.desc}`}
                              aria-pressed={isSelected}
                              className={`relative flex min-h-24 w-full items-start rounded-2xl border p-4 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                                isSelected
                                  ? "border-2 border-primary bg-accent/55 shadow-premium"
                                  : "border-border bg-card hover:border-primary/50 hover:bg-accent/35 hover:shadow-premium-sm"
                              }`}
                            >
                              <div className={`shrink-0 rounded-xl p-2.5 transition-colors duration-200 ${isSelected ? "bg-primary text-primary-foreground" : "bg-accent text-primary"}`}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="ml-3 pr-4">
                                <p className="text-sm font-bold text-neutral-900">{identity.label}</p>
                                <p className="text-xs text-neutral-500 leading-normal mt-1">{identity.desc}</p>
                              </div>
                              {isSelected && (
                                <span className="animate-scale-in absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
                                  ✓
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {fields.senderType && (
                      <div className="space-y-6 border-t pt-6 animate-fade-in">
                        {/* Category Dropdown */}
                        <div className="space-y-1.5">
                          <Label htmlFor="inquiryCategory" className="font-bold text-neutral-800">
                            2. Inquiry Category <span className="text-primary">*</span>
                          </Label>
                          <select
                            id="inquiryCategory"
                            name="inquiryCategory"
                            value={fields.inquiryCategory}
                            onChange={handleInputChange}
                            required
                            className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            {CATEGORIES_BY_SENDER[fields.senderType].map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Patient Warning Notice */}
                        {fields.senderType === "patient" && (
                          <div className="flex gap-3 rounded-2xl border border-primary/20 bg-accent/50 p-4 text-sm text-accent-foreground">
                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                            <p className="leading-normal">
                              <strong>Notice:</strong> Please do not submit medical records, emergency information, Social Security numbers, payment-card details, or highly sensitive health information through this form.
                            </p>
                          </div>
                        )}

                        {/* Conditional Fields — Clinic Owner */}
                        {fields.senderType === "clinic" && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-50 p-4 border border-neutral-100 rounded-2xl">
                            <div className="space-y-1.5">
                              <Label htmlFor="organizationName">Clinic Name <span className="text-primary">*</span></Label>
                              <Input id="organizationName" name="organizationName" required value={fields.organizationName} onChange={handleInputChange} placeholder="E.g. Oakridge Mens Health" className="bg-white border-neutral-200" />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="organizationWebsite">Clinic Website <span className="text-primary">*</span></Label>
                              <Input id="organizationWebsite" name="organizationWebsite" required value={fields.organizationWebsite} onChange={handleInputChange} placeholder="E.g. www.oakridgemens.com" className="bg-white border-neutral-200" />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="jobTitle">Your Role at Clinic <span className="text-primary">*</span></Label>
                              <Input id="jobTitle" name="jobTitle" required value={fields.jobTitle} onChange={handleInputChange} placeholder="E.g. Owner, Practice Manager" className="bg-white border-neutral-200" />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="phone">Clinic Phone <span className="text-primary">*</span></Label>
                              <Input id="phone" name="phone" required type="tel" value={fields.phone} onChange={handleInputChange} placeholder="E.g. (555) 019-2834" className="bg-white border-neutral-200" />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="city">City <span className="text-primary">*</span></Label>
                              <Input id="city" name="city" required value={fields.city} onChange={handleInputChange} placeholder="E.g. San Francisco" className="bg-white border-neutral-200" />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="state">State <span className="text-primary">*</span></Label>
                              <Input id="state" name="state" required value={fields.state} onChange={handleInputChange} placeholder="E.g. CA" className="bg-white border-neutral-200" />
                            </div>
                            <div className="sm:col-span-2 space-y-1.5">
                              <Label htmlFor="relevantUrl">Existing Listing URL (Optional)</Label>
                              <Input id="relevantUrl" name="relevantUrl" value={fields.relevantUrl} onChange={handleInputChange} placeholder="E.g. https://novalyte.io/clinics/oakridge-mens" className="bg-white border-neutral-200" />
                            </div>
                          </div>
                        )}

                        {/* Conditional Fields — Healthcare Professional */}
                        {fields.senderType === "professional" && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-50 p-4 border border-neutral-100 rounded-2xl">
                            <div className="space-y-1.5">
                              <Label htmlFor="jobTitle">Current Professional Title <span className="text-primary">*</span></Label>
                              <Input id="jobTitle" name="jobTitle" required value={fields.jobTitle} onChange={handleInputChange} placeholder="E.g. Endocrinologist, Nurse Practitioner" className="bg-white border-neutral-200" />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="organizationName">Medical Specialty <span className="text-primary">*</span></Label>
                              <Input id="organizationName" name="organizationName" required value={fields.organizationName} onChange={handleInputChange} placeholder="E.g. Urology, TRT Therapy" className="bg-white border-neutral-200" />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="state">State of Licensure <span className="text-primary">*</span></Label>
                              <Input id="state" name="state" required value={fields.state} onChange={handleInputChange} placeholder="E.g. CA, NY" className="bg-white border-neutral-200" />
                            </div>
                            <div className="space-y-1.5 flex flex-col justify-end pb-3">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id="hasExistingAccount"
                                  checked={fields.hasExistingAccount}
                                  onCheckedChange={(checked) => handleCheckboxChange("hasExistingAccount", !!checked)}
                                />
                                <Label htmlFor="hasExistingAccount" className="font-semibold text-neutral-800 cursor-pointer">
                                  Existing Novalyte Account
                                </Label>
                              </div>
                            </div>
                            <div className="sm:col-span-2 space-y-1.5">
                              <Label htmlFor="relevantUrl">Workforce Profile URL (Optional)</Label>
                              <Input id="relevantUrl" name="relevantUrl" value={fields.relevantUrl} onChange={handleInputChange} placeholder="E.g. https://novalyte.io/workforce/professional/john-doe" className="bg-white border-neutral-200" />
                            </div>
                          </div>
                        )}

                        {/* Conditional Fields — Employer */}
                        {fields.senderType === "employer" && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-50 p-4 border border-neutral-100 rounded-2xl">
                            <div className="space-y-1.5">
                              <Label htmlFor="organizationName">Organization Name <span className="text-primary">*</span></Label>
                              <Input id="organizationName" name="organizationName" required value={fields.organizationName} onChange={handleInputChange} placeholder="E.g. Valley Medical Systems" className="bg-white border-neutral-200" />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="organizationWebsite">Organization Website <span className="text-primary">*</span></Label>
                              <Input id="organizationWebsite" name="organizationWebsite" required value={fields.organizationWebsite} onChange={handleInputChange} placeholder="E.g. www.valleymedical.com" className="bg-white border-neutral-200" />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="jobTitle">Your Hiring Role <span className="text-primary">*</span></Label>
                              <Input id="jobTitle" name="jobTitle" required value={fields.jobTitle} onChange={handleInputChange} placeholder="E.g. HR Director, Recruiting Lead" className="bg-white border-neutral-200" />
                            </div>
                            <div className="space-y-1.5 flex flex-col justify-end pb-3">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id="hasExistingAccount"
                                  checked={fields.hasExistingAccount}
                                  onCheckedChange={(checked) => handleCheckboxChange("hasExistingAccount", !!checked)}
                                />
                                <Label htmlFor="hasExistingAccount" className="font-semibold text-neutral-800 cursor-pointer">
                                  Existing Employer Account
                                </Label>
                              </div>
                            </div>
                            <div className="sm:col-span-2 space-y-1.5">
                              <Label htmlFor="relevantUrl">Talent Requirement / Hiring Need <span className="text-primary">*</span></Label>
                              <Input id="relevantUrl" name="relevantUrl" required value={fields.relevantUrl} onChange={handleInputChange} placeholder="E.g. Need 2 Full-time TRT physicians in California" className="bg-white border-neutral-200" />
                            </div>
                          </div>
                        )}

                        {/* General Form Fields */}
                        <div className="space-y-4">
                          <h3 className="text-base font-bold text-neutral-900">3. Contact Details</h3>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label htmlFor="firstName">First Name <span className="text-primary">*</span></Label>
                              <Input id="firstName" name="firstName" required value={fields.firstName} onChange={handleInputChange} placeholder="John" className="bg-white border-neutral-200" />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="lastName">Last Name <span className="text-primary">*</span></Label>
                              <Input id="lastName" name="lastName" required value={fields.lastName} onChange={handleInputChange} placeholder="Doe" className="bg-white border-neutral-200" />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label htmlFor="email">Email Address <span className="text-primary">*</span></Label>
                              <Input id="email" name="email" required type="email" value={fields.email} onChange={handleInputChange} placeholder="john@domain.com" className="bg-white border-neutral-200" />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="phone">Phone Number (Optional)</Label>
                              <Input id="phone" name="phone" type="tel" value={fields.phone} onChange={handleInputChange} placeholder="(555) 000-0000" className="bg-white border-neutral-200" />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="subject">Subject <span className="text-primary">*</span></Label>
                            <Input id="subject" name="subject" required value={fields.subject} onChange={handleInputChange} placeholder="What is this inquiry about?" className="bg-white border-neutral-200" />
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between">
                              <Label htmlFor="message">Message <span className="text-primary">*</span></Label>
                              <span className={`text-xs ${charCount > 5000 ? "text-rose-500 font-bold" : "text-muted-foreground"}`}>
                                {charCount}/5,000 characters
                              </span>
                            </div>
                            <Textarea
                              id="message"
                              name="message"
                              required
                              value={fields.message}
                              onChange={handleInputChange}
                              placeholder="Please type your detailed inquiry here..."
                              className="min-h-[160px] bg-white border-neutral-200 resize-y"
                            />
                          </div>

                          {/* Preferred contact method dropdown */}
                          <div className="space-y-1.5">
                            <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
                            <select
                              id="preferredContactMethod"
                              name="preferredContactMethod"
                              value={fields.preferredContactMethod}
                              onChange={handleInputChange}
                              className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                              <option value="email">Email</option>
                              <option value="phone">Phone</option>
                            </select>
                          </div>
                        </div>

                        {/* Consent Checkbox */}
                        <div className="space-y-4 pt-4 border-t">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              id="consentAccepted"
                              checked={consentAccepted}
                              onCheckedChange={(checked) => setConsentAccepted(!!checked)}
                              className="mt-1"
                            />
                            <Label htmlFor="consentAccepted" className="text-xs text-neutral-600 leading-normal cursor-pointer">
                              I acknowledge that the submitted information will be used to respond to my inquiry and handled according to the <a href="/privacy" className="font-semibold text-primary underline hover:text-primary/80">Novalyte Privacy Policy</a>. <span className="text-primary">*</span>
                            </Label>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                          type="submit"
                          disabled={loading || !consentAccepted}
                          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-bold text-primary-foreground shadow-premium-sm transition hover:bg-primary/90"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              Submitting Inquiry...
                            </>
                          ) : (
                            <>
                              Submit Inquiry
                              <ChevronRight className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </form>
                </div>

                {/* Sidebar (right 3 cols) */}
                <aside className="space-y-6">
                  {/* Contact Info Card */}
                  <div className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-premium-sm">
                    <h3 className="text-lg font-bold text-neutral-900">Direct Contact</h3>
                    
                    <div className="space-y-5 text-sm">
                      <div className="flex items-start gap-3.5">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                          <Mail className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div className="pt-0.5">
                          <p className="font-bold text-foreground">Email Us</p>
                          <a href="mailto:support@novalyte.io" className="font-medium text-primary hover:underline">
                            support@novalyte.io
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start gap-3.5">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                          <MapPin className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div className="pt-0.5">
                          <p className="font-bold text-foreground">Headquarters</p>
                          <p className="leading-relaxed text-muted-foreground">
                            415 Mission Street<br />
                            San Francisco, CA
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Privacy & Medical Warning Card */}
                  <div className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-premium-sm">
                    <h3 aria-label="Important Disclaimers" className="flex items-center gap-3 text-lg font-bold text-foreground">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                        <ShieldAlert className="h-4.5 w-4.5" aria-hidden="true" />
                      </span>
                      Important Disclaimers
                    </h3>
                    
                    <div className="space-y-3.5 text-xs text-neutral-600 leading-relaxed">
                      <p>
                        <strong>Emergency Policy:</strong> Novalyte AI is a healthcare technology platform. We do not provide clinical diagnosis, medical treatment, or emergency response services.
                      </p>
                      <p>
                        <strong>Data Privacy:</strong> Inquiry submissions are handled according to the Novalyte Privacy Policy and applicable data-protection practices.
                      </p>
                    </div>
                  </div>
                </aside>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer onNewsletter={subscribeToNewsletter} />
    </div>
  );
}

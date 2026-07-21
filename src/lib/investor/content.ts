/**
 * Structured investor portal content.
 *
 * Only verified facts and clearly labeled placeholders belong here.
 * Do not add traction, revenue, customer counts, or fundraising terms
 * without founder confirmation and source validation.
 */

import type { MetricStatus } from "@/lib/investor/config";

export type ProductModuleStatus = "Completed" | "In progress" | "Planned";

export type RevenueStreamTiming = "Current" | "Near-term" | "Future";

export type InvestorContent = {
  company: CompanyInfo;
  founder: FounderInfo;
  stage: string;
  pillars: ProductPillar[];
  productModules: ProductModule[];
  investmentHighlights: InvestmentHighlight[];
  gtmPhases: GtmPhase[];
  revenueStreams: RevenueStream[];
  legalDisclaimers: LegalDisclaimer[];
  fundraising: FundraisingInfo;
  marketSizing: MarketSizingEntry[];
  marketSizingNote: string;
};

export type CompanyInfo = {
  name: string;
  oneLiner: string;
  positioning: string;
  industry: string;
  coreMarket: string;
  businessModelSummary: string;
  technologyFacilitatorNotice: string;
};

export type FounderInfo = {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  summary: string;
};

export type ProductPillar = {
  key: string;
  label: string;
  description: string;
};

export type ProductModule = {
  key: string;
  label: string;
  description: string;
  status: ProductModuleStatus;
  notes?: string;
};

export type InvestmentHighlight = {
  title: string;
  body: string;
};

export type GtmPhase = {
  phase: number;
  title: string;
  summary: string;
  activities: string[];
};

export type RevenueStream = {
  key: string;
  label: string;
  description: string;
  timing: RevenueStreamTiming;
  customer: string;
  pricingModel: string;
  statusNote: string;
};

export type LegalDisclaimer = {
  id: string;
  label: string;
  body: string;
  requiresAttorneyReview: true;
};

export type FundraisingInfo = {
  published: false;
  status: "Founder input required — not published";
  stage: null;
  targetRaise: null;
  minimumCheckSize: null;
  instrumentType: null;
  valuationOrCap: null;
  timeline: null;
  strategicInvestorProfile: null;
  useOfFunds: null;
  existingCommitments: null;
  leadInvestorStatus: null;
  contactEmail: string;
};

export type MarketSizingEntry = {
  metric: string;
  value: string;
  unit: string;
  geography: string;
  source: string;
  sourceUrl?: string;
  year?: number;
  metricStatus: MetricStatus;
};

export const investorContent: InvestorContent = {
  company: {
    name: "Novalyte AI",
    oneLiner:
      "Novalyte AI is building the operating infrastructure for modern healthcare discovery, patient growth, clinic operations, workforce access, and healthcare commerce.",
    positioning:
      "A healthcare technology facilitator connecting patient demand, verified clinics, specialized professionals, vendors, and operational services through one integrated ecosystem — starting with men's health.",
    industry: "Healthcare technology",
    coreMarket: "Men's health clinics and adjacent outpatient specialty care",
    businessModelSummary:
      "Multi-sided platform with directory-led clinic relationships, patient acquisition workflows, workforce matching, and B2B marketplace commerce.",
    technologyFacilitatorNotice:
      "Novalyte AI is a healthcare technology facilitator. It is not a medical provider, clinic, pharmacy, or diagnostic service. Licensed clinics and healthcare professionals remain responsible for all medical decisions, patient care, prescribing, treatment, credentialing, and regulatory compliance.",
  },

  founder: {
    firstName: "Jamil",
    lastName: "Yakasai",
    title: "Founder",
    email: "founder@novalyte.io",
    summary: "Founder-led product and GTM.",
  },

  stage: "Early stage — product live, clinic GTM in progress",

  pillars: [
    {
      key: "acquisition",
      label: "Patient Acquisition",
      description:
        "Educational content, informational assessments, landing pages, and structured intake that route high-intent patients to appropriate care.",
    },
    {
      key: "directory",
      label: "Verified Clinic Directory",
      description:
        "Searchable directory of men's health clinics with explicit verification status and publication controls.",
    },
    {
      key: "workforce",
      label: "Workforce Hub",
      description:
        "Specialized talent marketplace connecting clinics with physicians, advanced practice providers, nurses, coordinators, and operational professionals.",
    },
    {
      key: "marketplace",
      label: "Services Marketplace",
      description:
        "B2B marketplace for labs, equipment, supplies, software, billing, credentialing, compliance, and operational services.",
    },
  ],

  productModules: [
    {
      key: "patient-acquisition",
      label: "Patient Acquisition",
      description:
        "Patient-facing discovery flows, assessments, and intake designed to connect demand with verified clinic supply.",
      status: "In progress",
      notes:
        "Public patient routes and assessment infrastructure are live; clinic GTM and live campaign proof points are still in progress.",
    },
    {
      key: "directory",
      label: "Directory",
      description:
        "Clinic directory with verification workflow, publication gates, and crawlable public profiles.",
      status: "Completed",
      notes: "Live on novalyte.io with publication and RLS hardening.",
    },
    {
      key: "workforce",
      label: "Workforce",
      description:
        "Job board, professional profiles, and application flows for healthcare hiring.",
      status: "Completed",
      notes: "Public workforce routes and database models are shipped.",
    },
    {
      key: "marketplace",
      label: "Marketplace",
      description:
        "Vendor listings, quote requests, and moderation workflow for B2B healthcare commerce.",
      status: "Completed",
      notes: "Public marketplace routes and listing moderation pipeline are shipped.",
    },
    {
      key: "campaign-studio",
      label: "Campaign Studio",
      description:
        "Campaign wizard, landing page editor, embedded assessments, and paid/organic landing routes.",
      status: "Completed",
      notes: "Deployed on ads.novalyte.io with Supabase cs_* schema.",
    },
    {
      key: "command-center",
      label: "Command Center",
      description:
        "Internal clinic prospecting, call console, outreach history, and operational workflows for founder-led GTM.",
      status: "Completed",
      notes: "Deployed on admin.novalyte.io with clinic records and call tracking.",
    },
    {
      key: "journal",
      label: "Journal",
      description:
        "Editorial content system with SEO fields, medical review metadata, and public article routes.",
      status: "Completed",
      notes: "Content Studio and public journal views are integrated.",
    },
    {
      key: "assessments",
      label: "Assessments",
      description:
        "Informational patient assessments embeddable on landing pages with attribution to campaigns and clinics.",
      status: "In progress",
      notes:
        "Embedded assessment flows are built and deployed; production patient submission volume has not yet been validated.",
    },
  ],

  investmentHighlights: [
    {
      title: "Fragmented clinic go-to-market",
      body:
        "Men's health and adjacent outpatient clinics often rely on disconnected marketing, staffing, procurement, and patient-intake tools rather than a unified operating layer.",
    },
    {
      title: "High-intent patient demand",
      body:
        "Patients increasingly research specialized care online before choosing a provider, creating demand for trusted discovery, education, and structured intake.",
    },
    {
      title: "Clinics need measurable growth infrastructure",
      body:
        "Clinic operators need more than listings — they need workflows that connect demand generation, operations, workforce, and vendor relationships.",
    },
    {
      title: "Multiple interconnected revenue streams",
      body:
        "Directory relationships, patient acquisition, workforce, marketplace commerce, and future intelligence products can compound within one ecosystem.",
    },
    {
      title: "First-party workflow data opportunity",
      body:
        "Platform workflows across discovery, intake, outreach, hiring, and procurement can create proprietary operational insight over time — subject to privacy, consent, and compliance constraints.",
    },
    {
      title: "Founder-led product development",
      body:
        "Product, GTM, and clinic outreach are being built directly by the founding team alongside live infrastructure across the public site, ads subdomain, admin console, and portal.",
    },
    {
      title: "Platform expansion potential",
      body:
        "The same infrastructure can extend beyond a single vertical as clinic supply, patient demand signals, and operating modules mature.",
    },
    {
      title: "Cross-sell across the ecosystem",
      body:
        "Directory, campaigns, workforce, and marketplace modules reinforce one another rather than operating as isolated point solutions.",
    },
  ],

  gtmPhases: [
    {
      phase: 1,
      title: "Build clinic supply and directory coverage",
      summary:
        "Establish verified clinic records, publication workflow, and permission-based listing relationships.",
      activities: [
        "Import and enrich clinic prospect records",
        "Founder-led outreach for listing permission",
        "Publish approved clinics to the public directory",
        "Offer free directory listing as the initial relationship wedge",
      ],
    },
    {
      phase: 2,
      title: "Generate patient traffic and demand signals",
      summary:
        "Drive educational content, assessments, and campaign landing pages that produce measurable patient interest.",
      activities: [
        "Launch Campaign Studio landing pages",
        "Publish journal and SEO content",
        "Capture assessment and consultation intent",
        "Attribute demand signals to clinics and campaigns",
      ],
    },
    {
      phase: 3,
      title: "Demonstrate measurable value to clinics",
      summary:
        "Show clinics concrete demand, engagement, and workflow value before asking for paid commitments.",
      activities: [
        "Share patient-intent and engagement summaries",
        "Integrate booking links and follow-up workflows",
        "Use Command Center outreach history and outcomes",
        "Prove value with real clinic interactions",
      ],
    },
    {
      phase: 4,
      title: "Convert selected clinics into paid relationships",
      summary:
        "Move high-fit clinics from free directory participation into paid growth and operating services.",
      activities: [
        "Permission-based clinic onboarding",
        "Paid patient acquisition and campaign services",
        "Portal and workflow upsell where clinics see ROI",
        "Founder-led conversion after demonstrated value",
      ],
    },
    {
      phase: 5,
      title: "Expand software, workforce, marketplace, and intelligence",
      summary:
        "Layer additional revenue modules as clinic density and demand signals increase.",
      activities: [
        "Workforce and marketplace monetization",
        "Demand intelligence and analytics products",
        "Geographic and vertical expansion",
        "Enterprise and strategic partnership motions",
      ],
    },
  ],

  revenueStreams: [
    {
      key: "free-directory-listing",
      label: "Free verified directory listing",
      description:
        "Initial clinic relationship wedge — permission-based listing in the verified directory without a listing fee.",
      timing: "Current",
      customer: "Men's health and adjacent outpatient clinics",
      pricingModel: "Free listing (commercial wedge)",
      statusNote: "Active GTM wedge; not a long-term primary revenue driver.",
    },
    {
      key: "clinic-onboarding-services",
      label: "Clinic onboarding and profile services",
      description:
        "Paid setup, profile optimization, and operational onboarding for clinics moving beyond a basic listing.",
      timing: "Near-term",
      customer: "Clinics seeking faster launch and profile completeness",
      pricingModel: "Founder input required — not published",
      statusNote: "Pricing and packaging require founder confirmation.",
    },
    {
      key: "patient-acquisition-campaigns",
      label: "Patient acquisition campaigns",
      description:
        "Managed campaigns, landing pages, assessments, and lead routing for clinics with demonstrated demand fit.",
      timing: "Near-term",
      customer: "Clinics with active patient growth goals",
      pricingModel: "Founder input required — not published",
      statusNote: "Campaign Studio infrastructure is live; commercial packaging is not published.",
    },
    {
      key: "workforce-placement",
      label: "Workforce placement and hiring workflows",
      description:
        "Fees or subscriptions tied to job visibility, applications, and hiring workflow tools.",
      timing: "Near-term",
      customer: "Clinics and healthcare employers",
      pricingModel: "Founder input required — not published",
      statusNote: "Product surface exists; monetization terms not published.",
    },
    {
      key: "marketplace-commerce",
      label: "Marketplace vendor and transaction fees",
      description:
        "Listing fees, lead fees, or transaction-based revenue from B2B healthcare vendors and clinics.",
      timing: "Near-term",
      customer: "Healthcare vendors and clinic operators",
      pricingModel: "Founder input required — not published",
      statusNote: "Marketplace is live; commercial terms not published.",
    },
    {
      key: "demand-intelligence",
      label: "Demand intelligence and analytics",
      description:
        "Subscription access to aggregated demand, campaign, and market insight for clinic operators.",
      timing: "Future",
      customer: "Clinic groups and strategic operators",
      pricingModel: "Founder input required — not published",
      statusNote: "Requires sufficient first-party data volume and compliance review.",
    },
    {
      key: "enterprise-partnerships",
      label: "Enterprise and strategic partnerships",
      description:
        "Custom integrations, multi-location deployments, and strategic distribution relationships.",
      timing: "Future",
      customer: "Multi-site clinic groups and strategic partners",
      pricingModel: "Founder input required — not published",
      statusNote: "Partnership economics not published.",
    },
  ],

  legalDisclaimers: [
    {
      id: "forward-looking",
      label: "Forward-looking statements — attorney review placeholder",
      body:
        "[ATTORNEY REVIEW REQUIRED] Certain statements in this investor portal may constitute forward-looking statements. Actual results may differ materially. This placeholder must be replaced with counsel-approved language before external distribution.",
      requiresAttorneyReview: true,
    },
    {
      id: "not-an-offer",
      label: "Not an offer of securities — attorney review placeholder",
      body:
        "[ATTORNEY REVIEW REQUIRED] Nothing in this portal constitutes an offer to sell or a solicitation of an offer to buy any security. Any future offering will be made only through definitive documents and in compliance with applicable law.",
      requiresAttorneyReview: true,
    },
    {
      id: "confidentiality",
      label: "Confidential information — attorney review placeholder",
      body:
        "[ATTORNEY REVIEW REQUIRED] Materials marked confidential or made available through the protected data room are for authorized recipients only. Unauthorized use, reproduction, or distribution is prohibited.",
      requiresAttorneyReview: true,
    },
    {
      id: "technology-facilitator",
      label: "Healthcare technology facilitator",
      body:
        "Novalyte AI provides healthcare technology facilitation and workflow infrastructure. It does not provide medical care, diagnoses, prescriptions, or treatment recommendations.",
      requiresAttorneyReview: true,
    },
    {
      id: "metrics-validation",
      label: "Metric validation",
      body:
        "Metrics in this portal are labeled by status (Actual, Estimated, Projected, Target, Under development, Planned, Founder-provided, Pending validation). Do not treat unvalidated figures as audited financial or operating results.",
      requiresAttorneyReview: true,
    },
  ],

  fundraising: {
    published: false,
    status: "Founder input required — not published",
    stage: null,
    targetRaise: null,
    minimumCheckSize: null,
    instrumentType: null,
    valuationOrCap: null,
    timeline: null,
    strategicInvestorProfile: null,
    useOfFunds: null,
    existingCommitments: null,
    leadInvestorStatus: null,
    contactEmail: "founder@novalyte.io",
  },

  marketSizing: [],

  marketSizingNote:
    "Market sizing figures require third-party source citation and founder validation before publish. Add entries to marketSizing only with metric, value, unit, geography, source, sourceUrl, year, and metricStatus fields populated.",
};

export default investorContent;

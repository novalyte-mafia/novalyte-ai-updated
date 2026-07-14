"use client";

import { SectionShell } from "@/components/shared/section";
import { DisclaimerBanner } from "@/components/shared/disclaimer";
import { Button } from "@/components/ui/button";
import { navigate } from "@/lib/nav";
import { ArrowLeft, ArrowUp, FileText } from "lucide-react";

type LegalViewKey = "privacy" | "terms" | "medical-disclaimer" | "accessibility" | "cookies";

const VIEW_META: Record<LegalViewKey, { title: string; eyebrow: string }> = {
  privacy: { title: "Privacy Policy", eyebrow: "Legal" },
  terms: { title: "Terms of Service", eyebrow: "Legal" },
  "medical-disclaimer": { title: "Medical Disclaimer", eyebrow: "Legal" },
  accessibility: { title: "Accessibility Statement", eyebrow: "Legal" },
  cookies: { title: "Cookie Policy", eyebrow: "Legal" },
};

const LAST_UPDATED = "January 15, 2025";

export function LegalView({ view }: { view: LegalViewKey }) {
  const meta = VIEW_META[view];

  return (
    <>
      {/* Hero header */}
      <section className="border-b border-border bg-gradient-to-b from-teal-50/50 to-background py-12 sm:py-16">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 -ml-2 text-muted-foreground"
            onClick={() => navigate("home")}
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Return home
          </Button>
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-700">
            <FileText className="h-3 w-3" /> {meta.eyebrow}
          </div>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {meta.title}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      <SectionShell className="!py-12">
        <div className="mx-auto max-w-3xl">
          {/* Top-of-page draft disclaimer */}
          <DisclaimerBanner tone="amber" className="mb-8">
            This document is a placeholder draft and requires review by qualified legal counsel
            before production launch. It is provided for informational purposes only and does not
            constitute legal advice.
          </DisclaimerBanner>

          <article className="prose-legal">
            {view === "privacy" && <PrivacyContent />}
            {view === "terms" && <TermsContent />}
            {view === "medical-disclaimer" && <MedicalDisclaimerContent />}
            {view === "accessibility" && <AccessibilityContent />}
            {view === "cookies" && <CookiesContent />}
          </article>

          <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("home")}
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> Return home
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            >
              <ArrowUp className="mr-1 h-4 w-4" /> Back to top
            </Button>
          </div>

          {/* Other legal links */}
          <div className="mt-8 rounded-2xl border border-border bg-muted/30 p-5">
            <h3 className="text-sm font-semibold text-foreground">Other legal documents</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {(Object.keys(VIEW_META) as LegalViewKey[])
                .filter((k) => k !== view)
                .map((k) => (
                  <Button
                    key={k}
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(k)}
                  >
                    {VIEW_META[k].title}
                  </Button>
                ))}
            </div>
          </div>
        </div>
      </SectionShell>
    </>
  );
}

/* ---------- Shared typography primitives ---------- */

function H2({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="mt-10 text-pretty text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
    >
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-6 text-base font-semibold text-foreground">{children}</h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-sm leading-relaxed text-foreground/85 sm:text-base">{children}</p>;
}

function UL({ children }: { children: React.ReactNode }) {
  return <ul className="mt-3 list-disc space-y-1.5 pl-6 text-sm text-foreground/85 sm:text-base">{children}</ul>;
}

function OL({ children }: { children: React.ReactNode }) {
  return <ol className="mt-3 list-decimal space-y-1.5 pl-6 text-sm text-foreground/85 sm:text-base">{children}</ol>;
}

function LI({ children }: { children: React.ReactNode }) {
  return <li>{children}</li>;
}

/* ---------- Privacy Policy ---------- */

function PrivacyContent() {
  return (
    <>
      <P>
        This Privacy Policy describes how Novalyte AI (&quot;Novalyte,&quot; &quot;we,&quot;
        &quot;us,&quot; or &quot;our&quot;) collects, uses, discloses, and protects information
        collected through the Novalyte AI platform (the &quot;Service&quot;). The Service is a
        healthcare technology platform that connects patients, clinics, healthcare professionals,
        vendors, and other participants in the men&apos;s health ecosystem.
      </P>
      <P>
        Novalyte AI is a technology facilitator, not a medical provider. Some information processed
        through the Service may be considered protected health information (&quot;PHI&quot;) under
        applicable law. We design our systems to minimize the PHI we touch and to support covered
        entities and business associates in their compliance obligations.
      </P>

      <H2 id="info-collected">1. Information We Collect</H2>
      <H3>1.1 Information you provide directly</H3>
      <UL>
        <LI><strong>Account and contact information</strong> — name, email address, phone number, organization, role, and similar identifiers submitted through forms, onboarding flows, or contact requests.</LI>
        <LI><strong>Patient intake information</strong> — demographic, contact, treatment interest, and scheduling preference data submitted when a patient requests a consultation with a clinic.</LI>
        <LI><strong>Assessment responses</strong> — answers to optional health intake questionnaires intended to help route patients to appropriate clinics.</LI>
        <LI><strong>Clinic, professional, and vendor information</strong> — business details, licensure, credentialing, service descriptions, pricing, and operational data submitted by participants.</LI>
        <LI><strong>Communications</strong> — the content of messages, support tickets, and other correspondence you send to us.</LI>
      </UL>
      <H3>1.2 Information collected automatically</H3>
      <UL>
        <LI>Device and browser information, IP address, referring URLs, and usage data collected through cookies and similar technologies (see our Cookie Policy).</LI>
        <LI>Aggregate interaction metrics such as page views, click events, and form engagement used to improve the Service.</LI>
      </UL>
      <H3>1.3 Information from third parties</H3>
      <UL>
        <LI>Verification data from public registries, licensure databases, or reference checks used to validate participant information.</LI>
        <LI>Analytics and infrastructure data from service providers that support our platform operations.</LI>
      </UL>

      <H2 id="use-of-info">2. How We Use Information</H2>
      <P>We use information to operate, maintain, and improve the Service, including to:</P>
      <UL>
        <LI>Facilitate connections between patients, clinics, professionals, and vendors.</LI>
        <LI>Process consultation requests, applications, onboarding submissions, quote requests, and contact messages.</LI>
        <LI>Verify participant information and display verification status.</LI>
        <LI>Communicate with you about your submissions, account, and platform updates.</LI>
        <LI>Detect, prevent, and respond to fraud, abuse, security incidents, and policy violations.</LI>
        <LI>Comply with legal obligations and enforce our Terms of Service.</LI>
      </UL>

      <H2 id="phi">3. Health Information and PHI</H2>
      <P>
        Novalyte AI is not a covered entity under U.S. HIPAA regulations. Where a clinic or
        professional using the Service is a covered entity or business associate, we aim to operate
        as a business associate or sub-processor under a written Business Associate Agreement (BAA).
        Assessment responses and consultation requests are intended for routing and facilitation and
        are not intended to constitute a medical record.
      </P>
      <P>
        Patients should not include information they do not wish to share with the receiving clinic.
        Sensitive details should be discussed directly with a licensed provider in the appropriate
        clinical setting.
      </P>

      <H2 id="sharing">4. Sharing and Disclosure</H2>
      <P>We share information only as described in this Policy or as required by law:</P>
      <UL>
        <LI><strong>With participants</strong> — when you submit a request (e.g., consultation, application, quote), we share the submitted information with the relevant clinic, professional, or vendor.</LI>
        <LI><strong>With service providers</strong> — vendors that host infrastructure, deliver analytics, process payments, or support operations under written agreements.</LI>
        <LI><strong>For legal compliance</strong> — to respond to lawful requests, protect rights and safety, and comply with legal obligations.</LI>
        <LI><strong>Business transfers</strong> — in connection with a merger, acquisition, or sale of assets, subject to confidentiality obligations.</LI>
      </UL>
      <P>We do not sell personal information for monetary consideration.</P>

      <H2 id="retention">5. Data Retention</H2>
      <P>
        We retain information for as long as your account is active or as needed to provide the
        Service, comply with legal obligations, resolve disputes, and enforce agreements. When
        information is no longer needed, we delete it or anonymize it, subject to legal retention
        requirements.
      </P>

      <H2 id="security">6. Security</H2>
      <P>
        We use administrative, technical, and physical safeguards designed to protect information
        processed through the Service. No system is perfectly secure, and we cannot guarantee the
        absolute security of information. We encourage participants to use strong authentication
        and to report suspected incidents promptly.
      </P>

      <H2 id="rights">7. Your Rights</H2>
      <P>
        Depending on your jurisdiction, you may have rights to access, correct, delete, or restrict
        the processing of your personal information; object to processing; and request data
        portability. To exercise these rights, contact us using the information below. We will
        respond consistent with applicable law.
      </P>

      <H2 id="children">8. Children&apos;s Privacy</H2>
      <P>
        The Service is not directed to individuals under 18. We do not knowingly collect personal
        information from children. If you believe we have collected information from a child,
        please contact us to request deletion.
      </P>

      <H2 id="changes">9. Changes to This Policy</H2>
      <P>
        We may update this Privacy Policy from time to time. We will update the &quot;Last
        updated&quot; date above when we do. Material changes will be communicated through the
        Service or by other reasonable means. Continued use of the Service after changes take
        effect constitutes acceptance of the revised Policy.
      </P>

      <H2 id="contact">10. Contact</H2>
      <P>
        For privacy questions or requests, please contact us through the contact form on the About
        page. We will respond consistent with applicable law.
      </P>
    </>
  );
}

/* ---------- Terms of Service ---------- */

function TermsContent() {
  return (
    <>
      <P>
        These Terms of Service (&quot;Terms&quot;) govern your access to and use of the Novalyte AI
        platform (the &quot;Service&quot;). By accessing or using the Service, you agree to be
        bound by these Terms. If you do not agree, you may not use the Service.
      </P>

      <H2 id="nature">1. Nature of the Service</H2>
      <P>
        Novalyte AI is a healthcare technology facilitator. The Service connects patients, clinics,
        healthcare professionals, and vendors, but Novalyte AI is <strong>not</strong> a medical
        provider, clinic, pharmacy, diagnostic service, or provider of medical advice. Novalyte AI
        does not diagnose, prescribe, or treat any condition. Licensed clinics and professionals
        are solely responsible for all medical decisions, patient care, prescribing, treatment,
        credentialing, and regulatory compliance.
      </P>

      <H2 id="eligibility">2. Eligibility and Authority</H2>
      <P>
        You must be at least 18 years old and legally able to enter into these Terms. If you act on
        behalf of an organization, you represent that you have authority to bind that organization.
      </P>

      <H2 id="accounts">3. Accounts and Verification</H2>
      <P>
        Certain features require submission of business, professional, or operational information.
        You agree to provide accurate, current, and complete information and to update it as needed.
        Verification badges reflect review of submitted information and do not constitute
        endorsement, warranty, or guarantee of clinical outcomes or business practices.
      </P>

      <H2 id="acceptable-use">4. Acceptable Use</H2>
      <P>You agree not to:</P>
      <UL>
        <LI>Use the Service for any unlawful purpose or in violation of these Terms.</LI>
        <LI>Submit false, misleading, or fraudulent information.</LI>
        <LI>Attempt to access data or systems you are not authorized to access.</LI>
        <LI>Interfere with the proper functioning of the Service or impose unreasonable load.</LI>
        <LI>Use the Service to deliver medical advice, diagnosis, or treatment outside of an appropriate licensed clinical relationship.</LI>
        <LI>Scrape, resell, or redistribute participant data without authorization.</LI>
      </UL>

      <H2 id="relationships">5. Relationships Among Participants</H2>
      <P>
        The Service facilitates introductions and transactions between independent participants.
        Novalyte AI is not a party to any clinical, employment, vendor, or commercial relationship
        formed through the Service unless explicitly stated in a separate written agreement.
        Clinics are independently owned and operated. Provider participation does not constitute
        endorsement unless explicitly stated.
      </P>

      <H2 id="licenses">6. Licenses and Intellectual Property</H2>
      <P>
        We grant you a limited, non-exclusive, non-transferable license to access and use the
        Service for its intended purpose. We retain all rights, title, and interest in the Service,
        including all intellectual property. You retain ownership of information you submit and
        grant us the licenses necessary to operate the Service, including processing, displaying,
        and sharing submitted information as described in our Privacy Policy.
      </P>

      <H2 id="fees">7. Fees and Payment</H2>
      <P>
        Certain features may require payment. Where applicable, fees and billing terms will be
        described at the time of signup or in a separate agreement. Unless required by law, fees
        are generally non-refundable.
      </P>

      <H2 id="disclaimers">8. Disclaimers</H2>
      <P>
        The Service is provided &quot;as is&quot; and &quot;as available.&quot; To the fullest
        extent permitted by law, we disclaim all warranties, express or implied, including
        warranties of merchantability, fitness for a particular purpose, and non-infringement. We
        do not warrant that the Service will be uninterrupted, error-free, or secure, or that any
        verification, lead, application, or referral will result in a particular outcome. See our
        Medical Disclaimer for health-specific limitations.
      </P>

      <H2 id="liability">9. Limitation of Liability</H2>
      <P>
        To the fullest extent permitted by law, Novalyte AI and its affiliates, officers,
        employees, and contractors shall not be liable for any indirect, incidental, special,
        consequential, or punitive damages, or for any loss of profits or revenues, arising out of
        or related to your use of the Service, except to the extent such liability cannot be
        excluded under applicable law.
      </P>

      <H2 id="indemnity">10. Indemnification</H2>
      <P>
        You agree to indemnify and hold harmless Novalyte AI from claims, damages, and expenses
        arising out of your use of the Service, your violation of these Terms, or your infringement
        of any third-party rights.
      </P>

      <H2 id="termination">11. Termination</H2>
      <P>
        We may suspend or terminate access to the Service at any time, with or without cause or
        notice. Upon termination, your right to use the Service ceases. Provisions that by their
        nature should survive termination will remain in effect.
      </P>

      <H2 id="law">12. Governing Law and Disputes</H2>
      <P>
        These Terms are governed by the laws of the jurisdiction in which Novalyte AI is organized,
        without regard to conflict-of-laws principles. We will attempt to resolve disputes
        informally; unresolved disputes will be resolved through binding arbitration or in the
        appropriate courts, as required by law.
      </P>

      <H2 id="changes">13. Changes to These Terms</H2>
      <P>
        We may modify these Terms from time to time. We will update the &quot;Last updated&quot;
        date above when we do. Material changes will be communicated through the Service or by other
        reasonable means. Continued use of the Service after changes take effect constitutes
        acceptance of the revised Terms.
      </P>
    </>
  );
}

/* ---------- Medical Disclaimer ---------- */

function MedicalDisclaimerContent() {
  return (
    <>
      <P>
        This Medical Disclaimer applies to all content, tools, and interactions available through
        the Novalyte AI platform (the &quot;Service&quot;). It explains the limits of what the
        Service provides and what it does not.
      </P>

      <H2 id="not-medical">1. Novalyte AI Is Not a Medical Provider</H2>
      <P>
        Novalyte AI is a technology platform. It does not provide medical care, diagnosis,
        treatment, prescriptions, or professional medical advice. Novalyte AI is not a clinic,
        pharmacy, laboratory, diagnostic service, or healthcare provider of any kind. Nothing on
        the Service should be interpreted as medical advice or as creating a clinician-patient
        relationship between you and Novalyte AI.
      </P>

      <H2 id="assessments">2. Assessments Do Not Provide a Diagnosis</H2>
      <P>
        Any assessment, intake, or questionnaire offered through the Service is intended for
        routing, education, and operational facilitation. An assessment result <strong>does
        not</strong> provide a medical diagnosis and should not be relied upon as one. Only a
        licensed healthcare professional can diagnose medical conditions, and only after an
        appropriate clinical evaluation.
      </P>

      <H2 id="consult-professional">3. Consult a Licensed Healthcare Professional</H2>
      <P>
        Always consult a qualified, licensed healthcare professional regarding any medical
        condition, symptom, or treatment decision. Do not disregard, avoid, or delay obtaining
        medical advice because of something you read on or received through the Service. If you
        think you may have a medical emergency, call your local emergency number (such as 911 in
        the United States) immediately.
      </P>

      <H2 id="clinics">4. Clinics Are Independently Owned and Operated</H2>
      <P>
        Clinics listed in the directory are independent businesses. Novalyte AI does not employ,
        own, control, or direct the clinical operations of participating clinics. Each clinic is
        solely responsible for its own patient care, licensing, regulatory compliance, billing,
        and operational decisions.
      </P>

      <H2 id="endorsement">5. Participation Does Not Constitute Endorsement</H2>
      <P>
        Inclusion of a clinic, professional, vendor, or service in the Service does not constitute
        an endorsement, recommendation, or warranty by Novalyte AI. Verification status reflects a
        structured review of submitted information and does not guarantee clinical outcomes, business
        conduct, or fitness for any particular purpose.
      </P>

      <H2 id="credentials">6. Independently Confirm Licensure and Credentials</H2>
      <P>
        Patients and partners should independently confirm the licensure, credentials, and
        regulatory standing of any clinic or professional before engaging in care or transactions.
        Where applicable, verify information with the relevant state licensing board, certifying
        body, or public registry.
      </P>

      <H2 id="content">7. Educational Content Only</H2>
      <P>
        Articles, assessments, and other content on the Service (including the Novalyte Journal) are
        provided for general educational and informational purposes. They are not tailored to any
        individual&apos;s medical situation and should not be used as a substitute for personalized
        professional advice.
      </P>

      <H2 id="emergencies">8. Emergencies</H2>
      <P>
        The Service is not equipped to handle medical emergencies. If you experience a medical
        emergency, contact your local emergency services immediately. Do not use the Service to
        request urgent or emergency care.
      </P>

      <H2 id="reliance">9. No Reliance</H2>
      <P>
        You use the Service at your own risk. Any reliance on information or interactions available
        through the Service is solely at your own risk. Novalyte AI disclaims all liability for
        damages arising from such reliance to the fullest extent permitted by law.
      </P>

      <H2 id="changes">10. Changes to This Disclaimer</H2>
      <P>
        We may update this Medical Disclaimer from time to time. We will update the &quot;Last
        updated&quot; date above when we do. Continued use of the Service after changes take effect
        constitutes acceptance of the revised disclaimer.
      </P>
    </>
  );
}

/* ---------- Accessibility Statement ---------- */

function AccessibilityContent() {
  return (
    <>
      <P>
        Novalyte AI is committed to making the Novalyte AI platform (the &quot;Service&quot;)
        accessible to as many users as possible, including individuals with disabilities. This
        Accessibility Statement describes our approach and the commitments we aim to uphold.
      </P>

      <H2 id="approach">1. Our Approach</H2>
      <P>
        We design and evaluate the Service with accessibility in mind. We follow recognized
        guidelines such as the Web Content Accessibility Guidelines (WCAG) 2.1 as a reference
        framework, and we work toward conformance with Level AA where feasible.
      </P>

      <H2 id="features">2. Accessibility Features</H2>
      <P>Where supported, the Service aims to provide:</P>
      <UL>
        <LI>Semantic HTML structure and meaningful heading hierarchy.</LI>
        <LI>Keyboard-navigable interfaces with visible focus indicators.</LI>
        <LI>Text alternatives for meaningful non-text content.</LI>
        <LI>Sufficient color contrast for text and interactive elements.</LI>
        <LI>Labels and instructions for forms and interactive controls.</LI>
        <LI>Support for screen readers and other assistive technologies.</LI>
        <LI>Respect for user preferences such as reduced motion where technically feasible.</LI>
      </UL>

      <H2 id="limitations">3. Known Limitations</H2>
      <P>
        While we strive for broad accessibility, the Service may include third-party content,
        embedded tools, or features that we do not fully control. Some participant-submitted
        content (for example, clinic-supplied descriptions or vendor-supplied materials) may not
        meet the same accessibility standards as our core interface. We are continuously working to
        improve.
      </P>

      <H2 id="feedback">4. Feedback and Requests</H2>
      <P>
        If you encounter an accessibility barrier or have a suggestion, please contact us through
        the contact form on the About page. Include a description of the issue, the page or feature
        involved, and the assistive technology you are using. We aim to acknowledge accessibility
        feedback promptly and to work toward reasonable resolutions.
      </P>

      <H2 id="accommodations">5. Accommodations</H2>
      <P>
        Where reasonable, we will provide alternative means of access to information or features
        for users who experience barriers. Requests for accommodation can be submitted through the
        contact form on the About page.
      </P>

      <H2 id="third-party">6. Third-Party Content</H2>
      <P>
        The Service may link to or embed third-party websites and tools. We do not control and are
        not responsible for the accessibility of third-party content. We encourage third parties to
        follow accessibility best practices.
      </P>

      <H2 id="changes">7. Changes to This Statement</H2>
      <P>
        We may update this Accessibility Statement as the Service evolves. We will update the
        &quot;Last updated&quot; date above when we do.
      </P>
    </>
  );
}

/* ---------- Cookie Policy ---------- */

function CookiesContent() {
  return (
    <>
      <P>
        This Cookie Policy explains how Novalyte AI (&quot;we,&quot; &quot;us,&quot; or
        &quot;our&quot;) uses cookies and similar technologies on the Novalyte AI platform (the
        &quot;Service&quot;). It supplements our Privacy Policy.
      </P>

      <H2 id="what-are-cookies">1. What Are Cookies?</H2>
      <P>
        Cookies are small text files placed on your device when you visit a website. They allow the
        site to remember your actions and preferences over a period of time. The Service also uses
        similar technologies such as local storage and pixels, which we refer to collectively as
        &quot;cookies&quot; in this Policy.
      </P>

      <H2 id="types">2. Types of Cookies We Use</H2>
      <H3>2.1 Strictly necessary cookies</H3>
      <P>
        These cookies are required for the Service to function. They enable core features such as
        session management, security, and accessibility preferences. You cannot use the Service
        properly without them.
      </P>
      <H3>2.2 Functional cookies</H3>
      <P>
        These cookies remember choices you make (such as theme or region) to provide a more
        personalized experience. They are not strictly necessary but improve usability.
      </P>
      <H3>2.3 Analytics and performance cookies</H3>
      <P>
        These cookies help us understand how visitors interact with the Service so that we can
        improve its performance and design. We aim to use aggregated, de-identified analytics
        wherever possible.
      </P>
      <H3>2.4 Marketing cookies</H3>
      <P>
        Where used, marketing cookies help us measure and improve the relevance of our educational
        and operational content. We do not use cookies to sell your personal information to third
        parties.
      </P>

      <H2 id="third-party">3. Third-Party Cookies</H2>
      <P>
        Some cookies may be set by third parties that provide infrastructure, analytics, or other
        services to us. These third parties may use cookies subject to their own privacy and cookie
        policies. We encourage you to review those policies where applicable.
      </P>

      <H2 id="control">4. Managing Cookies</H2>
      <P>
        You can control or delete cookies through your browser settings. Most browsers allow you to
        refuse cookies or alert you when cookies are being sent. Note that disabling strictly
        necessary cookies may affect the functionality of the Service.
      </P>
      <P>Common ways to manage cookies include:</P>
      <UL>
        <LI>Adjusting cookie preferences in your browser settings.</LI>
        <LI>Using &quot;Do Not Track&quot; or similar browser signals where supported.</LI>
        <LI>Clearing cookies already stored on your device.</LI>
        <LI>Using privacy-focused browser extensions or private browsing modes.</LI>
      </UL>

      <H2 id="retention">5. Cookie Retention</H2>
      <P>
        Cookie retention varies by type. Strictly necessary cookies typically expire when you close
        your browser, while analytics and functional cookies may persist for a longer period to
        support continuity and measurement. We aim to keep retention periods as short as practical
        for the intended purpose.
      </P>

      <H2 id="updates">6. Updates to This Policy</H2>
      <P>
        We may update this Cookie Policy from time to time. We will update the &quot;Last
        updated&quot; date above when we do. Continued use of the Service after changes take effect
        constitutes acceptance of the revised Policy.
      </P>

      <H2 id="contact">7. Contact</H2>
      <P>
        For questions about cookies, please contact us through the contact form on the About page.
      </P>
    </>
  );
}

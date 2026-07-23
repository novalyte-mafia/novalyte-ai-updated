import { mainSitePath } from "@/lib/campaigns/directory-url";

export function CampaignComplianceNotice({ isAds = true }: { isAds?: boolean }) {
  const link = (path: string, label: string) =>
    isAds ? (
      <a
        href={mainSitePath(path)}
        target="_blank"
        rel="noopener noreferrer"
        className="underline-offset-2 hover:underline"
      >
        {label}
      </a>
    ) : (
      <a href={path} className="underline-offset-2 hover:underline">
        {label}
      </a>
    );

  return (
    <section className="rounded-xl border border-border bg-muted/30 p-5 text-left text-xs leading-relaxed text-muted-foreground">
      <p className="font-semibold text-foreground">Important information</p>
      <ul className="mt-2 list-disc space-y-1.5 pl-4">
        <li>This assessment is informational only and is not medical advice, diagnosis, or treatment.</li>
        <li>Eligibility and care decisions are made by licensed providers — not by Novalyte AI.</li>
        <li>Novalyte AI is a healthcare technology platform and facilitator, not a medical provider.</li>
        <li>Submitting this form does not guarantee treatment, an appointment, or a clinic match.</li>
        <li>If you are experiencing a medical emergency, call 911 or go to the nearest emergency department.</li>
      </ul>
      <p className="mt-3">
        {link("/privacy", "Privacy")}
        {" · "}
        {link("/terms", "Terms")}
        {" · "}
        {link("/medical-disclaimer", "Medical disclaimer")}
      </p>
    </section>
  );
}

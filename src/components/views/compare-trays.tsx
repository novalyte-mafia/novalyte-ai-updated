"use client";

import { useCompare } from "@/lib/nav";
import { CompareTray } from "@/components/shared/compare-tray";
import { navigate } from "@/lib/nav";
import { splitCsv, colorClasses, initials } from "@/lib/constants";
import { VerificationBadge } from "@/components/shared/badges";
import type { ClinicT, MarketplaceListingT } from "@/lib/types";
import { MapPin, Video, Building2, Check, X, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export function ClinicCompareTray({ clinics }: { clinics: ClinicT[] }) {
  const { clinics: ids, remove, clear, setOpen, isOpen } = useCompare();
  const selected = clinics.filter((c) => ids.includes(c.id));

  return (
    <CompareTray
      kind="clinic"
      items={selected.map((c) => ({ id: c.id, title: c.name, subtitle: `${c.city}, ${c.state}` }))}
      onRemove={(id) => remove("clinic", id)}
      onClear={() => clear("clinic")}
      onCompare={() => setOpen(!isOpen)}
    >
      {selected.length >= 2 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-40 p-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Attribute</th>
                {selected.map((c) => (
                  <th key={c.id} className="p-3 text-left align-top">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white", colorClasses(c.logoColor).bg)}>{initials(c.name)}</span>
                          <span className="font-semibold text-foreground">{c.name}</span>
                        </div>
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {c.city}, {c.state}</p>
                        <VerificationBadge verified={c.verified} status={c.verificationStatus} className="mt-1" />
                      </div>
                      <button onClick={() => remove("clinic", c.id)} className="text-muted-foreground hover:text-rose-600"><X className="h-3.5 w-3.5" /></button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Telehealth", get: (c: ClinicT) => c.telehealth ? "Yes" : "No" },
                { label: "Specialties", get: (c: ClinicT) => splitCsv(c.specialties).join(", ") || "—" },
                { label: "Capabilities", get: (c: ClinicT) => splitCsv(c.capabilities).join(", ") || "—" },
                { label: "Provider types", get: (c: ClinicT) => splitCsv(c.providerTypes).join(", ") || "—" },
                { label: "Service area", get: (c: ClinicT) => c.serviceArea ?? "—" },
                { label: "Hours", get: (c: ClinicT) => c.hours ?? "—" },
                { label: "Phone", get: (c: ClinicT) => c.phone ?? "—" },
              ].map((row) => (
                <tr key={row.label} className="border-t border-border">
                  <td className="p-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">{row.label}</td>
                  {selected.map((c) => (
                    <td key={c.id} className="p-3 text-foreground/80">{row.get(c)}</td>
                  ))}
                </tr>
              ))}
              <tr className="border-t border-border">
                <td className="p-3"></td>
                {selected.map((c) => (
                  <td key={c.id} className="p-3">
                    <button
                      onClick={() => navigate("clinic-profile", undefined, { id: c.id })}
                      className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-700"
                    >
                      View profile
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-muted-foreground">Add at least two clinics to compare.</p>
      )}
    </CompareTray>
  );
}

export function ProductCompareTray({ listings }: { listings: MarketplaceListingT[] }) {
  const { products: ids, remove, clear, setOpen, isOpen } = useCompare();
  const selected = listings.filter((l) => ids.includes(l.id));

  return (
    <CompareTray
      kind="product"
      items={selected.map((l) => ({ id: l.id, title: l.title, subtitle: l.vendorName }))}
      onRemove={(id) => remove("product", id)}
      onClear={() => clear("product")}
      onCompare={() => setOpen(!isOpen)}
    >
      {selected.length >= 2 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-40 p-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Attribute</th>
                {selected.map((l) => (
                  <th key={l.id} className="p-3 text-left align-top">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg text-white", colorClasses(l.imageColor).bg)}><Package className="h-4 w-4" /></span>
                          <span className="font-semibold text-foreground">{l.title}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{l.vendorName}</p>
                        <VerificationBadge verified={l.verified} status={l.reviewStatus} className="mt-1" />
                      </div>
                      <button onClick={() => remove("product", l.id)} className="text-muted-foreground hover:text-rose-600"><X className="h-3.5 w-3.5" /></button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Category", get: (l: MarketplaceListingT) => l.category },
                { label: "Type", get: (l: MarketplaceListingT) => l.listingType },
                { label: "Pricing", get: (l: MarketplaceListingT) => l.priceNote ?? "—" },
                { label: "Pricing model", get: (l: MarketplaceListingT) => l.pricingModel ?? "—" },
                { label: "Availability", get: (l: MarketplaceListingT) => l.availability },
                { label: "Description", get: (l: MarketplaceListingT) => l.description },
              ].map((row) => (
                <tr key={row.label} className="border-t border-border">
                  <td className="p-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">{row.label}</td>
                  {selected.map((l) => (
                    <td key={l.id} className="p-3 align-top text-foreground/80">
                      <span className="line-clamp-3">{row.get(l)}</span>
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t border-border">
                <td className="p-3"></td>
                {selected.map((l) => (
                  <td key={l.id} className="p-3">
                    <button
                      onClick={() => navigate("product-detail", undefined, { id: l.id })}
                      className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-700"
                    >
                      View details
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-muted-foreground">Add at least two products to compare.</p>
      )}
    </CompareTray>
  );
}

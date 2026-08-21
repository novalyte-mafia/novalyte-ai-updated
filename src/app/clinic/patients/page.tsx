import { Suspense } from "react";
import ClinicPatientsClient from "./patients-client";

export default function ClinicPatientsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-muted-foreground">Loading patients...</div>}>
      <ClinicPatientsClient />
    </Suspense>
  );
}

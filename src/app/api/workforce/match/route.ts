import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedProfessionalUser, professionalAuthErrorResponse } from "@/lib/professional-access";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

// Match calculation weights
const WEIGHTS = {
  profession: 20,
  license: 20,
  specialty: 15,
  location: 10,
  experience: 10,
  certification: 10,
  skills: 10,
  schedule: 3,
  compensation: 2,
};

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedProfessionalUser(req);
    if (!user.email_confirmed_at) {
      return NextResponse.json({ success: false, error: "Email confirmation is required." }, { status: 403 });
    }
    const payload = await req.json().catch(() => ({}));
    const { profileId, jobId } = payload;
    if (typeof profileId !== "string" || !profileId) {
      return NextResponse.json({ success: false, error: "A professional profile is required." }, { status: 400 });
    }

    const { data: ownedProfile, error: ownershipError } = await getSupabaseAdmin()
      .from("workforce_professional_profiles")
      .select("id")
      .eq("id", profileId)
      .eq("userId", user.id)
      .maybeSingle();
    if (ownershipError) throw ownershipError;
    if (!ownedProfile) {
      return NextResponse.json({ success: false, error: "You do not have access to this profile." }, { status: 403 });
    }

    // Fetch jobs
    let jobs: any[] = [];
    if (jobId) {
      const job = await db.jobPosting.findUnique({ where: { id: jobId } });
      if (job) jobs.push(job);
    } else {
      jobs = await db.jobPosting.findMany({ where: { status: "open" } });
    }

    // Fetch professional profiles
    let profiles: any[] = [];
    if (profileId) {
      const prof = await db.workforceProfessionalProfile.findUnique({ where: { id: profileId } });
      if (prof) profiles.push(prof);
    }

    const matchesCreated: any[] = [];

    for (const profile of profiles) {
      // Get related professional attributes
      const licenses = await db.professionalLicense.findMany({ where: { profileId: profile.id } });
      const certifications = await db.professionalCertification.findMany({ where: { profileId: profile.id } });
      const skills = await db.professionalSkill.findMany({ where: { profileId: profile.id } });
      const preferences = await db.professionalPreference.findUnique({ where: { profileId: profile.id } });
      const socials = await db.professionalSocialLink.findUnique({ where: { profileId: profile.id } });

      for (const job of jobs) {
        let score = 0;
        let hardRequirementsMet = true;
        const matched: string[] = [];
        const missing: string[] = [];
        const disqualifying: string[] = [];

        // 1. Profession Matching (Weight: 20)
        // Hard requirement check: Must match category/specialty role
        const jobTitleLower = job.title.toLowerCase();
        const profileTitleLower = profile.title.toLowerCase();
        const categoryLower = (profile.category || "").toLowerCase();

        const titleWords = ["nurse", "physician", "assistant", "technician", "therapist", "coordinator", "manager", "admin"];
        const matchesTitleType = titleWords.some(w => jobTitleLower.includes(w) && (profileTitleLower.includes(w) || categoryLower.includes(w)));

        if (matchesTitleType || jobTitleLower.includes(categoryLower) || categoryLower.includes(jobTitleLower)) {
          score += WEIGHTS.profession;
          matched.push("Profession alignment");
        } else {
          hardRequirementsMet = false;
          disqualifying.push("Profession type mismatch");
          missing.push("Required professional category");
        }

        // 2. Active License Match (Weight: 20)
        // Check if job requires specific state and license type
        const reqState = job.state;
        const reqLicenses = (job.requiredLicenses || "").toLowerCase();

        if (reqLicenses && reqLicenses.trim().length > 0) {
          const hasLicenseInState = licenses.some(
            (lic: any) =>
              lic.state === reqState &&
              (lic.status === "verified" || lic.status === "pending") &&
              reqLicenses.includes(lic.type.toLowerCase())
          );

          if (hasLicenseInState) {
            score += WEIGHTS.license;
            matched.push(`Active license in ${reqState}`);
          } else {
            hardRequirementsMet = false;
            missing.push(`Required active license in ${reqState}`);
            disqualifying.push(`No active license in ${reqState}`);
          }
        } else {
          score += WEIGHTS.license; // Default if none required
        }

        // 3. Specialty Match (Weight: 15)
        const jobSpecs = (job.treatmentSpecialties || "").toLowerCase();
        const profSpec = (profile.specialty || "").toLowerCase();
        if (jobSpecs && profSpec && (jobSpecs.includes(profSpec) || profSpec.includes(jobSpecs))) {
          score += WEIGHTS.specialty;
          matched.push("Specialty match");
        } else {
          missing.push("Preferred treatment specialty");
        }

        // 4. Location/Remote compatibility (Weight: 10)
        if (job.remote && (preferences?.workArrangement === "remote" || preferences?.workArrangement === "hybrid")) {
          score += WEIGHTS.location;
          matched.push("Remote compatibility");
        } else if (!job.remote && profile.state === job.state) {
          score += WEIGHTS.location;
          matched.push("Location proximity");
        } else {
          missing.push("On-site location matching");
        }

        // 5. Experience match (Weight: 10)
        const reqExp = parseInt(job.requiredExperience || "0", 10) || 0;
        const profExp = profile.experience || 0;
        if (profExp >= reqExp) {
          score += WEIGHTS.experience;
          matched.push("Experience requirements met");
        } else {
          missing.push("Preferred years of experience");
        }

        // 6. Required Certifications (Weight: 10)
        // Look for BLS, ACLS
        const hasAcls = certifications.some((c: any) => c.name.toLowerCase().includes("acls"));
        const hasBls = certifications.some((c: any) => c.name.toLowerCase().includes("bls") || c.name.toLowerCase().includes("cpr"));
        if (hasAcls || hasBls) {
          score += WEIGHTS.certification;
          matched.push("Certifications match");
        } else {
          missing.push("Standard certifications (ACLS/BLS)");
        }

        // 7. Skills match (Weight: 10)
        const matchesSkillsCount = skills.filter((sk: any) =>
          job.description.toLowerCase().includes(sk.name.toLowerCase())
        ).length;
        if (matchesSkillsCount > 0) {
          score += WEIGHTS.skills;
          matched.push("Key skills match");
        } else {
          missing.push("Clinical/operational skills alignment");
        }

        // 8. Schedule compatibility (Weight: 3)
        score += WEIGHTS.schedule; // Default baseline

        // 9. Compensation compatibility (Weight: 2)
        const jobMax = job.compMax || 1000000;
        const profPref = preferences?.minSalary || 0;
        if (profPref <= jobMax) {
          score += WEIGHTS.compensation;
          matched.push("Compensation match");
        } else {
          missing.push("Compensation alignment");
        }

        // Enforce hard requirement failure penalty
        if (!hardRequirementsMet) {
          score = Math.min(score, 50); // Cap match score
        }

        let level = "none";
        if (score >= 90) level = "exceptional";
        else if (score >= 80) level = "strong";
        else if (score >= 70) level = "potential";
        else if (score >= 60) level = "weak";

        // Upsert Match Record
        const existingMatch = await db.workforceJobMatch.findMany({
          where: { jobId: job.id, profileId: profile.id },
        });

        let savedMatch;
        if (existingMatch.length > 0) {
          savedMatch = await db.workforceJobMatch.update({
            where: { id: existingMatch[0].id },
            data: {
              score,
              level,
              matchedCriteria: matched.join(", "),
              missingCriteria: missing.join(", "),
              disqualifyingCriteria: disqualifying.join(", "),
              status: level === "strong" || level === "exceptional" ? "professional_notified" : "generated",
              updatedAt: new Date(),
            },
          });
        } else {
          savedMatch = await db.workforceJobMatch.create({
            data: {
              jobId: job.id,
              profileId: profile.id,
              score,
              level,
              matchedCriteria: matched.join(", "),
              missingCriteria: missing.join(", "),
              disqualifyingCriteria: disqualifying.join(", "),
              status: level === "strong" || level === "exceptional" ? "professional_notified" : "generated",
            },
          });
        }

        matchesCreated.push(savedMatch);

        // Notify Slack & Resend Email for High Matches
        if (level === "strong" || level === "exceptional") {
          // Slack Notification
          const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL || process.env.SLACK_WORKFORCE_WEBHOOK_URL;
          if (SLACK_WEBHOOK) {
            try {
              await fetch(SLACK_WEBHOOK, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  text: `🔥 *New Workforce Match Alert* 🔥\n*Candidate*: ${profile.name} (${profile.title})\n*Job*: ${job.title} at ${job.clinicName}\n*Match Score*: ${score}% (${level})\n*Matched*: ${matched.join(", ")}\n*Missing*: ${missing.join(", ")}`,
                }),
              });
            } catch (err) {
              console.error("Slack match notify error:", err);
            }
          }

          // Resend Email Alert to Professional
          const RESEND_KEY = process.env.RESEND_API_KEY;
          if (RESEND_KEY && profile.email) {
            try {
              await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${RESEND_KEY}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  from: "onboarding@novalyte.io",
                  to: profile.email,
                  subject: `A new role matches your profile: ${job.title}`,
                  html: `
                    <h2>New Match Recommendation</h2>
                    <p>Hello ${profile.name},</p>
                    <p>We found a new opportunity that matches your background:</p>
                    <ul>
                      <li><strong>Job:</strong> ${job.title}</li>
                      <li><strong>Clinic:</strong> ${job.clinicName}</li>
                      <li><strong>Location:</strong> ${job.city}, ${job.state}</li>
                      <li><strong>Match Score:</strong> ${score}%</li>
                    </ul>
                    <p>Log into your dashboard to apply!</p>
                  `,
                }),
              });
            } catch (err) {
              console.error("Resend match email error:", err);
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, count: matchesCreated.length, matches: matchesCreated });
  } catch (error: any) {
    const authResponse = professionalAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("Failed to run matching:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

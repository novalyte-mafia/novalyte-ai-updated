import { getSupabaseAdmin } from "./supabase/admin";

function parseDates(val: any): any {
  if (val === null || val === undefined) return val;
  if (Array.isArray(val)) {
    return val.map(parseDates);
  }
  if (typeof val === "object") {
    const res: any = {};
    for (const [k, v] of Object.entries(val)) {
      if (
        (k === "createdAt" ||
          k === "updatedAt" ||
          k === "deletedAt" ||
          k === "publishedAt" ||
          k === "submittedAt") &&
        typeof v === "string"
      ) {
        res[k] = new Date(v);
      } else {
        res[k] = parseDates(v);
      }
    }
    return res;
  }
  return val;
}

class ModelAdapter<T> {
  constructor(private tableName: string) {}

  async findMany(options?: { where?: any; orderBy?: any; include?: any; select?: any }) {
    const supabase = getSupabaseAdmin();
    let selectFields = "*";
    if (options?.select) {
      selectFields = Object.keys(options.select).join(",");
    } else if (this.tableName === "Clinic" && options?.include) {
      const includes: string[] = [];
      if (options.include.locations) includes.push("locations:ClinicLocation(*)");
      if (options.include.providers) includes.push("providers:ClinicProvider(*)");
      if (options.include.treatments) includes.push("treatments:ClinicTreatment(*)");
      if (options.include.reviews) includes.push("reviews:ClinicReview(*)");
      selectFields = `*, ${includes.join(", ")}`;
    }

    let query = supabase.from(this.tableName).select(selectFields);

    if (options?.where) {
      for (const [key, val] of Object.entries(options.where)) {
        if (val === null) {
          query = query.is(key, null);
        } else if (typeof val === "object" && val !== null) {
          if ("not" in val) {
            const notVal = (val as any).not;
            if (notVal === null) {
              query = query.not(key, "is", null);
            } else {
              query = query.neq(key, notVal);
            }
          }
        } else {
          query = query.eq(key, val);
        }
      }
    }

    if (options?.orderBy) {
      for (const [key, val] of Object.entries(options.orderBy)) {
        query = query.order(key, { ascending: val === "asc" });
      }
    }

    const { data, error } = await query;
    if (error) {
      console.error(`Error in findMany for ${this.tableName}`, error);
      throw error;
    }
    return parseDates(data) || [];
  }

  async findUnique(options: { where: any; include?: any }) {
    const supabase = getSupabaseAdmin();
    let selectFields = "*";
    if (this.tableName === "Clinic" && options?.include) {
      const includes: string[] = [];
      if (options.include.locations) includes.push("locations:ClinicLocation(*)");
      if (options.include.providers) includes.push("providers:ClinicProvider(*)");
      if (options.include.treatments) includes.push("treatments:ClinicTreatment(*)");
      if (options.include.reviews) includes.push("reviews:ClinicReview(*)");
      selectFields = `*, ${includes.join(", ")}`;
    }

    let query = supabase.from(this.tableName).select(selectFields);

    for (const [key, val] of Object.entries(options.where)) {
      query = query.eq(key, val);
    }

    const { data, error } = await query.maybeSingle();
    if (error) {
      console.error(`Error in findUnique for ${this.tableName}`, error);
      throw error;
    }
    return parseDates(data);
  }

  async findFirst(options?: { where: any }) {
    const supabase = getSupabaseAdmin();
    let query = supabase.from(this.tableName).select("*");
    if (options?.where) {
      for (const [key, val] of Object.entries(options.where)) {
        if (val === null) {
          query = query.is(key, null);
        } else {
          query = query.eq(key, val);
        }
      }
    }
    const { data, error } = await query.limit(1).maybeSingle();
    if (error) {
      console.error(`Error in findFirst for ${this.tableName}`, error);
      throw error;
    }
    return parseDates(data);
  }

  async create(options: { data: any }) {
    const supabase = getSupabaseAdmin();
    const { locations, providers, treatments, reviews, ...primaryData } = options.data;

    const { data, error } = await supabase
      .from(this.tableName)
      .insert(primaryData)
      .select()
      .single();

    if (error) {
      console.error(`Error in create for ${this.tableName}`, error);
      throw error;
    }

    const createdRecord = parseDates(data);

    if (this.tableName === "Clinic") {
      const clinicId = createdRecord.id;

      if (Array.isArray(locations)) {
        for (const loc of locations) {
          await supabase
            .from("ClinicLocation")
            .insert({ ...loc, clinicId });
        }
      }
      if (Array.isArray(providers)) {
        for (const prov of providers) {
          await supabase
            .from("ClinicProvider")
            .insert({ ...prov, clinicId });
        }
      }
      if (Array.isArray(treatments)) {
        for (const treat of treatments) {
          await supabase
            .from("ClinicTreatment")
            .insert({ ...treat, clinicId });
        }
      }
      if (Array.isArray(reviews)) {
        for (const rev of reviews) {
          await supabase
            .from("ClinicReview")
            .insert({ ...rev, clinicId });
        }
      }
    }

    return createdRecord;
  }

  async update(options: { where: any; data: any }) {
    const supabase = getSupabaseAdmin();
    let query = supabase.from(this.tableName).update(options.data);
    for (const [key, val] of Object.entries(options.where)) {
      query = query.eq(key, val);
    }
    const { data, error } = await query.select().single();
    if (error) {
      console.error(`Error in update for ${this.tableName}`, error);
      throw error;
    }
    return parseDates(data);
  }

  async upsert(options: { where: any; update: any; create: any }) {
    const existing = await this.findUnique({ where: options.where });
    if (existing) {
      if (Object.keys(options.update).length > 0) {
        return this.update({ where: options.where, data: options.update });
      }
      return existing;
    }
    return this.create({ data: options.create });
  }

  async count() {
    const supabase = getSupabaseAdmin();
    const { error, count } = await supabase
      .from(this.tableName)
      .select("*", { count: "exact", head: true });
    if (error) {
      console.error(`Error in count for ${this.tableName}`, error);
      throw error;
    }
    return count || 0;
  }

  async delete(options: { where: any }) {
    const supabase = getSupabaseAdmin();
    let query = supabase.from(this.tableName).delete();
    for (const [key, val] of Object.entries(options.where)) {
      query = query.eq(key, val);
    }
    const { data, error } = await query.select().maybeSingle();
    if (error) {
      console.error(`Error in delete for ${this.tableName}`, error);
      throw error;
    }
    return parseDates(data);
  }

  async deleteMany(options?: { where?: any }) {
    const supabase = getSupabaseAdmin();
    let query = supabase.from(this.tableName).delete();
    if (options?.where && Object.keys(options.where).length > 0) {
      for (const [key, val] of Object.entries(options.where)) {
        query = query.eq(key, val);
      }
    } else {
      query = query.neq("id", "_none_");
    }
    const { data, error } = await query;
    if (error) {
      console.error(`Error in deleteMany for ${this.tableName}`, error);
      throw error;
    }
    return parseDates(data) || [];
  }
}

export const db: any = {
  clinic: new ModelAdapter<any>("Clinic"),
  clinicLocation: new ModelAdapter<any>("ClinicLocation"),
  clinicProvider: new ModelAdapter<any>("ClinicProvider"),
  clinicTreatment: new ModelAdapter<any>("ClinicTreatment"),
  clinicReview: new ModelAdapter<any>("ClinicReview"),
  professional: new ModelAdapter<any>("Professional"),
  jobPosting: new ModelAdapter<any>("JobPosting"),
  jobApplication: new ModelAdapter<any>("JobApplication"),
  vendor: new ModelAdapter<any>("Vendor"),
  marketplaceListing: new ModelAdapter<any>("MarketplaceListing"),
  quoteRequest: new ModelAdapter<any>("QuoteRequest"),
  article: new ModelAdapter<any>("Article"),
  assessmentSubmission: new ModelAdapter<any>("AssessmentSubmission"),
  consultationRequest: new ModelAdapter<any>("ConsultationRequest"),
  contactSubmission: new ModelAdapter<any>("ContactSubmission"),
  newsletterSignup: new ModelAdapter<any>("NewsletterSignup"),
  clinicOnboarding: new ModelAdapter<any>("ClinicOnboarding"),
  clinicApplication: new ModelAdapter<any>("ClinicApplication"),
  professionalOnboarding: new ModelAdapter<any>("ProfessionalOnboarding"),
  vendorOnboarding: new ModelAdapter<any>("VendorOnboarding"),
  auditLog: new ModelAdapter<any>("AuditLog"),
  workforceProfessionalApplication: new ModelAdapter<any>("workforce_professional_applications"),
  workforceProfessionalProfile: new ModelAdapter<any>("workforce_professional_profiles"),
  professionalSocialLink: new ModelAdapter<any>("professional_social_links"),
  professionalEmploymentHistory: new ModelAdapter<any>("professional_employment_history"),
  professionalEducation: new ModelAdapter<any>("professional_education"),
  professionalLicense: new ModelAdapter<any>("professional_licenses"),
  professionalCertification: new ModelAdapter<any>("professional_certifications"),
  professionalSkill: new ModelAdapter<any>("professional_skills"),
  professionalPreference: new ModelAdapter<any>("professional_preferences"),
  professionalDocument: new ModelAdapter<any>("professional_documents"),
  professionalJobAlert: new ModelAdapter<any>("professional_job_alerts"),
  workforceJobMatch: new ModelAdapter<any>("workforce_job_matches"),
  notification: new ModelAdapter<any>("notifications"),
  notificationPreference: new ModelAdapter<any>("notification_preferences"),
  $disconnect: async () => {},
};

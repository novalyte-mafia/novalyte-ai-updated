-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clinics table
CREATE TABLE IF NOT EXISTS "Clinic" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "name" TEXT NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "tagline" TEXT,
  "overview" TEXT NOT NULL,
  "logoColor" TEXT NOT NULL DEFAULT 'teal',
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "zip" TEXT NOT NULL,
  "serviceArea" TEXT,
  "specialties" TEXT NOT NULL,
  "capabilities" TEXT,
  "telehealth" BOOLEAN NOT NULL DEFAULT false,
  "providerTypes" TEXT,
  "phone" TEXT,
  "email" TEXT,
  "website" TEXT,
  "hours" TEXT,
  "verified" BOOLEAN NOT NULL DEFAULT false,
  "verificationStatus" TEXT NOT NULL DEFAULT 'pending',
  "verificationNotes" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "deletedAt" TIMESTAMP WITH TIME ZONE,
  "acceptingNewPatients" BOOLEAN NOT NULL DEFAULT true,
  "claimStatus" TEXT NOT NULL DEFAULT 'unclaimed',
  "profileCompleteness" INTEGER NOT NULL DEFAULT 50,
  "initialConsultPrice" INTEGER,
  "membershipPrice" INTEGER,
  "insuranceAccepted" BOOLEAN NOT NULL DEFAULT false,
  "hsaFsaAccepted" BOOLEAN NOT NULL DEFAULT true,
  "earliestAvailability" TEXT,
  "statesServed" TEXT,
  "languages" TEXT NOT NULL DEFAULT 'English',
  "accessibility" TEXT NOT NULL DEFAULT 'Wheelchair accessible',
  "pricingStatus" TEXT NOT NULL DEFAULT 'Full Pricing Published',
  "whatToExpect" TEXT
);

CREATE INDEX IF NOT EXISTS "Clinic_state_idx" ON "Clinic"("state");
CREATE INDEX IF NOT EXISTS "Clinic_verified_idx" ON "Clinic"("verified");
CREATE INDEX IF NOT EXISTS "Clinic_slug_idx" ON "Clinic"("slug");

-- ClinicLocation table
CREATE TABLE IF NOT EXISTS "ClinicLocation" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "clinicId" TEXT NOT NULL REFERENCES "Clinic"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "phone" TEXT,
  "hours" TEXT,
  "parking" TEXT,
  "transit" TEXT,
  "accessibility" TEXT,
  "onSiteLab" BOOLEAN NOT NULL DEFAULT false,
  "phlebotomy" BOOLEAN NOT NULL DEFAULT false,
  "earliestAppt" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "ClinicLocation_clinicId_idx" ON "ClinicLocation"("clinicId");

-- ClinicProvider table
CREATE TABLE IF NOT EXISTS "ClinicProvider" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "clinicId" TEXT NOT NULL REFERENCES "Clinic"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "credentials" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "specialties" TEXT,
  "yearsExperience" INTEGER NOT NULL DEFAULT 0,
  "bio" TEXT,
  "languages" TEXT DEFAULT 'English',
  "telehealth" BOOLEAN NOT NULL DEFAULT false,
  "avatarUrl" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "ClinicProvider_clinicId_idx" ON "ClinicProvider"("clinicId");

-- ClinicTreatment table
CREATE TABLE IF NOT EXISTS "ClinicTreatment" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "clinicId" TEXT NOT NULL REFERENCES "Clinic"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "description" TEXT,
  "concerns" TEXT,
  "priceRange" TEXT,
  "labRequired" BOOLEAN NOT NULL DEFAULT false,
  "consultRequired" BOOLEAN NOT NULL DEFAULT true,
  "careFormat" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "ClinicTreatment_clinicId_idx" ON "ClinicTreatment"("clinicId");

-- ClinicReview table
CREATE TABLE IF NOT EXISTS "ClinicReview" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "clinicId" TEXT NOT NULL REFERENCES "Clinic"("id") ON DELETE CASCADE,
  "rating" INTEGER NOT NULL,
  "author" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "category" TEXT,
  "verifiedPatient" BOOLEAN NOT NULL DEFAULT true,
  "response" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "ClinicReview_clinicId_idx" ON "ClinicReview"("clinicId");

-- Professional table
CREATE TABLE IF NOT EXISTS "Professional" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "name" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "remote" BOOLEAN NOT NULL DEFAULT false,
  "licenses" TEXT,
  "licensedStates" TEXT,
  "certifications" TEXT,
  "specialties" TEXT,
  "yearsExperience" INTEGER NOT NULL DEFAULT 0,
  "availability" TEXT NOT NULL DEFAULT 'open',
  "employmentPref" TEXT NOT NULL DEFAULT 'full-time',
  "bio" TEXT,
  "verified" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "Professional_state_idx" ON "Professional"("state");
CREATE INDEX IF NOT EXISTS "Professional_title_idx" ON "Professional"("title");

-- JobPosting table
CREATE TABLE IF NOT EXISTS "JobPosting" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "clinicName" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "employmentType" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "remote" BOOLEAN NOT NULL DEFAULT false,
  "requiredLicenses" TEXT,
  "requiredExperience" TEXT,
  "treatmentSpecialties" TEXT,
  "compMin" INTEGER,
  "compMax" INTEGER,
  "schedule" TEXT,
  "description" TEXT NOT NULL,
  "applicationRequirements" TEXT,
  "status" TEXT NOT NULL DEFAULT 'open',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "JobPosting_state_idx" ON "JobPosting"("state");
CREATE INDEX IF NOT EXISTS "JobPosting_title_idx" ON "JobPosting"("title");

-- JobApplication table
CREATE TABLE IF NOT EXISTS "JobApplication" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "jobPostingId" TEXT NOT NULL REFERENCES "JobPosting"("id") ON DELETE CASCADE,
  "professionalId" TEXT REFERENCES "Professional"("id"),
  "applicantName" TEXT NOT NULL,
  "applicantEmail" TEXT NOT NULL,
  "applicantPhone" TEXT,
  "coverNote" TEXT,
  "status" TEXT NOT NULL DEFAULT 'submitted',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "JobApplication_jobPostingId_idx" ON "JobApplication"("jobPostingId");

-- Vendor table
CREATE TABLE IF NOT EXISTS "Vendor" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "name" TEXT NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "overview" TEXT,
  "website" TEXT,
  "verified" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- MarketplaceListing table
CREATE TABLE IF NOT EXISTS "MarketplaceListing" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "vendorId" TEXT NOT NULL REFERENCES "Vendor"("id") ON DELETE CASCADE,
  "vendorName" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "category" TEXT NOT NULL,
  "listingType" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "pricingModel" TEXT,
  "priceNote" TEXT,
  "availability" TEXT NOT NULL DEFAULT 'in-stock',
  "imageColor" TEXT NOT NULL DEFAULT 'teal',
  "verified" BOOLEAN NOT NULL DEFAULT false,
  "reviewStatus" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "MarketplaceListing_category_idx" ON "MarketplaceListing"("category");
CREATE INDEX IF NOT EXISTS "MarketplaceListing_listingType_idx" ON "MarketplaceListing"("listingType");
CREATE INDEX IF NOT EXISTS "MarketplaceListing_reviewStatus_idx" ON "MarketplaceListing"("reviewStatus");

-- QuoteRequest table
CREATE TABLE IF NOT EXISTS "QuoteRequest" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "listingId" TEXT NOT NULL REFERENCES "MarketplaceListing"("id") ON DELETE CASCADE,
  "requesterName" TEXT NOT NULL,
  "requesterEmail" TEXT NOT NULL,
  "requesterOrg" TEXT,
  "quantity" TEXT,
  "notes" TEXT,
  "status" TEXT NOT NULL DEFAULT 'new',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "QuoteRequest_listingId_idx" ON "QuoteRequest"("listingId");

-- Article table
CREATE TABLE IF NOT EXISTS "Article" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "title" TEXT NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "category" TEXT NOT NULL,
  "excerpt" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "author" TEXT NOT NULL,
  "medicalReviewer" TEXT,
  "readingTime" INTEGER NOT NULL DEFAULT 5,
  "publishedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "references" TEXT,
  "relatedTreatment" TEXT,
  "status" TEXT NOT NULL DEFAULT 'published',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "Article_category_idx" ON "Article"("category");
CREATE INDEX IF NOT EXISTS "Article_slug_idx" ON "Article"("slug");

-- AssessmentSubmission table
CREATE TABLE IF NOT EXISTS "AssessmentSubmission" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "treatmentType" TEXT,
  "ageRange" TEXT,
  "locationState" TEXT,
  "zip" TEXT,
  "concerns" TEXT,
  "symptoms" TEXT,
  "treatmentInterest" TEXT,
  "careFormat" TEXT,
  "telehealthPref" BOOLEAN NOT NULL DEFAULT false,
  "timeline" TEXT,
  "selfPayOpenness" TEXT,
  "budgetRange" TEXT,
  "firstName" TEXT,
  "lastName" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "preferredContact" TEXT,
  "bestTime" TEXT,
  "consentContact" BOOLEAN NOT NULL DEFAULT false,
  "consentSms" BOOLEAN NOT NULL DEFAULT false,
  "contactName" TEXT,
  "contactEmail" TEXT,
  "consent" BOOLEAN NOT NULL DEFAULT false,
  "internalStatus" TEXT,
  "matchedClinicIds" TEXT,
  "sourcePage" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "AssessmentSubmission_createdAt_idx" ON "AssessmentSubmission"("createdAt");
CREATE INDEX IF NOT EXISTS "AssessmentSubmission_treatmentType_idx" ON "AssessmentSubmission"("treatmentType");
CREATE INDEX IF NOT EXISTS "AssessmentSubmission_email_idx" ON "AssessmentSubmission"("email");

-- ConsultationRequest table
CREATE TABLE IF NOT EXISTS "ConsultationRequest" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "clinicId" TEXT REFERENCES "Clinic"("id"),
  "clinicName" TEXT NOT NULL,
  "patientName" TEXT NOT NULL,
  "patientEmail" TEXT NOT NULL,
  "patientPhone" TEXT,
  "preferredTime" TEXT,
  "treatmentInterest" TEXT,
  "notes" TEXT,
  "status" TEXT NOT NULL DEFAULT 'new',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "ConsultationRequest_clinicId_idx" ON "ConsultationRequest"("clinicId");
CREATE INDEX IF NOT EXISTS "ConsultationRequest_status_idx" ON "ConsultationRequest"("status");

-- ContactSubmission table
CREATE TABLE IF NOT EXISTS "ContactSubmission" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- NewsletterSignup table
CREATE TABLE IF NOT EXISTS "NewsletterSignup" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "email" TEXT UNIQUE NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ClinicOnboarding table
CREATE TABLE IF NOT EXISTS "ClinicOnboarding" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "clinicName" TEXT NOT NULL,
  "contactName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "city" TEXT,
  "state" TEXT,
  "specialties" TEXT,
  "currentVolume" TEXT,
  "goals" TEXT,
  "status" TEXT NOT NULL DEFAULT 'new',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ClinicApplication table
CREATE TABLE IF NOT EXISTS "ClinicApplication" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "applicationId" TEXT UNIQUE NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "legalName" TEXT NOT NULL,
  "dbaName" TEXT,
  "parentOrg" TEXT,
  "orgType" TEXT,
  "ownershipType" TEXT,
  "yearEstablished" TEXT,
  "website" TEXT,
  "mainPhone" TEXT,
  "generalEmail" TEXT,
  "orgDescription" TEXT,
  "locationCount" TEXT,
  "providerCount" TEXT,
  "employeeCount" TEXT,
  "dmFirstName" TEXT NOT NULL,
  "dmLastName" TEXT NOT NULL,
  "dmTitle" TEXT,
  "dmRole" TEXT,
  "dmEmail" TEXT NOT NULL,
  "dmPhone" TEXT,
  "dmMobile" TEXT,
  "dmPreferredContact" TEXT,
  "dmBestTime" TEXT,
  "dmLinkedin" TEXT,
  "dmAuthorized" BOOLEAN NOT NULL DEFAULT false,
  "dmFinalDecisionMaker" BOOLEAN NOT NULL DEFAULT false,
  "orgNpi" TEXT,
  "taxonomyCode" TEXT,
  "medicalDirector" TEXT,
  "medicalDirectorNpi" TEXT,
  "licenseStates" TEXT,
  "accreditation" TEXT,
  "treatments" TEXT,
  "monthlyInquiries" TEXT,
  "monthlyConsults" TEXT,
  "monthlyNewPatients" TEXT,
  "acquisitionChannels" TEXT,
  "responseTime" TEXT,
  "intakeMethod" TEXT,
  "crmSystem" TEXT,
  "acquisitionInterest" TEXT,
  "weeklyCapacity" TEXT,
  "monthlyCapacity" TEXT,
  "growthServices" TEXT,
  "commercialModel" TEXT,
  "budgetRange" TEXT,
  "workforceNeeds" TEXT,
  "marketplaceNeeds" TEXT,
  "shortDescription" TEXT,
  "fullBio" TEXT,
  "mission" TEXT,
  "differentiator" TEXT,
  "idealPatient" TEXT,
  "consultationProcess" TEXT,
  "insuranceInfo" TEXT,
  "selfPayInfo" TEXT,
  "financingInfo" TEXT,
  "languages" TEXT,
  "accessibility" TEXT,
  "amenities" TEXT,
  "bookingUrl" TEXT,
  "socialUrls" TEXT,
  "accuracyConfirm" BOOLEAN NOT NULL DEFAULT false,
  "verifyConsent" BOOLEAN NOT NULL DEFAULT false,
  "mediaConsent" BOOLEAN NOT NULL DEFAULT false,
  "termsConsent" BOOLEAN NOT NULL DEFAULT false,
  "contactConsent" BOOLEAN NOT NULL DEFAULT false,
  "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
  "referralSource" TEXT,
  "notes" TEXT,
  "submittedAt" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "ClinicApplication_status_idx" ON "ClinicApplication"("status");
CREATE INDEX IF NOT EXISTS "ClinicApplication_generalEmail_idx" ON "ClinicApplication"("generalEmail");
CREATE INDEX IF NOT EXISTS "ClinicApplication_dmEmail_idx" ON "ClinicApplication"("dmEmail");

-- ProfessionalOnboarding table
CREATE TABLE IF NOT EXISTS "ProfessionalOnboarding" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "state" TEXT,
  "licenses" TEXT,
  "experience" TEXT,
  "preferences" TEXT,
  "status" TEXT NOT NULL DEFAULT 'new',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- VendorOnboarding table
CREATE TABLE IF NOT EXISTS "VendorOnboarding" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "companyName" TEXT NOT NULL,
  "contactName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "category" TEXT,
  "productTypes" TEXT,
  "website" TEXT,
  "notes" TEXT,
  "status" TEXT NOT NULL DEFAULT 'new',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AuditLog table
CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT,
  "actor" TEXT,
  "detail" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "AuditLog_entity_idx" ON "AuditLog"("entity");
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

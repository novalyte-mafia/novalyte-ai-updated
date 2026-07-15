export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      Article: {
        Row: {
          author: string
          category: string
          content: string
          createdAt: string
          excerpt: string
          id: string
          medicalReviewer: string | null
          publishedAt: string
          readingTime: number
          references: string | null
          relatedTreatment: string | null
          slug: string
          status: string
          title: string
          updatedAt: string
        }
        Insert: {
          author: string
          category: string
          content: string
          createdAt?: string
          excerpt: string
          id?: string
          medicalReviewer?: string | null
          publishedAt?: string
          readingTime?: number
          references?: string | null
          relatedTreatment?: string | null
          slug: string
          status?: string
          title: string
          updatedAt?: string
        }
        Update: {
          author?: string
          category?: string
          content?: string
          createdAt?: string
          excerpt?: string
          id?: string
          medicalReviewer?: string | null
          publishedAt?: string
          readingTime?: number
          references?: string | null
          relatedTreatment?: string | null
          slug?: string
          status?: string
          title?: string
          updatedAt?: string
        }
        Relationships: []
      }
      AssessmentSubmission: {
        Row: {
          ageRange: string | null
          bestTime: string | null
          budgetRange: string | null
          careFormat: string | null
          concerns: string | null
          consent: boolean
          consentContact: boolean
          consentSms: boolean
          contactEmail: string | null
          contactName: string | null
          createdAt: string
          email: string | null
          firstName: string | null
          id: string
          internalStatus: string | null
          lastName: string | null
          locationState: string | null
          matchedClinicIds: string | null
          phone: string | null
          preferredContact: string | null
          selfPayOpenness: string | null
          sourcePage: string | null
          symptoms: string | null
          telehealthPref: boolean
          timeline: string | null
          treatmentInterest: string | null
          treatmentType: string | null
          zip: string | null
        }
        Insert: {
          ageRange?: string | null
          bestTime?: string | null
          budgetRange?: string | null
          careFormat?: string | null
          concerns?: string | null
          consent?: boolean
          consentContact?: boolean
          consentSms?: boolean
          contactEmail?: string | null
          contactName?: string | null
          createdAt?: string
          email?: string | null
          firstName?: string | null
          id?: string
          internalStatus?: string | null
          lastName?: string | null
          locationState?: string | null
          matchedClinicIds?: string | null
          phone?: string | null
          preferredContact?: string | null
          selfPayOpenness?: string | null
          sourcePage?: string | null
          symptoms?: string | null
          telehealthPref?: boolean
          timeline?: string | null
          treatmentInterest?: string | null
          treatmentType?: string | null
          zip?: string | null
        }
        Update: {
          ageRange?: string | null
          bestTime?: string | null
          budgetRange?: string | null
          careFormat?: string | null
          concerns?: string | null
          consent?: boolean
          consentContact?: boolean
          consentSms?: boolean
          contactEmail?: string | null
          contactName?: string | null
          createdAt?: string
          email?: string | null
          firstName?: string | null
          id?: string
          internalStatus?: string | null
          lastName?: string | null
          locationState?: string | null
          matchedClinicIds?: string | null
          phone?: string | null
          preferredContact?: string | null
          selfPayOpenness?: string | null
          sourcePage?: string | null
          symptoms?: string | null
          telehealthPref?: boolean
          timeline?: string | null
          treatmentInterest?: string | null
          treatmentType?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      AuditLog: {
        Row: {
          action: string
          actor: string | null
          createdAt: string
          detail: string | null
          entity: string
          entityId: string | null
          id: string
        }
        Insert: {
          action: string
          actor?: string | null
          createdAt?: string
          detail?: string | null
          entity: string
          entityId?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor?: string | null
          createdAt?: string
          detail?: string | null
          entity?: string
          entityId?: string | null
          id?: string
        }
        Relationships: []
      }
      Clinic: {
        Row: {
          acceptingNewPatients: boolean
          accessibility: string
          capabilities: string | null
          city: string
          claimStatus: string
          createdAt: string
          deletedAt: string | null
          earliestAvailability: string | null
          email: string | null
          hours: string | null
          hsaFsaAccepted: boolean
          id: string
          initialConsultPrice: number | null
          insuranceAccepted: boolean
          languages: string
          logoColor: string
          membershipPrice: number | null
          name: string
          overview: string
          phone: string | null
          pricingStatus: string
          profileCompleteness: number
          providerTypes: string | null
          serviceArea: string | null
          slug: string
          specialties: string
          state: string
          statesServed: string | null
          tagline: string | null
          telehealth: boolean
          updatedAt: string
          verificationNotes: string | null
          verificationStatus: string
          verified: boolean
          website: string | null
          whatToExpect: string | null
          zip: string
        }
        Insert: {
          acceptingNewPatients?: boolean
          accessibility?: string
          capabilities?: string | null
          city: string
          claimStatus?: string
          createdAt?: string
          deletedAt?: string | null
          earliestAvailability?: string | null
          email?: string | null
          hours?: string | null
          hsaFsaAccepted?: boolean
          id?: string
          initialConsultPrice?: number | null
          insuranceAccepted?: boolean
          languages?: string
          logoColor?: string
          membershipPrice?: number | null
          name: string
          overview: string
          phone?: string | null
          pricingStatus?: string
          profileCompleteness?: number
          providerTypes?: string | null
          serviceArea?: string | null
          slug: string
          specialties: string
          state: string
          statesServed?: string | null
          tagline?: string | null
          telehealth?: boolean
          updatedAt?: string
          verificationNotes?: string | null
          verificationStatus?: string
          verified?: boolean
          website?: string | null
          whatToExpect?: string | null
          zip: string
        }
        Update: {
          acceptingNewPatients?: boolean
          accessibility?: string
          capabilities?: string | null
          city?: string
          claimStatus?: string
          createdAt?: string
          deletedAt?: string | null
          earliestAvailability?: string | null
          email?: string | null
          hours?: string | null
          hsaFsaAccepted?: boolean
          id?: string
          initialConsultPrice?: number | null
          insuranceAccepted?: boolean
          languages?: string
          logoColor?: string
          membershipPrice?: number | null
          name?: string
          overview?: string
          phone?: string | null
          pricingStatus?: string
          profileCompleteness?: number
          providerTypes?: string | null
          serviceArea?: string | null
          slug?: string
          specialties?: string
          state?: string
          statesServed?: string | null
          tagline?: string | null
          telehealth?: boolean
          updatedAt?: string
          verificationNotes?: string | null
          verificationStatus?: string
          verified?: boolean
          website?: string | null
          whatToExpect?: string | null
          zip?: string
        }
        Relationships: []
      }
      ClinicApplication: {
        Row: {
          accessibility: string | null
          accreditation: string | null
          accuracyConfirm: boolean
          acquisitionChannels: string | null
          acquisitionInterest: string | null
          amenities: string | null
          applicationId: string
          bookingUrl: string | null
          budgetRange: string | null
          commercialModel: string | null
          consultationProcess: string | null
          contactConsent: boolean
          createdAt: string
          crmSystem: string | null
          dbaName: string | null
          differentiator: string | null
          dmAuthorized: boolean
          dmBestTime: string | null
          dmEmail: string
          dmFinalDecisionMaker: boolean
          dmFirstName: string
          dmLastName: string
          dmLinkedin: string | null
          dmMobile: string | null
          dmPhone: string | null
          dmPreferredContact: string | null
          dmRole: string | null
          dmTitle: string | null
          employeeCount: string | null
          financingInfo: string | null
          fullBio: string | null
          generalEmail: string | null
          growthServices: string | null
          id: string
          idealPatient: string | null
          insuranceInfo: string | null
          intakeMethod: string | null
          languages: string | null
          legalName: string
          licenseStates: string | null
          locationCount: string | null
          mainPhone: string | null
          marketingConsent: boolean
          marketplaceNeeds: string | null
          mediaConsent: boolean
          medicalDirector: string | null
          medicalDirectorNpi: string | null
          mission: string | null
          monthlyCapacity: string | null
          monthlyConsults: string | null
          monthlyInquiries: string | null
          monthlyNewPatients: string | null
          notes: string | null
          orgDescription: string | null
          orgNpi: string | null
          orgType: string | null
          ownershipType: string | null
          parentOrg: string | null
          providerCount: string | null
          referralSource: string | null
          responseTime: string | null
          selfPayInfo: string | null
          shortDescription: string | null
          socialUrls: string | null
          status: string
          submittedAt: string | null
          taxonomyCode: string | null
          termsConsent: boolean
          treatments: string | null
          updatedAt: string
          verifyConsent: boolean
          website: string | null
          weeklyCapacity: string | null
          workforceNeeds: string | null
          yearEstablished: string | null
        }
        Insert: {
          accessibility?: string | null
          accreditation?: string | null
          accuracyConfirm?: boolean
          acquisitionChannels?: string | null
          acquisitionInterest?: string | null
          amenities?: string | null
          applicationId: string
          bookingUrl?: string | null
          budgetRange?: string | null
          commercialModel?: string | null
          consultationProcess?: string | null
          contactConsent?: boolean
          createdAt?: string
          crmSystem?: string | null
          dbaName?: string | null
          differentiator?: string | null
          dmAuthorized?: boolean
          dmBestTime?: string | null
          dmEmail: string
          dmFinalDecisionMaker?: boolean
          dmFirstName: string
          dmLastName: string
          dmLinkedin?: string | null
          dmMobile?: string | null
          dmPhone?: string | null
          dmPreferredContact?: string | null
          dmRole?: string | null
          dmTitle?: string | null
          employeeCount?: string | null
          financingInfo?: string | null
          fullBio?: string | null
          generalEmail?: string | null
          growthServices?: string | null
          id?: string
          idealPatient?: string | null
          insuranceInfo?: string | null
          intakeMethod?: string | null
          languages?: string | null
          legalName: string
          licenseStates?: string | null
          locationCount?: string | null
          mainPhone?: string | null
          marketingConsent?: boolean
          marketplaceNeeds?: string | null
          mediaConsent?: boolean
          medicalDirector?: string | null
          medicalDirectorNpi?: string | null
          mission?: string | null
          monthlyCapacity?: string | null
          monthlyConsults?: string | null
          monthlyInquiries?: string | null
          monthlyNewPatients?: string | null
          notes?: string | null
          orgDescription?: string | null
          orgNpi?: string | null
          orgType?: string | null
          ownershipType?: string | null
          parentOrg?: string | null
          providerCount?: string | null
          referralSource?: string | null
          responseTime?: string | null
          selfPayInfo?: string | null
          shortDescription?: string | null
          socialUrls?: string | null
          status?: string
          submittedAt?: string | null
          taxonomyCode?: string | null
          termsConsent?: boolean
          treatments?: string | null
          updatedAt?: string
          verifyConsent?: boolean
          website?: string | null
          weeklyCapacity?: string | null
          workforceNeeds?: string | null
          yearEstablished?: string | null
        }
        Update: {
          accessibility?: string | null
          accreditation?: string | null
          accuracyConfirm?: boolean
          acquisitionChannels?: string | null
          acquisitionInterest?: string | null
          amenities?: string | null
          applicationId?: string
          bookingUrl?: string | null
          budgetRange?: string | null
          commercialModel?: string | null
          consultationProcess?: string | null
          contactConsent?: boolean
          createdAt?: string
          crmSystem?: string | null
          dbaName?: string | null
          differentiator?: string | null
          dmAuthorized?: boolean
          dmBestTime?: string | null
          dmEmail?: string
          dmFinalDecisionMaker?: boolean
          dmFirstName?: string
          dmLastName?: string
          dmLinkedin?: string | null
          dmMobile?: string | null
          dmPhone?: string | null
          dmPreferredContact?: string | null
          dmRole?: string | null
          dmTitle?: string | null
          employeeCount?: string | null
          financingInfo?: string | null
          fullBio?: string | null
          generalEmail?: string | null
          growthServices?: string | null
          id?: string
          idealPatient?: string | null
          insuranceInfo?: string | null
          intakeMethod?: string | null
          languages?: string | null
          legalName?: string
          licenseStates?: string | null
          locationCount?: string | null
          mainPhone?: string | null
          marketingConsent?: boolean
          marketplaceNeeds?: string | null
          mediaConsent?: boolean
          medicalDirector?: string | null
          medicalDirectorNpi?: string | null
          mission?: string | null
          monthlyCapacity?: string | null
          monthlyConsults?: string | null
          monthlyInquiries?: string | null
          monthlyNewPatients?: string | null
          notes?: string | null
          orgDescription?: string | null
          orgNpi?: string | null
          orgType?: string | null
          ownershipType?: string | null
          parentOrg?: string | null
          providerCount?: string | null
          referralSource?: string | null
          responseTime?: string | null
          selfPayInfo?: string | null
          shortDescription?: string | null
          socialUrls?: string | null
          status?: string
          submittedAt?: string | null
          taxonomyCode?: string | null
          termsConsent?: boolean
          treatments?: string | null
          updatedAt?: string
          verifyConsent?: boolean
          website?: string | null
          weeklyCapacity?: string | null
          workforceNeeds?: string | null
          yearEstablished?: string | null
        }
        Relationships: []
      }
      ClinicLocation: {
        Row: {
          accessibility: string | null
          address: string
          clinicId: string
          createdAt: string
          earliestAppt: string | null
          hours: string | null
          id: string
          name: string
          onSiteLab: boolean
          parking: string | null
          phlebotomy: boolean
          phone: string | null
          transit: string | null
          updatedAt: string
        }
        Insert: {
          accessibility?: string | null
          address: string
          clinicId: string
          createdAt?: string
          earliestAppt?: string | null
          hours?: string | null
          id?: string
          name: string
          onSiteLab?: boolean
          parking?: string | null
          phlebotomy?: boolean
          phone?: string | null
          transit?: string | null
          updatedAt?: string
        }
        Update: {
          accessibility?: string | null
          address?: string
          clinicId?: string
          createdAt?: string
          earliestAppt?: string | null
          hours?: string | null
          id?: string
          name?: string
          onSiteLab?: boolean
          parking?: string | null
          phlebotomy?: boolean
          phone?: string | null
          transit?: string | null
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "ClinicLocation_clinicId_fkey"
            columns: ["clinicId"]
            isOneToOne: false
            referencedRelation: "Clinic"
            referencedColumns: ["id"]
          },
        ]
      }
      ClinicOnboarding: {
        Row: {
          city: string | null
          clinicName: string
          contactName: string
          createdAt: string
          currentVolume: string | null
          email: string
          goals: string | null
          id: string
          phone: string | null
          specialties: string | null
          state: string | null
          status: string
        }
        Insert: {
          city?: string | null
          clinicName: string
          contactName: string
          createdAt?: string
          currentVolume?: string | null
          email: string
          goals?: string | null
          id?: string
          phone?: string | null
          specialties?: string | null
          state?: string | null
          status?: string
        }
        Update: {
          city?: string | null
          clinicName?: string
          contactName?: string
          createdAt?: string
          currentVolume?: string | null
          email?: string
          goals?: string | null
          id?: string
          phone?: string | null
          specialties?: string | null
          state?: string | null
          status?: string
        }
        Relationships: []
      }
      ClinicProvider: {
        Row: {
          avatarUrl: string | null
          bio: string | null
          clinicId: string
          createdAt: string
          credentials: string
          id: string
          languages: string | null
          name: string
          role: string
          specialties: string | null
          telehealth: boolean
          updatedAt: string
          yearsExperience: number
        }
        Insert: {
          avatarUrl?: string | null
          bio?: string | null
          clinicId: string
          createdAt?: string
          credentials: string
          id?: string
          languages?: string | null
          name: string
          role: string
          specialties?: string | null
          telehealth?: boolean
          updatedAt?: string
          yearsExperience?: number
        }
        Update: {
          avatarUrl?: string | null
          bio?: string | null
          clinicId?: string
          createdAt?: string
          credentials?: string
          id?: string
          languages?: string | null
          name?: string
          role?: string
          specialties?: string | null
          telehealth?: boolean
          updatedAt?: string
          yearsExperience?: number
        }
        Relationships: [
          {
            foreignKeyName: "ClinicProvider_clinicId_fkey"
            columns: ["clinicId"]
            isOneToOne: false
            referencedRelation: "Clinic"
            referencedColumns: ["id"]
          },
        ]
      }
      ClinicReview: {
        Row: {
          author: string
          category: string | null
          clinicId: string
          content: string
          createdAt: string
          id: string
          rating: number
          response: string | null
          updatedAt: string
          verifiedPatient: boolean
        }
        Insert: {
          author: string
          category?: string | null
          clinicId: string
          content: string
          createdAt?: string
          id?: string
          rating: number
          response?: string | null
          updatedAt?: string
          verifiedPatient?: boolean
        }
        Update: {
          author?: string
          category?: string | null
          clinicId?: string
          content?: string
          createdAt?: string
          id?: string
          rating?: number
          response?: string | null
          updatedAt?: string
          verifiedPatient?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "ClinicReview_clinicId_fkey"
            columns: ["clinicId"]
            isOneToOne: false
            referencedRelation: "Clinic"
            referencedColumns: ["id"]
          },
        ]
      }
      ClinicTreatment: {
        Row: {
          careFormat: string | null
          category: string
          clinicId: string
          concerns: string | null
          consultRequired: boolean
          createdAt: string
          description: string | null
          id: string
          labRequired: boolean
          name: string
          priceRange: string | null
          updatedAt: string
        }
        Insert: {
          careFormat?: string | null
          category: string
          clinicId: string
          concerns?: string | null
          consultRequired?: boolean
          createdAt?: string
          description?: string | null
          id?: string
          labRequired?: boolean
          name: string
          priceRange?: string | null
          updatedAt?: string
        }
        Update: {
          careFormat?: string | null
          category?: string
          clinicId?: string
          concerns?: string | null
          consultRequired?: boolean
          createdAt?: string
          description?: string | null
          id?: string
          labRequired?: boolean
          name?: string
          priceRange?: string | null
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "ClinicTreatment_clinicId_fkey"
            columns: ["clinicId"]
            isOneToOne: false
            referencedRelation: "Clinic"
            referencedColumns: ["id"]
          },
        ]
      }
      ConsultationRequest: {
        Row: {
          clinicId: string | null
          clinicName: string
          createdAt: string
          id: string
          notes: string | null
          patientEmail: string
          patientName: string
          patientPhone: string | null
          preferredTime: string | null
          status: string
          treatmentInterest: string | null
        }
        Insert: {
          clinicId?: string | null
          clinicName: string
          createdAt?: string
          id?: string
          notes?: string | null
          patientEmail: string
          patientName: string
          patientPhone?: string | null
          preferredTime?: string | null
          status?: string
          treatmentInterest?: string | null
        }
        Update: {
          clinicId?: string | null
          clinicName?: string
          createdAt?: string
          id?: string
          notes?: string | null
          patientEmail?: string
          patientName?: string
          patientPhone?: string | null
          preferredTime?: string | null
          status?: string
          treatmentInterest?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ConsultationRequest_clinicId_fkey"
            columns: ["clinicId"]
            isOneToOne: false
            referencedRelation: "Clinic"
            referencedColumns: ["id"]
          },
        ]
      }
      ContactSubmission: {
        Row: {
          createdAt: string
          email: string
          id: string
          message: string
          name: string
          role: string
        }
        Insert: {
          createdAt?: string
          email: string
          id?: string
          message: string
          name: string
          role: string
        }
        Update: {
          createdAt?: string
          email?: string
          id?: string
          message?: string
          name?: string
          role?: string
        }
        Relationships: []
      }
      JobApplication: {
        Row: {
          applicantEmail: string
          applicantName: string
          applicantPhone: string | null
          coverNote: string | null
          createdAt: string
          id: string
          jobPostingId: string
          professionalId: string | null
          status: string
        }
        Insert: {
          applicantEmail: string
          applicantName: string
          applicantPhone?: string | null
          coverNote?: string | null
          createdAt?: string
          id?: string
          jobPostingId: string
          professionalId?: string | null
          status?: string
        }
        Update: {
          applicantEmail?: string
          applicantName?: string
          applicantPhone?: string | null
          coverNote?: string | null
          createdAt?: string
          id?: string
          jobPostingId?: string
          professionalId?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "JobApplication_jobPostingId_fkey"
            columns: ["jobPostingId"]
            isOneToOne: false
            referencedRelation: "JobPosting"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "JobApplication_professionalId_fkey"
            columns: ["professionalId"]
            isOneToOne: false
            referencedRelation: "Professional"
            referencedColumns: ["id"]
          },
        ]
      }
      JobPosting: {
        Row: {
          applicationRequirements: string | null
          city: string
          clinicName: string
          compMax: number | null
          compMin: number | null
          createdAt: string
          description: string
          employmentType: string
          id: string
          remote: boolean
          requiredExperience: string | null
          requiredLicenses: string | null
          schedule: string | null
          state: string
          status: string
          title: string
          treatmentSpecialties: string | null
          updatedAt: string
        }
        Insert: {
          applicationRequirements?: string | null
          city: string
          clinicName: string
          compMax?: number | null
          compMin?: number | null
          createdAt?: string
          description: string
          employmentType: string
          id?: string
          remote?: boolean
          requiredExperience?: string | null
          requiredLicenses?: string | null
          schedule?: string | null
          state: string
          status?: string
          title: string
          treatmentSpecialties?: string | null
          updatedAt?: string
        }
        Update: {
          applicationRequirements?: string | null
          city?: string
          clinicName?: string
          compMax?: number | null
          compMin?: number | null
          createdAt?: string
          description?: string
          employmentType?: string
          id?: string
          remote?: boolean
          requiredExperience?: string | null
          requiredLicenses?: string | null
          schedule?: string | null
          state?: string
          status?: string
          title?: string
          treatmentSpecialties?: string | null
          updatedAt?: string
        }
        Relationships: []
      }
      MarketplaceListing: {
        Row: {
          availability: string
          category: string
          createdAt: string
          description: string
          id: string
          imageColor: string
          listingType: string
          priceNote: string | null
          pricingModel: string | null
          reviewStatus: string
          slug: string
          title: string
          updatedAt: string
          vendorId: string
          vendorName: string
          verified: boolean
        }
        Insert: {
          availability?: string
          category: string
          createdAt?: string
          description: string
          id?: string
          imageColor?: string
          listingType: string
          priceNote?: string | null
          pricingModel?: string | null
          reviewStatus?: string
          slug: string
          title: string
          updatedAt?: string
          vendorId: string
          vendorName: string
          verified?: boolean
        }
        Update: {
          availability?: string
          category?: string
          createdAt?: string
          description?: string
          id?: string
          imageColor?: string
          listingType?: string
          priceNote?: string | null
          pricingModel?: string | null
          reviewStatus?: string
          slug?: string
          title?: string
          updatedAt?: string
          vendorId?: string
          vendorName?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "MarketplaceListing_vendorId_fkey"
            columns: ["vendorId"]
            isOneToOne: false
            referencedRelation: "Vendor"
            referencedColumns: ["id"]
          },
        ]
      }
      NewsletterSignup: {
        Row: {
          createdAt: string
          email: string
          id: string
        }
        Insert: {
          createdAt?: string
          email: string
          id?: string
        }
        Update: {
          createdAt?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          applications: string | null
          createdAt: string
          id: string
          interests: string | null
          matches: string | null
          profileId: string
        }
        Insert: {
          applications?: string | null
          createdAt?: string
          id?: string
          interests?: string | null
          matches?: string | null
          profileId: string
        }
        Update: {
          applications?: string | null
          createdAt?: string
          id?: string
          interests?: string | null
          matches?: string | null
          profileId?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_profileId_fkey"
            columns: ["profileId"]
            isOneToOne: false
            referencedRelation: "workforce_professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          createdAt: string
          id: string
          link: string | null
          message: string
          profileId: string
          read: boolean | null
          title: string
          type: string
        }
        Insert: {
          createdAt?: string
          id?: string
          link?: string | null
          message: string
          profileId: string
          read?: boolean | null
          title: string
          type: string
        }
        Update: {
          createdAt?: string
          id?: string
          link?: string | null
          message?: string
          profileId?: string
          read?: boolean | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_profileId_fkey"
            columns: ["profileId"]
            isOneToOne: false
            referencedRelation: "workforce_professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      Professional: {
        Row: {
          availability: string
          bio: string | null
          certifications: string | null
          city: string
          createdAt: string
          employmentPref: string
          id: string
          licensedStates: string | null
          licenses: string | null
          name: string
          remote: boolean
          specialties: string | null
          state: string
          title: string
          updatedAt: string
          verified: boolean
          yearsExperience: number
        }
        Insert: {
          availability?: string
          bio?: string | null
          certifications?: string | null
          city: string
          createdAt?: string
          employmentPref?: string
          id?: string
          licensedStates?: string | null
          licenses?: string | null
          name: string
          remote?: boolean
          specialties?: string | null
          state: string
          title: string
          updatedAt?: string
          verified?: boolean
          yearsExperience?: number
        }
        Update: {
          availability?: string
          bio?: string | null
          certifications?: string | null
          city?: string
          createdAt?: string
          employmentPref?: string
          id?: string
          licensedStates?: string | null
          licenses?: string | null
          name?: string
          remote?: boolean
          specialties?: string | null
          state?: string
          title?: string
          updatedAt?: string
          verified?: boolean
          yearsExperience?: number
        }
        Relationships: []
      }
      professional_certifications: {
        Row: {
          authority: string
          createdAt: string
          expires: string | null
          id: string
          name: string
          profileId: string
        }
        Insert: {
          authority: string
          createdAt?: string
          expires?: string | null
          id?: string
          name: string
          profileId: string
        }
        Update: {
          authority?: string
          createdAt?: string
          expires?: string | null
          id?: string
          name?: string
          profileId?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_certifications_profileId_fkey"
            columns: ["profileId"]
            isOneToOne: false
            referencedRelation: "workforce_professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_documents: {
        Row: {
          createdAt: string
          id: string
          name: string
          path: string
          profileId: string
          size: number | null
          status: string | null
          type: string
        }
        Insert: {
          createdAt?: string
          id?: string
          name: string
          path: string
          profileId: string
          size?: number | null
          status?: string | null
          type: string
        }
        Update: {
          createdAt?: string
          id?: string
          name?: string
          path?: string
          profileId?: string
          size?: number | null
          status?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_documents_profileId_fkey"
            columns: ["profileId"]
            isOneToOne: false
            referencedRelation: "workforce_professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_education: {
        Row: {
          createdAt: string
          degree: string
          field: string
          graduationYear: string | null
          id: string
          profileId: string
          school: string
        }
        Insert: {
          createdAt?: string
          degree: string
          field: string
          graduationYear?: string | null
          id?: string
          profileId: string
          school: string
        }
        Update: {
          createdAt?: string
          degree?: string
          field?: string
          graduationYear?: string | null
          id?: string
          profileId?: string
          school?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_education_profileId_fkey"
            columns: ["profileId"]
            isOneToOne: false
            referencedRelation: "workforce_professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_employment_history: {
        Row: {
          createdAt: string
          current: boolean | null
          description: string | null
          employer: string
          endDate: string | null
          id: string
          position: string
          profileId: string
          sortOrder: number | null
          startDate: string
        }
        Insert: {
          createdAt?: string
          current?: boolean | null
          description?: string | null
          employer: string
          endDate?: string | null
          id?: string
          position: string
          profileId: string
          sortOrder?: number | null
          startDate: string
        }
        Update: {
          createdAt?: string
          current?: boolean | null
          description?: string | null
          employer?: string
          endDate?: string | null
          id?: string
          position?: string
          profileId?: string
          sortOrder?: number | null
          startDate?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_employment_history_profileId_fkey"
            columns: ["profileId"]
            isOneToOne: false
            referencedRelation: "workforce_professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_job_alerts: {
        Row: {
          active: boolean | null
          category: string | null
          createdAt: string
          frequency: string | null
          id: string
          name: string
          profileId: string
          state: string | null
          title: string | null
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          createdAt?: string
          frequency?: string | null
          id?: string
          name: string
          profileId: string
          state?: string | null
          title?: string | null
        }
        Update: {
          active?: boolean | null
          category?: string | null
          createdAt?: string
          frequency?: string | null
          id?: string
          name?: string
          profileId?: string
          state?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_job_alerts_profileId_fkey"
            columns: ["profileId"]
            isOneToOne: false
            referencedRelation: "workforce_professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_licenses: {
        Row: {
          createdAt: string
          expires: string | null
          id: string
          number: string
          profileId: string
          state: string
          status: string | null
          type: string
        }
        Insert: {
          createdAt?: string
          expires?: string | null
          id?: string
          number: string
          profileId: string
          state: string
          status?: string | null
          type: string
        }
        Update: {
          createdAt?: string
          expires?: string | null
          id?: string
          number?: string
          profileId?: string
          state?: string
          status?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_licenses_profileId_fkey"
            columns: ["profileId"]
            isOneToOne: false
            referencedRelation: "workforce_professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_preferences: {
        Row: {
          createdAt: string
          empTypes: string | null
          id: string
          minSalary: number | null
          profileId: string
          telehealth: boolean | null
          workArrangement: string | null
        }
        Insert: {
          createdAt?: string
          empTypes?: string | null
          id?: string
          minSalary?: number | null
          profileId: string
          telehealth?: boolean | null
          workArrangement?: string | null
        }
        Update: {
          createdAt?: string
          empTypes?: string | null
          id?: string
          minSalary?: number | null
          profileId?: string
          telehealth?: boolean | null
          workArrangement?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_preferences_profileId_fkey"
            columns: ["profileId"]
            isOneToOne: false
            referencedRelation: "workforce_professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_skills: {
        Row: {
          createdAt: string
          id: string
          level: string | null
          name: string
          profileId: string
        }
        Insert: {
          createdAt?: string
          id?: string
          level?: string | null
          name: string
          profileId: string
        }
        Update: {
          createdAt?: string
          id?: string
          level?: string | null
          name?: string
          profileId?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_skills_profileId_fkey"
            columns: ["profileId"]
            isOneToOne: false
            referencedRelation: "workforce_professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_social_links: {
        Row: {
          createdAt: string
          github: string | null
          id: string
          linkedin: string | null
          orcid: string | null
          portfolio: string | null
          profileId: string
          researchgate: string | null
          scholar: string | null
          visibility: string | null
          website: string | null
        }
        Insert: {
          createdAt?: string
          github?: string | null
          id?: string
          linkedin?: string | null
          orcid?: string | null
          portfolio?: string | null
          profileId: string
          researchgate?: string | null
          scholar?: string | null
          visibility?: string | null
          website?: string | null
        }
        Update: {
          createdAt?: string
          github?: string | null
          id?: string
          linkedin?: string | null
          orcid?: string | null
          portfolio?: string | null
          profileId?: string
          researchgate?: string | null
          scholar?: string | null
          visibility?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_social_links_profileId_fkey"
            columns: ["profileId"]
            isOneToOne: false
            referencedRelation: "workforce_professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ProfessionalOnboarding: {
        Row: {
          createdAt: string
          email: string
          experience: string | null
          id: string
          licenses: string | null
          name: string
          preferences: string | null
          state: string | null
          status: string
          title: string
        }
        Insert: {
          createdAt?: string
          email: string
          experience?: string | null
          id?: string
          licenses?: string | null
          name: string
          preferences?: string | null
          state?: string | null
          status?: string
          title: string
        }
        Update: {
          createdAt?: string
          email?: string
          experience?: string | null
          id?: string
          licenses?: string | null
          name?: string
          preferences?: string | null
          state?: string | null
          status?: string
          title?: string
        }
        Relationships: []
      }
      QuoteRequest: {
        Row: {
          createdAt: string
          id: string
          listingId: string
          notes: string | null
          quantity: string | null
          requesterEmail: string
          requesterName: string
          requesterOrg: string | null
          status: string
        }
        Insert: {
          createdAt?: string
          id?: string
          listingId: string
          notes?: string | null
          quantity?: string | null
          requesterEmail: string
          requesterName: string
          requesterOrg?: string | null
          status?: string
        }
        Update: {
          createdAt?: string
          id?: string
          listingId?: string
          notes?: string | null
          quantity?: string | null
          requesterEmail?: string
          requesterName?: string
          requesterOrg?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "QuoteRequest_listingId_fkey"
            columns: ["listingId"]
            isOneToOne: false
            referencedRelation: "MarketplaceListing"
            referencedColumns: ["id"]
          },
        ]
      }
      Vendor: {
        Row: {
          createdAt: string
          id: string
          name: string
          overview: string | null
          slug: string
          updatedAt: string
          verified: boolean
          website: string | null
        }
        Insert: {
          createdAt?: string
          id?: string
          name: string
          overview?: string | null
          slug: string
          updatedAt?: string
          verified?: boolean
          website?: string | null
        }
        Update: {
          createdAt?: string
          id?: string
          name?: string
          overview?: string | null
          slug?: string
          updatedAt?: string
          verified?: boolean
          website?: string | null
        }
        Relationships: []
      }
      VendorOnboarding: {
        Row: {
          category: string | null
          companyName: string
          contactName: string
          createdAt: string
          email: string
          id: string
          notes: string | null
          productTypes: string | null
          status: string
          website: string | null
        }
        Insert: {
          category?: string | null
          companyName: string
          contactName: string
          createdAt?: string
          email: string
          id?: string
          notes?: string | null
          productTypes?: string | null
          status?: string
          website?: string | null
        }
        Update: {
          category?: string | null
          companyName?: string
          contactName?: string
          createdAt?: string
          email?: string
          id?: string
          notes?: string | null
          productTypes?: string | null
          status?: string
          website?: string | null
        }
        Relationships: []
      }
      workforce_job_matches: {
        Row: {
          createdAt: string
          disqualifyingCriteria: string | null
          id: string
          jobId: string
          level: string
          matchedCriteria: string | null
          missingCriteria: string | null
          profileId: string
          score: number
          status: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          disqualifyingCriteria?: string | null
          id?: string
          jobId: string
          level: string
          matchedCriteria?: string | null
          missingCriteria?: string | null
          profileId: string
          score: number
          status?: string
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          disqualifyingCriteria?: string | null
          id?: string
          jobId?: string
          level?: string
          matchedCriteria?: string | null
          missingCriteria?: string | null
          profileId?: string
          score?: number
          status?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "workforce_job_matches_jobId_fkey"
            columns: ["jobId"]
            isOneToOne: false
            referencedRelation: "JobPosting"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_job_matches_profileId_fkey"
            columns: ["profileId"]
            isOneToOne: false
            referencedRelation: "workforce_professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workforce_professional_applications: {
        Row: {
          application_status: string
          bio: string | null
          created_at: string
          education: Json | null
          email: string
          employment_history: Json | null
          employment_preference: Json | null
          first_name: string
          id: string
          internal_notes: string | null
          last_name: string
          licenses: Json | null
          linkedin_url: string | null
          phone: string | null
          professional_title: string | null
          relocation_preference: boolean | null
          resume_url: string | null
          specialties: Json | null
          state_or_location: string | null
          telehealth_availability: boolean | null
          updated_at: string
          visibility_settings: Json | null
          work_arrangement: string | null
        }
        Insert: {
          application_status?: string
          bio?: string | null
          created_at?: string
          education?: Json | null
          email: string
          employment_history?: Json | null
          employment_preference?: Json | null
          first_name: string
          id?: string
          internal_notes?: string | null
          last_name: string
          licenses?: Json | null
          linkedin_url?: string | null
          phone?: string | null
          professional_title?: string | null
          relocation_preference?: boolean | null
          resume_url?: string | null
          specialties?: Json | null
          state_or_location?: string | null
          telehealth_availability?: boolean | null
          updated_at?: string
          visibility_settings?: Json | null
          work_arrangement?: string | null
        }
        Update: {
          application_status?: string
          bio?: string | null
          created_at?: string
          education?: Json | null
          email?: string
          employment_history?: Json | null
          employment_preference?: Json | null
          first_name?: string
          id?: string
          internal_notes?: string | null
          last_name?: string
          licenses?: Json | null
          linkedin_url?: string | null
          phone?: string | null
          professional_title?: string | null
          relocation_preference?: boolean | null
          resume_url?: string | null
          specialties?: Json | null
          state_or_location?: string | null
          telehealth_availability?: boolean | null
          updated_at?: string
          visibility_settings?: Json | null
          work_arrangement?: string | null
        }
        Relationships: []
      }
      workforce_professional_profiles: {
        Row: {
          availability: string | null
          bio: string | null
          category: string | null
          city: string
          createdAt: string
          email: string
          experience: number | null
          id: string
          name: string
          phone: string | null
          pronouns: string | null
          relocate: boolean | null
          specialty: string | null
          state: string
          status: string | null
          title: string
          updatedAt: string
        }
        Insert: {
          availability?: string | null
          bio?: string | null
          category?: string | null
          city: string
          createdAt?: string
          email: string
          experience?: number | null
          id?: string
          name: string
          phone?: string | null
          pronouns?: string | null
          relocate?: boolean | null
          specialty?: string | null
          state: string
          status?: string | null
          title: string
          updatedAt?: string
        }
        Update: {
          availability?: string | null
          bio?: string | null
          category?: string | null
          city?: string
          createdAt?: string
          email?: string
          experience?: number | null
          id?: string
          name?: string
          phone?: string | null
          pronouns?: string | null
          relocate?: boolean | null
          specialty?: string | null
          state?: string
          status?: string | null
          title?: string
          updatedAt?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

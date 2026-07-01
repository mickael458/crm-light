export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ContactStatus = "chaud" | "tiede" | "froid";
export type DealStage = "prospect" | "discussion" | "devis" | "gagne" | "perdu";
export type OnboardingActivity = "consultant" | "coach" | "freelance" | "artisan" | "autre";
export type OnboardingCycle = "court" | "long" | "devis" | "appel";
export type OnboardingGoal = "relance" | "devis" | "pipeline";
export type OnboardingSummary = "matin" | "hebdo" | "jamais";

export type Database = {
  public: {
    Tables: {
      contacts: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          company: string | null;
          email: string | null;
          phone: string | null;
          status: ContactStatus | null;
          context_note: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          company?: string | null;
          email?: string | null;
          phone?: string | null;
          status?: ContactStatus | null;
          context_note?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          company?: string | null;
          email?: string | null;
          phone?: string | null;
          status?: ContactStatus | null;
          context_note?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      deals: {
        Row: {
          id: string;
          user_id: string | null;
          contact_id: string | null;
          title: string;
          amount: number | null;
          stage: DealStage | null;
          created_at: string | null;
          updated_at: string | null;
          last_contacted_at: string | null;
          context_note: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          contact_id?: string | null;
          title: string;
          amount?: number | null;
          stage?: DealStage | null;
          created_at?: string | null;
          updated_at?: string | null;
          last_contacted_at?: string | null;
          context_note?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          contact_id?: string | null;
          title?: string;
          amount?: number | null;
          stage?: DealStage | null;
          created_at?: string | null;
          updated_at?: string | null;
          last_contacted_at?: string | null;
          context_note?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          subscribed: boolean | null;
          subscription_id: string | null;
          onboarding_activity: OnboardingActivity | null;
          onboarding_cycle: OnboardingCycle | null;
          onboarding_delay: number | null;
          onboarding_goal: OnboardingGoal | null;
          onboarding_channels: string[] | null;
          onboarding_summary: OnboardingSummary | null;
          onboarding_done: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          subscribed?: boolean | null;
          subscription_id?: string | null;
          onboarding_activity?: OnboardingActivity | null;
          onboarding_cycle?: OnboardingCycle | null;
          onboarding_delay?: number | null;
          onboarding_goal?: OnboardingGoal | null;
          onboarding_channels?: string[] | null;
          onboarding_summary?: OnboardingSummary | null;
          onboarding_done?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          subscribed?: boolean | null;
          subscription_id?: string | null;
          onboarding_activity?: OnboardingActivity | null;
          onboarding_cycle?: OnboardingCycle | null;
          onboarding_delay?: number | null;
          onboarding_goal?: OnboardingGoal | null;
          onboarding_channels?: string[] | null;
          onboarding_summary?: OnboardingSummary | null;
          onboarding_done?: boolean | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Contact = Database["public"]["Tables"]["contacts"]["Row"];
export type ContactInsert = Database["public"]["Tables"]["contacts"]["Insert"];
export type Deal = Database["public"]["Tables"]["deals"]["Row"];
export type DealInsert = Database["public"]["Tables"]["deals"]["Insert"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type DealWithContact = Deal & {
  contacts: Pick<Contact, "id" | "name" | "company" | "email"> | null;
};

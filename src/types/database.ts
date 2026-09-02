import type { Contact, ContactPayload, Priority } from "@/types/contact";

type ContactInsert = ContactPayload & {
  id?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
};

type ContactUpdate = Partial<ContactPayload> & {
  updated_at?: string;
};

export interface Database {
  public: {
    Tables: {
      contacts: {
        Row: Contact;
        Insert: ContactInsert;
        Update: ContactUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      priority: Priority;
    };
    CompositeTypes: Record<string, never>;
  };
}

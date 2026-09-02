import { nullableText, type ContactFormValues } from "@/lib/contact-schema";
import { neon } from "@/lib/neon";
import type { Contact, ContactPayload } from "@/types/contact";

const contactColumns =
  "id,user_id,name,company,role,where_met,notes,priority,created_at,updated_at";

function requireClient() {
  if (!neon) {
    throw new Error(
      "Neon is not configured. Add the public Auth and Data API URLs.",
    );
  }

  return neon;
}

function toPayload(values: ContactFormValues): ContactPayload {
  return {
    name: values.name.trim(),
    company: nullableText(values.company),
    role: nullableText(values.role),
    where_met: nullableText(values.where_met),
    notes: nullableText(values.notes),
    priority: values.priority,
  };
}

export async function listContacts(): Promise<Contact[]> {
  const { data, error } = await requireClient()
    .from("contacts")
    .select(contactColumns)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Contact[];
}

export async function createContact(
  values: ContactFormValues,
): Promise<Contact> {
  const { data, error } = await requireClient()
    .from("contacts")
    .insert(toPayload(values))
    .select(contactColumns)
    .single();

  if (error) throw new Error(error.message);
  return data as Contact;
}

export async function updateContact(
  id: string,
  values: ContactFormValues,
): Promise<Contact> {
  const { data, error } = await requireClient()
    .from("contacts")
    .update(toPayload(values))
    .eq("id", id)
    .select(contactColumns)
    .single();

  if (error) throw new Error(error.message);
  return data as Contact;
}

export async function deleteContact(id: string): Promise<void> {
  const { error } = await requireClient().from("contacts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

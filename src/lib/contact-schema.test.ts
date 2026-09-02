import { describe, expect, it } from "vitest";

import { contactFormSchema, nullableText } from "./contact-schema";

const validContact = {
  name: "Maya Chen",
  company: "Berkeley SkyDeck",
  role: "Product Designer",
  where_met: "AI Builders Meetup",
  notes: "Follow up about the fall demo day.",
  priority: "high" as const,
};

describe("contactFormSchema", () => {
  it("accepts and trims a complete contact", () => {
    const result = contactFormSchema.parse({
      ...validContact,
      name: "  Maya Chen  ",
    });

    expect(result.name).toBe("Maya Chen");
  });

  it("rejects a whitespace-only name", () => {
    const result = contactFormSchema.safeParse({
      ...validContact,
      name: "   ",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Name is required");
    }
  });

  it("rejects a priority outside high, medium, or low", () => {
    const result = contactFormSchema.safeParse({
      ...validContact,
      priority: "urgent",
    });

    expect(result.success).toBe(false);
  });
});

describe("nullableText", () => {
  it("normalizes optional empty values to null", () => {
    expect(nullableText("   ")).toBeNull();
    expect(nullableText("  Haas  ")).toBe("Haas");
  });
});

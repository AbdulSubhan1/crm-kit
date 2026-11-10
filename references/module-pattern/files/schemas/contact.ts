import { z } from "zod";
import { email, fullName, optionalText, phone } from "./fields";

export const contactSchema = z.object({
  name: fullName,
  email,
  phone,
  notes: optionalText(),
});

export type ContactInput = z.infer<typeof contactSchema>;

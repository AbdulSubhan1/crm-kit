"use client";

import { useTranslations } from "next-intl";
import { Controller } from "react-hook-form";
import { Button, Field, FormError, Input, Panel, PhoneInput, Textarea } from "@/components/ui";
import { contactSchema } from "@/schemas/contact";
import { createContact } from "@/server/actions/contacts";
import { useActionForm } from "./use-action-form";

export function ContactForm() {
  const t = useTranslations();
  const { form, pending, onSubmit, errorOf, rootError } = useActionForm(contactSchema, createContact, {
    defaultValues: { name: "", email: "", phone: "", notes: "" },
  });

  return (
    <Panel>
      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2" noValidate>
        <Field label={t("contacts.name")} error={errorOf("name")}>
          <Input autoComplete="name" placeholder={t("placeholders.fullName")} {...form.register("name")} />
        </Field>
        <Field label={t("contacts.email")} error={errorOf("email")}>
          <Input type="email" autoComplete="email" placeholder={t("placeholders.email")} {...form.register("email")} />
        </Field>
        <Field label={t("contacts.phone")} error={errorOf("phone")} group>
          <Controller
            control={form.control}
            name="phone"
            render={({ field, fieldState }) => (
              <PhoneInput {...field} aria-label={t("contacts.phone")} invalid={fieldState.invalid} />
            )}
          />
        </Field>
        <Field label={t("contacts.notes")} error={errorOf("notes")} className="md:col-span-2">
          <Textarea rows={3} placeholder={t("placeholders.notes")} {...form.register("notes")} />
        </Field>
        <div className="grid justify-items-start gap-2 md:col-span-2">
          <FormError message={rootError} />
          <Button variant="primary" disabled={pending}>
            {pending ? t("contacts.creating") : t("contacts.create")}
          </Button>
        </div>
      </form>
    </Panel>
  );
}

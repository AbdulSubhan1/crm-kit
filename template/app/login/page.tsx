import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/components/forms/login-form";
import { LocaleSwitch } from "@/components/layout/locale-switch";
import { Panel } from "@/components/ui";
import { DEMO_PASSWORD } from "@/constants/config";
import { DEMO_ACCOUNTS } from "@/constants/demo";

export default async function LoginPage() {
  const t = await getTranslations();
  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <section className="flex flex-col justify-between gap-10 bg-ink px-6 py-8 text-white md:px-12 md:py-12">
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-brand font-bold">
              {t("app.name").charAt(0)}
            </span>
            <span className="text-lg font-semibold tracking-tight">{t("app.name")}</span>
          </span>
          <LocaleSwitch />
        </div>
        <div className="max-w-md">
          <h1 className="text-3xl leading-tight font-semibold tracking-tight md:text-4xl">{t("app.tagline")}</h1>
          <p className="mt-4 text-white/70">{t("login.pitch")}</p>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-10 md:px-10">
        <Panel className="w-full max-w-md">
          <h2 className="text-lg font-semibold">{t("login.demoTitle")}</h2>
          <p className="mt-1 mb-5 text-sm text-muted">{t("login.demoBody", { password: DEMO_PASSWORD })}</p>
          <LoginForm
            demoPassword={DEMO_PASSWORD}
            demoEmails={DEMO_ACCOUNTS.map((a) => ({
              email: a.email,
              label: t(`login.roles.${a.role}`),
              hint: t(`login.roles.${a.role}Hint`),
            }))}
          />
        </Panel>
      </section>
    </main>
  );
}

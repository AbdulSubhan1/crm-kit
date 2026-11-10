import { useTranslations } from "next-intl";
import {
  ActionBar,
  AlertDialog,
  Avatar,
  Button,
  Checkbox,
  DetailList,
  Dialog,
  DropdownMenu,
  Field,
  Icon,
  Input,
  Popover,
  Tooltip,
} from "@/components/ui";
import { DEFAULT_LOCALE, LOCALE_NAMES, LOCALES } from "@/constants/i18n";
import { Demo, type DemoProps } from "../demo";
import { SAMPLE_STATUSES } from "../samples";

const PEOPLE = ["Ahmed Rahman", "Layla Haddad", "John Smith", "Priya Patel"];

/** Dialogs, sheets, popovers, tooltips, menus and the bulk action bar. */
export function OverlayDemos({ name, path }: DemoProps) {
  const t = useTranslations();

  switch (name) {
    case "Dialog":
      return (
        <>
          <Demo title="Form in a dialog" description="The footer's submit button submits the form around the dialog.">
            <form action={path}>
              <Dialog
                trigger={
                  <Button type="button">
                    <Icon name="edit" size={15} />
                    {t("samples.customer")}
                  </Button>
                }
                title={t("samples.customer")}
                description="Ahmed Rahman"
                closeLabel={t("common.close")}
                footer={
                  <>
                    <Button type="button" data-dialog-close>
                      {t("common.cancel")}
                    </Button>
                    <Button type="submit" variant="primary">
                      {t("common.save")}
                    </Button>
                  </>
                }
              >
                <div className="grid gap-3">
                  <Field label={t("samples.customerName")}>
                    <Input name="demo-name" defaultValue="Ahmed Rahman" />
                  </Field>
                  <Field label={t("samples.email")}>
                    <Input type="email" placeholder={t("placeholders.email")} />
                  </Field>
                </div>
              </Dialog>
            </form>
          </Demo>
          <Demo title="Sheet" description='side="end" slides in from the side, for details that keep the list in view.'>
            <Dialog
              trigger={<Button type="button">{t("common.view")}</Button>}
              title="#1034"
              side="end"
              closeLabel={t("common.close")}
            >
              <DetailList
                items={[
                  { label: t("samples.customer"), value: "Ahmed Rahman" },
                  { label: t("samples.plan"), value: t("samples.plans.basic") },
                  { label: t("samples.owner"), value: "Aisha Khan" },
                ]}
              />
            </Dialog>
          </Demo>
        </>
      );
    case "AlertDialog":
      return (
        <>
          <Demo title="Destructive" description="Confirm submits the form the dialog sits in.">
            <form action={path}>
              <AlertDialog
                trigger={
                  <Button type="button" variant="danger">
                    {t("samples.cancelSubscription")}
                  </Button>
                }
                title={`${t("samples.cancelSubscription")}?`}
                confirmLabel={t("samples.cancelSubscription")}
              />
            </form>
          </Demo>
          <Demo title="Neutral">
            <form action={path}>
              <AlertDialog
                tone="primary"
                trigger={<Button type="button">{t("common.deactivate")}</Button>}
                title={`${t("common.deactivate")}?`}
                description="They can be activated again later."
                confirmLabel={t("common.deactivate")}
              />
            </form>
          </Demo>
        </>
      );
    case "Popover":
      return (
        <Demo title="Quick details" description="Escape or a click outside closes it.">
          <Popover label={t("samples.owner")} trigger={<Button type="button">{t("samples.owner")}</Button>}>
            <div className="flex items-center gap-3">
              <Avatar name="Aisha Khan" status="online" />
              <div className="min-w-0 text-sm">
                <p className="font-medium">Aisha Khan</p>
                <p className="text-muted">{t("samples.team")}</p>
              </div>
            </div>
          </Popover>
        </Demo>
      );
    case "Tooltip":
      return (
        <Demo title="Sides" description="Hover or tab onto each button.">
          <div className="flex flex-wrap gap-3 py-6">
            {(["top", "bottom", "start", "end"] as const).map((side) => (
              <Tooltip key={side} content={`side="${side}"`} side={side}>
                <Button size="sm">{side}</Button>
              </Tooltip>
            ))}
          </div>
        </Demo>
      );
    case "DropdownMenu":
      return (
        <>
          <Demo title="Icons, shortcuts and a danger item">
            <DropdownMenu
              label={t("samples.records")}
              trigger={
                <Button type="button">
                  {t("samples.setStatus")}
                  <Icon name="chevronDown" size={15} />
                </Button>
              }
              items={[
                { type: "label", label: "#1034" },
                { label: t("common.view"), icon: "eye", shortcut: "⌘O", href: path },
                { label: t("samples.customer"), icon: "edit", shortcut: "⌘E" },
                { label: t("common.add"), icon: "copy", shortcut: "⌘D" },
                { type: "separator" },
                { label: t("common.delete"), icon: "trash", danger: true },
              ]}
            />
          </Demo>
          <Demo title="Submenu and checks" description="Hover or press → on a row with an arrow.">
            <DropdownMenu
              label={t("samples.status")}
              trigger={
                <Button type="button" variant="ghost" aria-label={t("samples.status")}>
                  <Icon name="more" size={18} />
                </Button>
              }
              items={[
                {
                  label: t("samples.setStatus"),
                  icon: "send",
                  items: SAMPLE_STATUSES.map((s) => ({
                    label: t(`samples.statuses.${s}`),
                    checked: s === "pending",
                  })),
                },
                {
                  label: t("common.language"),
                  icon: "globe",
                  items: LOCALES.map((l) => ({ label: LOCALE_NAMES[l], checked: l === DEFAULT_LOCALE })),
                },
                { type: "separator" },
                { label: t("common.disable"), disabled: true },
              ]}
            />
          </Demo>
        </>
      );
    case "ActionBar":
      return (
        <Demo
          title="Bulk selection"
          description="Tick a row: the bar rises at the bottom of the screen with the count."
        >
          <form id="demo-bulk" action={path} className="grid gap-2">
            {PEOPLE.map((p) => (
              <Checkbox key={p} name="ids" value={p} label={p} />
            ))}
            <ActionBar form="demo-bulk" name="ids">
              <Button type="button" size="sm" variant="ghost">
                <Icon name="send" size={15} />
                {t("samples.setStatus")}
              </Button>
              <AlertDialog
                trigger={
                  <Button type="button" size="sm" variant="ghost">
                    <Icon name="trash" size={15} />
                    {t("common.delete")}
                  </Button>
                }
                title={`${t("common.delete")}?`}
                confirmLabel={t("common.delete")}
              />
            </ActionBar>
          </form>
        </Demo>
      );
    default:
      return null;
  }
}

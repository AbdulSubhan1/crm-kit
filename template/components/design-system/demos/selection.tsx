import { useTranslations } from "next-intl";
import {
  Autocomplete,
  Checkbox,
  Field,
  MultiSelect,
  Radio,
  RadioGroup,
  Rating,
  SegmentGroup,
  Switch,
} from "@/components/ui";
import { keyedOptions } from "@/lib/options";
import { Demo, type DemoProps } from "../demo";
import { CITY_OPTIONS, SAMPLE_PLANS, SAMPLE_STATUSES } from "../samples";

const METHODS = ["card", "bank_transfer", "cash"] as const;

/** Every way to choose: dropdowns, checks, radios, switches, segments and stars. */
export function SelectionDemos({ name }: DemoProps) {
  const t = useTranslations();

  switch (name) {
    case "Autocomplete":
      return (
        <>
          <Demo title="Groups and search" description="Cities grouped by country; type to filter.">
            <div className="max-w-sm">
              <Field label={t("samples.city")}>
                <Autocomplete options={CITY_OPTIONS} placeholder={t("samples.pickCity")} />
              </Field>
            </div>
          </Demo>
          <Demo title="With a value">
            <div className="max-w-sm">
              <Autocomplete
                aria-label={t("samples.status")}
                options={keyedOptions(t, "samples.statuses", SAMPLE_STATUSES)}
                defaultValue="pending"
              />
            </div>
          </Demo>
        </>
      );
    case "MultiSelect":
      return (
        <>
          <Demo title="Tags" description="Pick several plans; Backspace removes the last tag.">
            <div className="max-w-md">
              <MultiSelect
                label={t("samples.plan")}
                options={keyedOptions(t, "samples.plans", SAMPLE_PLANS)}
                defaultValue={["standard"]}
                placeholder={t("samples.pickPlan")}
              />
            </div>
          </Demo>
          <Demo title="Empty">
            <div className="max-w-md">
              <MultiSelect
                label={t("samples.paymentMethod")}
                options={keyedOptions(t, "samples.methods", METHODS)}
                placeholder={t("samples.pickMethod")}
              />
            </div>
          </Demo>
        </>
      );
    case "Checkbox":
      return (
        <>
          <Demo title="With hint">
            <Checkbox label={t("permissions.users:manage")} hint="users:manage" defaultChecked />
          </Demo>
          <Demo title="Sizes">
            <div className="grid gap-3">
              <Checkbox size="sm" label="sm" />
              <Checkbox label="md" defaultChecked />
              <Checkbox size="lg" label="lg" defaultChecked />
            </div>
          </Demo>
          <Demo title="Disabled">
            <Checkbox label={t("roles.locked")} disabled defaultChecked />
          </Demo>
        </>
      );
    case "Radio":
      return (
        <Demo title="Sizes" description="A bare radio for tables; use RadioGroup when it needs a label.">
          <div className="flex items-center gap-4">
            <Radio name="demo-radio" size="sm" aria-label="sm" />
            <Radio name="demo-radio" aria-label="md" defaultChecked />
            <Radio name="demo-radio" size="lg" aria-label="lg" />
          </div>
        </Demo>
      );
    case "RadioGroup":
      return (
        <>
          <Demo title="List">
            <RadioGroup
              name="demo-methods"
              label={t("samples.paymentMethod")}
              defaultValue="card"
              options={keyedOptions(t, "samples.methods", METHODS)}
            />
          </Demo>
          <Demo title="Cards" description="For choices that need a line of explanation.">
            <RadioGroup
              name="demo-method"
              variant="cards"
              label={t("samples.paymentMethod")}
              defaultValue="card"
              options={METHODS.map((m) => ({
                value: m,
                label: t(`samples.methods.${m}`),
                description: t("samples.reference"),
              }))}
            />
          </Demo>
        </>
      );
    case "Switch":
      return (
        <>
          <Demo title="With description">
            <Switch label={t("users.active")} description={t("users.description")} defaultChecked />
          </Demo>
          <Demo title="Sizes and disabled">
            <div className="grid gap-3">
              <Switch size="sm" label="sm" />
              <Switch label="md" defaultChecked />
              <Switch label={t("roles.locked")} disabled defaultChecked />
            </div>
          </Demo>
        </>
      );
    case "SegmentGroup":
      return (
        <Demo title="View switch">
          <SegmentGroup
            name="demo-view"
            label={t("samples.records")}
            defaultValue="all"
            options={[
              { value: "all", label: t("common.all") },
              { value: "new", label: t("samples.statuses.new") },
              { value: "pending", label: t("samples.statuses.pending") },
            ]}
          />
        </Demo>
      );
    case "Rating":
      return (
        <>
          <Demo title="Input" description="Click a star or use the arrow keys.">
            <Rating name="demo-rating" value={3} label="Service" />
          </Demo>
          <Demo title="Read only">
            <Rating value={4} label="Service" />
          </Demo>
        </>
      );
    default:
      return null;
  }
}

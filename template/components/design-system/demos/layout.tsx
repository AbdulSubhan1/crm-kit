import { useTranslations } from "next-intl";
import {
  Badge,
  Button,
  CellText,
  DetailList,
  ListRow,
  PageHeader,
  Panel,
  PanelSection,
  PillNav,
  Tabs,
} from "@/components/ui";
import { withParams } from "@/lib/url";
import { Demo, type DemoProps } from "../demo";
import { SAMPLE_PLANS } from "../samples";

/** Page structure and navigation between views. */
export function LayoutDemos({ name, path, params }: DemoProps) {
  const t = useTranslations();

  switch (name) {
    case "Tabs": {
      const tab = params.tab === "activity" || params.tab === "billing" ? params.tab : "overview";
      return (
        <Demo title="Driven by the URL" description="Each tab is a link, so the back button and shared links work.">
          <Panel flush>
            <Tabs
              label={t("samples.tabs.overview")}
              current={tab}
              tabs={[
                {
                  id: "overview",
                  label: t("samples.tabs.overview"),
                  href: withParams(path, params, { tab: "overview" }),
                  count: 2,
                },
                {
                  id: "activity",
                  label: t("samples.tabs.activity"),
                  href: withParams(path, params, { tab: "activity" }),
                },
                { id: "billing", label: t("samples.tabs.billing"), href: withParams(path, params, { tab: "billing" }) },
              ]}
            />
            <PanelSection>{t(`samples.tabs.${tab}`)}</PanelSection>
          </Panel>
        </Demo>
      );
    }
    case "PillNav":
      return (
        <Demo title="Motion highlight" description="Hover the pills: one background glides between them.">
          <PillNav
            label={t("samples.plan")}
            items={SAMPLE_PLANS.map((p) => ({
              href: withParams(path, params, { plan: p }),
              label: t(`samples.plans.${p}`),
              active: (params.plan ?? "basic") === p,
            }))}
          />
        </Demo>
      );
    case "PageHeader":
      return (
        <Demo title="Back link and action">
          <PageHeader
            back={{ href: path, label: t("samples.records") }}
            title="Ahmed Rahman"
            description={t("samples.summary", {
              plan: t("samples.plans.basic"),
              owner: "Aisha Khan",
            })}
            action={<Badge tone="amber">{t("samples.statuses.pending")}</Badge>}
          />
        </Demo>
      );
    case "Panel":
      return (
        <>
          <Demo title="With actions">
            <Panel title={t("samples.customer")} actions={<Button size="sm">{t("common.save")}</Button>}>
              <DetailList
                columns={2}
                items={[
                  { label: t("samples.email"), value: "ahmed@example.com" },
                  { label: t("samples.phone"), value: "+971501234567" },
                ]}
              />
            </Panel>
          </Demo>
          <Demo title="Flush with a footer" description="For lists and tables that run edge to edge.">
            <Panel
              title={t("samples.records")}
              flush
              footer={<span className="text-sm text-muted">{t("common.add")}</span>}
            >
              <ul>
                <ListRow action={<Badge status="active" />}>
                  <CellText primary="Northwind Traders" secondary={t("samples.itemCount", { count: 12 })} />
                </ListRow>
              </ul>
            </Panel>
          </Demo>
        </>
      );
    case "PanelSection":
      return (
        <Demo title="Plain and muted">
          <Panel title={t("samples.tabs.overview")} flush>
            <PanelSection>{t("samples.emptyItems")}</PanelSection>
            <PanelSection muted>{t("samples.noItems")}</PanelSection>
          </Panel>
        </Demo>
      );
    case "DetailList":
      return (
        <Demo title="Three columns" description="Empty values show a dash.">
          <DetailList
            columns={3}
            items={[
              { label: t("samples.idNumber"), value: "784-1990-1234567-1" },
              { label: t("samples.country"), value: "Pakistan" },
              { label: t("samples.reference"), value: "" },
            ]}
          />
        </Demo>
      );
    default:
      return null;
  }
}

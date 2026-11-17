import { useTranslations } from "next-intl";
import {
  ActionBar,
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  ButtonLink,
  CellText,
  DataTable,
  Icon,
  ICON_NAMES,
  ListRow,
  Panel,
  PriceBreakdown,
  Stat,
  TableFilters,
  Timeline,
} from "@/components/ui";
import { money } from "@/lib/format";
import { keyedOptions } from "@/lib/options";
import { Demo, type DemoProps } from "../demo";
import { SAMPLE_PLANS, SAMPLE_STATUSES, SAMPLE_TONE } from "../samples";

// Sample rows for the live DataTable example. Search, filter and pages work on them through the URL.
const SAMPLE = Array.from({ length: 23 }, (_, i) => ({
  id: i + 1,
  customer: `${["Ahmed Rahman", "Layla Haddad", "John Smith", "Priya Patel", "Yusuf Khan"][i % 5]} ${i + 1}`,
  plan: SAMPLE_PLANS[i % 5],
  status: SAMPLE_STATUSES[i % 3],
  reference: `#${1001 + i}`,
  amount: 400 + i * 85,
}));
const PAGE = 5;
const TEAM = ["Aisha Khan", "Omar Farouk", "Sara Ali", "David Chen", "Fatima Noor", "Ravi Menon"];

/** Tables, rows, statuses, numbers, people and icons. */
export function DataDemos({ name, path, params }: DemoProps) {
  const t = useTranslations();

  switch (name) {
    case "DataTable": {
      const q = params.q?.toLowerCase();
      const rows = SAMPLE.filter(
        (r) => (!params.filter || r.status === params.filter) && (!q || r.customer.toLowerCase().includes(q)),
      );
      const page = Math.max(1, Number(params.page) || 1);
      return (
        <>
          <Demo
            title="Search, filters, pages and selection"
            description="All state lives in the URL. Tick rows to see the ActionBar. Plan has priority 2, so it gives way first when the table is narrow."
          >
            <form id="demo-table" action={path}>
              <ActionBar form="demo-table" name="ids">
                <Button type="button" size="sm" variant="ghost">
                  <Icon name="send" size={15} />
                  {t("samples.setStatus")}
                </Button>
              </ActionBar>
            </form>
            <DataTable
              path={path}
              params={params}
              rows={rows.slice((page - 1) * PAGE, page * PAGE)}
              rowKey={(r) => r.id}
              minWidth="sm"
              select={{ form: "demo-table", name: "ids", label: (r) => r.customer }}
              search={{ placeholder: t("samples.search") }}
              filters={{
                label: t("samples.status"),
                options: keyedOptions(t, "samples.statuses", SAMPLE_STATUSES.slice(0, 3)),
              }}
              pagination={{ page, pageSize: PAGE, total: rows.length }}
              empty={{
                title: t("samples.empty"),
                icon: "search",
                action: <ButtonLink href={path}>{t("common.all")}</ButtonLink>,
              }}
              columns={[
                {
                  key: "customer",
                  header: t("samples.customer"),
                  cell: (r) => <CellText primary={r.customer} secondary={r.reference} />,
                },
                { key: "plan", header: t("samples.plan"), priority: 2, cell: (r) => t(`samples.plans.${r.plan}`) },
                {
                  key: "status",
                  header: t("samples.status"),
                  cell: (r) => <Badge tone={SAMPLE_TONE[r.status]}>{t(`samples.statuses.${r.status}`)}</Badge>,
                },
                { key: "amount", header: t("samples.amount"), numeric: true, cell: (r) => money(r.amount) },
              ]}
            />
          </Demo>
          <Demo
            title="Rows on phones"
            description='With mobile="rows", a table narrower than 42rem shows each row as a stacked card from summary. This box is that narrow.'
          >
            <div className="max-w-sm">
              <DataTable
                path={path}
                rows={SAMPLE.slice(0, 3)}
                rowKey={(r) => r.id}
                rowHref={() => path}
                empty={{ title: t("samples.empty") }}
                mobile="rows"
                summary={(r) => ({
                  title: r.customer,
                  amount: money(r.amount),
                  meta: [r.reference, t(`samples.plans.${r.plan}`)],
                  badges: <Badge tone={SAMPLE_TONE[r.status]}>{t(`samples.statuses.${r.status}`)}</Badge>,
                })}
                columns={[
                  { key: "customer", header: t("samples.customer"), cell: (r) => r.customer },
                  { key: "amount", header: t("samples.amount"), numeric: true, cell: (r) => money(r.amount) },
                ]}
              />
            </div>
          </Demo>
        </>
      );
    }
    case "TableFilters":
      return (
        <Demo
          title="Dropdown and on/off"
          description="Each change is a URL parameter; DataTable shows these from refine."
        >
          <TableFilters
            path={path}
            params={params}
            selects={[
              {
                name: "owner",
                label: t("samples.owner"),
                placeholder: t("samples.anyOwner"),
                options: [
                  { value: "none", label: t("common.unassigned") },
                  ...TEAM.map((n) => ({ value: n, label: n })),
                ],
              },
            ]}
            toggles={[{ name: "overdue", label: t("samples.overdueOnly") }]}
          />
        </Demo>
      );
    case "CellText":
      return (
        <Demo title="Truncates long text" description="Two lines that never overflow their cell.">
          <div className="max-w-xs">
            <CellText
              href={path}
              primary="Muhammad Abdullah Al-Rashidi Trading and General Services LLC"
              secondary="ahmed.rahman.longemail@example.com"
            />
          </div>
        </Demo>
      );
    case "ListRow":
      return (
        <>
          <Demo title="With actions">
            <Panel flush>
              <ul>
                <ListRow action={<Button size="sm">{t("common.disable")}</Button>}>
                  <CellText primary="Northwind Traders" secondary={t("samples.itemCount", { count: 12 })} />
                </ListRow>
                <ListRow muted action={<Button size="sm">{t("common.enable")}</Button>}>
                  <CellText primary="Crescent Supplies" secondary={t("common.inactive")} />
                </ListRow>
              </ul>
            </Panel>
          </Demo>
          <Demo
            title="As a link"
            description="With href the whole row opens the record, as DataTable rows do on phones."
          >
            <Panel flush>
              <ul>
                <ListRow href={path}>
                  <CellText primary="Ahmed Rahman" secondary="#1034" />
                </ListRow>
              </ul>
            </Panel>
          </Demo>
        </>
      );
    case "Badge":
      return (
        <>
          <Demo
            title="Tones"
            description="In the app, pass status and the colour and label come from constants/statuses.ts."
          >
            <div className="flex flex-wrap gap-1.5">
              {(["new", "pending", "approved", "rejected", "active", "inactive", "overdue", "high"] as const).map(
                (s) => (
                  <Badge key={s} tone={SAMPLE_TONE[s]}>
                    {t(`samples.statuses.${s}`)}
                  </Badge>
                ),
              )}
            </div>
          </Demo>
          <Demo title="Custom tone">
            <div className="flex flex-wrap gap-1.5">
              <Badge tone="plum">{t("samples.reviewQueue")}</Badge>
              <Badge tone="grey">v2</Badge>
            </div>
          </Demo>
        </>
      );
    case "Stat":
      return (
        <>
          <Demo title="Plain and linked">
            <div className="grid grid-cols-2 gap-3">
              <Stat label={t("samples.stats.openRecords")} value="12" href={path} />
              <Stat label={t("samples.stats.conversion")} value="67%" />
            </div>
          </Demo>
          <Demo title="Comparison, hint, badge and action" description="Dashboard numbers and task cards.">
            <div className="grid gap-3 sm:grid-cols-2">
              <Stat
                label={t("samples.stats.revenue")}
                value={money(21105)}
                delta={{ value: 12, label: t("samples.stats.vsPrevious", { previous: "October" }) }}
              />
              <Stat
                label={t("samples.waitingReview")}
                value="8"
                href={path}
                badge={<Badge tone="amber">{t("samples.stats.oldest", { days: 3 })}</Badge>}
                hint={t("samples.stats.wonOfClosed", { won: 10, closed: 12 })}
                action={t("samples.stats.reviewNow")}
              />
            </div>
          </Demo>
        </>
      );
    case "Timeline":
      return (
        <Demo title="A record's history">
          <Timeline
            items={[
              {
                id: 1,
                icon: "badgeCheck",
                tone: "brand",
                title: t("samples.statuses.active"),
                description: "#1034",
                time: "24 Nov",
              },
              {
                id: 2,
                icon: "shield",
                tone: "info",
                title: t("samples.statuses.approved"),
                description: t("samples.reviewer"),
                time: "22 Nov",
              },
              {
                id: 3,
                icon: "send",
                tone: "warn",
                title: t("samples.statuses.pending"),
                description: "Standard plan, $1,200",
                time: "20 Nov",
              },
              { id: 4, icon: "inbox", title: t("samples.statuses.new"), time: "18 Nov" },
            ]}
          />
        </Demo>
      );
    case "PriceBreakdown":
      return (
        <Demo title="A price, line by line" description="Included parts say so; money taken off is red.">
          <div className="max-w-sm">
            <PriceBreakdown
              caption={t("samples.price.caption")}
              lines={[
                { label: t("samples.price.base"), amount: money(1215) },
                { label: t("samples.price.setup"), amount: t("samples.price.included"), tone: "included" },
                { label: t("samples.price.extra"), amount: money(60) },
                { label: t("samples.price.discount"), amount: `−${money(50)}`, tone: "minus" },
              ]}
              total={{ label: t("samples.price.total"), amount: money(1225) }}
            />
          </div>
        </Demo>
      );
    case "Avatar":
      return (
        <>
          <Demo title="Sizes" description="The colour comes from the name, so a person looks the same everywhere.">
            <div className="flex items-center gap-3">
              <Avatar name="Aisha Khan" size="sm" />
              <Avatar name="Omar Farouk" />
              <Avatar name="Sara Ali" size="lg" />
            </div>
          </Demo>
          <Demo title="Status">
            <div className="flex items-center gap-3">
              <Avatar name="Aisha Khan" status="online" />
              <Avatar name="David Chen" status="away" />
              <Avatar name="Ravi Menon" status="offline" />
            </div>
          </Demo>
        </>
      );
    case "AvatarGroup":
      return (
        <Demo title="With a count" description="Hover a face for the name, or +N for the rest.">
          <div className="grid gap-3">
            <AvatarGroup names={TEAM} />
            <AvatarGroup names={TEAM.slice(0, 3)} size="sm" />
          </div>
        </Demo>
      );
    case "Icon":
      return (
        <Demo title="The whole set" description="Add icons in icon.tsx; never import an icon package.">
          <div className="grid grid-cols-3 gap-4 text-ink-soft sm:grid-cols-6">
            {ICON_NAMES.map((n) => (
              <span key={n} className="grid min-w-0 justify-items-center gap-1 text-xs text-muted">
                <Icon name={n} size={22} />
                <span className="max-w-full truncate">{n}</span>
              </span>
            ))}
          </div>
        </Demo>
      );
    default:
      return null;
  }
}

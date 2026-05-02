import Link from "next/link";
import { Inbox, Phone } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/date";
import { ADMIN_NAV } from "@/lib/nav";
import {
  GRADE_LABELS,
  LEAD_STATUS_LABELS,
  TRACK_LABELS,
  type GradeLevel,
  type LeadStatus,
  type StudyTrack,
} from "@/lib/db/types";
import { LeadDeleteButton, LeadStatusSelect } from "./lead-row-actions";

type LeadRow = {
  id: string;
  full_name: string;
  grade: GradeLevel;
  track: StudyTrack;
  phone: string;
  parent_phone: string | null;
  status: LeadStatus;
  notes: string | null;
  created_at: string;
  institutions: { name: string } | null;
};

type Institution = { id: string; name: string };

const STATUS_FILTERS: (LeadStatus | "ALL")[] = [
  "ALL",
  "NEW",
  "CONTACTING",
  "NOT_REACHED",
  "CONVERTED",
  "REJECTED",
];

const STATUS_BADGE: Record<LeadStatus, string> = {
  NEW: "bg-primary text-primary-foreground hover:bg-primary",
  CONTACTING: "bg-blue-500 text-white hover:bg-blue-500",
  NOT_REACHED: "bg-amber-500 text-white hover:bg-amber-500",
  CONVERTED: "bg-success text-success-foreground hover:bg-success",
  REJECTED: "bg-muted text-muted-foreground hover:bg-muted",
};

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  // 11 haneli TR formatı: 0XXX XXX XX XX
  if (digits.length === 11 && digits.startsWith("0")) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9, 11)}`;
  }
  // 10 haneli: XXX XXX XX XX
  if (digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
  }
  return raw;
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; institution?: string }>;
}) {
  const user = await requireUser("ADMIN");
  const supabase = await createClient();
  const params = await searchParams;
  const statusFilter =
    params.status && STATUS_FILTERS.includes(params.status as LeadStatus)
      ? (params.status as LeadStatus)
      : null;
  const institutionFilter = params.institution ?? null;

  const { data: institutions = [] } = await supabase
    .from("institutions")
    .select("id, name")
    .order("name")
    .returns<Institution[]>();

  let query = supabase
    .from("lead_applications")
    .select(
      "id, full_name, grade, track, phone, parent_phone, status, notes, created_at, institutions:preferred_institution_id(name)",
    )
    .order("created_at", { ascending: false });

  if (statusFilter) query = query.eq("status", statusFilter);
  if (institutionFilter) {
    query = query.eq("preferred_institution_id", institutionFilter);
  }

  const { data: leads = [] } = await query.returns<LeadRow[]>();

  // Tüm sayımları (filter'sız) hesapla — badge'ler için
  const { data: allLeads = [] } = await supabase
    .from("lead_applications")
    .select("status")
    .returns<{ status: LeadStatus }[]>();

  const counts: Record<LeadStatus | "ALL", number> = {
    ALL: allLeads?.length ?? 0,
    NEW: 0,
    CONTACTING: 0,
    NOT_REACHED: 0,
    CONVERTED: 0,
    REJECTED: 0,
  };
  for (const l of allLeads ?? []) counts[l.status]++;

  function buildHref(s: LeadStatus | "ALL", inst: string | null) {
    const sp = new URLSearchParams();
    if (s !== "ALL") sp.set("status", s);
    if (inst) sp.set("institution", inst);
    const qs = sp.toString();
    return qs ? `/admin/leads?${qs}` : "/admin/leads";
  }

  return (
    <>
      <AppHeader user={user} nav={ADMIN_NAV} />
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
        <PageHeader
          title="Ön başvurular"
          description="Ana sayfadan gelen kayıt talepleri. Durumu güncelleyerek takip et."
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filtreler</CardTitle>
            <CardDescription>Durum ve lokasyona göre süz.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="mb-2 text-xs font-medium text-muted-foreground">
                Durum
              </div>
              <div className="flex flex-wrap gap-2">
                {STATUS_FILTERS.map((s) => {
                  const active =
                    s === "ALL" ? !statusFilter : statusFilter === s;
                  return (
                    <Link
                      key={s}
                      href={buildHref(s, institutionFilter)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card hover:border-primary/40 hover:bg-primary/5",
                      )}
                    >
                      {s === "ALL" ? "Tümü" : LEAD_STATUS_LABELS[s]}{" "}
                      <span className="opacity-70">({counts[s]})</span>
                    </Link>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs font-medium text-muted-foreground">
                Lokasyon
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={buildHref(statusFilter ?? "ALL", null)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    !institutionFilter
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:border-primary/40 hover:bg-primary/5",
                  )}
                >
                  Hepsi
                </Link>
                {(institutions ?? []).map((inst) => {
                  const active = institutionFilter === inst.id;
                  return (
                    <Link
                      key={inst.id}
                      href={buildHref(statusFilter ?? "ALL", inst.id)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card hover:border-primary/40 hover:bg-primary/5",
                      )}
                    >
                      {inst.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {!leads || leads.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Başvuru yok"
            description="Ana sayfadaki ön başvuru formundan kayıt geldikçe burada görüneceksin."
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {leads.length} başvuru
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Ad Soyad</TableHead>
                    <TableHead>Sınıf / Bölüm</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Veli Tel.</TableHead>
                    <TableHead>Lokasyon</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((l) => (
                    <TableRow key={l.id} className="hover:bg-primary/5">
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDateTime(l.created_at)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {l.full_name}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>{GRADE_LABELS[l.grade]}</div>
                        <div className="text-xs text-muted-foreground">
                          {TRACK_LABELS[l.track]}
                        </div>
                      </TableCell>
                      <TableCell>
                        <a
                          href={`tel:${l.phone}`}
                          className="inline-flex items-center gap-1.5 font-mono text-xs hover:text-primary"
                        >
                          <Phone className="h-3 w-3" />
                          {formatPhone(l.phone)}
                        </a>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {l.parent_phone ? formatPhone(l.parent_phone) : "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {l.institutions?.name ?? "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={cn("hidden md:inline-flex", STATUS_BADGE[l.status])}
                          >
                            {LEAD_STATUS_LABELS[l.status]}
                          </Badge>
                          <LeadStatusSelect id={l.id} current={l.status} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <LeadDeleteButton id={l.id} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}

import Link from "next/link";
import { Download, FileBarChart, Star } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatDate, formatDateTime } from "@/lib/date";
import { ADMIN_NAV } from "@/lib/nav";

type Institution = { id: string; name: string };
type WeekOption = {
  id: string;
  exam_date: string;
  institution_id: string;
  institutions: { name: string } | null;
};

type ReportRow = {
  id: string;
  is_default_assigned: boolean;
  created_at: string;
  profiles: { full_name: string; username: string } | null;
  publishers: { name: string } | null;
  sessions: { session_datetime: string } | null;
};

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; institution?: string }>;
}) {
  const user = await requireUser("ADMIN");
  const supabase = await createClient();
  const params = await searchParams;
  const filterInstitution = params.institution ?? null;

  const { data: institutions = [] } = await supabase
    .from("institutions")
    .select("id, name")
    .order("name")
    .returns<Institution[]>();

  let weeksQuery = supabase
    .from("exam_weeks")
    .select("id, exam_date, institution_id, institutions(name)")
    .order("exam_date", { ascending: false })
    .limit(60);
  if (filterInstitution) {
    weeksQuery = weeksQuery.eq("institution_id", filterInstitution);
  }
  const { data: weeks = [] } = await weeksQuery.returns<WeekOption[]>();

  const selectedWeekId =
    params.week && weeks?.some((w) => w.id === params.week)
      ? params.week
      : weeks?.[0]?.id ?? null;

  let students: { id: string; full_name: string; username: string }[] = [];
  let selections: ReportRow[] = [];
  let week: WeekOption | undefined;

  if (selectedWeekId) {
    week = weeks?.find((w) => w.id === selectedWeekId);

    if (week) {
      const { data: studentList = [] } = await supabase
        .from("profiles")
        .select("id, full_name, username")
        .eq("role", "STUDENT")
        .eq("is_active", true)
        .eq("institution_id", week.institution_id)
        .order("full_name")
        .returns<{ id: string; full_name: string; username: string }[]>();
      students = studentList ?? [];
    }

    const { data: selList = [] } = await supabase
      .from("selections")
      .select(
        "id, student_id, is_default_assigned, created_at, profiles(full_name, username), publishers(name), sessions(session_datetime)",
      )
      .eq("exam_week_id", selectedWeekId)
      .returns<(ReportRow & { student_id: string })[]>();
    selections = selList ?? [];
  }

  const byStudent = new Map<string, ReportRow & { student_id: string }>();
  for (const s of selections as (ReportRow & { student_id: string })[]) {
    byStudent.set(s.student_id, s);
  }

  const defaultCount = Array.from(byStudent.values()).filter(
    (s) => s.is_default_assigned,
  ).length;
  const ownCount = byStudent.size - defaultCount;

  const exportAllHref = "/api/admin/rapor/export";
  const exportInstitutionHref = filterInstitution
    ? `/api/admin/rapor/export?institution=${filterInstitution}`
    : null;
  const exportWeekHref = selectedWeekId
    ? `/api/admin/rapor/export?week=${selectedWeekId}`
    : null;

  return (
    <>
      <AppHeader user={user} nav={ADMIN_NAV} />
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
        <PageHeader
          title="Seçim raporu"
          description="Hangi öğrenci ne seçti, hangisine varsayılan atandı. Filtrele ve Excel'e aktar."
          action={
            <Button asChild className="gap-2">
              <a href={exportAllHref}>
                <Download className="h-4 w-4" />
                Tümünü Excel&apos;e aktar
              </a>
            </Button>
          }
        />

        {/* Lokasyon filtresi */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lokasyon filtresi</CardTitle>
            <CardDescription>
              Tüm haftaları belirli bir lokasyona göre süzebilirsin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/admin/rapor"
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  !filterInstitution
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:border-primary/40 hover:bg-primary/5",
                )}
              >
                Tüm lokasyonlar
              </Link>
              {(institutions ?? []).map((inst) => {
                const active = filterInstitution === inst.id;
                return (
                  <Link
                    key={inst.id}
                    href={`/admin/rapor?institution=${inst.id}`}
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
              {exportInstitutionHref ? (
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="ml-auto gap-2"
                >
                  <a href={exportInstitutionHref}>
                    <Download className="h-4 w-4" />
                    Bu lokasyonun tüm haftalarını aktar
                  </a>
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {!weeks || weeks.length === 0 ? (
          <EmptyState
            icon={FileBarChart}
            title={
              filterInstitution ? "Bu lokasyonda hafta yok" : "Henüz hafta yok"
            }
            description="Sınav haftası oluşturduğunda raporu burada görebilirsin."
          />
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Hafta seç</CardTitle>
                <CardDescription>Son 60 hafta listelenir.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(weeks ?? []).map((w) => {
                    const active = w.id === selectedWeekId;
                    const params = new URLSearchParams();
                    params.set("week", w.id);
                    if (filterInstitution) {
                      params.set("institution", filterInstitution);
                    }
                    return (
                      <Link
                        key={w.id}
                        href={`/admin/rapor?${params.toString()}`}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card hover:border-primary/40 hover:bg-primary/5",
                        )}
                      >
                        {w.institutions?.name} · {formatDate(w.exam_date)}
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {week ? (
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">
                        {week.institutions?.name} — {formatDate(week.exam_date)}
                      </CardTitle>
                      <CardDescription className="flex flex-wrap items-center gap-3 pt-1">
                        <span>
                          {byStudent.size} / {students.length} öğrenci için
                          seçim
                        </span>
                        <span aria-hidden>·</span>
                        <Badge variant="outline" className="gap-1">
                          <Star className="h-3 w-3 fill-current text-muted-foreground" />
                          {defaultCount} varsayılan
                        </Badge>
                        <Badge className="bg-success text-success-foreground hover:bg-success">
                          {ownCount} kendi seçti
                        </Badge>
                      </CardDescription>
                    </div>
                    {exportWeekHref ? (
                      <Button asChild size="sm" className="gap-2">
                        <a href={exportWeekHref}>
                          <Download className="h-4 w-4" />
                          Bu haftayı Excel&apos;e aktar
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent>
                  {students.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      Bu lokasyon için aktif öğrenci bulunmuyor.
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Öğrenci</TableHead>
                          <TableHead>Kullanıcı adı</TableHead>
                          <TableHead>Yayın</TableHead>
                          <TableHead>Seans</TableHead>
                          <TableHead>Durum</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((st) => {
                          const sel = byStudent.get(st.id);
                          return (
                            <TableRow
                              key={st.id}
                              className="hover:bg-primary/5"
                            >
                              <TableCell className="font-medium">
                                {st.full_name}
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {st.username}
                              </TableCell>
                              <TableCell>
                                {sel?.publishers?.name ?? "—"}
                              </TableCell>
                              <TableCell>
                                {sel?.sessions?.session_datetime
                                  ? formatDateTime(
                                      sel.sessions.session_datetime,
                                    )
                                  : "—"}
                              </TableCell>
                              <TableCell>
                                {!sel ? (
                                  <Badge variant="secondary">Seçim yok</Badge>
                                ) : sel.is_default_assigned ? (
                                  <Badge variant="outline" className="gap-1">
                                    <Star className="h-3 w-3 fill-current" />
                                    Varsayılan
                                  </Badge>
                                ) : (
                                  <Badge className="bg-success text-success-foreground hover:bg-success">
                                    Kendi seçti
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            ) : null}
          </>
        )}
      </main>
    </>
  );
}

import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  Clock,
  GraduationCap,
  School,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, isPastDeadline, timeUntil } from "@/lib/date";
import { ADMIN_NAV } from "@/lib/nav";
import type { InstitutionType } from "@/lib/db/types";

type InstRow = { id: string; name: string; type: InstitutionType };

type NextWeek = {
  id: string;
  exam_date: string;
  selection_deadline: string;
};

const ICON_BY_TYPE: Record<InstitutionType, typeof Building2> = {
  Q_WORK: Building2,
  KNT_EFELER: School,
  KNT_NAZILLI: GraduationCap,
};

export default async function AdminHome() {
  const user = await requireUser("ADMIN");
  const supabase = await createClient();

  const { data: institutions = [] } = await supabase
    .from("institutions")
    .select("id, name, type")
    .order("name")
    .returns<InstRow[]>();

  const today = new Date().toISOString().slice(0, 10);

  const cards = await Promise.all(
    (institutions ?? []).map(async (inst) => {
      const { data: week } = await supabase
        .from("exam_weeks")
        .select("id, exam_date, selection_deadline")
        .eq("institution_id", inst.id)
        .gte("exam_date", today)
        .order("exam_date")
        .limit(1)
        .maybeSingle<NextWeek>();

      const { count: totalStudents = 0 } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "STUDENT")
        .eq("institution_id", inst.id)
        .eq("is_active", true);

      let selectionsCount = 0;
      if (week) {
        const { count = 0 } = await supabase
          .from("selections")
          .select("id", { count: "exact", head: true })
          .eq("exam_week_id", week.id)
          .eq("is_default_assigned", false);
        selectionsCount = count ?? 0;
      }

      return { inst, week, totalStudents: totalStudents ?? 0, selectionsCount };
    }),
  );

  const { data: openAlerts = [] } = await supabase
    .from("admin_alerts")
    .select(
      "id, reason, created_at, student_id, profiles(full_name, institutions(name))",
    )
    .eq("is_resolved", false)
    .order("created_at", { ascending: false })
    .limit(20)
    .returns<
      {
        id: string;
        reason: string;
        created_at: string;
        profiles: {
          full_name: string;
          institutions: { name: string } | null;
        } | null;
      }[]
    >();

  return (
    <>
      <AppHeader user={user} nav={ADMIN_NAV} />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8">
        <PageHeader
          title={`Merhaba, ${user.full_name.split(" ")[0]}`}
          description="3 lokasyonun bu haftaki durumu."
        />

        <div className="grid gap-4 md:grid-cols-3">
          {cards.map(({ inst, week, totalStudents, selectionsCount }) => {
            const Icon = ICON_BY_TYPE[inst.type] ?? Building2;
            const past = week ? isPastDeadline(week.selection_deadline) : false;
            const ratio =
              totalStudents > 0 ? selectionsCount / totalStudents : 0;
            return (
              <StatCard
                key={inst.id}
                icon={Icon}
                tone="primary"
                title={inst.name}
                description={`${totalStudents} aktif öğrenci`}
              >
                {week ? (
                  <>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">
                        Yaklaşan
                      </div>
                      <div className="font-semibold">
                        {formatDate(week.exam_date)}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Seçim</span>
                        <span className="font-semibold">
                          {selectionsCount}/{totalStudents}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${ratio * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1">
                      {past ? (
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" />
                          Kilitli
                        </Badge>
                      ) : (
                        <Badge className="gap-1">
                          <Clock className="h-3 w-3" />
                          {timeUntil(week.selection_deadline)}
                        </Badge>
                      )}
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/hafta/${week.id}`}>Düzenle</Link>
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Yaklaşan sınav tanımlı değil.
                    </p>
                    <Button asChild size="sm">
                      <Link href="/admin/hafta">Hafta oluştur</Link>
                    </Button>
                  </>
                )}
              </StatCard>
            );
          })}
        </div>

        <Card>
          <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-warning-foreground" />
                Açık uyarılar
              </CardTitle>
              <CardDescription>
                Varsayılan atama yapılamayan öğrenciler — manuel müdahale.
              </CardDescription>
            </div>
            {openAlerts && openAlerts.length > 0 ? (
              <Badge className="bg-warning text-warning-foreground hover:bg-warning">
                {openAlerts.length}
              </Badge>
            ) : null}
          </CardHeader>
          <CardContent>
            {openAlerts && openAlerts.length > 0 ? (
              <ul className="space-y-2">
                {openAlerts.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-start justify-between gap-3 rounded-lg border-l-4 border-warning bg-warning/10 p-3 text-sm"
                  >
                    <div>
                      <span className="font-semibold">
                        {a.profiles?.full_name ?? "—"}
                      </span>{" "}
                      <span className="text-muted-foreground">
                        ({a.profiles?.institutions?.name ?? "—"})
                      </span>
                      <div className="text-xs text-muted-foreground">
                        {alertReasonLabel(a.reason)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-2 text-center text-sm text-muted-foreground">
                Açık uyarı yok.
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}

function alertReasonLabel(reason: string) {
  switch (reason) {
    case "DEFAULT_SESSION_FULL":
      return "Varsayılan seans dolu — manuel seans ataması gerekli";
    case "DEFAULT_SESSION_CLOSED":
      return "Varsayılan seans kapalı — seans açılmalı veya başka atanmalı";
    case "NO_DEFAULT_PUBLISHER":
      return "Varsayılan yayın tanımlı değil";
    case "NO_DEFAULT_SESSION":
      return "Varsayılan seans tanımlı değil";
    default:
      return reason;
  }
}

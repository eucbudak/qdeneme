import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";
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
import type { InstitutionType } from "@/lib/db/types";

type InstRow = { id: string; name: string; type: InstitutionType };

type NextWeek = {
  id: string;
  exam_date: string;
  selection_deadline: string;
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
      <AppHeader
        user={user}
        nav={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/hafta", label: "Haftalık Sınav" },
          { href: "/admin/ogrenciler", label: "Öğrenciler" },
          { href: "/admin/rapor", label: "Rapor" },
        ]}
      />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>

        <div className="grid gap-4 md:grid-cols-3">
          {cards.map(({ inst, week, totalStudents, selectionsCount }) => {
            const past = week ? isPastDeadline(week.selection_deadline) : false;
            return (
              <Card key={inst.id}>
                <CardHeader>
                  <CardTitle className="text-base">{inst.name}</CardTitle>
                  <CardDescription>
                    {totalStudents} aktif öğrenci
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {week ? (
                    <>
                      <div>
                        <div className="text-sm text-zinc-500">
                          Yaklaşan sınav
                        </div>
                        <div className="font-medium">
                          {formatDate(week.exam_date)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-zinc-500">Seçim</div>
                        <div className="font-medium">
                          {selectionsCount} / {totalStudents} öğrenci
                        </div>
                      </div>
                      <div>
                        {past ? (
                          <Badge variant="secondary">Deadline geçti</Badge>
                        ) : (
                          <Badge>
                            Kalan: {timeUntil(week.selection_deadline)}
                          </Badge>
                        )}
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/hafta/${week.id}`}>Düzenle</Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-zinc-500">
                        Yaklaşan sınav tanımlı değil.
                      </p>
                      <Button asChild size="sm">
                        <Link href="/admin/hafta">Hafta oluştur</Link>
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Açık uyarılar</CardTitle>
            <CardDescription>
              Varsayılan atama yapılamayan öğrenciler — manuel müdahale gerekir.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {openAlerts && openAlerts.length > 0 ? (
              <ul className="space-y-2">
                {openAlerts.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between rounded-md border p-3 text-sm"
                  >
                    <div>
                      <span className="font-medium">
                        {a.profiles?.full_name ?? "—"}
                      </span>{" "}
                      <span className="text-zinc-500">
                        ({a.profiles?.institutions?.name ?? "—"})
                      </span>
                      <div className="text-xs text-zinc-500">
                        {alertReasonLabel(a.reason)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-4 text-center text-sm text-zinc-500">
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

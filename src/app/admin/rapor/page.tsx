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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatDateTime } from "@/lib/date";

type WeekOption = {
  id: string;
  exam_date: string;
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
  searchParams: Promise<{ week?: string }>;
}) {
  const user = await requireUser("ADMIN");
  const supabase = await createClient();

  const { data: weeks = [] } = await supabase
    .from("exam_weeks")
    .select("id, exam_date, institutions(name)")
    .order("exam_date", { ascending: false })
    .limit(30)
    .returns<WeekOption[]>();

  const params = await searchParams;
  const selectedWeekId = params.week ?? weeks?.[0]?.id ?? null;

  let students: { id: string; full_name: string; username: string }[] = [];
  let selections: ReportRow[] = [];
  let week: WeekOption | undefined;

  if (selectedWeekId) {
    week = weeks?.find((w) => w.id === selectedWeekId);
    const { data: weekFull } = await supabase
      .from("exam_weeks")
      .select("institution_id")
      .eq("id", selectedWeekId)
      .single<{ institution_id: string }>();

    if (weekFull) {
      const { data: studentList = [] } = await supabase
        .from("profiles")
        .select("id, full_name, username")
        .eq("role", "STUDENT")
        .eq("is_active", true)
        .eq("institution_id", weekFull.institution_id)
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
        <h1 className="text-2xl font-semibold">Seçim raporu</h1>

        <Card>
          <CardHeader>
            <CardTitle>Hafta seç</CardTitle>
            <CardDescription>Son 30 hafta listelenir.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(weeks ?? []).map((w) => (
                <Link
                  key={w.id}
                  href={`/admin/rapor?week=${w.id}`}
                  className={`rounded-md border px-3 py-1 text-sm ${
                    w.id === selectedWeekId
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                      : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  {w.institutions?.name} — {formatDate(w.exam_date)}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {week && students.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>
                {week.institutions?.name} — {formatDate(week.exam_date)}
              </CardTitle>
              <CardDescription>
                {byStudent.size} / {students.length} öğrenci için seçim var
                {" · "}
                {
                  Array.from(byStudent.values()).filter(
                    (s) => s.is_default_assigned,
                  ).length
                }
                {" "}varsayılan atandı
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                      <TableRow key={st.id}>
                        <TableCell className="font-medium">
                          {st.full_name}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {st.username}
                        </TableCell>
                        <TableCell>{sel?.publishers?.name ?? "—"}</TableCell>
                        <TableCell>
                          {sel?.sessions?.session_datetime
                            ? formatDateTime(sel.sessions.session_datetime)
                            : "—"}
                        </TableCell>
                        <TableCell>
                          {!sel ? (
                            <Badge variant="secondary">Seçim yok</Badge>
                          ) : sel.is_default_assigned ? (
                            <Badge variant="outline">Varsayılan atandı</Badge>
                          ) : (
                            <Badge>Kendi seçti</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <p className="py-8 text-center text-sm text-zinc-500">
            Seçilmiş bir hafta yok veya öğrenci bulunmuyor.
          </p>
        )}
      </main>
    </>
  );
}

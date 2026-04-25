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

type PastRow = {
  id: string;
  is_default_assigned: boolean;
  created_at: string;
  exam_weeks: { exam_date: string } | null;
  publishers: { name: string } | null;
  sessions: { session_datetime: string } | null;
};

export default async function StudentHistory() {
  const user = await requireUser("STUDENT");
  const supabase = await createClient();

  const today = new Date().toISOString().slice(0, 10);

  const { data: past = [] } = await supabase
    .from("selections")
    .select(
      "id, is_default_assigned, created_at, exam_weeks!inner(exam_date, institution_id), publishers(name), sessions(session_datetime)",
    )
    .eq("student_id", user.id)
    .lt("exam_weeks.exam_date", today)
    .order("exam_weeks(exam_date)", { ascending: false })
    .returns<PastRow[]>();

  const nav = [
    { href: "/student", label: "Yaklaşan Sınav" },
    { href: "/student/gecmis", label: "Geçmiş Sınavlarım" },
  ];

  return (
    <>
      <AppHeader user={user} nav={nav} />
      <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
        <h1 className="text-2xl font-semibold">Geçmiş sınavlarım</h1>

        <Card>
          <CardHeader>
            <CardTitle>Tüm haftalar</CardTitle>
            <CardDescription>
              Bugüne kadar girdiğin veya sana atanan sınavlar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {past && past.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sınav tarihi</TableHead>
                    <TableHead>Yayın</TableHead>
                    <TableHead>Seans</TableHead>
                    <TableHead>Durum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {past.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        {p.exam_weeks?.exam_date
                          ? formatDate(p.exam_weeks.exam_date)
                          : "—"}
                      </TableCell>
                      <TableCell>{p.publishers?.name ?? "—"}</TableCell>
                      <TableCell>
                        {p.sessions?.session_datetime
                          ? formatDateTime(p.sessions.session_datetime)
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {p.is_default_assigned ? (
                          <Badge variant="outline">Varsayılan</Badge>
                        ) : (
                          <Badge>Kendi seçtin</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="py-8 text-center text-sm text-zinc-500">
                Henüz geçmiş sınav yok.
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, isPastDeadline, timeUntil } from "@/lib/date";
import { NewWeekDialog } from "./new-week-dialog";

type WeekRow = {
  id: string;
  exam_date: string;
  selection_deadline: string;
  is_locked: boolean;
  institutions: { name: string } | null;
};

export default async function WeeksPage() {
  const user = await requireUser("ADMIN");
  const supabase = await createClient();

  const { data: institutions = [] } = await supabase
    .from("institutions")
    .select("id, name")
    .order("name");

  const today = new Date().toISOString().slice(0, 10);
  const { data: upcoming = [] } = await supabase
    .from("exam_weeks")
    .select("id, exam_date, selection_deadline, is_locked, institutions(name)")
    .gte("exam_date", today)
    .order("exam_date")
    .returns<WeekRow[]>();

  const { data: past = [] } = await supabase
    .from("exam_weeks")
    .select("id, exam_date, selection_deadline, is_locked, institutions(name)")
    .lt("exam_date", today)
    .order("exam_date", { ascending: false })
    .limit(20)
    .returns<WeekRow[]>();

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Haftalık sınavlar</h1>
            <p className="text-sm text-zinc-500">
              Her hafta için lokasyon bazında sınav kaydı oluştur, seans ve yayın tanımla.
            </p>
          </div>
          <NewWeekDialog institutions={institutions ?? []} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Yaklaşan</CardTitle>
            <CardDescription>
              Seçim deadline&apos;ı geçmemiş haftalar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WeekTable rows={upcoming ?? []} emptyMessage="Yaklaşan hafta yok." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Geçmiş</CardTitle>
            <CardDescription>Son 20 hafta</CardDescription>
          </CardHeader>
          <CardContent>
            <WeekTable rows={past ?? []} emptyMessage="Geçmiş hafta yok." />
          </CardContent>
        </Card>
      </main>
    </>
  );
}

function WeekTable({
  rows,
  emptyMessage,
}: {
  rows: WeekRow[];
  emptyMessage: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-zinc-500">{emptyMessage}</p>
    );
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Lokasyon</TableHead>
          <TableHead>Sınav tarihi</TableHead>
          <TableHead>Deadline</TableHead>
          <TableHead></TableHead>
          <TableHead className="text-right"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((w) => {
          const past = isPastDeadline(w.selection_deadline);
          return (
            <TableRow key={w.id}>
              <TableCell>{w.institutions?.name ?? "—"}</TableCell>
              <TableCell>{formatDate(w.exam_date)}</TableCell>
              <TableCell>{formatDate(w.selection_deadline)}</TableCell>
              <TableCell>
                {past ? (
                  <Badge variant="secondary">Kilitli</Badge>
                ) : (
                  <Badge>{timeUntil(w.selection_deadline)}</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/hafta/${w.id}`}>Düzenle</Link>
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

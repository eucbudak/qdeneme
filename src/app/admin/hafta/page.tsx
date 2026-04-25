import Link from "next/link";
import { CalendarDays, ChevronRight, Lock, Plus } from "lucide-react";
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
import { ADMIN_NAV } from "@/lib/nav";
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

  const hasAny = (upcoming?.length ?? 0) + (past?.length ?? 0) > 0;

  return (
    <>
      <AppHeader user={user} nav={ADMIN_NAV} />
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
        <PageHeader
          title="Haftalık sınavlar"
          description="Her hafta için lokasyon bazında sınav kaydı oluştur, seans ve yayın tanımla."
          action={<NewWeekDialog institutions={institutions ?? []} />}
        />

        {!hasAny ? (
          <EmptyState
            icon={CalendarDays}
            title="Henüz hafta yok"
            description="İlk sınav haftasını oluşturmak için sağ üstteki butonu kullan."
          />
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Yaklaşan</CardTitle>
                <CardDescription>
                  Seçim deadline&apos;ı geçmemiş haftalar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WeekTable
                  rows={upcoming ?? []}
                  emptyMessage="Yaklaşan hafta yok."
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Geçmiş</CardTitle>
                <CardDescription>Son 20 hafta</CardDescription>
              </CardHeader>
              <CardContent>
                <WeekTable
                  rows={past ?? []}
                  emptyMessage="Geçmiş hafta yok."
                />
              </CardContent>
            </Card>
          </>
        )}
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
      <p className="py-6 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
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
            <TableRow key={w.id} className="hover:bg-primary/5">
              <TableCell className="font-medium">
                {w.institutions?.name ?? "—"}
              </TableCell>
              <TableCell>{formatDate(w.exam_date)}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(w.selection_deadline)}
              </TableCell>
              <TableCell>
                {past ? (
                  <Badge variant="secondary" className="gap-1">
                    <Lock className="h-3 w-3" />
                    Kilitli
                  </Badge>
                ) : (
                  <Badge>{timeUntil(w.selection_deadline)}</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button asChild variant="ghost" size="sm" className="gap-1">
                  <Link href={`/admin/hafta/${w.id}`}>
                    Düzenle
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

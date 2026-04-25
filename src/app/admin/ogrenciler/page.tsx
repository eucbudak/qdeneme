import { Users } from "lucide-react";
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
import { ADMIN_NAV } from "@/lib/nav";
import { NewStudentDialog } from "./new-student-dialog";
import { ResetPasswordButton, ToggleActiveButton } from "./student-actions";

type StudentRow = {
  id: string;
  username: string;
  full_name: string;
  is_active: boolean;
  institution_id: string | null;
  institutions: { name: string } | null;
};

export default async function StudentsPage() {
  const user = await requireUser("ADMIN");
  const supabase = await createClient();

  const { data: institutions = [] } = await supabase
    .from("institutions")
    .select("id, name")
    .order("name");

  const { data: students = [] } = await supabase
    .from("profiles")
    .select(
      "id, username, full_name, is_active, institution_id, institutions(name)",
    )
    .eq("role", "STUDENT")
    .order("full_name")
    .returns<StudentRow[]>();

  const activeCount = students?.filter((s) => s.is_active).length ?? 0;
  const inactiveCount = (students?.length ?? 0) - activeCount;

  return (
    <>
      <AppHeader user={user} nav={ADMIN_NAV} />
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
        <PageHeader
          title="Öğrenciler"
          description={
            students && students.length > 0
              ? `${activeCount} aktif · ${inactiveCount} pasif`
              : "Henüz öğrenci eklenmedi."
          }
          action={<NewStudentDialog institutions={institutions ?? []} />}
        />

        {students && students.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Liste</CardTitle>
              <CardDescription>
                Şifreyi sıfırladığında yeni şifreyi öğrenciye sen ileteceksin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ad Soyad</TableHead>
                    <TableHead>Kullanıcı adı</TableHead>
                    <TableHead>Lokasyon</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => (
                    <TableRow key={s.id} className="hover:bg-primary/5">
                      <TableCell className="font-medium">
                        {s.full_name}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {s.username}
                      </TableCell>
                      <TableCell>{s.institutions?.name ?? "—"}</TableCell>
                      <TableCell>
                        {s.is_active ? (
                          <Badge className="bg-success text-success-foreground hover:bg-success">
                            Aktif
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Pasif</Badge>
                        )}
                      </TableCell>
                      <TableCell className="space-x-2 text-right">
                        <ResetPasswordButton
                          studentId={s.id}
                          studentName={s.full_name}
                        />
                        <ToggleActiveButton
                          studentId={s.id}
                          isActive={s.is_active}
                          studentName={s.full_name}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            icon={Users}
            title="Henüz öğrenci yok"
            description="İlk öğrenciyi sağ üstteki butonla ekle. Vereceğin kullanıcı adı ve şifreyle öğrenci giriş yapabilir."
          />
        )}
      </main>
    </>
  );
}

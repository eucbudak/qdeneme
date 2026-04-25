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
    .select("id, username, full_name, is_active, institution_id, institutions(name)")
    .eq("role", "STUDENT")
    .order("full_name")
    .returns<StudentRow[]>();

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
            <h1 className="text-2xl font-semibold">Öğrenciler</h1>
            <p className="text-sm text-zinc-500">
              Toplam {students?.length ?? 0} öğrenci
            </p>
          </div>
          <NewStudentDialog institutions={institutions ?? []} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste</CardTitle>
            <CardDescription>
              Şifreyi sıfırladığında yeni şifreyi öğrenciye sen ileteceksin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {students && students.length > 0 ? (
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
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">
                        {s.full_name}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {s.username}
                      </TableCell>
                      <TableCell>{s.institutions?.name ?? "—"}</TableCell>
                      <TableCell>
                        {s.is_active ? (
                          <Badge variant="default">Aktif</Badge>
                        ) : (
                          <Badge variant="secondary">Pasif</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
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
            ) : (
              <p className="text-sm text-zinc-500 py-8 text-center">
                Henüz öğrenci eklenmedi.
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}

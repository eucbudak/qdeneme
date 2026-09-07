import { MapPin } from "lucide-react";
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
import type { InstitutionType } from "@/lib/db/types";
import {
  DeleteInstitutionButton,
  EditInstitutionButton,
} from "./institution-actions";

type InstitutionRow = {
  id: string;
  name: string;
  type: InstitutionType;
  has_capacity: boolean;
  address: string | null;
  phone: string | null;
  maps_url: string | null;
};

export default async function InstitutionsPage() {
  const user = await requireUser("ADMIN");
  const supabase = await createClient();

  const { data: institutions = [] } = await supabase
    .from("institutions")
    .select("id, name, type, has_capacity, address, phone, maps_url")
    .order("name")
    .returns<InstitutionRow[]>();

  // Silme dialogunda ne kadar veri gideceğini göstermek için bağlı kayıt sayıları.
  const { data: studentRows = [] } = await supabase
    .from("profiles")
    .select("institution_id")
    .eq("role", "STUDENT")
    .returns<{ institution_id: string | null }[]>();

  const { data: weekRows = [] } = await supabase
    .from("exam_weeks")
    .select("institution_id")
    .returns<{ institution_id: string }[]>();

  const studentsBy = new Map<string, number>();
  for (const r of studentRows ?? []) {
    if (!r.institution_id) continue;
    studentsBy.set(r.institution_id, (studentsBy.get(r.institution_id) ?? 0) + 1);
  }
  const weeksBy = new Map<string, number>();
  for (const r of weekRows ?? []) {
    weeksBy.set(r.institution_id, (weeksBy.get(r.institution_id) ?? 0) + 1);
  }

  return (
    <>
      <AppHeader user={user} nav={ADMIN_NAV} />
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
        <PageHeader
          title="Lokasyonlar"
          description="Şube bilgilerini düzenle. Adres, telefon ve harita linki ana sayfada görünür."
        />

        {institutions && institutions.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Şubeler</CardTitle>
              <CardDescription>
                Bir lokasyonu silmek, ona ait tüm deneme haftalarını da siler.
                Bağlı öğrenci varsa silme engellenir.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lokasyon</TableHead>
                    <TableHead>Adres</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Öğrenci</TableHead>
                    <TableHead>Kontenjan</TableHead>
                    <TableHead className="text-right">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {institutions.map((i) => {
                    const students = studentsBy.get(i.id) ?? 0;
                    const weeks = weeksBy.get(i.id) ?? 0;
                    return (
                      <TableRow key={i.id} className="hover:bg-primary/5">
                        <TableCell className="font-medium">{i.name}</TableCell>
                        <TableCell className="max-w-xs text-sm text-muted-foreground">
                          {i.address ?? "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {i.phone ?? "—"}
                        </TableCell>
                        <TableCell className="text-sm">{students}</TableCell>
                        <TableCell>
                          {i.has_capacity ? (
                            <Badge variant="secondary">Var</Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Yok
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="space-x-2 text-right">
                          <EditInstitutionButton institution={i} />
                          <DeleteInstitutionButton
                            institutionId={i.id}
                            institutionName={i.name}
                            studentCount={students}
                            weekCount={weeks}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            icon={MapPin}
            title="Lokasyon yok"
            description="Tanımlı şube bulunamadı."
          />
        )}
      </main>
    </>
  );
}

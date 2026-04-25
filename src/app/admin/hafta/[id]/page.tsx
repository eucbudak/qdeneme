import { BookOpen, Clock, Lock } from "lucide-react";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, isPastDeadline, timeUntil } from "@/lib/date";
import { ADMIN_NAV } from "@/lib/nav";
import type { InstitutionType } from "@/lib/db/types";
import { SessionsPanel } from "./sessions-panel";
import { PublishersPanel } from "./publishers-panel";

type WeekDetail = {
  id: string;
  exam_date: string;
  selection_deadline: string;
  is_locked: boolean;
  institution_id: string;
  institutions: {
    name: string;
    type: InstitutionType;
    has_capacity: boolean;
  } | null;
};

type SessionRow = {
  id: string;
  session_datetime: string;
  capacity: number | null;
  is_open: boolean;
  is_default: boolean;
};

type PublisherRow = {
  id: string;
  name: string;
  is_default: boolean;
};

export default async function WeekDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser("ADMIN");
  const supabase = await createClient();

  const { data: week } = await supabase
    .from("exam_weeks")
    .select(
      "id, exam_date, selection_deadline, is_locked, institution_id, institutions(name, type, has_capacity)",
    )
    .eq("id", id)
    .single<WeekDetail>();

  if (!week) notFound();

  const { data: sessions = [] } = await supabase
    .from("sessions")
    .select("id, session_datetime, capacity, is_open, is_default")
    .eq("exam_week_id", id)
    .order("session_datetime")
    .returns<SessionRow[]>();

  const { data: publishers = [] } = await supabase
    .from("publishers")
    .select("id, name, is_default")
    .eq("exam_week_id", id)
    .order("name")
    .returns<PublisherRow[]>();

  const { data: selCounts = [] } = await supabase
    .from("selections")
    .select("session_id")
    .eq("exam_week_id", id)
    .returns<{ session_id: string | null }[]>();

  const countsBySession = new Map<string, number>();
  for (const s of selCounts ?? []) {
    if (!s.session_id) continue;
    countsBySession.set(s.session_id, (countsBySession.get(s.session_id) ?? 0) + 1);
  }

  const past = isPastDeadline(week.selection_deadline);
  const hasCapacity = week.institutions?.has_capacity ?? false;
  const institutionType = week.institutions?.type;

  return (
    <>
      <AppHeader user={user} nav={ADMIN_NAV} />
      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8">
        <PageHeader
          title={`${week.institutions?.name} — ${formatDate(week.exam_date)}`}
          description={`Deadline: ${formatDate(week.selection_deadline)}`}
          action={
            past ? (
              <Badge variant="secondary" className="gap-1">
                <Lock className="h-3 w-3" />
                Seçim kilitli
              </Badge>
            ) : (
              <Badge className="gap-1">
                <Clock className="h-3 w-3" />
                {timeUntil(week.selection_deadline)}
              </Badge>
            )
          }
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-primary" />
              Seanslar
            </CardTitle>
            <CardDescription>
              {institutionType === "Q_WORK"
                ? "Q work — birden çok seans tanımlayabilirsin. Varsayılan Pazar 10:00 olmalı."
                : "Tek seans (Pazar 10:00). Kapatıp açabilirsin."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SessionsPanel
              examWeekId={week.id}
              sessions={sessions ?? []}
              hasCapacity={hasCapacity}
              allowAdd={institutionType === "Q_WORK"}
              countsBySession={Object.fromEntries(countsBySession)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4 text-primary" />
              Yayınlar
            </CardTitle>
            <CardDescription>
              En az bir yayın ekle. Varsayılan olan, seçim yapmayana atanır.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PublishersPanel
              examWeekId={week.id}
              publishers={publishers ?? []}
            />
          </CardContent>
        </Card>
      </main>
    </>
  );
}

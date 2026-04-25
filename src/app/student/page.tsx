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
  formatDate,
  formatDateTime,
  isPastDeadline,
  timeUntil,
} from "@/lib/date";
import type { InstitutionType } from "@/lib/db/types";
import {
  SelectionForm,
  type PublisherOption,
  type SessionOption,
} from "./selection-form";

type Week = {
  id: string;
  exam_date: string;
  selection_deadline: string;
  is_locked: boolean;
};

export default async function StudentHome() {
  const user = await requireUser("STUDENT");
  const supabase = await createClient();

  const today = new Date().toISOString().slice(0, 10);
  const { data: week } = await supabase
    .from("exam_weeks")
    .select("id, exam_date, selection_deadline, is_locked")
    .eq("institution_id", user.institution_id!)
    .gte("exam_date", today)
    .order("exam_date")
    .limit(1)
    .maybeSingle<Week>();

  const nav = [
    { href: "/student", label: "Yaklaşan Sınav" },
    { href: "/student/gecmis", label: "Geçmiş Sınavlarım" },
  ];

  if (!week) {
    return (
      <>
        <AppHeader user={user} nav={nav} />
        <main className="mx-auto w-full max-w-3xl px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Yaklaşan sınav yok</CardTitle>
              <CardDescription>
                Kurumunuz haftalık konfigürasyonu girdiğinde burada görünecek.
              </CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        </main>
      </>
    );
  }

  const [{ data: publishers = [] }, { data: sessionsRaw = [] }, { data: mySel }] =
    await Promise.all([
      supabase
        .from("publishers")
        .select("id, name, is_default")
        .eq("exam_week_id", week.id)
        .order("name")
        .returns<PublisherOption[]>(),
      supabase
        .from("sessions")
        .select("id, session_datetime, capacity, is_open, is_default")
        .eq("exam_week_id", week.id)
        .order("session_datetime")
        .returns<
          Omit<SessionOption, "used">[]
        >(),
      supabase
        .from("selections")
        .select(
          "publisher_id, session_id, is_default_assigned, publishers(name), sessions(session_datetime)",
        )
        .eq("student_id", user.id)
        .eq("exam_week_id", week.id)
        .maybeSingle<{
          publisher_id: string;
          session_id: string | null;
          is_default_assigned: boolean;
          publishers: { name: string } | null;
          sessions: { session_datetime: string } | null;
        }>(),
    ]);

  // Seans başı doluluk
  const { data: selCounts = [] } = await supabase
    .from("selections")
    .select("session_id")
    .eq("exam_week_id", week.id)
    .returns<{ session_id: string | null }[]>();
  const usedBySession = new Map<string, number>();
  for (const s of selCounts ?? []) {
    if (!s.session_id) continue;
    usedBySession.set(s.session_id, (usedBySession.get(s.session_id) ?? 0) + 1);
  }

  const sessions: SessionOption[] = (sessionsRaw ?? []).map((s) => ({
    ...s,
    used: usedBySession.get(s.id) ?? 0,
  }));

  const showSessions = user.institution_type === "Q_WORK";
  const past = isPastDeadline(week.selection_deadline) || week.is_locked;

  return (
    <>
      <AppHeader user={user} nav={nav} />
      <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-semibold">
            Yaklaşan sınav — {formatDate(week.exam_date)}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
            <span>{user.institution_name}</span>
            <span>·</span>
            <span>Deadline: {formatDate(week.selection_deadline)}</span>
            {past ? (
              <Badge variant="secondary">Seçim kilitli</Badge>
            ) : (
              <Badge>Kalan: {timeUntil(week.selection_deadline)}</Badge>
            )}
          </div>
        </div>

        {mySel ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mevcut seçimin</CardTitle>
              {mySel.is_default_assigned && (
                <CardDescription>
                  Bu seçim <strong>varsayılan</strong> olarak atandı.
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div>
                <span className="text-zinc-500">Yayın:</span>{" "}
                <span className="font-medium">
                  {mySel.publishers?.name ?? "—"}
                </span>
              </div>
              {mySel.sessions?.session_datetime && (
                <div>
                  <span className="text-zinc-500">Seans:</span>{" "}
                  <span className="font-medium">
                    {formatDateTime(mySel.sessions.session_datetime)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}

        {past ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Seçim süresi doldu</CardTitle>
              <CardDescription>
                {mySel
                  ? "Seçimini yukarıda görebilirsin."
                  : "Seçim yapmadığın için varsayılan kısa süre içinde atanacak."}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : publishers && publishers.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {mySel ? "Seçimini değiştir" : "Seçimini yap"}
              </CardTitle>
              <CardDescription>
                Deadline: {formatDateTime(week.selection_deadline)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SelectionForm
                examWeekId={week.id}
                publishers={publishers ?? []}
                sessions={sessions}
                showSessions={showSessions}
                currentPublisherId={mySel?.publisher_id}
                currentSessionId={mySel?.session_id}
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Henüz yayın tanımlanmadı
              </CardTitle>
              <CardDescription>
                Kurumunuz bu hafta için yayınları girince burada görünecek.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </main>
    </>
  );
}

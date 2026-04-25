import { CalendarDays, Clock, Lock, Sparkles, Star } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";
import { EmptyState } from "@/components/empty-state";
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

const studentNav = [
  { href: "/student", label: "Yaklaşan Sınav", icon: CalendarDays, match: "exact" as const },
  { href: "/student/gecmis", label: "Geçmiş Sınavlarım", icon: Clock },
];

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

  if (!week) {
    return (
      <>
        <AppHeader user={user} nav={studentNav} />
        <main className="mx-auto w-full max-w-3xl px-4 py-10">
          <EmptyState
            icon={CalendarDays}
            title="Yaklaşan sınav yok"
            description="Kurumun haftalık konfigürasyonu girdiğinde burada görünecek. Bir süre sonra tekrar bak."
          />
        </main>
      </>
    );
  }

  const [
    { data: publishers = [] },
    { data: sessionsRaw = [] },
    { data: mySel },
  ] = await Promise.all([
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
      .returns<Omit<SessionOption, "used">[]>(),
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
      <AppHeader user={user} nav={studentNav} />
      <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
        {/* Hero kart */}
        <div className="overflow-hidden rounded-2xl bg-brand-gradient text-primary-foreground shadow-lg">
          <div className="space-y-4 p-6 sm:p-8">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary-foreground/80">
              <Sparkles className="h-3.5 w-3.5" />
              Yaklaşan sınav
            </div>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">
                  {formatDate(week.exam_date)}
                </h1>
                <p className="text-sm text-primary-foreground/80">
                  {user.institution_name}
                </p>
              </div>
              <div className="rounded-xl bg-primary-foreground/15 px-4 py-2 backdrop-blur">
                {past ? (
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Lock className="h-4 w-4" />
                    Seçim kilitli
                  </div>
                ) : (
                  <>
                    <div className="text-xs uppercase tracking-wider text-primary-foreground/70">
                      Kalan
                    </div>
                    <div className="text-lg font-bold">
                      {timeUntil(week.selection_deadline)}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {mySel ? (
          <Card
            className={
              mySel.is_default_assigned
                ? "border-muted-foreground/20"
                : "border-success/40 bg-success/5"
            }
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                {mySel.is_default_assigned ? (
                  <>
                    <Star className="h-4 w-4 fill-current text-muted-foreground" />
                    Sana atanan seçim
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-success" />
                    Mevcut seçimin
                  </>
                )}
              </CardTitle>
              {mySel.is_default_assigned ? (
                <CardDescription>
                  Seçim yapmadığın için varsayılan otomatik atandı.
                </CardDescription>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div>
                <span className="text-muted-foreground">Yayın:</span>{" "}
                <span className="font-semibold">
                  {mySel.publishers?.name ?? "—"}
                </span>
              </div>
              {mySel.sessions?.session_datetime ? (
                <div>
                  <span className="text-muted-foreground">Seans:</span>{" "}
                  <span className="font-semibold">
                    {formatDateTime(mySel.sessions.session_datetime)}
                  </span>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        {past ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lock className="h-4 w-4" />
                Seçim süresi doldu
              </CardTitle>
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
                Son tarih: {formatDateTime(week.selection_deadline)}
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
          <EmptyState
            icon={Sparkles}
            title="Henüz yayın tanımlanmadı"
            description="Kurumun bu hafta için yayınları girince seçim ekranı burada açılacak."
          />
        )}
      </main>
    </>
  );
}

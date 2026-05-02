import { Building2, CalendarDays, Lock, Sparkles, Star } from "lucide-react";
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
import {
  formatDate,
  formatDateTime,
  isPastDeadline,
  timeUntil,
} from "@/lib/date";
import { STUDENT_NAV } from "@/lib/nav";
import {
  SelectionForm,
  type PublisherOption,
  type SessionOption,
} from "./selection-form";

type Week = {
  id: string;
  exam_date: string;
  selection_deadline: string;
  change_lock_at: string | null;
  is_locked: boolean;
};

type MySelection = {
  exam_week_id: string;
  publisher_id: string;
  session_id: string | null;
  is_default_assigned: boolean;
  publishers: { name: string } | null;
  sessions: { session_datetime: string } | null;
};

export default async function StudentHome() {
  const user = await requireUser("STUDENT");
  const supabase = await createClient();

  const today = new Date().toISOString().slice(0, 10);
  const { data: weeks = [] } = await supabase
    .from("exam_weeks")
    .select("id, exam_date, selection_deadline, change_lock_at, is_locked")
    .eq("institution_id", user.institution_id!)
    .gte("exam_date", today)
    .order("exam_date")
    .returns<Week[]>();

  if (!weeks || weeks.length === 0) {
    return (
      <>
        <AppHeader user={user} nav={STUDENT_NAV} />
        <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
          <InstitutionBanner name={user.institution_name} />
          <EmptyState
            icon={CalendarDays}
            title="Yaklaşan sınav yok"
            description="Kurumun haftalık konfigürasyonu girdiğinde burada görünecek. Bir süre sonra tekrar bak."
          />
        </main>
      </>
    );
  }

  const weekIds = weeks.map((w) => w.id);

  const [
    { data: publishersAll = [] },
    { data: sessionsAll = [] },
    { data: mySelections = [] },
    { data: allSelections = [] },
  ] = await Promise.all([
    supabase
      .from("publishers")
      .select("id, exam_week_id, name, is_default")
      .in("exam_week_id", weekIds)
      .order("name")
      .returns<(PublisherOption & { exam_week_id: string })[]>(),
    supabase
      .from("sessions")
      .select(
        "id, exam_week_id, session_datetime, capacity, is_open, is_default",
      )
      .in("exam_week_id", weekIds)
      .order("session_datetime")
      .returns<(Omit<SessionOption, "used"> & { exam_week_id: string })[]>(),
    supabase
      .from("selections")
      .select(
        "exam_week_id, publisher_id, session_id, is_default_assigned, publishers(name), sessions(session_datetime)",
      )
      .eq("student_id", user.id)
      .in("exam_week_id", weekIds)
      .returns<MySelection[]>(),
    supabase
      .from("selections")
      .select("exam_week_id, session_id")
      .in("exam_week_id", weekIds)
      .returns<{ exam_week_id: string; session_id: string | null }[]>(),
  ]);

  const usedBySession = new Map<string, number>();
  for (const s of allSelections ?? []) {
    if (!s.session_id) continue;
    usedBySession.set(s.session_id, (usedBySession.get(s.session_id) ?? 0) + 1);
  }

  const mySelByWeek = new Map<string, MySelection>();
  for (const s of mySelections ?? []) {
    mySelByWeek.set(s.exam_week_id, s);
  }

  const showSessions = user.institution_type === "Q_WORK";

  return (
    <>
      <AppHeader user={user} nav={STUDENT_NAV} />
      <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
        <InstitutionBanner name={user.institution_name} />

        {weeks.map((week) => {
          const publishers = (publishersAll ?? []).filter(
            (p) => p.exam_week_id === week.id,
          );
          const sessions: SessionOption[] = (sessionsAll ?? [])
            .filter((s) => s.exam_week_id === week.id)
            .map((s) => ({ ...s, used: usedBySession.get(s.id) ?? 0 }));
          const mySel = mySelByWeek.get(week.id);
          const changeLocked =
            week.change_lock_at !== null &&
            isPastDeadline(week.change_lock_at);
          const past =
            isPastDeadline(week.selection_deadline) || week.is_locked;

          return (
            <WeekBlock
              key={week.id}
              week={week}
              publishers={publishers}
              sessions={sessions}
              showSessions={showSessions}
              mySel={mySel}
              past={past}
              changeLocked={changeLocked}
              institutionName={user.institution_name}
            />
          );
        })}
      </main>
    </>
  );
}

function InstitutionBanner({ name }: { name: string | null }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border bg-card/60 px-4 py-2.5 shadow-sm">
      <Building2 className="h-4 w-4 text-primary" />
      <span className="text-xs uppercase tracking-wider text-muted-foreground">
        Kurumun
      </span>
      <span className="text-sm font-semibold">{name ?? "—"}</span>
    </div>
  );
}

function WeekBlock({
  week,
  publishers,
  sessions,
  showSessions,
  mySel,
  past,
  changeLocked,
  institutionName,
}: {
  week: Week;
  publishers: PublisherOption[];
  sessions: SessionOption[];
  showSessions: boolean;
  mySel: MySelection | undefined;
  past: boolean;
  changeLocked: boolean;
  institutionName: string | null;
}) {
  return (
    <section className="space-y-4">
      {/* Hafta başlığı */}
      <div className="overflow-hidden rounded-2xl bg-brand-gradient text-primary-foreground shadow-lg">
        <div className="space-y-4 p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary-foreground/80">
            <Sparkles className="h-3.5 w-3.5" />
            Sınav haftası
          </div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">
                {formatDate(week.exam_date)}
              </h2>
              <p className="text-sm text-primary-foreground/80">
                {institutionName}
              </p>
            </div>
            <div className="rounded-xl bg-primary-foreground/15 px-4 py-2 backdrop-blur">
              {past ? (
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Lock className="h-4 w-4" />
                  Seçim kilitli
                </div>
              ) : changeLocked ? (
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Lock className="h-4 w-4" />
                  Değişiklik kapandı
                </div>
              ) : (
                <>
                  <div className="text-xs uppercase tracking-wider text-primary-foreground/70">
                    Kalan
                  </div>
                  <div className="text-lg font-bold">
                    {timeUntil(
                      week.change_lock_at ?? week.selection_deadline,
                    )}
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
            <CardDescription className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              {institutionName}
              {mySel.is_default_assigned ? (
                <span className="ml-2 text-muted-foreground">
                  · Seçim yapmadığın için varsayılan otomatik atandı
                </span>
              ) : null}
            </CardDescription>
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
      ) : changeLocked ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lock className="h-4 w-4" />
              Değişiklik dönemi kapandı
            </CardTitle>
            <CardDescription>
              {mySel
                ? "Seçimin yukarıda. Sınav gününe kadar değiştirilemez."
                : "Seçim yapmadın. Otomatik atama tarihinde varsayılan atanacak."}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : publishers.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {mySel ? "Seçimini değiştir" : "Seçimini yap"}
            </CardTitle>
            <CardDescription>
              Son tarih:{" "}
              {formatDateTime(
                week.change_lock_at ?? week.selection_deadline,
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SelectionForm
              examWeekId={week.id}
              publishers={publishers}
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
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4" />
              Henüz yayın tanımlanmadı
            </CardTitle>
            <CardDescription>
              Kurumun bu hafta için yayınları girince seçim ekranı burada
              açılacak.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </section>
  );
}

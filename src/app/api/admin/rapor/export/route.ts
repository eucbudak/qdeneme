import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatDateTime } from "@/lib/date";

type WeekRow = {
  id: string;
  exam_date: string;
  institution_id: string;
  institutions: { name: string } | null;
};

type StudentRow = {
  id: string;
  full_name: string;
  username: string;
  institution_id: string | null;
};

type SelectionRow = {
  student_id: string;
  exam_week_id: string;
  is_default_assigned: boolean;
  publishers: { name: string } | null;
  sessions: { session_datetime: string } | null;
};

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single<{ role: string; is_active: boolean }>();
  if (!profile || profile.role !== "ADMIN" || !profile.is_active) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const url = new URL(request.url);
  const weekId = url.searchParams.get("week");
  const institutionId = url.searchParams.get("institution");

  let weekQuery = supabase
    .from("exam_weeks")
    .select("id, exam_date, institution_id, institutions(name)")
    .order("exam_date", { ascending: false });
  if (weekId) weekQuery = weekQuery.eq("id", weekId);
  if (institutionId) weekQuery = weekQuery.eq("institution_id", institutionId);

  const { data: weeks = [], error: weekErr } = await weekQuery.returns<
    WeekRow[]
  >();
  if (weekErr) {
    return NextResponse.json({ error: weekErr.message }, { status: 500 });
  }
  if (!weeks || weeks.length === 0) {
    return NextResponse.json(
      { error: "Veri bulunamadı." },
      { status: 404 },
    );
  }

  const weekIds = weeks.map((w) => w.id);
  const institutionIds = Array.from(
    new Set(weeks.map((w) => w.institution_id)),
  );

  const [{ data: studentsAll = [] }, { data: selsAll = [] }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, username, institution_id")
      .eq("role", "STUDENT")
      .eq("is_active", true)
      .in("institution_id", institutionIds)
      .order("full_name")
      .returns<StudentRow[]>(),
    supabase
      .from("selections")
      .select(
        "student_id, exam_week_id, is_default_assigned, publishers(name), sessions(session_datetime)",
      )
      .in("exam_week_id", weekIds)
      .returns<SelectionRow[]>(),
  ]);

  const selByKey = new Map<string, SelectionRow>();
  for (const s of selsAll ?? []) {
    selByKey.set(`${s.exam_week_id}::${s.student_id}`, s);
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Q Deneme";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Seçim Raporu");
  sheet.columns = [
    { header: "Lokasyon", key: "institution", width: 28 },
    { header: "Sınav Tarihi", key: "exam_date", width: 28 },
    { header: "Öğrenci Ad Soyad", key: "full_name", width: 28 },
    { header: "Kullanıcı Adı", key: "username", width: 18 },
    { header: "Yayın (Sınav)", key: "publisher", width: 22 },
    { header: "Seans Saati", key: "session", width: 26 },
    { header: "Durum", key: "status", width: 18 },
  ];
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).alignment = { vertical: "middle" };

  for (const week of weeks) {
    const studentsOfInst = (studentsAll ?? []).filter(
      (s) => s.institution_id === week.institution_id,
    );
    for (const st of studentsOfInst) {
      const sel = selByKey.get(`${week.id}::${st.id}`);
      sheet.addRow({
        institution: week.institutions?.name ?? "—",
        exam_date: formatDate(week.exam_date),
        full_name: st.full_name,
        username: st.username,
        publisher: sel?.publishers?.name ?? "—",
        session: sel?.sessions?.session_datetime
          ? formatDateTime(sel.sessions.session_datetime)
          : "—",
        status: !sel
          ? "Seçim yok"
          : sel.is_default_assigned
            ? "Varsayılan"
            : "Kendi seçti",
      });
    }
  }

  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: sheet.columns.length },
  };

  const buffer = await workbook.xlsx.writeBuffer();

  let filenameStem = "secim-raporu";
  if (weekId && weeks.length === 1) {
    const w = weeks[0];
    filenameStem = `secim-${w.institutions?.name ?? "lokasyon"}-${w.exam_date}`;
  } else if (institutionId && weeks.length > 0) {
    filenameStem = `secim-${weeks[0].institutions?.name ?? "lokasyon"}-tum-haftalar`;
  } else {
    filenameStem = "secim-tum-haftalar";
  }
  const filename = `${filenameStem.replace(/[^a-zA-Z0-9-]+/g, "_")}.xlsx`;

  return new NextResponse(buffer as ArrayBuffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

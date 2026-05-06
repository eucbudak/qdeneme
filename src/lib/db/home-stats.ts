import { createAdminClient } from "@/lib/supabase/admin";

export type HomeStats = {
  studentCount: number;
  selectionCount: number;
  weekCount: number;
};

/**
 * Ana sayfa için canlı istatistikler. RLS bypass'lı admin client kullanır;
 * yalnızca toplam sayılar dönsün diye head:true count seçeneğiyle veri çekmiyor.
 */
export async function fetchHomeStats(): Promise<HomeStats> {
  const supabase = createAdminClient();

  const [students, selections, weeks] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "STUDENT"),
    supabase
      .from("selections")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("exam_weeks")
      .select("id", { count: "exact", head: true }),
  ]);

  return {
    studentCount: students.count ?? 0,
    selectionCount: selections.count ?? 0,
    weekCount: weeks.count ?? 0,
  };
}

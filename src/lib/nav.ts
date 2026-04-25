import {
  CalendarDays,
  Clock,
  FileBarChart,
  LayoutDashboard,
  Users,
} from "lucide-react";
import type { NavItem } from "@/components/nav-links";

export const STUDENT_NAV: NavItem[] = [
  { href: "/student", label: "Yaklaşan Sınav", icon: CalendarDays, match: "exact" },
  { href: "/student/gecmis", label: "Geçmiş Sınavlarım", icon: Clock },
];

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, match: "exact" },
  { href: "/admin/hafta", label: "Haftalık Sınav", icon: CalendarDays },
  { href: "/admin/ogrenciler", label: "Öğrenciler", icon: Users },
  { href: "/admin/rapor", label: "Rapor", icon: FileBarChart },
];

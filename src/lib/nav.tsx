import {
  CalendarDays,
  Clock,
  FileBarChart,
  Inbox,
  LayoutDashboard,
  Users,
} from "lucide-react";
import type { NavItem } from "@/components/nav-links";

const ICON_CLASS = "h-4 w-4";

export const STUDENT_NAV: NavItem[] = [
  {
    href: "/student",
    label: "Yaklaşan Sınav",
    icon: <CalendarDays className={ICON_CLASS} strokeWidth={2} />,
    match: "exact",
  },
  {
    href: "/student/gecmis",
    label: "Geçmiş Sınavlarım",
    icon: <Clock className={ICON_CLASS} strokeWidth={2} />,
  },
];

export const ADMIN_NAV: NavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: <LayoutDashboard className={ICON_CLASS} strokeWidth={2} />,
    match: "exact",
  },
  {
    href: "/admin/hafta",
    label: "Haftalık Sınav",
    icon: <CalendarDays className={ICON_CLASS} strokeWidth={2} />,
  },
  {
    href: "/admin/ogrenciler",
    label: "Öğrenciler",
    icon: <Users className={ICON_CLASS} strokeWidth={2} />,
  },
  {
    href: "/admin/rapor",
    label: "Rapor",
    icon: <FileBarChart className={ICON_CLASS} strokeWidth={2} />,
  },
  {
    href: "/admin/leads",
    label: "Ön Başvurular",
    icon: <Inbox className={ICON_CLASS} strokeWidth={2} />,
  },
];

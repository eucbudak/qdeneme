"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LEAD_STATUS_LABELS, type LeadStatus } from "@/lib/db/types";
import { deleteLead, updateLeadStatus } from "./actions";

const STATUS_ORDER: LeadStatus[] = [
  "NEW",
  "CONTACTING",
  "NOT_REACHED",
  "CONVERTED",
  "REJECTED",
];

export function LeadStatusSelect({
  id,
  current,
}: {
  id: string;
  current: LeadStatus;
}) {
  const [pending, startTransition] = useTransition();

  function onChange(value: string) {
    startTransition(async () => {
      const res = await updateLeadStatus(id, value as LeadStatus);
      if (res.ok) toast.success("Durum güncellendi");
      else toast.error(res.error ?? "Hata");
    });
  }

  return (
    <Select value={current} onValueChange={onChange} disabled={pending}>
      <SelectTrigger className="h-8 w-[150px] text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUS_ORDER.map((s) => (
          <SelectItem key={s} value={s}>
            {LEAD_STATUS_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function LeadDeleteButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!confirm("Bu başvuruyu silmek istediğine emin misin?")) return;
    startTransition(async () => {
      const res = await deleteLead(id);
      if (res.ok) toast.success("Başvuru silindi");
      else toast.error(res.error ?? "Hata");
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={onClick}
      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}

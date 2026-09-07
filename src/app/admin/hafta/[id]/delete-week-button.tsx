"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteExamWeek } from "../actions";

export function DeleteWeekButton({
  examWeekId,
  weekLabel,
  selectionCount,
}: {
  examWeekId: string;
  weekLabel: string;
  selectionCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onConfirm() {
    startTransition(async () => {
      const res = await deleteExamWeek(examWeekId);
      if (res.ok) {
        toast.success(`${weekLabel} silindi`);
        setOpen(false);
        router.push("/admin/hafta");
        router.refresh();
      } else {
        toast.error(res.error ?? "Silinemedi");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 text-destructive">
          <Trash2 className="h-4 w-4" />
          Sil
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Denemeyi sil</DialogTitle>
          <DialogDescription>
            {weekLabel} kaydı kalıcı olarak silinecek. Bu haftaya bağlı tüm
            seanslar, yayınlar
            {selectionCount > 0
              ? ` ve ${selectionCount} öğrenci seçimi`
              : " ve öğrenci seçimleri"}{" "}
            de silinir. Bu işlem geri alınamaz.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Vazgeç
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? "Siliniyor…" : "Evet, sil"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createExamWeek } from "./actions";

type Institution = { id: string; name: string };

function offsetForInput(examDate: string, daysBefore: number): string {
  if (!examDate) return "";
  const d = new Date(`${examDate}T00:00:00`);
  d.setDate(d.getDate() - daysBefore);
  d.setHours(23, 59, 0, 0);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export function NewWeekDialog({
  institutions,
}: {
  institutions: Institution[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [examDate, setExamDate] = useState("");
  const [changeLock, setChangeLock] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    setChangeLock(offsetForInput(examDate, 10));
    setDeadline(offsetForInput(examDate, 7));
  }, [examDate]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createExamWeek(formData);
      if (res.ok && res.id) {
        toast.success("Hafta oluşturuldu");
        setOpen(false);
        setExamDate("");
        router.push(`/admin/hafta/${res.id}`);
      } else {
        toast.error(res.error ?? "Hata");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Yeni hafta</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Yeni sınav haftası</DialogTitle>
            <DialogDescription>
              Sınava kaç gün kala değişiklik kapatılsın ve varsayılan ne zaman
              atansın — iki tarihi ayrı ayrı belirleyebilirsin.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="institution_id">Lokasyon</Label>
            <Select name="institution_id" required>
              <SelectTrigger id="institution_id">
                <SelectValue placeholder="Seç" />
              </SelectTrigger>
              <SelectContent>
                {institutions.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exam_date">Sınav tarihi (Pazar)</Label>
            <Input
              id="exam_date"
              name="exam_date"
              type="date"
              required
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="change_lock_at">
              Değişiklik son tarihi
              <span className="ml-1 font-normal text-muted-foreground">
                (varsayılan: 10 gün önce 23:59)
              </span>
            </Label>
            <Input
              id="change_lock_at"
              name="change_lock_at"
              type="datetime-local"
              value={changeLock}
              onChange={(e) => setChangeLock(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Bu tarihten sonra öğrenci seçim ekleyemez/değiştiremez. Boş
              bırakılırsa sadece atama tarihi geçerli.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="selection_deadline">
              Otomatik atama tarihi
              <span className="ml-1 font-normal text-muted-foreground">
                (varsayılan: 7 gün önce 23:59)
              </span>
            </Label>
            <Input
              id="selection_deadline"
              name="selection_deadline"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Bu tarihte cron çalışır, seçim yapmamış öğrencilere varsayılan
              yayın atanır ve hafta kilitlenir.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Oluşturuluyor…" : "Oluştur"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

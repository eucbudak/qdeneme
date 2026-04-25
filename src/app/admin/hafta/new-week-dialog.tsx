"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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

export function NewWeekDialog({
  institutions,
}: {
  institutions: Institution[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createExamWeek(formData);
      if (res.ok && res.id) {
        toast.success("Hafta oluşturuldu");
        setOpen(false);
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
              Lokasyon ve sınav tarihini seç. Deadline tarihten 10 gün önceye
              otomatik ayarlanır. Varsayılan seans Pazar 10:00 olarak açılır.
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
            <Input id="exam_date" name="exam_date" type="date" required />
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

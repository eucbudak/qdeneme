"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import { deleteInstitution, updateInstitution } from "./actions";

type InstitutionFields = {
  id: string;
  name: string;
  has_capacity: boolean;
  address: string | null;
  phone: string | null;
  maps_url: string | null;
};

export function EditInstitutionButton({
  institution,
}: {
  institution: InstitutionFields;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(institution.name);
  const [hasCapacity, setHasCapacity] = useState(institution.has_capacity);
  const [address, setAddress] = useState(institution.address ?? "");
  const [phone, setPhone] = useState(institution.phone ?? "");
  const [mapsUrl, setMapsUrl] = useState(institution.maps_url ?? "");
  const [pending, startTransition] = useTransition();

  // Dialog her açıldığında sunucudan gelen güncel değerlere dön.
  function onOpenChange(next: boolean) {
    if (next) {
      setName(institution.name);
      setHasCapacity(institution.has_capacity);
      setAddress(institution.address ?? "");
      setPhone(institution.phone ?? "");
      setMapsUrl(institution.maps_url ?? "");
    }
    setOpen(next);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateInstitution(institution.id, {
        name,
        hasCapacity,
        address,
        phone,
        mapsUrl,
      });
      if (res.ok) {
        toast.success("Lokasyon güncellendi");
        setOpen(false);
      } else {
        toast.error(res.error ?? "Hata");
      }
    });
  }

  const fieldId = (suffix: string) => `inst-${institution.id}-${suffix}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Düzenle
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Lokasyonu düzenle</DialogTitle>
            <DialogDescription>
              Adres, telefon ve harita linki ana sayfadaki lokasyon kartında
              görünür. Boş bırakılan alanlar &quot;Yakında&quot; olarak gösterilir.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor={fieldId("name")}>Lokasyon adı</Label>
            <Input
              id={fieldId("name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={fieldId("address")}>Adres</Label>
            <Input
              id={fieldId("address")}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Mahalle, sokak, no, ilçe / il"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={fieldId("phone")}>Telefon</Label>
            <Input
              id={fieldId("phone")}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0256 000 00 00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={fieldId("maps")}>Harita linki</Label>
            <Input
              id={fieldId("maps")}
              value={mapsUrl}
              onChange={(e) => setMapsUrl(e.target.value)}
              placeholder="https://www.google.com/maps/..."
              inputMode="url"
            />
          </div>

          <label
            className="flex cursor-pointer items-start gap-3 rounded-lg border p-3"
            htmlFor={fieldId("capacity")}
          >
            <input
              id={fieldId("capacity")}
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-primary"
              checked={hasCapacity}
              onChange={(e) => setHasCapacity(e.target.checked)}
            />
            <span className="space-y-0.5">
              <span className="block text-sm font-medium">
                Seans kontenjanı kullanılsın
              </span>
              <span className="block text-xs text-muted-foreground">
                Açıkken yeni haftaların seansları kontenjanlı açılır (varsayılan
                30 kişi). Kapalıyken seans sınırsızdır.
              </span>
            </span>
          </label>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Kaydediliyor…" : "Kaydet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteInstitutionButton({
  institutionId,
  institutionName,
  studentCount,
  weekCount,
}: {
  institutionId: string;
  institutionName: string;
  studentCount: number;
  weekCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const blocked = studentCount > 0;

  function onConfirm() {
    startTransition(async () => {
      const res = await deleteInstitution(institutionId);
      if (res.ok) {
        toast.success(`${institutionName} silindi`);
        setOpen(false);
      } else {
        toast.error(res.error ?? "Silinemedi");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Sil</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Lokasyonu sil</DialogTitle>
          <DialogDescription>
            {blocked ? (
              <>
                {institutionName} lokasyonuna bağlı {studentCount} öğrenci var.
                Silmeden önce bu öğrencileri başka bir lokasyona taşı ya da sil.
              </>
            ) : (
              <>
                {institutionName} kalıcı olarak silinecek.
                {weekCount > 0
                  ? ` Bu lokasyona ait ${weekCount} deneme haftası, seansları, yayınları ve seçimleri de gider.`
                  : " Bu lokasyona ait deneme haftası yok."}{" "}
                Bu işlem geri alınamaz.
              </>
            )}
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
            disabled={pending || blocked}
          >
            {pending ? "Siliniyor…" : "Evet, sil"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
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
import {
  deleteStudent,
  resetStudentPassword,
  toggleStudentActive,
  updateStudent,
} from "./actions";

export function ResetPasswordButton({
  studentId,
  studentName,
}: {
  studentId: string;
  studentName: string;
}) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await resetStudentPassword(studentId, password);
      if (res.ok) {
        toast.success(`${studentName} için şifre değiştirildi`);
        setOpen(false);
        setPassword("");
      } else {
        toast.error(res.error ?? "Hata");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Şifre sıfırla
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Şifre sıfırla</DialogTitle>
            <DialogDescription>
              {studentName} için yeni şifre belirle. Öğrenciye ilet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="new-password">Yeni şifre (en az 8 karakter)</Label>
            <Input
              id="new-password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
              required
              minLength={8}
            />
          </div>
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

export function ToggleActiveButton({
  studentId,
  isActive,
  studentName,
}: {
  studentId: string;
  isActive: boolean;
  studentName: string;
}) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      const res = await toggleStudentActive(studentId, !isActive);
      if (res.ok) {
        toast.success(
          isActive
            ? `${studentName} devre dışı bırakıldı`
            : `${studentName} aktif edildi`,
        );
      } else {
        toast.error(res.error ?? "Hata");
      }
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={pending}
    >
      {isActive ? "Devre dışı bırak" : "Aktif et"}
    </Button>
  );
}

export function EditStudentButton({
  studentId,
  fullName,
  username,
  institutionId,
  institutions,
}: {
  studentId: string;
  fullName: string;
  username: string;
  institutionId: string | null;
  institutions: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(fullName);
  const [uname, setUname] = useState(username);
  const [instId, setInstId] = useState(institutionId ?? "");
  const [pending, startTransition] = useTransition();

  // Dialog her açıldığında satırdaki güncel değerlere dön.
  function onOpenChange(next: boolean) {
    if (next) {
      setName(fullName);
      setUname(username);
      setInstId(institutionId ?? "");
    }
    setOpen(next);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateStudent(studentId, {
        fullName: name,
        username: uname,
        institutionId: instId,
      });
      if (res.ok) {
        toast.success("Öğrenci güncellendi");
        setOpen(false);
      } else {
        toast.error(res.error ?? "Hata");
      }
    });
  }

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
            <DialogTitle>Öğrenciyi düzenle</DialogTitle>
            <DialogDescription>
              Kullanıcı adını değiştirirsen öğrenci bundan sonra yeni adla giriş
              yapar. Şifre değişmez.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor={`edit-name-${studentId}`}>Ad Soyad</Label>
            <Input
              id={`edit-name-${studentId}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`edit-uname-${studentId}`}>
              Kullanıcı adı (küçük harf, rakam, . _ -)
            </Label>
            <Input
              id={`edit-uname-${studentId}`}
              value={uname}
              onChange={(e) => setUname(e.target.value)}
              autoCapitalize="none"
              required
              pattern="[a-z0-9._\-]{3,32}"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`edit-inst-${studentId}`}>Lokasyon</Label>
            <Select value={instId} onValueChange={setInstId} required>
              <SelectTrigger id={`edit-inst-${studentId}`}>
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

export function DeleteStudentButton({
  studentId,
  studentName,
}: {
  studentId: string;
  studentName: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      const res = await deleteStudent(studentId);
      if (res.ok) {
        toast.success(`${studentName} silindi`);
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
          <DialogTitle>Öğrenciyi sil</DialogTitle>
          <DialogDescription>
            {studentName} kalıcı olarak silinecek. Giriş hesabı ve geçmiş deneme
            seçimleri de gider. Bu işlem geri alınamaz. Öğrenci geçici olarak
            ayrılacaksa silmek yerine &quot;Devre dışı bırak&quot; kullan.
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

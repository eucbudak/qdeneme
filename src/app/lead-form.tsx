"use client";

import { useRef, useState, useTransition } from "react";
import confetti from "canvas-confetti";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { GRADE_LABELS, TRACK_LABELS } from "@/lib/db/types";
import { maskTrPhone } from "@/lib/phone-mask";
import { submitLeadApplication } from "./lead-actions";

function fireConfetti() {
  const colors = ["#3b82f6", "#22c55e", "#f59e0b", "#ec4899"];
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.7 },
    colors,
  });
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
    });
  }, 200);
}

type Institution = { id: string; name: string };

const GRADE_ORDER = ["GRADE_9", "GRADE_10", "GRADE_11", "GRADE_12", "MEZUN"] as const;
const TRACK_ORDER = ["SAY", "EA", "DIL", "SOZEL"] as const;

export function LeadForm({ institutions }: { institutions: Institution[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [grade, setGrade] = useState<string>("");
  const [track, setTrack] = useState<string>("");
  const [institutionId, setInstitutionId] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [parentPhone, setParentPhone] = useState<string>("");
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (grade) formData.set("grade", grade);
    if (track) formData.set("track", track);
    if (institutionId) formData.set("preferred_institution_id", institutionId);
    startTransition(async () => {
      const res = await submitLeadApplication(formData);
      if (res.ok) {
        toast.success("Başvurun alındı, kurum yakında seninle iletişime geçecek.");
        fireConfetti();
        setDone(true);
        formRef.current?.reset();
        setGrade("");
        setTrack("");
        setInstitutionId("");
        setPhone("");
        setParentPhone("");
      } else {
        toast.error(res.error ?? "Hata");
      }
    });
  }

  if (done) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold">Teşekkürler, başvurun alındı.</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Kurum kısa sürede seni arayacak.
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-4"
          onClick={() => setDone(false)}
        >
          Yeni başvuru gönder
        </Button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm sm:p-8"
    >
      <div className="space-y-2">
        <Label htmlFor="full_name">Ad Soyad</Label>
        <Input
          id="full_name"
          name="full_name"
          required
          minLength={3}
          maxLength={120}
          autoComplete="name"
          placeholder="Adın soyadın"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="grade">Sınıf</Label>
          <Select value={grade} onValueChange={setGrade}>
            <SelectTrigger id="grade">
              <SelectValue placeholder="Seç" />
            </SelectTrigger>
            <SelectContent>
              {GRADE_ORDER.map((g) => (
                <SelectItem key={g} value={g}>
                  {GRADE_LABELS[g]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="track">Bölüm</Label>
          <Select value={track} onValueChange={setTrack}>
            <SelectTrigger id="track">
              <SelectValue placeholder="Seç" />
            </SelectTrigger>
            <SelectContent>
              {TRACK_ORDER.map((t) => (
                <SelectItem key={t} value={t}>
                  {TRACK_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Telefon</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            inputMode="tel"
            autoComplete="tel"
            placeholder="0 (5XX) XXX XX XX"
            value={phone}
            onChange={(e) => setPhone(maskTrPhone(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="parent_phone">
            Veli telefonu{" "}
            <span className="text-xs font-normal text-muted-foreground">
              (opsiyonel)
            </span>
          </Label>
          <Input
            id="parent_phone"
            name="parent_phone"
            type="tel"
            inputMode="tel"
            placeholder="0 (5XX) XXX XX XX"
            value={parentPhone}
            onChange={(e) => setParentPhone(maskTrPhone(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="preferred_institution_id">
          Sınava girmek istediğin yer
        </Label>
        <Select value={institutionId} onValueChange={setInstitutionId}>
          <SelectTrigger id="preferred_institution_id">
            <SelectValue placeholder="Lokasyon seç" />
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

      <Button type="submit" size="lg" disabled={pending} className="w-full gap-2">
        {pending ? (
          "Gönderiliyor…"
        ) : (
          <>
            <Send className="h-4 w-4" />
            Başvuruyu gönder
          </>
        )}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Bilgilerin kurumla paylaşılır, başka yerde kullanılmaz.
      </p>
    </form>
  );
}

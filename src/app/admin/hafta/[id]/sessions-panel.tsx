"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/date";
import {
  addSession,
  deleteSession,
  setDefaultSession,
  updateSession,
} from "../actions";

type SessionRow = {
  id: string;
  session_datetime: string;
  capacity: number | null;
  is_open: boolean;
  is_default: boolean;
};

type Props = {
  examWeekId: string;
  sessions: SessionRow[];
  hasCapacity: boolean;
  allowAdd: boolean;
  countsBySession: Record<string, number>;
};

export function SessionsPanel({
  examWeekId,
  sessions,
  hasCapacity,
  allowAdd,
  countsBySession,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [newDatetime, setNewDatetime] = useState("");
  const [newCapacity, setNewCapacity] = useState("30");

  function onAdd() {
    if (!newDatetime) {
      toast.error("Tarih/saat gerekli");
      return;
    }
    startTransition(async () => {
      const iso = new Date(newDatetime).toISOString();
      const cap = hasCapacity
        ? Math.max(1, parseInt(newCapacity, 10) || 1)
        : null;
      const res = await addSession(examWeekId, iso, cap);
      if (res.ok) {
        toast.success("Seans eklendi");
        setNewDatetime("");
      } else {
        toast.error(res.error ?? "Hata");
      }
    });
  }

  function onToggleOpen(s: SessionRow) {
    startTransition(async () => {
      const res = await updateSession(s.id, { is_open: !s.is_open });
      if (!res.ok) toast.error(res.error ?? "Hata");
    });
  }

  function onSetDefault(s: SessionRow) {
    startTransition(async () => {
      const res = await setDefaultSession(examWeekId, s.id);
      if (res.ok) toast.success("Varsayılan seans güncellendi");
      else toast.error(res.error ?? "Hata");
    });
  }

  function onCapacityChange(s: SessionRow, value: string) {
    const n = Math.max(1, parseInt(value, 10) || 1);
    startTransition(async () => {
      const res = await updateSession(s.id, { capacity: n });
      if (!res.ok) toast.error(res.error ?? "Hata");
    });
  }

  function onDelete(s: SessionRow) {
    if (!confirm("Seansı silmek istediğine emin misin?")) return;
    startTransition(async () => {
      const res = await deleteSession(s.id);
      if (res.ok) toast.success("Seans silindi");
      else toast.error(res.error ?? "Hata");
    });
  }

  return (
    <div className="space-y-4">
      {sessions.length === 0 ? (
        <p className="text-sm text-zinc-500">Henüz seans yok.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Gün / Saat</TableHead>
              {hasCapacity && <TableHead>Kapasite</TableHead>}
              <TableHead>Durum</TableHead>
              <TableHead>Varsayılan</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((s) => {
              const used = countsBySession[s.id] ?? 0;
              return (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">
                    {formatDateTime(s.session_datetime)}
                  </TableCell>
                  {hasCapacity && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={1}
                          defaultValue={s.capacity ?? 30}
                          onBlur={(e) => onCapacityChange(s, e.target.value)}
                          className="w-20"
                          disabled={pending}
                        />
                        <span className="text-xs text-zinc-500">
                          ({used} dolu)
                        </span>
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    <Button
                      size="sm"
                      variant={s.is_open ? "default" : "secondary"}
                      onClick={() => onToggleOpen(s)}
                      disabled={pending}
                    >
                      {s.is_open ? "Açık" : "Kapalı"}
                    </Button>
                  </TableCell>
                  <TableCell>
                    {s.is_default ? (
                      <Badge>Varsayılan</Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onSetDefault(s)}
                        disabled={pending}
                      >
                        Varsayılan yap
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(s)}
                      disabled={pending || s.is_default}
                    >
                      Sil
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {allowAdd && (
        <div className="flex items-end gap-3 rounded-md border p-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="new-datetime" className="text-xs">
              Yeni seans
            </Label>
            <Input
              id="new-datetime"
              type="datetime-local"
              value={newDatetime}
              onChange={(e) => setNewDatetime(e.target.value)}
              className="w-56"
            />
          </div>
          {hasCapacity && (
            <div className="flex flex-col gap-1">
              <Label htmlFor="new-capacity" className="text-xs">
                Kapasite
              </Label>
              <Input
                id="new-capacity"
                type="number"
                min={1}
                value={newCapacity}
                onChange={(e) => setNewCapacity(e.target.value)}
                className="w-24"
              />
            </div>
          )}
          <Button onClick={onAdd} disabled={pending}>
            Ekle
          </Button>
        </div>
      )}
    </div>
  );
}

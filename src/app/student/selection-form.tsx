"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/date";
import { saveSelection } from "./actions";

export type PublisherOption = {
  id: string;
  name: string;
  is_default: boolean;
};

export type SessionOption = {
  id: string;
  session_datetime: string;
  capacity: number | null;
  is_open: boolean;
  is_default: boolean;
  used: number;
};

type Props = {
  examWeekId: string;
  publishers: PublisherOption[];
  sessions: SessionOption[];
  showSessions: boolean;
  currentPublisherId?: string;
  currentSessionId?: string | null;
};

export function SelectionForm({
  examWeekId,
  publishers,
  sessions,
  showSessions,
  currentPublisherId,
  currentSessionId,
}: Props) {
  const [publisherId, setPublisherId] = useState<string>(
    currentPublisherId ?? publishers.find((p) => p.is_default)?.id ?? "",
  );
  const [sessionId, setSessionId] = useState<string>(
    currentSessionId ?? sessions.find((s) => s.is_default)?.id ?? "",
  );
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!publisherId) {
      toast.error("Yayın seç");
      return;
    }
    if (showSessions && !sessionId) {
      toast.error("Seans seç");
      return;
    }
    startTransition(async () => {
      const res = await saveSelection(
        examWeekId,
        publisherId,
        showSessions ? sessionId : sessions[0]?.id ?? null,
      );
      if (res.ok) toast.success("Seçim kaydedildi");
      else toast.error(res.error ?? "Hata");
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Yayın</Label>
        <RadioGroup
          value={publisherId}
          onValueChange={setPublisherId}
          className="space-y-2"
        >
          {publishers.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-md border p-3"
            >
              <RadioGroupItem value={p.id} id={`pub-${p.id}`} />
              <Label
                htmlFor={`pub-${p.id}`}
                className="flex-1 cursor-pointer font-normal"
              >
                {p.name}
              </Label>
              {p.is_default && <Badge variant="outline">Varsayılan</Badge>}
            </div>
          ))}
        </RadioGroup>
      </div>

      {showSessions && (
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Seans</Label>
          <RadioGroup
            value={sessionId}
            onValueChange={setSessionId}
            className="space-y-2"
          >
            {sessions.map((s) => {
              const full =
                s.capacity !== null && s.used >= s.capacity;
              const disabled = !s.is_open || full;
              return (
                <div
                  key={s.id}
                  className={`flex items-center gap-3 rounded-md border p-3 ${
                    disabled ? "opacity-50" : ""
                  }`}
                >
                  <RadioGroupItem
                    value={s.id}
                    id={`ses-${s.id}`}
                    disabled={disabled}
                  />
                  <Label
                    htmlFor={`ses-${s.id}`}
                    className="flex-1 cursor-pointer font-normal"
                  >
                    {formatDateTime(s.session_datetime)}
                    {s.capacity !== null && (
                      <span className="ml-2 text-xs text-zinc-500">
                        ({s.used}/{s.capacity} {full ? "DOLU" : "dolu"})
                      </span>
                    )}
                  </Label>
                  {s.is_default && <Badge variant="outline">Varsayılan</Badge>}
                  {!s.is_open && <Badge variant="secondary">Kapalı</Badge>}
                </div>
              );
            })}
          </RadioGroup>
        </div>
      )}

      <Button type="submit" disabled={pending} size="lg">
        {pending ? "Kaydediliyor…" : "Seçimi kaydet"}
      </Button>
    </form>
  );
}

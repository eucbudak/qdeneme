"use client";

import { useState, useTransition } from "react";
import { Check, Lock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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
    <form onSubmit={onSubmit} className="space-y-7">
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Yayın</Label>
        <RadioGroup
          value={publisherId}
          onValueChange={setPublisherId}
          className="grid gap-2"
        >
          {publishers.map((p) => {
            const selected = publisherId === p.id;
            return (
              <label
                key={p.id}
                htmlFor={`pub-${p.id}`}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border bg-card p-4 transition-all",
                  selected
                    ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                    : "hover:border-primary/40 hover:bg-muted/40",
                )}
              >
                <RadioGroupItem value={p.id} id={`pub-${p.id}`} />
                <span className="flex-1 font-medium">{p.name}</span>
                {p.is_default ? (
                  <Badge variant="outline" className="gap-1 border-primary/30 text-primary">
                    <Star className="h-3 w-3 fill-current" />
                    Varsayılan
                  </Badge>
                ) : null}
              </label>
            );
          })}
        </RadioGroup>
      </div>

      {showSessions ? (
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Seans</Label>
          <RadioGroup
            value={sessionId}
            onValueChange={setSessionId}
            className="grid gap-2"
          >
            {sessions.map((s) => {
              const full = s.capacity !== null && s.used >= s.capacity;
              const disabled = !s.is_open || full;
              const selected = sessionId === s.id;
              const ratio =
                s.capacity !== null ? Math.min(s.used / s.capacity, 1) : 0;
              return (
                <label
                  key={s.id}
                  htmlFor={`ses-${s.id}`}
                  className={cn(
                    "flex cursor-pointer flex-col gap-2 rounded-xl border bg-card p-4 transition-all",
                    disabled && "cursor-not-allowed opacity-50",
                    !disabled && selected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                      : !disabled && "hover:border-primary/40 hover:bg-muted/40",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem
                      value={s.id}
                      id={`ses-${s.id}`}
                      disabled={disabled}
                    />
                    <span className="flex-1 font-medium">
                      {formatDateTime(s.session_datetime)}
                    </span>
                    {s.is_default ? (
                      <Badge variant="outline" className="gap-1 border-primary/30 text-primary">
                        <Star className="h-3 w-3 fill-current" />
                        Varsayılan
                      </Badge>
                    ) : null}
                    {!s.is_open ? (
                      <Badge variant="secondary" className="gap-1">
                        <Lock className="h-3 w-3" />
                        Kapalı
                      </Badge>
                    ) : null}
                  </div>
                  {s.capacity !== null ? (
                    <div className="flex items-center gap-3 pl-7">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full transition-all",
                            full ? "bg-destructive" : "bg-primary",
                          )}
                          style={{ width: `${ratio * 100}%` }}
                        />
                      </div>
                      <span
                        className={cn(
                          "text-xs",
                          full ? "font-semibold text-destructive" : "text-muted-foreground",
                        )}
                      >
                        {s.used}/{s.capacity}
                        {full ? " · DOLU" : ""}
                      </span>
                    </div>
                  ) : null}
                </label>
              );
            })}
          </RadioGroup>
        </div>
      ) : null}

      <Button type="submit" disabled={pending} size="lg" className="gap-2">
        {pending ? (
          "Kaydediliyor…"
        ) : (
          <>
            <Check className="h-4 w-4" />
            Seçimi kaydet
          </>
        )}
      </Button>
    </form>
  );
}

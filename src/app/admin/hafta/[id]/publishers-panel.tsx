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
import { addPublisher, deletePublisher, setDefaultPublisher } from "../actions";

type PublisherRow = {
  id: string;
  name: string;
  is_default: boolean;
};

export function PublishersPanel({
  examWeekId,
  publishers,
}: {
  examWeekId: string;
  publishers: PublisherRow[];
}) {
  const [pending, startTransition] = useTransition();
  const [newName, setNewName] = useState("");

  function onAdd() {
    if (!newName.trim()) {
      toast.error("Yayın adı gerekli");
      return;
    }
    startTransition(async () => {
      const res = await addPublisher(examWeekId, newName.trim());
      if (res.ok) {
        toast.success("Yayın eklendi");
        setNewName("");
      } else {
        toast.error(res.error ?? "Hata");
      }
    });
  }

  function onSetDefault(p: PublisherRow) {
    startTransition(async () => {
      const res = await setDefaultPublisher(examWeekId, p.id);
      if (res.ok) toast.success("Varsayılan yayın güncellendi");
      else toast.error(res.error ?? "Hata");
    });
  }

  function onDelete(p: PublisherRow) {
    if (!confirm("Yayını silmek istediğine emin misin?")) return;
    startTransition(async () => {
      const res = await deletePublisher(p.id);
      if (res.ok) toast.success("Yayın silindi");
      else toast.error(res.error ?? "Hata");
    });
  }

  return (
    <div className="space-y-4">
      {publishers.length === 0 ? (
        <p className="text-sm text-zinc-500">Henüz yayın yok.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Yayın</TableHead>
              <TableHead>Varsayılan</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {publishers.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>
                  {p.is_default ? (
                    <Badge>Varsayılan</Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onSetDefault(p)}
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
                    onClick={() => onDelete(p)}
                    disabled={pending || p.is_default}
                  >
                    Sil
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="flex items-end gap-3 rounded-md border p-3">
        <div className="flex flex-1 flex-col gap-1">
          <Label htmlFor="new-publisher" className="text-xs">
            Yeni yayın adı (ör. TYT Toprak)
          </Label>
          <Input
            id="new-publisher"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="TYT Toprak"
          />
        </div>
        <Button onClick={onAdd} disabled={pending}>
          Ekle
        </Button>
      </div>
    </div>
  );
}

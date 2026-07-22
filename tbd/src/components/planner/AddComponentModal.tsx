"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PlanCategory, PlanComponent } from "@/lib/types";

const CATEGORIES: { value: PlanCategory; label: string }[] = [
  { value: "catering", label: "Catering" },
  { value: "florals", label: "Florals" },
  { value: "photography", label: "Photography" },
  { value: "venue", label: "Venue" },
  { value: "entertainment", label: "Entertainment" },
  { value: "attire", label: "Attire" },
  { value: "decor", label: "Décor" },
  { value: "officiant", label: "Officiant" },
  { value: "transport", label: "Transport" },
  { value: "other", label: "Other" },
];

interface AddComponentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (component: PlanComponent) => void;
}

export function AddComponentModal({
  open,
  onOpenChange,
  onAdd,
}: AddComponentModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<PlanCategory | null>(null);
  const [cost, setCost] = useState("");

  const reset = () => {
    setName("");
    setCategory(null);
    setCost("");
  };

  const costNum = Number(cost);
  const valid =
    name.trim().length > 0 && category !== null && costNum > 0 && Number.isFinite(costNum);

  const handleConfirm = () => {
    if (!valid || !category) return;
    onAdd({
      id: crypto.randomUUID(),
      category,
      name: name.trim(),
      description: "Custom component added to your plan.",
      estimatedCost: costNum,
      priority: "optional",
      rationale: "Manually added",
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Add component</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="comp-name">Name</Label>
            <Input
              id="comp-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Live band"
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={category ?? undefined}
              onValueChange={(v) => setCategory(v as PlanCategory)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="comp-cost">Estimated cost</Label>
            <Input
              id="comp-cost"
              type="number"
              min={1}
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="2500"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={!valid} onClick={handleConfirm}>
            Add to plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

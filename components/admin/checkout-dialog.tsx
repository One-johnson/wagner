"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAdminSession } from "@/components/auth/session-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getFriendlyErrorMessage } from "@/lib/friendly-errors";

export function CheckoutDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { sessionToken } = useAdminSession();
  const availableTools = useQuery(
    api.tools.listAvailable,
    sessionToken && open ? { sessionToken } : "skip"
  );
  const technicians = useQuery(
    api.technicians.listActive,
    sessionToken && open ? { sessionToken } : "skip"
  );
  const checkout = useMutation(api.checkouts.checkout);

  const [toolId, setToolId] = useState("");
  const [technicianId, setTechnicianId] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setToolId("");
    setTechnicianId("");
    setDueDate(undefined);
    setNotes("");
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sessionToken || !toolId || !technicianId) return;
    setLoading(true);
    try {
      await checkout({
        sessionToken,
        toolId: toolId as Id<"tools">,
        technicianId: technicianId as Id<"technicians">,
        dueAt: dueDate
          ? new Date(
              dueDate.getFullYear(),
              dueDate.getMonth(),
              dueDate.getDate(),
              23,
              59,
              59,
              999
            ).getTime()
          : undefined,
        notes: notes || undefined,
        conditionAtEvent: "good",
      });
      toast.success("Tool checked out");
      onOpenChange(false);
    } catch (err) {
      toast.error(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Check out tool</DialogTitle>
          <DialogDescription>
            Record a tool leaving the store to a technician.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="space-y-2">
            <Label>Tool</Label>
            <Select
              value={toolId}
              onValueChange={(v) => setToolId(v ?? "")}
              items={
                availableTools?.map((tool) => ({
                  value: tool._id,
                  label: `${tool.assetTag} — ${tool.name}`,
                })) ?? []
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select available tool" />
              </SelectTrigger>
              <SelectContent>
                {availableTools?.length ? (
                  availableTools.map((tool) => (
                    <SelectItem key={tool._id} value={tool._id}>
                      {tool.assetTag} — {tool.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="__none" disabled>
                    No available tools
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Technician</Label>
            <Select
              value={technicianId}
              onValueChange={(v) => setTechnicianId(v ?? "")}
              items={
                technicians?.map((tech) => ({
                  value: tech._id,
                  label: `${tech.employeeCode} — ${tech.name}`,
                })) ?? []
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select technician" />
              </SelectTrigger>
              <SelectContent>
                {technicians?.length ? (
                  technicians.map((tech) => (
                    <SelectItem key={tech._id} value={tech._id}>
                      {tech.employeeCode} — {tech.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="__none" disabled>
                    No active technicians
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkout-due">Due date (optional)</Label>
            <DatePicker
              id="checkout-due"
              value={dueDate}
              onChange={setDueDate}
              placeholder="Select due date"
              fromDate={new Date()}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkout-notes">Notes</Label>
            <Input
              id="checkout-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !toolId || !technicianId}>
              {loading ? "Processing…" : "Check out"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAdminSession } from "@/components/auth/session-provider";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getFriendlyErrorMessage } from "@/lib/friendly-errors";

export function CategoriesPanel() {
  const { sessionToken } = useAdminSession();
  const categories = useQuery(
    api.tools.listCategoriesWithSummary,
    sessionToken ? { sessionToken } : "skip"
  );
  const createCategory = useMutation(api.tools.createCategory);
  const removeCategory = useMutation(api.tools.removeCategory);

  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<{
    _id: Id<"toolCategories">;
    name: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sessionToken) return;
    setLoading(true);
    try {
      await createCategory({ sessionToken, name });
      toast.success("Category created");
      setName("");
      setAddOpen(false);
    } catch (err) {
      toast.error(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!sessionToken || !deletingCategory) return;
    setDeleting(true);
    try {
      await removeCategory({ sessionToken, categoryId: deletingCategory._id });
      toast.success("Category deleted");
      setDeletingCategory(null);
    } catch (err) {
      toast.error(getFriendlyErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Categories"
        description="Organize tools by category"
        dataTour="page-categories"
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="size-4" />
            Add category
          </Button>
        }
      />

      <ul
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        data-tour="categories-list"
      >
        {categories?.map((cat) => (
          <li key={cat._id}>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                <div className="min-w-0 space-y-1">
                  <CardTitle className="truncate text-base">{cat.name}</CardTitle>
                  <Badge variant="secondary">
                    {cat.toolCount} tool{cat.toolCount === 1 ? "" : "s"}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeletingCategory(cat)}
                  aria-label={`Delete ${cat.name}`}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {cat.toolCount === 0 ? (
                  <p className="text-muted-foreground">No tools in this category yet.</p>
                ) : (
                  <>
                    <p className="text-xs font-medium text-muted-foreground">Includes</p>
                    <ul className="space-y-1 text-muted-foreground">
                      {cat.tools.map((tool) => (
                        <li key={tool.assetTag} className="truncate">
                          {tool.assetTag} — {tool.name}
                        </li>
                      ))}
                    </ul>
                    {cat.toolCount > cat.tools.length ? (
                      <p className="text-xs text-muted-foreground">
                        +{cat.toolCount - cat.tools.length} more
                      </p>
                    ) : null}
                  </>
                )}
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>

      {!categories?.length && categories !== undefined ? (
        <p className="text-sm text-muted-foreground">
          No categories yet. Add one to organize your tools.
        </p>
      ) : null}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add category</DialogTitle>
            <DialogDescription>Create a category to group related tools.</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Category name</Label>
              <Input
                id="cat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Power Tools"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Adding…" : "Add category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
        title="Delete category"
        description={
          deletingCategory
            ? `Delete "${deletingCategory.name}"? Categories assigned to tools cannot be removed.`
            : ""
        }
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}

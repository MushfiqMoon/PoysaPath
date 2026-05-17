"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  createCategory,
  deleteCategory,
  getCategoryExpenseCount,
  updateCategory,
} from "@/app/(app)/actions/categories";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Category } from "@/lib/types";

type CategoriesManagerProps = {
  categories: Category[];
};

export function CategoriesManager({ categories }: CategoriesManagerProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteExpenseCount, setDeleteExpenseCount] = useState(0);
  const [reassignToId, setReassignToId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");

  const deleteTarget = categories.find((c) => c.id === deleteId);
  const reassignOptions = categories.filter((c) => c.id !== deleteId);

  useEffect(() => {
    if (!deleteId) {
      setDeleteExpenseCount(0);
      setReassignToId("");
      return;
    }

    let cancelled = false;
    getCategoryExpenseCount(deleteId)
      .then((count) => {
        if (!cancelled) {
          setDeleteExpenseCount(count);
          const first = categories.find((c) => c.id !== deleteId);
          setReassignToId(first?.id ?? "");
        }
      })
      .catch(() => {
        if (!cancelled) setDeleteExpenseCount(0);
      });

    return () => {
      cancelled = true;
    };
  }, [deleteId, categories]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createCategory(name, icon);
      setName("");
      setIcon("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add category");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveEdit(id: string) {
    setLoading(true);
    setError(null);
    try {
      await updateCategory(id, editName, editIcon);
      setEditingId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    if (deleteExpenseCount > 0 && !reassignToId) {
      setError("Choose a category to move expenses into.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await deleteCategory(
        deleteId,
        deleteExpenseCount > 0 ? reassignToId : undefined,
      );
      setDeleteId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete");
    } finally {
      setLoading(false);
    }
  }

  const deleteMessage =
    deleteExpenseCount > 0
      ? `${deleteExpenseCount} expense${deleteExpenseCount === 1 ? "" : "s"} use “${deleteTarget?.name}”. Move them to another category, then delete.`
      : `Delete “${deleteTarget?.name}”? This cannot be undone.`;

  return (
    <div className="space-y-6">
      <ul className="space-y-2">
        {categories.map((cat) => (
          <li
            key={cat.id}
            className="rounded-xl border border-border bg-surface p-4"
          >
            {editingId === cat.id ? (
              <div className="space-y-3">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  aria-label="Category name"
                />
                <Input
                  value={editIcon}
                  onChange={(e) => setEditIcon(e.target.value)}
                  placeholder="Icon emoji (optional)"
                  aria-label="Category icon"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    fullWidth
                    disabled={loading}
                    onClick={() => handleSaveEdit(cat.id)}
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    fullWidth
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-text">
                  {cat.icon && (
                    <span className="mr-2" aria-hidden>
                      {cat.icon}
                    </span>
                  )}
                  {cat.name}
                </span>
                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="min-h-9 px-2 text-sm"
                    onClick={() => {
                      setEditingId(cat.id);
                      setEditName(cat.name);
                      setEditIcon(cat.icon ?? "");
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="min-h-9 px-2 text-sm text-danger"
                    onClick={() => setDeleteId(cat.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      <form
        onSubmit={handleAdd}
        className="space-y-3 rounded-xl border border-border bg-surface p-4"
      >
        <p className="font-medium text-text">Add category</p>
        <div>
          <Label htmlFor="cat-name">Name</Label>
          <Input
            id="cat-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Side hustle"
          />
        </div>
        <div>
          <Label htmlFor="cat-icon">Icon (optional)</Label>
          <Input
            id="cat-icon"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="e.g. 💼"
            maxLength={4}
          />
        </div>
        {error && (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "Adding…" : "+ Add category"}
        </Button>
      </form>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete category?"
        message={deleteMessage}
        loading={loading}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
      >
        {deleteExpenseCount > 0 && reassignOptions.length > 0 && (
          <div className="mt-4">
            <Label htmlFor="reassign-category">Move expenses to</Label>
            <select
              id="reassign-category"
              value={reassignToId}
              onChange={(e) => setReassignToId(e.target.value)}
              className="mt-1.5 min-h-11 w-full rounded-xl border border-border bg-surface px-3 py-2 text-base text-text"
            >
              {reassignOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon ? `${c.icon} ` : ""}
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {deleteExpenseCount > 0 && reassignOptions.length === 0 && (
          <p className="mt-3 text-sm text-danger">
            Add another category before deleting this one.
          </p>
        )}
      </ConfirmDialog>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  createCategory,
  deleteCategory,
  getCategoryExpenseCount,
  getCategoryIncomeCount,
  updateCategory,
} from "@/app/(app)/actions/categories";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { KindPillTabs } from "@/components/shared/kind-pill-tabs";
import {
  CancelLink,
  DeleteButton,
  EditButton,
  FormSaveActions,
  InlineActionGroup,
  SaveButton,
} from "@/components/ui/action-buttons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { truncateCategoryIcon } from "@/lib/category-icon";
import type { Category, CategoryKind } from "@/lib/types";

const TAB_STORAGE_KEY = "poysapath-categories-tab";

type Tab = CategoryKind;

function readStoredTab(): Tab {
  if (typeof window === "undefined") return "expense";
  try {
    const raw = localStorage.getItem(TAB_STORAGE_KEY);
    if (raw === "expense" || raw === "income") return raw;
  } catch {
    /* ignore */
  }
  return "expense";
}

type CategoriesManagerProps = {
  expenseCategories: Category[];
  incomeCategories: Category[];
};

function CategoryKindPanel({
  categories,
  kind,
}: {
  categories: Category[];
  kind: CategoryKind;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteEntryCount, setDeleteEntryCount] = useState(0);
  const [reassignToId, setReassignToId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");

  const deleteTarget = categories.find((c) => c.id === deleteId);
  const reassignOptions = categories.filter((c) => c.id !== deleteId);
  const entryLabel = kind === "income" ? "income" : "expense";
  const entryLabelPlural = kind === "income" ? "income entries" : "expenses";

  useEffect(() => {
    if (!deleteId) {
      setDeleteEntryCount(0);
      setReassignToId("");
      return;
    }

    let cancelled = false;
    const loadCount =
      kind === "income" ? getCategoryIncomeCount : getCategoryExpenseCount;

    loadCount(deleteId)
      .then((count) => {
        if (!cancelled) {
          setDeleteEntryCount(count);
          const first = categories.find((c) => c.id !== deleteId);
          setReassignToId(first?.id ?? "");
        }
      })
      .catch(() => {
        if (!cancelled) setDeleteEntryCount(0);
      });

    return () => {
      cancelled = true;
    };
  }, [deleteId, categories, kind]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createCategory(name, icon, kind);
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
    if (deleteEntryCount > 0 && !reassignToId) {
      setError(`Choose a category to move ${entryLabelPlural} into.`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await deleteCategory(
        deleteId,
        deleteEntryCount > 0 ? reassignToId : undefined,
        kind,
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
    deleteEntryCount > 0
      ? `${deleteEntryCount} ${entryLabel}${deleteEntryCount === 1 ? "" : "s"} use “${deleteTarget?.name}”. Move them to another category, then delete.`
      : `Delete “${deleteTarget?.name}”? This cannot be undone.`;

  return (
    <div className="space-y-6">
      <ul className="space-y-2">
        {categories.map((cat) => (
          <li key={cat.id}>
            <Card padding="md">
              {editingId === cat.id ? (
                <div className="space-y-3">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    aria-label="Category name"
                  />
                  <Input
                    value={editIcon}
                    onChange={(e) =>
                      setEditIcon(truncateCategoryIcon(e.target.value))
                    }
                    placeholder="e.g. 💼"
                    aria-label="Category icon"
                    inputMode="text"
                  />
                  <p className="text-xs text-text-muted">
                    Up to 2 characters or one emoji
                  </p>
                  <FormSaveActions>
                    <SaveButton
                      type="button"
                      fullWidth
                      size="default"
                      loading={loading}
                      onClick={() => handleSaveEdit(cat.id)}
                    />
                    <CancelLink onClick={() => setEditingId(null)} />
                  </FormSaveActions>
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
                  <InlineActionGroup>
                    <EditButton
                      type="button"
                      onClick={() => {
                        setEditingId(cat.id);
                        setEditName(cat.name);
                        setEditIcon(cat.icon ?? "");
                      }}
                    />
                    <DeleteButton
                      type="button"
                      onClick={() => setDeleteId(cat.id)}
                    />
                  </InlineActionGroup>
                </div>
              )}
            </Card>
          </li>
        ))}
      </ul>

      <Card padding="md">
        <form onSubmit={handleAdd} className="space-y-3">
          <p className="font-semibold tracking-tight text-text">
            Add {kind} category
          </p>
          <div>
            <Label htmlFor={`cat-name-${kind}`}>Name</Label>
            <Input
              id={`cat-name-${kind}`}
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                kind === "income" ? "e.g. Bonus" : "e.g. Side hustle"
              }
            />
          </div>
          <div>
            <Label htmlFor={`cat-icon-${kind}`}>Icon (optional)</Label>
            <Input
              id={`cat-icon-${kind}`}
              value={icon}
              onChange={(e) => setIcon(truncateCategoryIcon(e.target.value))}
              placeholder="e.g. 💼"
              inputMode="text"
            />
            <p className="mt-1 text-xs text-text-muted">
              Up to 2 characters or one emoji
            </p>
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
      </Card>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete category?"
        message={deleteMessage}
        loading={loading}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
      >
        {deleteEntryCount > 0 && reassignOptions.length > 0 && (
          <div className="mt-4">
            <Label htmlFor={`reassign-category-${kind}`}>
              Move {entryLabelPlural} to
            </Label>
            <select
              id={`reassign-category-${kind}`}
              value={reassignToId}
              onChange={(e) => setReassignToId(e.target.value)}
              className="mt-1.5 min-h-11 w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 py-2 text-base text-text"
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
        {deleteEntryCount > 0 && reassignOptions.length === 0 && (
          <p className="mt-3 text-sm text-danger">
            Add another category before deleting this one.
          </p>
        )}
      </ConfirmDialog>
    </div>
  );
}

export function CategoriesManager({
  expenseCategories,
  incomeCategories,
}: CategoriesManagerProps) {
  const [tab, setTab] = useState<Tab>("expense");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setTab(readStoredTab());
      setHydrated(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  function selectTab(next: Tab) {
    setTab(next);
    try {
      localStorage.setItem(TAB_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-5">
      <KindPillTabs
        value={tab}
        onChange={selectTab}
        ariaLabel="Category kind"
      />

      {hydrated && tab === "income" ? (
        <CategoryKindPanel categories={incomeCategories} kind="income" />
      ) : hydrated ? (
        <CategoryKindPanel categories={expenseCategories} kind="expense" />
      ) : (
        <CategoryKindPanel categories={expenseCategories} kind="expense" />
      )}
    </div>
  );
}

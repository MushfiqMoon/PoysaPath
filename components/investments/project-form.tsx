"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  completeInvestmentProject,
  deleteInvestmentProject,
  updateInvestmentProject,
} from "@/app/(app)/actions/investments";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  DeleteDangerButton,
  FormSaveActions,
  SaveButton,
} from "@/components/ui/action-buttons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getInvestmentKindLabel } from "@/lib/investments/progress";
import type { InvestmentProject } from "@/lib/types";

type ProjectFormProps = {
  project: InvestmentProject;
  redirectTo?: string;
};

export function ProjectForm({
  project,
  redirectTo = "/settings/investments",
}: ProjectFormProps) {
  const router = useRouter();
  const isMulti = project.kind === "multi_payment";

  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description ?? "");
  const [targetAmount, setTargetAmount] = useState(
    project.target_amount != null ? String(project.target_amount) : "",
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await updateInvestmentProject(project.id, {
        title,
        description: description.trim() || null,
        target_amount: isMulti ? Number(targetAmount) : undefined,
      });
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save project");
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete() {
    setLoading(true);
    try {
      await completeInvestmentProject(project.id);
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update project");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteInvestmentProject(project.id);
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete project");
      setConfirmDelete(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-text-muted">
          Type:{" "}
          <span className="font-medium text-text">
            {getInvestmentKindLabel(project.kind)}
          </span>
        </p>

        <div className="space-y-2">
          <Label htmlFor="project-title">Title</Label>
          <Input
            id="project-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="project-description">
            Description{" "}
            <span className="font-normal text-text-muted">(optional)</span>
          </Label>
          <Input
            id="project-description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
          />
        </div>

        {isMulti ? (
          <div className="space-y-2">
            <Label htmlFor="project-target">Target amount (৳)</Label>
            <Input
              id="project-target"
              type="number"
              min="0"
              step="any"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              required
            />
          </div>
        ) : null}

        {error ? (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}

        <FormSaveActions>
          <SaveButton type="submit" loading={loading}>
            Save changes
          </SaveButton>
          {project.status === "active" && isMulti ? (
            <button
              type="button"
              onClick={handleComplete}
              disabled={loading}
              className="text-sm font-medium text-accent hover:underline disabled:opacity-50"
            >
              Mark project complete
            </button>
          ) : null}
          <DeleteDangerButton
            type="button"
            onClick={() => setConfirmDelete(true)}
          >
            Delete project
          </DeleteDangerButton>
        </FormSaveActions>
      </form>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete project?"
        message="This removes the project and all of its payments. This cannot be undone."
        loading={loading}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}

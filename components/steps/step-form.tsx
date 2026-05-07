"use client";

import { Check, RotateCcw, Save, X } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Checklist } from "@/components/forms/checklist";
import { Select } from "@/components/forms/select";
import { TagsInput } from "@/components/forms/tags-input";
import { StepVideoUploadField } from "@/components/video/step-video-upload-field";
import type { Id } from "@/convex/_generated/dataModel";
import { getActiveAppConfig } from "@/lib/domain/config";
import {
  allowedSmartTags,
  createStepFormDefaults,
  deriveStepFormSmartFields,
  validateStepFormValues,
} from "@/lib/steps/step-form-defaults";
import {
  difficultyOptions,
  type ExistingStepVideo,
  type StepFormErrors,
  type StepFormValues,
  type StepMutationInput,
  stepKindOptions,
} from "@/lib/steps/step-form-schema";

type StepFormProps = {
  id?: string;
  initialValues?: Partial<StepFormValues>;
  currentStepId?: string;
  existingVideos?: ExistingStepVideo[];
  tagOptions?: string[];
  artistOptions?: string[];
  submitLabel?: string;
  hideActions?: boolean;
  videoMode?: "readonly" | "upload";
  resetSignal?: number;
  onValuesChange?: (values: StepFormValues) => void;
  onSubmit?: (
    input: StepMutationInput,
    intent: "save" | "save-and-create-another",
  ) => void | Promise<void>;
};

function nextVariationKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `variation-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function toMutationInput(values: StepFormValues): StepMutationInput {
  return {
    name: values.name.trim(),
    videos: values.videos,
    difficulty: values.difficulty,
    feeling: values.feeling,
    kind: values.kind,
    tags: values.tags,
    artists: values.artists,
    notes: values.notes.trim(),
    removedSmartTags: values.removedSmartTags,
    variationKey: nextVariationKey(),
  };
}

export function StepForm({
  id,
  initialValues,
  currentStepId,
  existingVideos = [],
  tagOptions = [],
  artistOptions = [],
  submitLabel = "Save step",
  hideActions = false,
  videoMode = "readonly",
  resetSignal = 0,
  onValuesChange,
  onSubmit,
}: StepFormProps) {
  const config = getActiveAppConfig();
  const smartTagOptions = useMemo(() => allowedSmartTags(), []);
  const initialFormValues = useMemo(() => {
    const defaults = createStepFormDefaults(initialValues);
    const smartFields = deriveStepFormSmartFields(
      defaults.name,
      defaults.removedSmartTags,
    );

    return {
      ...defaults,
      smartTags: initialValues?.smartTags ?? smartFields.smartTags,
      tokens: initialValues?.tokens ?? smartFields.tokens,
    };
  }, [initialValues]);
  const [values, setValues] = useState<StepFormValues>(initialFormValues);
  const [errors, setErrors] = useState<StepFormErrors>({});
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => {
    setValues(initialFormValues);
    setErrors({});
    setSubmitMessage("");
  }, [initialFormValues, resetSignal]);

  useEffect(() => {
    onValuesChange?.(values);
  }, [onValuesChange, values]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setValues((current) => ({
        ...current,
        ...deriveStepFormSmartFields(current.name, current.removedSmartTags),
      }));
    }, 200);

    return () => window.clearTimeout(timeout);
  }, [values.name, values.removedSmartTags]);

  function update(patch: Partial<StepFormValues>) {
    setValues((current) => ({ ...current, ...patch }));
    setErrors({});
    setSubmitMessage("");
  }

  function removeSmartTag(tag: string) {
    if (!smartTagOptions.includes(tag)) {
      return;
    }

    update({
      smartTags: values.smartTags.filter((candidate) => candidate !== tag),
      removedSmartTags: unique([...values.removedSmartTags, tag]),
    });
  }

  function restoreSmartTag(tag: string) {
    if (!smartTagOptions.includes(tag)) {
      return;
    }

    update({
      removedSmartTags: values.removedSmartTags.filter(
        (candidate) => candidate !== tag,
      ),
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = validateStepFormValues(values, {
      currentStepId,
      existingVideos,
    });

    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    const submitter = (event.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null;
    const intent =
      submitter?.value === "save-and-create-another"
        ? "save-and-create-another"
        : "save";

    await onSubmit?.(toMutationInput(result.values), intent);
    setSubmitMessage("Step saved.");
  }

  return (
    <form id={id} className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <section className="flex flex-col gap-3" aria-labelledby="videos-heading">
        {videoMode === "upload" ? (
          <>
            <StepVideoUploadField
              key={resetSignal}
              initialVideos={values.videos}
              currentStepId={currentStepId as Id<"steps"> | undefined}
              onVideosChange={(videos) => update({ videos })}
            />
            {errors.videos ? (
              <p className="text-sm text-red-700">{errors.videos}</p>
            ) : null}
          </>
        ) : (
          <>
            <div>
              <h2 id="videos-heading" className="text-base font-semibold">
                Videos
              </h2>
              {errors.videos ? (
                <p className="mt-1 text-sm text-red-700">{errors.videos}</p>
              ) : null}
            </div>
            {values.videos.length > 0 ? (
              <ul className="divide-y divide-[var(--border)] rounded-md border border-[var(--border)] bg-white">
                {values.videos.map((video) => (
                  <li key={video.hash} className="px-3 py-2 text-sm">
                    <span className="font-medium">
                      {video.hash.slice(0, 12)}
                    </span>
                    <span className="ml-2 text-[var(--muted-foreground)]">
                      {video.storageKey}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-md border border-dashed border-[var(--border)] px-3 py-4 text-sm text-[var(--muted-foreground)]">
                Add a video before saving.
              </p>
            )}
          </>
        )}
      </section>

      <label className="flex flex-col gap-2 text-sm font-medium">
        Name
        <input
          className="h-10 rounded-md border border-[var(--border)] bg-white px-3 text-sm font-normal"
          value={values.name}
          onChange={(event) => update({ name: event.target.value })}
        />
        {errors.name ? (
          <span className="text-sm text-red-700">{errors.name}</span>
        ) : null}
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <Select
          label="Kind"
          value={values.kind}
          error={errors.kind}
          options={stepKindOptions.map((kind) => ({
            value: kind,
            label: config.stepKinds[kind],
          }))}
          onChange={(kind) => update({ kind })}
        />
        <Select
          label="Difficulty"
          value={values.difficulty}
          error={errors.difficulty}
          options={difficultyOptions.map((difficulty) => ({
            value: difficulty,
            label: config.difficulties[difficulty],
          }))}
          onChange={(difficulty) => update({ difficulty })}
        />
      </div>

      <Checklist
        label="Feeling"
        values={values.feeling}
        error={errors.feeling}
        options={Object.entries(config.feelings).map(([value, label]) => ({
          value,
          label,
        }))}
        onChange={(feeling) => update({ feeling })}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <TagsInput
          label="Tags"
          values={values.tags}
          options={tagOptions}
          onChange={(tags) => update({ tags })}
        />
        <TagsInput
          label="Artists"
          values={values.artists}
          options={artistOptions}
          onChange={(artists) => update({ artists })}
        />
      </div>

      <section
        className="flex flex-col gap-2"
        aria-labelledby="smart-tags-heading"
      >
        <h2 id="smart-tags-heading" className="text-sm font-medium">
          Smart tags
        </h2>
        {values.smartTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {values.smartTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex min-h-8 items-center gap-1 rounded-md bg-[var(--accent)] px-2 text-xs text-[var(--accent-foreground)]"
              >
                <Check size={14} aria-hidden="true" />
                {tag}
                <button
                  type="button"
                  aria-label={`Remove smart tag ${tag}`}
                  onClick={() => removeSmartTag(tag)}
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--muted-foreground)]">
            No smart tags matched.
          </p>
        )}
      </section>

      {values.removedSmartTags.length > 0 ? (
        <section
          className="flex flex-col gap-2"
          aria-labelledby="removed-smart-tags-heading"
        >
          <h2 id="removed-smart-tags-heading" className="text-sm font-medium">
            Removed smart tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {values.removedSmartTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex min-h-8 items-center gap-1 rounded-md border border-[var(--border)] bg-white px-2 text-xs"
              >
                {tag}
                <button
                  type="button"
                  aria-label={`Restore smart tag ${tag}`}
                  onClick={() => restoreSmartTag(tag)}
                >
                  <RotateCcw size={14} aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <label className="flex flex-col gap-2 text-sm font-medium">
        Notes
        <textarea
          className="min-h-28 rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm font-normal"
          value={values.notes}
          onChange={(event) => update({ notes: event.target.value })}
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        {hideActions ? null : (
          <button
            type="submit"
            name="intent"
            value="save"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-[var(--foreground)] px-4 text-sm font-medium text-white"
          >
            <Save size={16} aria-hidden="true" />
            {submitLabel}
          </button>
        )}
        {submitMessage ? (
          <p
            className="text-sm text-[var(--muted-foreground)]"
            aria-live="polite"
          >
            {submitMessage}
          </p>
        ) : null}
      </div>
    </form>
  );
}

"use client";

import { ThreeStateTag } from "@/components/forms/three-state-tag";
import { TagsInput } from "@/components/forms/tags-input";
import { getActiveAppConfig } from "@/lib/domain/config";
import type { FeelingFilterValue, SearchState } from "@/lib/search/types";

type SearchFiltersProps = {
  value: SearchState;
  tagOptions: string[];
  artistOptions: string[];
  onChange: (value: SearchState) => void;
};

function updateFeeling(
  current: SearchState["feeling"],
  feeling: string,
  value: FeelingFilterValue,
) {
  const next = { ...current };

  if (value === 0) {
    delete next[feeling];
    return next;
  }

  next[feeling] = value;
  return next;
}

export function SearchFilters({
  value,
  tagOptions,
  artistOptions,
  onChange,
}: SearchFiltersProps) {
  const config = getActiveAppConfig();

  return (
    <div className="flex flex-col gap-5">
      <label className="flex flex-col gap-2 text-sm font-medium">
        Text query
        <input
          className="h-10 rounded-md border border-[var(--border)] bg-white px-3 text-sm font-normal"
          value={value.query}
          onChange={(event) =>
            onChange({ ...value, query: event.target.value })
          }
        />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Feeling</legend>
        <div className="flex flex-wrap gap-2">
          {Object.entries(config.feelings).map(([feeling, label]) => (
            <ThreeStateTag
              key={feeling}
              label={label}
              value={value.feeling[feeling] ?? 0}
              onChange={(nextValue) =>
                onChange({
                  ...value,
                  feeling: updateFeeling(value.feeling, feeling, nextValue),
                })
              }
            />
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 md:grid-cols-2">
        <TagsInput
          label="Include all tags"
          values={value.includeAllTags}
          options={tagOptions}
          onChange={(includeAllTags) =>
            onChange({ ...value, includeAllTags })
          }
        />
        <TagsInput
          label="Exclude any tags"
          values={value.excludeAnyTags}
          options={tagOptions}
          onChange={(excludeAnyTags) =>
            onChange({ ...value, excludeAnyTags })
          }
        />
      </div>

      <TagsInput
        label="Artists"
        values={value.anyArtists}
        options={artistOptions}
        onChange={(anyArtists) => onChange({ ...value, anyArtists })}
      />
    </div>
  );
}

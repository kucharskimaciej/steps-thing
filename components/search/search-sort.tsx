"use client";

import { Select } from "@/components/forms/select";
import type {
  SearchSortDirection,
  SearchSortType,
  SearchState,
} from "@/lib/search/types";

const sortOptions: Array<{ value: SearchSortType; label: string }> = [
  { value: "SCORE", label: "Score" },
  { value: "VIEW_DATE", label: "View date" },
  { value: "VIEW_COUNT", label: "View count" },
  { value: "PRACTICE_DATE", label: "Practice date" },
  { value: "ADDED_DATE", label: "Added date" },
  { value: "RANDOM", label: "Random" },
];

const directionOptions: Array<{ value: SearchSortDirection; label: string }> = [
  { value: "DESCENDING", label: "Descending" },
  { value: "ASCENDING", label: "Ascending" },
];

type SearchSortProps = {
  value: SearchState["sort"];
  onChange: (sort: SearchState["sort"]) => void;
};

export function SearchSort({ value, onChange }: SearchSortProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Select
        label="Sort by"
        value={value.type}
        options={sortOptions}
        onChange={(type) => onChange({ ...value, type })}
      />
      <Select
        label="Direction"
        value={value.direction}
        options={directionOptions}
        onChange={(direction) => onChange({ ...value, direction })}
      />
    </div>
  );
}

export type FirestoreExportValue =
  | { type: "array"; value: FirestoreExportValue[] }
  | { type: "object"; value: Record<string, FirestoreExportValue> }
  | { type: string; value: unknown };

export function readFirestoreValue(value: unknown): unknown {
  if (!isFirestoreExportValue(value)) {
    if (Array.isArray(value)) {
      return value.map(readFirestoreValue);
    }

    if (typeof value === "object" && value !== null) {
      return Object.fromEntries(
        Object.entries(value).map(([key, nestedValue]) => [
          key,
          readFirestoreValue(nestedValue),
        ]),
      );
    }

    return value;
  }

  if (value.type === "array") {
    return (value.value as unknown[]).map(readFirestoreValue);
  }

  if (value.type === "object") {
    return Object.fromEntries(
      Object.entries(value.value as Record<string, unknown>).map(([key, nestedValue]) => [
        key,
        readFirestoreValue(nestedValue),
      ]),
    );
  }

  return value.value;
}

function isFirestoreExportValue(
  value: unknown,
): value is FirestoreExportValue {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    "value" in value
  );
}

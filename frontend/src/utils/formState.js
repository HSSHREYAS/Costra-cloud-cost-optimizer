import { serviceCatalog } from "../config/serviceCatalog.js";

export function createInitialState(service) {
  const { defaultValues } = serviceCatalog[service];
  return structuredClone({
    service,
    ...defaultValues,
  });
}

export function validatePayload(payload, options = {}) {
  const { requireDuration = true } = options;
  const errors = {};

  if (!payload.region) {
    errors.region = "Region is required.";
  }

  if (requireDuration && (!payload.duration_hours || Number(payload.duration_hours) <= 0)) {
    errors.duration_hours = "Duration must be greater than zero.";
  }

  Object.entries(payload.configuration || {}).forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined) {
      errors[key] = "This field is required.";
    }
    if (typeof value === "number" && value <= 0) {
      errors[key] = "Value must be greater than zero.";
    }
  });

  // Field-level max validation using catalog metadata (sync)
  const { fields = [] } = serviceCatalog[payload.service] || {};
  fields.forEach((field) => {
    if (
      field.max != null &&
      typeof payload.configuration[field.name] === "number" &&
      payload.configuration[field.name] > field.max
    ) {
      errors[field.name] = `Max allowed: ${field.max.toLocaleString()}`;
    }
  });

  return errors;
}

export function normalizeFieldValue(type, value) {
  if (type === "number") {
    return value === "" ? "" : Number(value);
  }
  return value;
}

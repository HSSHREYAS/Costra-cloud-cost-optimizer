import { serviceCatalog } from "../../config/serviceCatalog.js";

export default function ConfigurationFields({ service, configuration, errors, onChange }) {
  return serviceCatalog[service].fields.map((field) => {
    const fieldValue = configuration[field.name] ?? "";
    return (
      <label className="field" key={field.name}>
        <span>
          {field.label}
          {field.hint && <small className="field-hint">{field.hint}</small>}
        </span>
        {field.type === "select" ? (
          <select value={fieldValue} onChange={(event) => onChange(field, event.target.value)}>
            {field.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={field.type}
            min={field.min}
            max={field.max}
            placeholder={field.placeholder}
            value={fieldValue}
            onChange={(event) => onChange(field, event.target.value)}
          />
        )}
        {errors[field.name] ? <small className="field-error">{errors[field.name]}</small> : null}
      </label>
    );
  });
}

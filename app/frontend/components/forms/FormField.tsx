import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

interface FieldFrameProps {
  id: string;
  label: string;
  /** Message for the field, shown under the control and linked with aria-describedby. */
  error?: string;
  children: ReactNode;
}

function FieldFrame({ id, label, error, children }: FieldFrameProps) {
  return (
    <div className="form-field">
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      {children}
      {error && (
        <div className="form-field-error" id={`${id}-error`}>
          {error}
        </div>
      )}
    </div>
  );
}

/** Props shared by the controls: the ARIA wiring for the error message. */
function errorProps(id: string, error: string | undefined) {
  return error ? { "aria-invalid": true, "aria-describedby": `${id}-error` } : {};
}

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  label: string;
  error?: string;
};

/** Single-line text input with a visible label and an inline error. */
export function TextField({ id, label, error, className, ...input }: TextFieldProps) {
  return (
    <FieldFrame id={id} label={label} error={error}>
      <input
        {...input}
        id={id}
        type={input.type ?? "text"}
        className={`form-control${error ? " is-invalid" : ""}${className ? ` ${className}` : ""}`}
        {...errorProps(id, error)}
      />
    </FieldFrame>
  );
}

type TextAreaFieldProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> & {
  id: string;
  label: string;
  error?: string;
};

/** Multi-line text input with a visible label and an inline error. */
export function TextAreaField({ id, label, error, className, ...textarea }: TextAreaFieldProps) {
  return (
    <FieldFrame id={id} label={label} error={error}>
      <textarea
        {...textarea}
        id={id}
        className={`form-control${error ? " is-invalid" : ""}${className ? ` ${className}` : ""}`}
        {...errorProps(id, error)}
      />
    </FieldFrame>
  );
}

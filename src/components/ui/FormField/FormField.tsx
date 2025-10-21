import React from 'react';
import { Input } from '../Input/Input';
import styles from './FormField.module.scss';

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  required?: boolean;
  helperText?: string;
  type?: 'text' | 'email' | 'tel' | 'password' | 'number';
  placeholder?: string;
  id?: string;
  disabled?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChange,
  error,
  required = false,
  helperText,
  type = 'text',
  placeholder,
  id,
  disabled = false
}) => {
  const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const hasError = !!error;

  return (
    <div className={styles.formField}>
      <label htmlFor={fieldId} className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      <Input
        id={fieldId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={hasError ? styles.inputError : ''}
      />
      {error && (
        <span className={styles.errorMessage} role="alert">
          {error}
        </span>
      )}
      {!error && helperText && (
        <span className={styles.helperText}>
          {helperText}
        </span>
      )}
    </div>
  );
};


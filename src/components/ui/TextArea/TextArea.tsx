import React from 'react';
import styles from './TextArea.module.scss';

interface TextAreaProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  maxLength?: number;
  rows?: number;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  className?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
  id,
  label,
  placeholder,
  value,
  disabled = false,
  maxLength,
  rows = 4,
  onChange,
  onBlur,
  onFocus,
  className
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className={styles.textareaWrapper}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={`${styles.textarea} ${className || ''}`}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        maxLength={maxLength}
        rows={rows}
        onChange={handleChange}
        onBlur={onBlur}
        onFocus={onFocus}
      />
      {maxLength && (
        <div className={styles.charCount}>
          {value?.length || 0}/{maxLength}
        </div>
      )}
    </div>
  );
};


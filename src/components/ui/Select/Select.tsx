import React from 'react';
import styles from './Select.module.scss';

interface SelectProps {
  id?: string;
  label?: string;
  value?: string;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  className?: string;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  id,
  label,
  value,
  disabled = false,
  onChange,
  onBlur,
  onFocus,
  className,
  children
}) => {
  return (
    <div className={styles.selectWrapper}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <select
        id={id}
        className={`${styles.select} ${className || ''}`}
        value={value}
        disabled={disabled}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
      >
        {children}
      </select>
    </div>
  );
};


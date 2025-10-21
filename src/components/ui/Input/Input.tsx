import React from 'react';
import styles from './Input.module.scss';

interface InputProps {
  id?: string;
  type?: 'text' | 'email' | 'tel' | 'password' | 'number';
  placeholder?: string;
  value?: string | number;
  disabled?: boolean;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  id,
  type = 'text',
  placeholder,
  value,
  disabled = false,
  onChange,
  onBlur,
  onFocus,
  className
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <input
      id={id}
      type={type}
      className={`${styles.input} ${className || ''}`}
      placeholder={placeholder}
      value={value}
      disabled={disabled}
      onChange={handleChange}
      onBlur={onBlur}
      onFocus={onFocus}
    />
  );
};

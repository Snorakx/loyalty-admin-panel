import { useState, useCallback } from 'react';
import { ValidationResult } from '../utils/validation';

export interface FormValues {
  [key: string]: any;
}

export interface FormErrors {
  [key: string]: string | null;
}

export interface FormTouched {
  [key: string]: boolean;
}

export interface ValidationRules {
  [key: string]: (value: any) => ValidationResult;
}

export interface UseFormValidationReturn {
  values: FormValues;
  errors: FormErrors;
  touched: FormTouched;
  isValid: boolean;
  setFieldValue: (fieldName: string, value: any) => void;
  setFieldError: (fieldName: string, error: string | null) => void;
  setFieldTouched: (fieldName: string, touched: boolean) => void;
  validateField: (fieldName: string) => boolean;
  validateAll: () => boolean;
  resetForm: () => void;
  setValues: (values: FormValues) => void;
}

export function useFormValidation(
  initialValues: FormValues,
  validationRules: ValidationRules
): UseFormValidationReturn {
  const [values, setValuesState] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});

  const setFieldValue = useCallback((fieldName: string, value: any) => {
    setValuesState(prev => ({ ...prev, [fieldName]: value }));
    
    // Auto-validate on change if field was touched
    if (touched[fieldName] && validationRules[fieldName]) {
      const result = validationRules[fieldName](value);
      setErrors(prev => ({ ...prev, [fieldName]: result.error }));
    }
  }, [touched, validationRules]);

  const setFieldError = useCallback((fieldName: string, error: string | null) => {
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  }, []);

  const setFieldTouched = useCallback((fieldName: string, isTouched: boolean) => {
    setTouched(prev => ({ ...prev, [fieldName]: isTouched }));
  }, []);

  const validateField = useCallback((fieldName: string): boolean => {
    if (!validationRules[fieldName]) {
      return true;
    }

    const result = validationRules[fieldName](values[fieldName]);
    setErrors(prev => ({ ...prev, [fieldName]: result.error }));
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    return result.valid;
  }, [values, validationRules]);

  const validateAll = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    const newTouched: FormTouched = {};
    let isFormValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const result = validationRules[fieldName](values[fieldName]);
      newErrors[fieldName] = result.error;
      newTouched[fieldName] = true;
      
      if (!result.valid) {
        isFormValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(newTouched);
    
    return isFormValid;
  }, [values, validationRules]);

  const resetForm = useCallback(() => {
    setValuesState(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const setValues = useCallback((newValues: FormValues) => {
    setValuesState(newValues);
  }, []);

  // Calculate if form is valid
  const isValid = Object.keys(errors).every(key => !errors[key]);

  return {
    values,
    errors,
    touched,
    isValid,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    validateField,
    validateAll,
    resetForm,
    setValues
  };
}


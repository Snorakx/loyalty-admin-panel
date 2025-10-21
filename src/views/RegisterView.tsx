import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card/Card';
import { Button } from '../components/ui/Button/Button';
import { FormField } from '../components/ui/FormField/FormField';
import { Alert } from '../components/ui/Alert/Alert';
import { supabase } from '../repositories/supabase.client';
import { useFormValidation } from '../hooks/useFormValidation';
import { validateEmail, validatePassword, validatePasswordConfirmation } from '../utils/validation';
import { LogIn } from 'lucide-react';
import styles from './RegisterView.module.scss';

export const RegisterView: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const { values, errors, touched, setFieldValue, validateAll } = useFormValidation(
    {
      email: '',
      password: '',
      passwordConfirmation: ''
    },
    {
      email: validateEmail,
      password: validatePassword,
      passwordConfirmation: (value) => validatePasswordConfirmation(values.password, value)
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate all fields
    if (!validateAll()) {
      return;
    }

    // Check terms acceptance
    if (!termsAccepted) {
      setError('Musisz zaakceptować regulamin');
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
          data: {
            app: 'admin' // Mark this as admin-panel registration
          }
        }
      });

      if (signUpError) {
        // Handle specific Supabase errors
        if (signUpError.message.includes('already registered')) {
          setError('Ten adres email jest już zarejestrowany');
        } else if (signUpError.message.includes('rate limit')) {
          setError('Zbyt wiele prób rejestracji. Spróbuj ponownie za chwilę');
        } else {
          setError(signUpError.message);
        }
        return;
      }

      if (data.user) {
        // Check if email confirmation is required
        if (data.user.confirmed_at) {
          // User is confirmed, redirect to onboarding
          navigate('/onboarding');
        } else {
          // Email confirmation required
          setError('Sprawdź swoją skrzynkę email i potwierdź adres, aby kontynuować');
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Wystąpił błąd podczas rejestracji. Spróbuj ponownie');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.registerView} id="register-view">
      <div className={styles.container}>
        <Card className={styles.registerCard}>
          <div className={styles.header}>
            <LogIn size={32} className={styles.icon} />
            <h1 className={styles.title}>Załóż konto</h1>
            <p className={styles.subtitle}>
              Zarejestruj się i zacznij zarządzać swoim programem lojalnościowym
            </p>
          </div>

          {error && (
            <Alert
              variant="error"
              message={error}
              onClose={() => setError(null)}
            />
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <FormField
              id="register-email"
              label="Email"
              type="email"
              value={values.email}
              onChange={(value) => setFieldValue('email', value)}
              error={touched.email ? errors.email : null}
              required
              placeholder="twoj@email.com"
            />

            <FormField
              id="register-password"
              label="Hasło"
              type="password"
              value={values.password}
              onChange={(value) => setFieldValue('password', value)}
              error={touched.password ? errors.password : null}
              required
              placeholder="Minimum 8 znaków"
              helperText="Hasło musi zawierać litery i cyfry"
            />

            <FormField
              id="register-password-confirmation"
              label="Potwierdź hasło"
              type="password"
              value={values.passwordConfirmation}
              onChange={(value) => setFieldValue('passwordConfirmation', value)}
              error={touched.passwordConfirmation ? errors.passwordConfirmation : null}
              required
              placeholder="Powtórz hasło"
            />

            <div className={styles.termsWrapper}>
              <label className={styles.termsLabel}>
                <input
                  id="terms-checkbox"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className={styles.checkbox}
                />
                <span>
                  Akceptuję{' '}
                  <a href="/regulamin" target="_blank" className={styles.link}>
                    regulamin
                  </a>{' '}
                  i{' '}
                  <a href="/polityka-prywatnosci" target="_blank" className={styles.link}>
                    politykę prywatności
                  </a>
                </span>
              </label>
            </div>

            <Button
              id="register-submit-btn"
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? 'Rejestracja...' : 'Zarejestruj się'}
            </Button>
          </form>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              Masz już konto?{' '}
              <button
                id="go-to-login-btn"
                onClick={() => navigate('/login')}
                className={styles.link}
                type="button"
              >
                Zaloguj się
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};


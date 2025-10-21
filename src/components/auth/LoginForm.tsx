import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button/Button';
import { Input } from '../ui/Input/Input';
import { LogIn, Building2 } from 'lucide-react';
import styles from './LoginForm.module.scss';

interface LoginFormProps {
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  disabled = false
}) => {
  return (
    <div className={styles.loginView} id="login-view">
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <Building2 size={48} className={styles.logo} />
          <h1>Admin Panel</h1>
          <p>Zaloguj się do panelu administracyjnego</p>
        </div>
        
        <form onSubmit={onSubmit} className={styles.loginForm}>
          <Input
            id="email-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={onEmailChange}
          />
          <Input
            id="password-input"
            type="password"
            placeholder="Hasło"
            value={password}
            onChange={onPasswordChange}
          />
          <Button
            id="login-btn"
            type="submit"
            fullWidth
            disabled={disabled || !email || !password}
          >
            <LogIn size={16} />
            Zaloguj się
          </Button>
        </form>
        
        <div className={styles.registerLink}>
          <p>
            Nie masz konta?{' '}
            <Link to="/register">Zarejestruj się</Link>
          </p>
        </div>
      </div>
    </div>
  );
};


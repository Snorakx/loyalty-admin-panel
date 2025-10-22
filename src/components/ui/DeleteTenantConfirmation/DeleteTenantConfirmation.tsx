import React, { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Drawer } from '../Drawer';
import { Button } from '../Button/Button';
import { FormField } from '../FormField/FormField';
import styles from './DeleteTenantConfirmation.module.scss';

interface DeleteTenantConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tenantName: string;
}

export const DeleteTenantConfirmation: React.FC<DeleteTenantConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  tenantName
}) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isRequestSent, setIsRequestSent] = useState(false);

  const expectedText = tenantName;
  const isConfirmationValid = confirmationText === expectedText;
  const isPasswordValid = password.length >= 6;
  const isFormValid = isConfirmationValid && isPasswordValid;

  const handleConfirm = async () => {
    if (!isFormValid) return;
    
    setIsDeleting(true);
    setPasswordError(null);
    
    try {
      // Weryfikacja hasła przed wysłaniem żądania
      const { AuthService } = await import('../../../services/auth.service');
      const authService = AuthService.getInstance();
      
      // Sprawdź czy hasło jest poprawne (używając istniejącej metody logowania)
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        
        setPasswordError('Nie jesteś zalogowany');
        return;
      }

      // Weryfikuj hasło
      const isPasswordCorrect = await authService.verifyPassword(currentUser.email, password);
      if (!isPasswordCorrect) {
        setPasswordError('Nieprawidłowe hasło');
        return;
      }

      // Jeśli hasło jest poprawne, wysyłamy żądanie usunięcia
      await onConfirm();
      setIsRequestSent(true);
    } catch (error) {
      console.error('Error requesting tenant deletion:', error);
      setPasswordError('Błąd podczas weryfikacji hasła');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setConfirmationText('');
    setPassword('');
    setPasswordError(null);
    setIsDeleting(false);
    setIsRequestSent(false);
    onClose();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      title="Zażądaj usunięcia profilu firmy"
    >
      <div className={styles.deleteConfirmation}>
        {!isRequestSent ? (
          <>
            <div className={styles.warning}>
              <AlertTriangle size={48} className={styles.warningIcon} />
              <h2>Czy na pewno chcesz zażądać usunięcia tego profilu firmy?</h2>
              <p>
                Ta operacja wyśle żądanie usunięcia, które wymaga zatwierdzenia. Po zatwierdzeniu zostanie usunięte:
              </p>
            </div>

            <div className={styles.consequences}>
              <h3>Co zostanie usunięte:</h3>
              <ul>
                <li>Wszystkie dane profilu firmy: <strong>{tenantName}</strong></li>
                <li>Wszystkie lokalizacje tej firmy</li>
                <li>Wszystkie programy lojalnościowe</li>
                <li>Wszystkie karty klientów</li>
                <li>Wszystkie stemple i historię</li>
                <li>Wszystkich użytkowników przypisanych do tej firmy</li>
              </ul>
            </div>

            <div className={styles.confirmation}>
              <h3>Potwierdź żądanie usunięcia</h3>
              <p>
                Aby wysłać żądanie usunięcia, wpisz nazwę firmy: <strong>{tenantName}</strong>
              </p>
              
              <FormField
                label="Nazwa firmy"
                value={confirmationText}
                onChange={setConfirmationText}
                placeholder={`Wpisz "${tenantName}" aby potwierdzić`}
                error={confirmationText && !isConfirmationValid ? 'Nazwa nie jest zgodna' : undefined}
                disabled={isDeleting}
              />
              
              <FormField
                label="Hasło"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="Wpisz swoje hasło"
                error={passwordError || (password && !isPasswordValid ? 'Hasło musi mieć co najmniej 6 znaków' : undefined)}
                disabled={isDeleting}
              />
            </div>

            <div className={styles.actions}>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isDeleting}
                fullWidth
              >
                Anuluj
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirm}
                disabled={!isFormValid || isDeleting}
                fullWidth
              >
                <Trash2 size={16} />
                {isDeleting ? 'Wysyłanie żądania...' : 'Wyślij żądanie usunięcia'}
              </Button>
            </div>
          </>
        ) : (
          <div className={styles.success}>
            <div className={styles.successIcon}>
              <AlertTriangle size={48} />
            </div>
            <h2>Żądanie usunięcia zostało wysłane</h2>
            <p>
              Twoje żądanie usunięcia profilu firmy <strong>{tenantName}</strong> zostało wysłane do administratora.
            </p>
            <p>
              <strong>Co dalej?</strong>
            </p>
            <ul className={styles.nextSteps}>
              <li>Administrator przeanalizuje Twoje żądanie</li>
              <li>Otrzymasz powiadomienie o decyzji</li>
              <li>Proces może potrwać do 24 godzin</li>
              <li>W przypadku zatwierdzenia, wszystkie dane zostaną usunięte</li>
            </ul>
            <div className={styles.actions}>
              <Button
                variant="primary"
                onClick={handleClose}
                fullWidth
              >
                Zamknij
              </Button>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
};

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useSendVerificationCode, useChangePassword } from '../../hooks/useAuth';

type Step = 'credentials' | 'verification' | 'success';

export function SecuritySettings() {
  const { t } = useTranslation();
  const { sendCode, isSending, sendError, clearSendError } = useSendVerificationCode();
  const { changePassword, isChanging, changeError, changeSuccess, clearChangeState } = useChangePassword();

  const [step, setStep] = useState<Step>('credentials');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Resend cooldown (30s)
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Store newPassword across steps (not exposed to user after Step 2 renders)
  const newPasswordRef = useRef('');

  // Reset resend cooldown timer
  const startCooldown = useCallback(() => {
    setResendCooldown(30);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          cooldownRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  // Reset to Step 1 after success (3s delay)
  useEffect(() => {
    if (changeSuccess) {
      setStep('success');
      const timer = setTimeout(() => {
        resetForm();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [changeSuccess]);

  const resetForm = () => {
    setStep('credentials');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setVerificationCode('');
    setValidationError(null);
    clearChangeState();
    clearSendError();
    newPasswordRef.current = '';
  };

  // Step 1: Submit credentials → send verification code
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearSendError();

    // Client-side validation
    if (!currentPassword) {
      setValidationError(t('settings.currentPasswordRequired'));
      return;
    }

    if (newPassword.length < 6) {
      setValidationError(t('settings.passwordMinLength'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError(t('settings.passwordMismatch'));
      return;
    }

    // Store new password for later use
    newPasswordRef.current = newPassword;

    // Send verification code
    const result = await sendCode();
    if (result) {
      setStep('verification');
      startCooldown();
    }
  };

  // Step 2: Submit code → change password
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearChangeState();

    if (!verificationCode || verificationCode.length !== 6) {
      setValidationError(t('settings.codeRequired'));
      return;
    }

    const success = await changePassword(verificationCode, newPasswordRef.current);
    if (!success) {
      // Stay on step 2, error shown
    }
  };

  // Resend code
  const handleResend = async () => {
    if (resendCooldown > 0) return;

    clearSendError();
    const result = await sendCode();
    if (result) {
      setVerificationCode('');
      startCooldown();
    }
  };

  // Handle code input change (only digits, max 6)
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(value);
  };

  return (
    <div>
      <h2
        style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          marginBottom: '1rem',
          color: '#111827',
        }}
      >
        {t('settings.security')}
      </h2>

      {/* Step 1: Credentials */}
      {step === 'credentials' && (
        <form onSubmit={handleStep1Submit}>
          <div style={{ display: 'grid', gap: '1rem', maxWidth: '400px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginBottom: '0.25rem',
                }}
              >
                {t('settings.currentPassword')}
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isSending}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  background: '#fff',
                  color: '#111827',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginBottom: '0.25rem',
                }}
              >
                {t('settings.newPassword')}
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isSending}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  background: '#fff',
                  color: '#111827',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginBottom: '0.25rem',
                }}
              >
                {t('settings.confirmPassword')}
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSending}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  background: '#fff',
                  color: '#111827',
                }}
              />
            </div>

            {/* Validation error */}
            {validationError && (
              <div
                style={{
                  color: '#dc2626',
                  fontSize: '0.875rem',
                  padding: '0.5rem',
                  background: '#fef2f2',
                  borderRadius: '6px',
                }}
              >
                {validationError}
              </div>
            )}

            {/* API error */}
            {sendError && (
              <div
                style={{
                  color: '#dc2626',
                  fontSize: '0.875rem',
                  padding: '0.5rem',
                  background: '#fef2f2',
                  borderRadius: '6px',
                }}
              >
                {sendError}
              </div>
            )}

            <div style={{ marginTop: '0.5rem' }}>
              <button
                type="submit"
                disabled={isSending}
                style={{
                  padding: '0.625rem 1.25rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: isSending ? '#93c5fd' : '#3b82f6',
                  color: '#fff',
                  fontWeight: '500',
                  cursor: isSending ? 'not-allowed' : 'pointer',
                }}
              >
                {isSending ? t('settings.sendingCode') : t('settings.sendCode')}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Step 2: Verification Code */}
      {step === 'verification' && (
        <form onSubmit={handleStep2Submit}>
          <div style={{ display: 'grid', gap: '1rem', maxWidth: '400px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginBottom: '0.25rem',
                }}
              >
                {t('settings.verificationCode')}
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={verificationCode}
                onChange={handleCodeChange}
                placeholder={t('settings.verificationCodePlaceholder')}
                disabled={isChanging}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  background: '#fff',
                  color: '#111827',
                  fontFamily: 'monospace',
                  fontSize: '1.25rem',
                  letterSpacing: '0.5rem',
                  textAlign: 'center',
                }}
              />
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  marginTop: '0.25rem',
                }}
              >
                {t('settings.verificationCodeSent')}
              </div>
            </div>

            {/* Validation error */}
            {validationError && (
              <div
                style={{
                  color: '#dc2626',
                  fontSize: '0.875rem',
                  padding: '0.5rem',
                  background: '#fef2f2',
                  borderRadius: '6px',
                }}
              >
                {validationError}
              </div>
            )}

            {/* API error */}
            {changeError && (
              <div
                style={{
                  color: '#dc2626',
                  fontSize: '0.875rem',
                  padding: '0.5rem',
                  background: '#fef2f2',
                  borderRadius: '6px',
                }}
              >
                {changeError}
              </div>
            )}

            <div style={{ marginTop: '0.5rem' }}>
              <button
                type="submit"
                disabled={isChanging || verificationCode.length !== 6}
                style={{
                  padding: '0.625rem 1.25rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: isChanging || verificationCode.length !== 6 ? '#93c5fd' : '#3b82f6',
                  color: '#fff',
                  fontWeight: '500',
                  cursor: isChanging || verificationCode.length !== 6 ? 'not-allowed' : 'pointer',
                }}
              >
                {isChanging ? t('settings.changing') : t('settings.changePassword')}
              </button>
            </div>

            {/* Resend code */}
            <div style={{ marginTop: '0.25rem' }}>
              {resendCooldown > 0 ? (
                <span
                  style={{
                    fontSize: '0.875rem',
                    color: '#9ca3af',
                  }}
                >
                  {t('settings.resendCooldown').replace('{seconds}', String(resendCooldown))}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isSending}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#3b82f6',
                    cursor: isSending ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    padding: 0,
                    textDecoration: 'underline',
                    opacity: isSending ? 0.5 : 1,
                  }}
                >
                  {isSending ? t('settings.sendingCode') : t('settings.resendCode')}
                </button>
              )}
            </div>

            {/* Send error for resend */}
            {sendError && (
              <div
                style={{
                  color: '#dc2626',
                  fontSize: '0.875rem',
                  padding: '0.5rem',
                  background: '#fef2f2',
                  borderRadius: '6px',
                }}
              >
                {sendError}
              </div>
            )}
          </div>
        </form>
      )}

      {/* Success step (displayed for 3 seconds before reset) */}
      {step === 'success' && changeSuccess && (
        <div
          style={{
            color: '#16a34a',
            fontSize: '0.875rem',
            padding: '1rem',
            background: '#f0fdf4',
            borderRadius: '6px',
            maxWidth: '400px',
          }}
        >
          {changeSuccess}
        </div>
      )}
    </div>
  );
}

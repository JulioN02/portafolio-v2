import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import {
  useChangePassword,
  useProfile,
  useSetup2fa,
  useEnable2fa,
  useDisable2fa,
} from '../../hooks/useAuth';
import type { ChangePasswordPayload } from '../../api/auth';
import type { TwoFactorSetupResponse } from '@jsoft/shared';
import { toast } from 'sonner';

/** Normalize a recovery code: trim, uppercase, accept both XXXX-XXXX and XXXXXXXXXX. */
function normalizeRecoveryCode(raw: string): string {
  const compact = raw.trim().toUpperCase().replace(/\s+/g, '');
  if (compact.length === 8 && !compact.includes('-')) {
    return `${compact.slice(0, 4)}-${compact.slice(4)}`;
  }
  return compact;
}

const TOTP_CODE_REGEX = /^\d{6}$/;
const RECOVERY_CODE_REGEX = /^[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$/;

/** 2FA enable flow: idle -> setup (QR + secret) -> recovery-codes (shown once). */
type EnableFlow = 'idle' | 'setup' | 'recovery-codes';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  background: '#fff',
  color: '#111827',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.875rem',
  color: '#6b7280',
  marginBottom: '0.25rem',
};

const errorBoxStyle: React.CSSProperties = {
  color: '#dc2626',
  fontSize: '0.875rem',
  padding: '0.5rem',
  background: '#fef2f2',
  borderRadius: '6px',
};

const primaryButtonStyle: React.CSSProperties = {
  padding: '0.625rem 1.25rem',
  borderRadius: '6px',
  border: 'none',
  background: '#3b82f6',
  color: '#fff',
  fontWeight: '500',
  cursor: 'pointer',
};

export function SecuritySettings() {
  const { t } = useTranslation();
  const { profile, fetchProfile } = useProfile();
  const { changePassword, isChanging, changeError, changeSuccess, clearChangeState } = useChangePassword();
  const { setup2fa, isSettingUp, setupError, clearSetupError } = useSetup2fa();
  const { enable2fa, isEnabling, enableError, clearEnableError } = useEnable2fa();
  const { disable2fa, isDisabling, disableError, disableSuccess, clearDisableState } = useDisable2fa();

  // Load the profile so the 2FA status drives the UI (enable vs disable section).
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // ── Password change form state ────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordTotp, setPasswordTotp] = useState('');
  const [passwordRecovery, setPasswordRecovery] = useState('');
  const [useRecovery, setUseRecovery] = useState(false);
  const [passwordValidationError, setPasswordValidationError] = useState<string | null>(null);

  // ── 2FA enable flow state ─────────────────────────────────────────────────
  const [enableFlow, setEnableFlow] = useState<EnableFlow>('idle');
  const [setupData, setSetupData] = useState<TwoFactorSetupResponse | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [enableTotp, setEnableTotp] = useState('');
  const [enableValidationError, setEnableValidationError] = useState<string | null>(null);

  // ── 2FA disable form state ────────────────────────────────────────────────
  const [disablePassword, setDisablePassword] = useState('');
  const [disableTotp, setDisableTotp] = useState('');
  const [disableValidationError, setDisableValidationError] = useState<string | null>(null);

  const resetPasswordForm = useCallback(() => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordTotp('');
    setPasswordRecovery('');
    setUseRecovery(false);
    setPasswordValidationError(null);
    clearChangeState();
  }, [clearChangeState]);

  // Success card auto-reset (5s)
  useEffect(() => {
    if (changeSuccess) {
      toast.success(changeSuccess);
      const timer = setTimeout(resetPasswordForm, 5000);
      return () => clearTimeout(timer);
    }
  }, [changeSuccess, resetPasswordForm]);

  // ── Password change ───────────────────────────────────────────────────────
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordValidationError(null);
    clearChangeState();

    if (!currentPassword) {
      setPasswordValidationError(t('settings.currentPasswordRequired'));
      return;
    }
    if (newPassword.length < 12) {
      setPasswordValidationError(t('settings.passwordMinLength'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordValidationError(t('settings.passwordMismatch'));
      return;
    }

    let body: ChangePasswordPayload;
    if (profile?.twoFactorEnabled) {
      if (!useRecovery) {
        if (!TOTP_CODE_REGEX.test(passwordTotp)) {
          setPasswordValidationError(t('settings.totpCode'));
          return;
        }
        body = { currentPassword, totpCode: passwordTotp, newPassword };
      } else {
        const normalized = normalizeRecoveryCode(passwordRecovery);
        if (!RECOVERY_CODE_REGEX.test(normalized)) {
          setPasswordValidationError(t('settings.recoveryCode'));
          return;
        }
        body = { currentPassword, recoveryCode: normalized, newPassword };
      }
    } else {
      // 2FA disabled: totp/recovery are not sent at all.
      body = { currentPassword, newPassword };
    }

    const ok = await changePassword(body);
    if (!ok) {
      // Errors (403 "Current password is incorrect", 429 rate limit, 400 bad
      // code) are surfaced inline; the form data is preserved.
      setPasswordValidationError(changeError || t('settings.passwordChangeError'));
    }
  };

  // ── 2FA enable flow ───────────────────────────────────────────────────────
  const handleEnableStart = async () => {
    clearSetupError();
    clearEnableError();
    setEnableValidationError(null);
    const data = await setup2fa();
    if (data) {
      setSetupData(data);
      setEnableFlow('setup');
    }
  };

  const handleEnableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnableValidationError(null);
    clearEnableError();
    if (!TOTP_CODE_REGEX.test(enableTotp)) {
      setEnableValidationError(t('settings.totpCode'));
      return;
    }
    const result = await enable2fa(enableTotp);
    if (result) {
      setRecoveryCodes(result.recoveryCodes);
      setEnableFlow('recovery-codes');
      setEnableTotp('');
    }
  };

  const handleEnableCancel = () => {
    // Cancelling must NOT change twoFactorEnabled.
    setEnableFlow('idle');
    setSetupData(null);
    setEnableTotp('');
    setEnableValidationError(null);
    clearSetupError();
    clearEnableError();
  };

  const handleRecoveryDone = () => {
    setEnableFlow('idle');
    setRecoveryCodes(null);
    setSetupData(null);
    // Refresh profile so the UI flips to the disable section.
    fetchProfile();
  };

  const handleCopyRecoveryCodes = async () => {
    if (!recoveryCodes) return;
    try {
      await navigator.clipboard.writeText(recoveryCodes.join('\n'));
      toast.success(t('settings.recoveryCodesCopied'));
    } catch {
      // Clipboard unavailable — codes remain on screen, nothing persisted.
    }
  };

  // ── 2FA disable ───────────────────────────────────────────────────────────
  const handleDisableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisableValidationError(null);
    clearDisableState();

    if (!disablePassword) {
      setDisableValidationError(t('settings.currentPasswordRequired'));
      return;
    }
    if (!TOTP_CODE_REGEX.test(disableTotp)) {
      setDisableValidationError(t('settings.totpCode'));
      return;
    }

    const ok = await disable2fa(disablePassword, disableTotp);
    if (ok) {
      toast.success(t('settings.twoFactorDisabled'));
      setDisablePassword('');
      setDisableTotp('');
      fetchProfile();
    }
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

      {/* ── Two-factor authentication section ─────────────────────────────── */}
      <div style={{ marginBottom: '2rem', maxWidth: '400px' }}>
        {profile === null ? null : !profile.twoFactorEnabled && enableFlow === 'idle' ? (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#374151' }}>
              {t('settings.twoFactorDisabled')}
            </div>
            <div>
              <button type="button" onClick={handleEnableStart} disabled={isSettingUp} style={primaryButtonStyle}>
                {isSettingUp ? t('common.loading') : t('settings.enable2fa')}
              </button>
            </div>
            {setupError && <div style={errorBoxStyle}>{setupError}</div>}
          </div>
        ) : null}

        {enableFlow === 'setup' && setupData && (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#374151' }}>
              {t('settings.twoFactorSetup')}
            </div>

            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                {t('settings.scanQr')}
              </p>
              <img
                src={setupData.qrDataUrl}
                alt="TOTP QR"
                style={{ width: '180px', height: '180px', borderRadius: '6px' }}
              />
              <div>
                <span style={labelStyle}>{t('settings.manualEntry')}</span>
                <code
                  style={{
                    display: 'block',
                    padding: '0.5rem',
                    background: '#f3f4f6',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    wordBreak: 'break-all',
                    color: '#111827',
                  }}
                >
                  {setupData.secret}
                </code>
              </div>
            </div>

            <form onSubmit={handleEnableSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>{t('settings.totpCode')}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={enableTotp}
                  onChange={(e) => setEnableTotp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={isEnabling}
                  style={{ ...inputStyle, fontFamily: 'monospace', letterSpacing: '0.25rem' }}
                />
              </div>

              {enableValidationError && <div style={errorBoxStyle}>{enableValidationError}</div>}
              {enableError && <div style={errorBoxStyle}>{enableError}</div>}

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" disabled={isEnabling} style={primaryButtonStyle}>
                  {isEnabling ? t('common.loading') : t('settings.verifyCode')}
                </button>
                <button
                  type="button"
                  onClick={handleEnableCancel}
                  disabled={isEnabling}
                  style={{
                    padding: '0.625rem 1.25rem',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    background: '#fff',
                    color: '#374151',
                    cursor: 'pointer',
                  }}
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        )}

        {enableFlow === 'recovery-codes' && recoveryCodes && (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#374151' }}>
              {t('settings.recoveryCodesTitle')}
            </div>
            <div
              style={{
                color: '#92400e',
                fontSize: '0.875rem',
                padding: '0.75rem',
                background: '#fffbeb',
                borderRadius: '6px',
              }}
            >
              {t('settings.recoveryCodesWarning')}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.5rem',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                color: '#111827',
              }}
            >
              {recoveryCodes.map((code) => (
                <div key={code} style={{ padding: '0.5rem', background: '#f3f4f6', borderRadius: '6px' }}>
                  {code}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" onClick={handleCopyRecoveryCodes} style={primaryButtonStyle}>
                {t('settings.copyRecoveryCodes')}
              </button>
              <button
                type="button"
                onClick={handleRecoveryDone}
                style={{
                  padding: '0.625rem 1.25rem',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  background: '#fff',
                  color: '#374151',
                  cursor: 'pointer',
                }}
              >
                {t('settings.finish')}
              </button>
            </div>
          </div>
        )}

        {profile?.twoFactorEnabled && (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div
              style={{
                color: '#166534',
                fontSize: '0.875rem',
                padding: '0.75rem',
                background: '#f0fdf4',
                borderRadius: '6px',
              }}
            >
              {t('settings.twoFactorEnabled')}
            </div>

            <form onSubmit={handleDisableSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>{t('settings.currentPassword')}</label>
                <input
                  type="password"
                  required
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  disabled={isDisabling}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>{t('settings.totpCode')}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={disableTotp}
                  onChange={(e) => setDisableTotp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={isDisabling}
                  style={{ ...inputStyle, fontFamily: 'monospace', letterSpacing: '0.25rem' }}
                />
              </div>

              {disableValidationError && <div style={errorBoxStyle}>{disableValidationError}</div>}
              {disableError && <div style={errorBoxStyle}>{disableError}</div>}
              {disableSuccess && (
                <div style={{ ...errorBoxStyle, color: '#166534', background: '#f0fdf4' }}>
                  {disableSuccess}
                </div>
              )}

              <div>
                <button type="submit" disabled={isDisabling} style={primaryButtonStyle}>
                  {isDisabling ? t('common.loading') : t('settings.disable2fa')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ── Single-step password change ───────────────────────────────────── */}
      <form onSubmit={handlePasswordSubmit}>
        <div style={{ display: 'grid', gap: '1rem', maxWidth: '400px' }}>
          <div>
            <label style={labelStyle}>{t('settings.currentPassword')}</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isChanging}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>{t('settings.newPassword')}</label>
            <input
              type="password"
              required
              minLength={12}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isChanging}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>{t('settings.confirmPassword')}</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isChanging}
              style={inputStyle}
            />
          </div>

          {profile?.twoFactorEnabled && (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {!useRecovery ? (
                <div>
                  <label style={labelStyle}>{t('settings.totpCode')}</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={passwordTotp}
                    onChange={(e) => setPasswordTotp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    disabled={isChanging}
                    style={{ ...inputStyle, fontFamily: 'monospace', letterSpacing: '0.25rem' }}
                  />
                </div>
              ) : (
                <div>
                  <label style={labelStyle}>{t('settings.recoveryCode')}</label>
                  <input
                    type="text"
                    value={passwordRecovery}
                    onChange={(e) => setPasswordRecovery(e.target.value)}
                    placeholder="XXXX-XXXX"
                    disabled={isChanging}
                    style={{ ...inputStyle, fontFamily: 'monospace' }}
                  />
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setUseRecovery((v) => !v);
                  setPasswordTotp('');
                  setPasswordRecovery('');
                }}
                disabled={isChanging}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  padding: 0,
                  textDecoration: 'underline',
                  textAlign: 'left',
                }}
              >
                {useRecovery ? t('settings.totpCode') : t('settings.useRecoveryCode')}
              </button>
            </div>
          )}

          {passwordValidationError && <div style={errorBoxStyle}>{passwordValidationError}</div>}
          {changeError && <div style={errorBoxStyle}>{changeError}</div>}
          {changeSuccess && (
            <div
              style={{
                color: '#166534',
                fontSize: '0.875rem',
                padding: '0.75rem',
                background: '#f0fdf4',
                borderRadius: '6px',
              }}
            >
              {changeSuccess}
            </div>
          )}

          <div style={{ marginTop: '0.5rem' }}>
            <button type="submit" disabled={isChanging} style={primaryButtonStyle}>
              {isChanging ? t('settings.changing') : t('settings.changePassword')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
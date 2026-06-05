import { useState, type FormEvent } from 'react';
import { useSubmitContact } from '../../hooks/useContactForm';
import { useTranslation } from '../../i18n/LanguageContext';
import { toast } from 'sonner';
import type { RecruiterContactFormData } from '../../hooks/useContactForm';
import styles from './RecruiterContactForm.module.css';

/* ── Validation helpers ── */

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[+]?[\d\s()-]{7,20}$/;

interface FieldErrors {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  budget?: string;
  message?: string;
  preferredContact?: string;
}

/**
 * Creates validation errors using translation function.
 */
function createValidationErrors(
  t: (key: string) => string,
  data: RecruiterContactFormData,
): FieldErrors {
  const errors: FieldErrors = {};

  if (!data.name.trim()) {
    errors.name = t('contactForm.error.nameRequired');
  }

  if (!data.email.trim()) {
    errors.email = t('contactForm.error.emailRequired');
  } else if (!emailRegex.test(data.email)) {
    errors.email = t('contactForm.error.emailInvalid');
  }

  if (!data.phone.trim()) {
    errors.phone = t('contactForm.error.phoneRequired');
  } else if (!phoneRegex.test(data.phone)) {
    errors.phone = t('contactForm.error.phoneInvalid');
  }

  if (!data.company.trim()) {
    errors.company = t('contactForm.error.companyRequired');
  }

  if (!data.position.trim()) {
    errors.position = t('contactForm.error.positionRequired');
  }

  if (!data.budget.trim()) {
    errors.budget = t('contactForm.error.budgetRequired');
  }

  if (!data.message.trim()) {
    errors.message = t('contactForm.error.messageRequired');
  }

  if (!data.preferredContact) {
    errors.preferredContact = t('contactForm.error.preferredContactRequired');
  }

  return errors;
}

/**
 * Checks whether the errors object has at least one key with a truthy value.
 */
function hasErrors(errors: FieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}

/* ── Component ── */

export function RecruiterContactForm() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<RecruiterContactFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    budget: '',
    message: '',
    preferredContact: 'EMAIL',
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const { mutate, isPending, isError, error, isSuccess, data } =
    useSubmitContact();

  /* ── Handlers ── */

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear the field-level error on change
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const errors = createValidationErrors(t, formData);
    setFieldErrors(errors);

    if (hasErrors(errors)) return;

    mutate(formData, {
      onSuccess: () => {
        toast.success('¡Mensaje enviado con éxito!');
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          position: '',
          budget: '',
          message: '',
          preferredContact: 'EMAIL',
        });
        setFieldErrors({});
      },
      onError: () => {
        toast.error('Error al enviar el mensaje');
      },
    });
  };

  const handleRetry = () => {
    mutate(formData);
  };

  /* ── Render ── */

  // Success state — hide form, show confirmation
  if (isSuccess && data) {
    return (
      <div className={styles.successCard}>
        <div className={styles.successIcon}>✓</div>
        <h3 className={styles.successTitle}>{t('contactForm.success.title')}</h3>
        <p className={styles.successMessage}>{data.message}</p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {/* ── Name ── */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="name">
          {t('contactForm.nameLabel')}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          className={`${styles.input} ${fieldErrors.name ? styles.inputError : ''}`}
          value={formData.name}
          onChange={handleChange}
          placeholder={t('contactForm.namePlaceholder')}
          disabled={isPending}
          autoComplete="name"
        />
        {fieldErrors.name && (
          <span className={styles.fieldError}>{fieldErrors.name}</span>
        )}
      </div>

      {/* ── Email ── */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="email">
          {t('contactForm.emailLabel')}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className={`${styles.input} ${fieldErrors.email ? styles.inputError : ''}`}
          value={formData.email}
          onChange={handleChange}
          placeholder={t('contactForm.emailPlaceholder')}
          disabled={isPending}
          autoComplete="email"
        />
        {fieldErrors.email && (
          <span className={styles.fieldError}>{fieldErrors.email}</span>
        )}
      </div>

      {/* ── Phone ── */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="phone">
          {t('contactForm.phoneLabel')}
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className={`${styles.input} ${fieldErrors.phone ? styles.inputError : ''}`}
          value={formData.phone}
          onChange={handleChange}
          placeholder={t('contactForm.phonePlaceholder')}
          disabled={isPending}
          autoComplete="tel"
        />
        {fieldErrors.phone && (
          <span className={styles.fieldError}>{fieldErrors.phone}</span>
        )}
      </div>

      {/* ── Company ── */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="company">
          {t('contactForm.companyLabel')}
        </label>
        <input
          id="company"
          name="company"
          type="text"
          className={`${styles.input} ${fieldErrors.company ? styles.inputError : ''}`}
          value={formData.company}
          onChange={handleChange}
          placeholder={t('contactForm.companyPlaceholder')}
          disabled={isPending}
          autoComplete="organization"
        />
        {fieldErrors.company && (
          <span className={styles.fieldError}>{fieldErrors.company}</span>
        )}
      </div>

      {/* ── Position ── */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="position">
          {t('contactForm.positionLabel')}
        </label>
        <input
          id="position"
          name="position"
          type="text"
          className={`${styles.input} ${fieldErrors.position ? styles.inputError : ''}`}
          value={formData.position}
          onChange={handleChange}
          placeholder={t('contactForm.positionPlaceholder')}
          disabled={isPending}
        />
        {fieldErrors.position && (
          <span className={styles.fieldError}>{fieldErrors.position}</span>
        )}
      </div>

      {/* ── Budget ── */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="budget">
          {t('contactForm.budgetLabel')}
        </label>
        <input
          id="budget"
          name="budget"
          type="text"
          className={`${styles.input} ${fieldErrors.budget ? styles.inputError : ''}`}
          value={formData.budget}
          onChange={handleChange}
          placeholder={t('contactForm.budgetPlaceholder')}
          disabled={isPending}
        />
        {fieldErrors.budget && (
          <span className={styles.fieldError}>{fieldErrors.budget}</span>
        )}
      </div>

      {/* ── Preferred Contact ── */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="preferredContact">
          {t('contactForm.preferredContactLabel')}
        </label>
        <select
          id="preferredContact"
          name="preferredContact"
          className={`${styles.select} ${fieldErrors.preferredContact ? styles.inputError : ''}`}
          value={formData.preferredContact}
          onChange={handleChange}
          disabled={isPending}
        >
          <option value="EMAIL">{t('contactForm.option.email')}</option>
          <option value="PHONE">{t('contactForm.option.phone')}</option>
          <option value="WHATSAPP">{t('contactForm.option.whatsapp')}</option>
        </select>
        {fieldErrors.preferredContact && (
          <span className={styles.fieldError}>
            {fieldErrors.preferredContact}
          </span>
        )}
      </div>

      {/* ── Message ── */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="message">
          {t('contactForm.messageLabel')}
        </label>
        <textarea
          id="message"
          name="message"
          className={`${styles.textarea} ${fieldErrors.message ? styles.inputError : ''}`}
          value={formData.message}
          onChange={handleChange}
          placeholder={t('contactForm.messagePlaceholder')}
          rows={5}
          disabled={isPending}
        />
        {fieldErrors.message && (
          <span className={styles.fieldError}>{fieldErrors.message}</span>
        )}
      </div>

      {/* ── API Error ── */}
      {isError && (
        <div className={styles.apiError}>
          <p className={styles.apiErrorText}>
            {error?.message ?? t('contactForm.error.generic')}
          </p>
          <button
            type="button"
            className={styles.retryButton}
            onClick={handleRetry}
            disabled={isPending}
          >
            {t('contactForm.error.retry')}
          </button>
        </div>
      )}

      {/* ── Submit ── */}
      <button
        type="submit"
        className={styles.submitButton}
        disabled={isPending}
      >
        {isPending ? (
          <span className={styles.loadingWrapper}>
            <span className={styles.spinner} />
            {t('contactForm.submitting')}
          </span>
        ) : (
          t('contactForm.submit')
        )}
      </button>
    </form>
  );
}

import { useState, type FormEvent } from 'react';
import { useSubmitContact } from '../../hooks/useContactForm';
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
 * Client-side validation. Returns an object with error messages only
 * for fields that fail validation.
 */
function validateForm(data: RecruiterContactFormData): FieldErrors {
  const errors: FieldErrors = {};

  if (!data.name.trim()) {
    errors.name = 'El nombre es obligatorio';
  }

  if (!data.email.trim()) {
    errors.email = 'El correo electrónico es obligatorio';
  } else if (!emailRegex.test(data.email)) {
    errors.email = 'Ingrese un correo electrónico válido';
  }

  if (!data.phone.trim()) {
    errors.phone = 'El teléfono es obligatorio';
  } else if (!phoneRegex.test(data.phone)) {
    errors.phone = 'Ingrese un número de teléfono válido (ej. +57 300 123 4567)';
  }

  if (!data.company.trim()) {
    errors.company = 'La empresa es obligatoria';
  }

  if (!data.position.trim()) {
    errors.position = 'El cargo es obligatorio';
  }

  if (!data.budget.trim()) {
    errors.budget = 'El presupuesto es obligatorio';
  }

  if (!data.message.trim()) {
    errors.message = 'El mensaje es obligatorio';
  }

  if (!data.preferredContact) {
    errors.preferredContact = 'Seleccione un medio de contacto preferido';
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

    const errors = validateForm(formData);
    setFieldErrors(errors);

    if (hasErrors(errors)) return;

    mutate(formData, {
      onSuccess: () => {
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
        <h3 className={styles.successTitle}>¡Mensaje enviado!</h3>
        <p className={styles.successMessage}>{data.message}</p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {/* ── Name ── */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="name">
          Nombre completo *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          className={`${styles.input} ${fieldErrors.name ? styles.inputError : ''}`}
          value={formData.name}
          onChange={handleChange}
          placeholder="Ej. Juan Pérez"
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
          Correo electrónico *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className={`${styles.input} ${fieldErrors.email ? styles.inputError : ''}`}
          value={formData.email}
          onChange={handleChange}
          placeholder="ejemplo@correo.com"
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
          Teléfono *
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className={`${styles.input} ${fieldErrors.phone ? styles.inputError : ''}`}
          value={formData.phone}
          onChange={handleChange}
          placeholder="+57 300 123 4567"
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
          Empresa *
        </label>
        <input
          id="company"
          name="company"
          type="text"
          className={`${styles.input} ${fieldErrors.company ? styles.inputError : ''}`}
          value={formData.company}
          onChange={handleChange}
          placeholder="Nombre de la empresa"
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
          Cargo *
        </label>
        <input
          id="position"
          name="position"
          type="text"
          className={`${styles.input} ${fieldErrors.position ? styles.inputError : ''}`}
          value={formData.position}
          onChange={handleChange}
          placeholder="Ej. Tech Lead, HR Manager"
          disabled={isPending}
        />
        {fieldErrors.position && (
          <span className={styles.fieldError}>{fieldErrors.position}</span>
        )}
      </div>

      {/* ── Budget ── */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="budget">
          Presupuesto / Rango salarial *
        </label>
        <input
          id="budget"
          name="budget"
          type="text"
          className={`${styles.input} ${fieldErrors.budget ? styles.inputError : ''}`}
          value={formData.budget}
          onChange={handleChange}
          placeholder="$50k–$80k USD o Por definir"
          disabled={isPending}
        />
        {fieldErrors.budget && (
          <span className={styles.fieldError}>{fieldErrors.budget}</span>
        )}
      </div>

      {/* ── Preferred Contact ── */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="preferredContact">
          Medio de contacto preferido *
        </label>
        <select
          id="preferredContact"
          name="preferredContact"
          className={`${styles.select} ${fieldErrors.preferredContact ? styles.inputError : ''}`}
          value={formData.preferredContact}
          onChange={handleChange}
          disabled={isPending}
        >
          <option value="EMAIL">Email</option>
          <option value="PHONE">Teléfono</option>
          <option value="WHATSAPP">WhatsApp</option>
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
          Mensaje *
        </label>
        <textarea
          id="message"
          name="message"
          className={`${styles.textarea} ${fieldErrors.message ? styles.inputError : ''}`}
          value={formData.message}
          onChange={handleChange}
          placeholder="Cuénteme sobre la oportunidad, requisitos, y cualquier detalle relevante..."
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
            {error?.message ??
              'Ocurrió un error al enviar el formulario. Intente nuevamente.'}
          </p>
          <button
            type="button"
            className={styles.retryButton}
            onClick={handleRetry}
            disabled={isPending}
          >
            Intentar de nuevo
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
            Enviando...
          </span>
        ) : (
          'Enviar mensaje'
        )}
      </button>
    </form>
  );
}

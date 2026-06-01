import { useState } from 'react';
import { Button } from '@jsoft/shared';
import { useSubmitContact } from '../../hooks/useContact';
import { Spinner } from '../common/Spinner';
import styles from './ContactForm.module.css';

interface ContactFormProps {
  source?: string;
  onSuccess?: () => void;
}

export function ContactForm({ source = 'general', onSuccess }: ContactFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    whatsapp: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const { mutate: submitContact, isPending } = useSubmitContact({
    onSuccess: () => {
      setSuccess(true);
      setFormData({ firstName: '', lastName: '', email: '', whatsapp: '', message: '' });
      onSuccess?.();
    },
    onError: () => {
      setErrors({ submit: 'Error al enviar el formulario. Por favor, intenta de nuevo.' });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = 'El WhatsApp es requerido';
    }
    if (!formData.message.trim()) {
      newErrors.message = 'El mensaje es requerido';
    } else if (formData.message.length < 10) {
      newErrors.message = 'El mensaje debe tener al menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      submitContact({ ...formData, source });
    }
  };

  /* ── Renders a field with label + input + error ── */
  const renderField = ({
    id,
    label,
    type = 'text',
    value,
    placeholder,
    autoComplete,
    error,
  }: {
    id: string;
    label: string;
    type?: string;
    value: string;
    placeholder?: string;
    autoComplete?: string;
    error?: string;
  }) => (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={isPending}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        aria-invalid={error ? 'true' : undefined}
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );

  if (success) {
    return (
      <div className={styles.success}>
        <div className={styles.successIcon}>✓</div>
        <h3>¡Mensaje enviado!</h3>
        <p>Gracias por contactarme. Te responderé lo antes posible.</p>
        <button onClick={() => setSuccess(false)} className={styles.resetButton}>
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <div className={styles.row}>
        {renderField({ id: 'firstName', label: 'Nombre', value: formData.firstName, placeholder: 'Tu nombre', autoComplete: 'given-name', error: errors.firstName })}
        {renderField({ id: 'lastName', label: 'Apellido', value: formData.lastName, placeholder: 'Tu apellido', autoComplete: 'family-name', error: errors.lastName })}
      </div>

      {renderField({ id: 'email', label: 'Email', type: 'email', value: formData.email, placeholder: 'tu@email.com', autoComplete: 'email', error: errors.email })}

      {renderField({ id: 'whatsapp', label: 'WhatsApp', type: 'tel', value: formData.whatsapp, placeholder: '+57 300 123 4567', autoComplete: 'tel', error: errors.whatsapp })}

      <div className={styles.field}>
        <label htmlFor="message" className={styles.label}>
          Mensaje
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Cuéntame sobre tu proyecto..."
          rows={4}
          disabled={isPending}
          className={`${styles.textarea} ${errors.message ? styles.inputError : ''}`}
          aria-invalid={errors.message ? 'true' : undefined}
        />
        {errors.message && (
          <span className={styles.errorText}>{errors.message}</span>
        )}
      </div>

      {errors.submit && (
        <div className={styles.submitError}>{errors.submit}</div>
      )}

      <Button type="submit" disabled={isPending} className={styles.submitButton}>
        {isPending ? (
          <>
            <Spinner size="sm" /> Enviando...
          </>
        ) : (
          'Enviar mensaje'
        )}
      </Button>
    </form>
  );
}

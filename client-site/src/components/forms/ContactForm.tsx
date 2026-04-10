import { useState } from 'react';
import { Input, Button } from '@jsoft/shared';
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
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.row}>
        <Input
          id="firstName"
          name="firstName"
          label="Nombre"
          value={formData.firstName}
          onChange={handleChange}
          error={errors.firstName}
          placeholder="Tu nombre"
          required
        />
        <Input
          id="lastName"
          name="lastName"
          label="Apellido"
          value={formData.lastName}
          onChange={handleChange}
          error={errors.lastName}
          placeholder="Tu apellido"
          required
        />
      </div>

      <Input
        id="email"
        name="email"
        type="email"
        label="Email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="tu@email.com"
        required
      />

      <Input
        id="whatsapp"
        name="whatsapp"
        type="tel"
        label="WhatsApp"
        value={formData.whatsapp}
        onChange={handleChange}
        error={errors.whatsapp}
        placeholder="+57 300 123 4567"
        required
      />

      <div className={styles.textareaWrapper}>
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
          className={`${styles.textarea} ${errors.message ? styles.textareaError : ''}`}
          required
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

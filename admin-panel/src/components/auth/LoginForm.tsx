import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../i18n/LanguageContext';
import { Input, Button, ErrorMessage } from '@jsoft/shared';
import { toast } from 'sonner';

export function LoginForm() {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login({ username, password });
    if (success) {
      toast.success('Inicio de sesión exitoso');
      navigate('/dashboard');
    }
  };

  useEffect(() => {
    if (error) {
      toast.error(error || 'Error al iniciar sesión');
    }
  }, [error]);

  return (
    <form onSubmit={handleSubmit}>
      <Input
        id="username"
        label={t('auth.username')}
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <Input
        id="password"
        label={t('auth.password')}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <ErrorMessage message={error} />}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? t('auth.loggingIn') : t('auth.login')}
      </Button>
    </form>
  );
}
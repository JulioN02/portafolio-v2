import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Input, Button, ErrorMessage } from '@jsoft/shared';

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login({ username, password });
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        id="username"
        label="Username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <Input
        id="password"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <ErrorMessage message={error} />}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
}
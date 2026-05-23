import { Button } from '@jsoft/shared';
import { useAuth } from '../../hooks/useAuth';
import styles from './Header.module.css';

export function Header() {
  const { getUser, logout } = useAuth();
  const user = getUser();

  return (
    <header className={styles.header}>
      <div className={styles.userInfo}>
        <span className={styles.username}>
          {user?.username || 'Admin'}
        </span>
        <div className={styles.avatar}>
          {user?.username?.[0]?.toUpperCase() || 'A'}
        </div>
      </div>
      <Button variant="danger" size="sm" onClick={logout}>
        Cerrar sesión
      </Button>
    </header>
  );
}

import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import styles from './Layout.module.css';
import { ConsentBanner } from '../public/ConsentBanner';
import { StickyCta } from '../public/StickyCta';

export function Layout() {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
      <ConsentBanner />
      <StickyCta />
    </div>
  );
}

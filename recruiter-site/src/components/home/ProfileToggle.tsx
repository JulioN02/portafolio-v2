import { useState } from 'react';
import styles from './ProfileToggle.module.css';

type ProfileMode = 'professional' | 'technical';

const professionalText = `Soy un desarrollador Full Stack con más de 5 años de experiencia creando soluciones digitales para empresas de diversos sectores. Mi enfoque está en entender las necesidades del negocio y traducirlas en productos funcionales, escalables y mantenibles.

He liderado equipos de desarrollo, coordinado entregas ágiles y trabajado directamente con stakeholders para garantizar que cada proyecto cumpla con los objetivos de negocio. Me apasiona la calidad del código, la documentación clara y la comunicación efectiva entre equipos técnicos y no técnicos.

Mi experiencia abarca desde startups hasta proyectos enterprise, siempre con el compromiso de entregar valor real a través de la tecnología.`;

const technicalText = `Especializado en el ecosistema JavaScript/TypeScript con experiencia comprobada en React, Next.js y Node.js. Arquitectura de aplicaciones web modernas utilizando Server Components, API Routes, y patrones de estado con TanStack Query.

En el backend, domino Node.js con Express, bases de datos relacionales (PostgreSQL, Prisma ORM) y NoSQL (MongoDB). Experiencia en diseño de APIs RESTful, autenticación JWT, y despliegue con Docker.

Competencias técnicas destacadas:
• Frontend: React 19, Next.js 15, TypeScript, CSS Modules, Tailwind CSS
• Backend: Node.js, Express, PostgreSQL, Prisma, MongoDB
• DevOps: Docker, Linux, Git/GitHub Actions, CI/CD
• Testing: Jest, React Testing Library, Playwright
• Herramientas: Figma, VS Code, Postman, Linear`;

export function ProfileToggle() {
  const [mode, setMode] = useState<ProfileMode>('professional');
  const isProfessional = mode === 'professional';

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Sobre Mí</h2>

        <div className={styles.toggle}>
          <button
            className={`${styles.toggleBtn} ${isProfessional ? styles.active : ''}`}
            onClick={() => setMode('professional')}
            aria-pressed={isProfessional}
          >
            Perfil Profesional
          </button>
          <button
            className={`${styles.toggleBtn} ${!isProfessional ? styles.active : ''}`}
            onClick={() => setMode('technical')}
            aria-pressed={!isProfessional}
          >
            Perfil Técnico
          </button>
          <div
            className={styles.toggleIndicator}
            style={{
              transform: isProfessional ? 'translateX(0)' : 'translateX(100%)',
            }}
          />
        </div>

        <div className={styles.contentWrapper}>
          <div
            className={`${styles.content} ${isProfessional ? styles.visible : styles.hidden}`}
          >
            {professionalText.split('\n\n').map((paragraph, i) => (
              <p key={i} className={styles.paragraph}>{paragraph}</p>
            ))}
          </div>
          <div
            className={`${styles.content} ${!isProfessional ? styles.visible : styles.hidden}`}
          >
            {technicalText.split('\n\n').map((paragraph, i) => (
              <p key={i} className={styles.paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export interface TechGroup {
  category: string;
  icon: string;
  items: { name: string; level: string; color: string }[];
}

// CV-aligned tech stack (RHP-6): only items backed by the CV/profile.
export const techStack: TechGroup[] = [
  {
    category: 'Backend',
    icon: '⚙️',
    items: [
      { name: 'Node.js', level: 'Avanzado', color: '#339933' },
      { name: 'Express', level: 'Avanzado', color: '#000000' },
      { name: 'Nest.js', level: 'Intermedio', color: '#e0234e' },
      { name: 'PostgreSQL', level: 'Avanzado', color: '#336791' },
      { name: 'MySQL', level: 'Intermedio', color: '#00758f' },
      { name: 'Prisma', level: 'Avanzado', color: '#2d3748' },
      { name: 'JWT', level: 'Avanzado', color: '#000000' },
      { name: 'RBAC', level: 'Intermedio', color: '#4b5563' },
    ],
  },
  {
    category: 'Frontend',
    icon: '🖥️',
    items: [
      { name: 'React', level: 'Avanzado', color: '#61dafb' },
      { name: 'TypeScript', level: 'Avanzado', color: '#3178c6' },
    ],
  },
  {
    category: 'Metodologías',
    icon: '📐',
    items: [
      { name: 'TDD', level: 'Avanzado', color: '#3E985D' },
      { name: 'SDD', level: 'Avanzado', color: '#3E985D' },
      { name: 'DDD', level: 'Intermedio', color: '#3E985D' },
      { name: 'AI-assisted development', level: 'Avanzado', color: '#7CBD68' },
    ],
  },
  {
    category: 'Plataformas-DevOps',
    icon: '🛠️',
    items: [
      { name: 'Docker', level: 'Intermedio', color: '#2496ed' },
      { name: 'Linux', level: 'Avanzado', color: '#fcc624' },
      { name: 'Git/GitHub', level: 'Avanzado', color: '#f05032' },
      { name: 'CI/CD', level: 'Avanzado', color: '#4b5563' },
      { name: 'Vercel', level: 'Avanzado', color: '#000000' },
      { name: 'Supabase', level: 'Intermedio', color: '#3ecf8e' },
      { name: 'Jest', level: 'Avanzado', color: '#c21325' },
    ],
  },
];
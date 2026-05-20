export interface TechGroup {
  category: string;
  icon: string;
  items: { name: string; level: string; color: string }[];
}

export const techStack: TechGroup[] = [
  {
    category: 'Frontend',
    icon: '🖥️',
    items: [
      { name: 'React', level: 'Avanzado', color: '#61dafb' },
      { name: 'TypeScript', level: 'Avanzado', color: '#3178c6' },
      { name: 'Next.js', level: 'Avanzado', color: '#000000' },
      { name: 'Vue.js', level: 'Intermedio', color: '#4fc08d' },
      { name: 'Tailwind CSS', level: 'Avanzado', color: '#06b6d4' },
    ],
  },
  {
    category: 'Backend',
    icon: '⚙️',
    items: [
      { name: 'Node.js', level: 'Avanzado', color: '#339933' },
      { name: 'Express', level: 'Avanzado', color: '#000000' },
      { name: 'PostgreSQL', level: 'Avanzado', color: '#336791' },
      { name: 'Prisma', level: 'Avanzado', color: '#2d3748' },
      { name: 'MongoDB', level: 'Intermedio', color: '#47a248' },
    ],
  },
  {
    category: 'Complementarias',
    icon: '🛠️',
    items: [
      { name: 'Docker', level: 'Intermedio', color: '#2496ed' },
      { name: 'Git/GitHub', level: 'Avanzado', color: '#f05032' },
      { name: 'Linux', level: 'Avanzado', color: '#fcc624' },
      { name: 'Jest', level: 'Avanzado', color: '#c21325' },
      { name: 'Figma', level: 'Intermedio', color: '#f24e1e' },
    ],
  },
];

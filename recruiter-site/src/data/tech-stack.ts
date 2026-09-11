import {
  NodejsIcon,
  TypescriptIcon,
  ExpressIcon,
  NestjsIcon,
  PostgresqlIcon,
  MysqlIcon,
  PrismaIcon,
  DockerIcon,
  LinuxIcon,
  CicdIcon,
  GitIcon,
  ReactIcon,
  ViteIcon,
  VanillaIcon,
  HtmlcssIcon,
} from '../components/home/techStack/icons';

/** Shared props for tech stack icons (React SVG props). */
export interface TechIconProps extends React.SVGProps<SVGSVGElement> {}

export interface TechItem {
  id: string;
  labelKey: string;
  Icon: React.ComponentType<TechIconProps>;
}

export interface TechDomain {
  id: string;
  titleKey: string;
  items: TechItem[];
}

/** Data-driven tech stack: 4 system-layer domains, 15 technologies. */
export const DATA: TechDomain[] = [
  {
    id: 'backend',
    titleKey: 'techStack.domain.backend',
    items: [
      { id: 'nodejs', labelKey: 'techStack.item.nodejs', Icon: NodejsIcon },
      { id: 'typescript', labelKey: 'techStack.item.typescript', Icon: TypescriptIcon },
      { id: 'express', labelKey: 'techStack.item.express', Icon: ExpressIcon },
      { id: 'nestjs', labelKey: 'techStack.item.nestjs', Icon: NestjsIcon },
    ],
  },
  {
    id: 'data',
    titleKey: 'techStack.domain.data',
    items: [
      { id: 'postgresql', labelKey: 'techStack.item.postgresql', Icon: PostgresqlIcon },
      { id: 'mysql', labelKey: 'techStack.item.mysql', Icon: MysqlIcon },
      { id: 'prisma', labelKey: 'techStack.item.prisma', Icon: PrismaIcon },
    ],
  },
  {
    id: 'infrastructure',
    titleKey: 'techStack.domain.infrastructure',
    items: [
      { id: 'docker', labelKey: 'techStack.item.docker', Icon: DockerIcon },
      { id: 'linux', labelKey: 'techStack.item.linux', Icon: LinuxIcon },
      { id: 'cicd', labelKey: 'techStack.item.cicd', Icon: CicdIcon },
      { id: 'git', labelKey: 'techStack.item.git', Icon: GitIcon },
    ],
  },
  {
    id: 'frontend',
    titleKey: 'techStack.domain.frontend',
    items: [
      { id: 'react', labelKey: 'techStack.item.react', Icon: ReactIcon },
      { id: 'vite', labelKey: 'techStack.item.vite', Icon: ViteIcon },
      { id: 'vanilla', labelKey: 'techStack.item.vanilla', Icon: VanillaIcon },
      { id: 'htmlcss', labelKey: 'techStack.item.htmlcss', Icon: HtmlcssIcon },
    ],
  },
];

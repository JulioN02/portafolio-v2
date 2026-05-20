import { PrismaClient, PostStatus, FormOrigin } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting full seed...');

  // 1. Admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { password: hashedPassword },
    create: { username: 'admin', password: hashedPassword },
  });
  console.log('✅ Admin user: admin / admin123');

  // 2. Services
  const services = [
    {
      title: 'Desarrollo Web Full Stack',
      slug: 'desarrollo-web-full-stack',
      classification: 'Desarrollo',
      shortDescription: 'Creación de aplicaciones web completas con tecnologías modernas: React, Node.js, TypeScript, PostgreSQL.',
      fullDescription: '<h2>Desarrollo Web Full Stack</h2><p>Creamos aplicaciones web completas desde cero, usando las tecnologías más modernas del mercado. Nuestro stack incluye <strong>React 19</strong> para el frontend, <strong>Node.js + Express</strong> para el backend, <strong>TypeScript</strong> para type safety, y <strong>PostgreSQL</strong> como base de datos.</p><h3>¿Qué incluye?</h3><ul><li>Arquitectura modular y escalable</li><li>API RESTful documentada</li><li>Autenticación JWT</li><li>Panel administrativo</li><li>Despliegue en producción</li></ul><p>Ideal para negocios que quieren tener presencia web profesional con funcionalidades avanzadas.</p>',
      includedItems: ['Frontend React/Next.js', 'Backend Node.js + Express', 'Base de datos PostgreSQL', 'API REST documentada', 'Panel admin'],
      images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop'],
      order: 1, featured: true,
      technicalExplanation: '<p>Arquitectura cliente-servidor con React 19 + Vite en frontend, Express + Prisma ORM en backend. Comunicación vía REST API con TanStack Query para cache y estado. JWT para autenticación stateless. Despliegue en Railway con PostgreSQL integrado.</p>',
      technicalImages: ['https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop'],
    },
    {
      title: 'Diseño UI/UX Profesional',
      slug: 'diseno-ui-ux-profesional',
      classification: 'Diseño',
      shortDescription: 'Diseñamos interfaces modernas, accesibles y centradas en el usuario para maximizar conversiones.',
      fullDescription: '<h2>Diseño UI/UX Profesional</h2><p>El diseño de tu aplicación es la primera impresión que tus usuarios tienen de tu negocio. Nos especializamos en crear interfaces <strong>intuitivas</strong>, <strong>accesibles</strong> y <strong>visualmente atractivas</strong> que guían al usuario hacia sus objetivos.</p><h3>Nuestro proceso</h3><ol><li><strong>Investigación:</strong> Entendemos a tus usuarios y sus necesidades</li><li><strong>Wireframes:</strong> Estructuramos la información y el flujo</li><li><strong>Prototipos:</strong> Diseñamos interacciones reales</li><li><strong>Testing:</strong> Validamos con usuarios reales</li><li><strong>Implementación:</strong> Entregamos en Figma o código</li></ol>',
      includedItems: ['Investigación de usuarios', 'Wireframes interactivos', 'Prototipos en Figma', 'Design System', 'Guía de estilos'],
      images: ['https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&h=600&fit=crop'],
      order: 2, featured: true,
      technicalExplanation: '<p>Metodología Design Thinking con entregables en Figma. Componentes diseñados con atomic design. Sistema de diseño con tokens (colores, tipografía, spacing) implementado como CSS variables para consistencia entre frontends.</p>',
    },
    {
      title: 'Consultoría Tecnológica',
      slug: 'consultoria-tecnologica',
      classification: 'Consultoría',
      shortDescription: 'Asesoramos en la selección de tecnologías, arquitectura de software y mejores prácticas para tu proyecto.',
      fullDescription: '<h2>Consultoría Tecnológica</h2><p>¿No estás seguro de qué tecnología usar para tu próximo proyecto? Te ayudamos a tomar las mejores decisiones técnicas basadas en años de experiencia en la industria.</p><p>Ofrecemos:</p><ul><li>Auditoría de código y arquitectura</li><li>Selección de stack tecnológico</li><li>Revisión de seguridad</li><li>Optimización de performance</li><li>Code reviews</li></ul>',
      includedItems: ['Auditoría técnica', 'Recomendación de stack', 'Revisión de seguridad', 'Code review'],
      images: ['https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop'],
      order: 3, featured: false,
    },
    {
      title: 'Desarrollo de APIs y Microservicios',
      slug: 'desarrollo-apis-microservicios',
      classification: 'Desarrollo',
      shortDescription: 'APIs robustas, escalables y bien documentadas para potenciar tu ecosistema digital.',
      fullDescription: '<h2>Desarrollo de APIs</h2><p>Construimos APIs RESTful y GraphQL siguiendo las mejores prácticas de la industria: <strong>validación</strong>, <strong>autenticación</strong>, <strong>documentación OpenAPI</strong> y <strong>tests automatizados</strong>.</p>',
      includedItems: ['API REST/GraphQL', 'Documentación OpenAPI', 'Autenticación JWT', 'Tests automatizados', 'Rate limiting'],
      images: ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop'],
      order: 4, featured: false,
    },
  ];

  for (const svc of services) {
    await prisma.service.upsert({
      where: { slug: svc.slug },
      update: {},
      create: svc,
    });
  }
  console.log(`✅ ${services.length} services created`);

  // 3. Products
  const products = [
    {
      title: 'ERP JSoft',
      slug: 'erp-jsoft',
      classification: 'Enterprise',
      shortDescription: 'Sistema de planificación de recursos empresariales todo-en-uno para PyMEs.',
      fullDescription: '<h2>ERP JSoft</h2><p>Solución completa de gestión empresarial que integra <strong>facturación</strong>, <strong>inventario</strong>, <strong>RRHH</strong> y <strong>contabilidad</strong> en una sola plataforma.</p>',
      images: ['https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&h=600&fit=crop'],
      externalLink: 'https://github.com/jsoftsolutions/erp',
      order: 1, featured: true,
      technicalExplanation: '<p>Monolito modular con Node.js + Express. Frontend React con dashboard administrativo. PostgreSQL con Prisma ORM. Despliegue on-premise o cloud.</p>',
    },
    {
      title: 'CRM Comercial',
      slug: 'crm-comercial',
      classification: 'Enterprise',
      shortDescription: 'Gestión de clientes, ventas y pipeline comercial con reporting avanzado.',
      fullDescription: '<h2>CRM Comercial</h2><p>Administra tu relación con clientes de principio a fin. Desde la captación de leads hasta el seguimiento post-venta.</p>',
      images: ['https://images.unsplash.com/photo-1553729459-afe8f2e2c2b7?w=800&h=600&fit=crop'],
      externalLink: 'https://github.com/jsoftsolutions/crm',
      order: 2, featured: true,
    },
    {
      title: 'E-commerce Platform',
      slug: 'ecommerce-platform',
      classification: 'Digital',
      shortDescription: 'Plataforma de comercio electrónico personalizable con pasarela de pago integrada.',
      fullDescription: '<h2>E-commerce Platform</h2><p>Tu tienda online lista para vender. Con <strong>carrito de compras</strong>, <strong>pasarela de pago</strong>, <strong>panel de administración</strong> y <strong>reportes de ventas</strong>.</p>',
      images: ['https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop'],
      externalLink: null,
      order: 3, featured: false,
    },
  ];

  for (const prod of products) {
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {},
      create: prod,
    });
  }
  console.log(`✅ ${products.length} products created`);

  // 4. Tools
  const tools = [
    {
      title: 'JSoft CLI',
      slug: 'jsoft-cli',
      classification: 'Developer Tools',
      shortDescription: 'CLI para scaffolding rápido de proyectos Node.js + TypeScript con arquitectura modular.',
      fullDescription: '<h2>JSoft CLI</h2><p>Genera proyectos con nuestra arquitectura probada en segundos. Incluye configuración de TypeScript, ESLint, Prettier, Prisma y testing.</p>',
      images: ['https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&h=600&fit=crop'],
      requiresInstall: true,
      order: 1, featured: true,
    },
    {
      title: 'Component Library',
      slug: 'component-library',
      classification: 'UI',
      shortDescription: 'Librería de componentes React reutilizables con diseño atómico y CSS Modules.',
      fullDescription: '<h2>Component Library</h2><p>Colección de componentes UI diseñados para ser reutilizados en todos tus proyectos React. Incluye Button, Input, Card, Modal, Table, Pagination, Carousel y más.</p>',
      images: ['https://images.unsplash.com/photo-1617042370283-2b4c2c1a8f1f?w=800&h=600&fit=crop'],
      requiresInstall: false,
      order: 2, featured: true,
    },
    {
      title: 'API Template',
      slug: 'api-template',
      classification: 'Backend',
      shortDescription: 'Template de API REST con Express + TypeScript + Prisma + JWT listo para usar.',
      fullDescription: '<h2>API Template</h2><p>Punto de partida para tus APIs con todo lo necesario: autenticación, base de datos, validación, tests y documentación OpenAPI.</p>',
      images: ['https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=600&fit=crop'],
      requiresInstall: true,
      order: 3, featured: false,
    },
  ];

  for (const tool of tools) {
    await prisma.tool.upsert({
      where: { slug: tool.slug },
      update: {},
      create: tool,
    });
  }
  console.log(`✅ ${tools.length} tools created`);

  // 5. SuccessCases
  const cases = [
    {
      title: 'Transformación Digital - Grupo Comercial MX',
      slug: 'transformacion-digital-grupo-mx',
      description: 'Implementación de ERP y CRM para grupo comercial con 50+ usuarios. Reducción del 40% en tiempos de procesos administrativos.',
      images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop'],
      videos: [],
      links: ['https://ejemplo.com/caso1'],
    },
    {
      title: 'Plataforma E-learning - EducaPro',
      slug: 'plataforma-elearning-educapro',
      description: 'Desarrollo de plataforma de cursos online con 10,000+ estudiantes activos. Streaming de video en vivo, evaluaciones automatizadas y certificaciones digitales.',
      images: ['https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop'],
      videos: [],
      links: [],
    },
    {
      title: 'App Financiera - FinTech CR',
      slug: 'app-financiera-fintech-cr',
      description: 'Aplicación web de gestión financiera personal con conexión a APIs bancarias. +15,000 usuarios registrados en los primeros 3 meses.',
      images: ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=600&fit=crop'],
      videos: [],
      links: [],
    },
  ];

  for (const sc of cases) {
    await prisma.successCase.upsert({
      where: { slug: sc.slug },
      update: {},
      create: sc,
    });
  }
  console.log(`✅ ${cases.length} success cases created`);

  // 6. BlogPosts
  const posts = [
    {
      title: 'Cómo elegir el stack tecnológico para tu proyecto en 2026',
      slug: 'como-elegir-stack-tecnologico-2026',
      category: 'Desarrollo',
      shortDescription: 'Guía práctica para seleccionar las tecnologías adecuadas según el tipo de proyecto, presupuesto y equipo.',
      coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=450&fit=crop',
      mediaGallery: [],
      body: '<h2>La decisión más importante de tu proyecto</h2><p>Elegir el stack tecnológico es como elegir los cimientos de una casa. Una mala decisión puede costarte meses de trabajo y miles de dólares.</p><h3>Factores a considerar</h3><ul><li><strong>Tipo de proyecto:</strong> No es lo mismo un e-commerce que una app de tiempo real</li><li><strong>Equipo:</strong> ¿Tienes desarrolladores con experiencia en esas tecnologías?</li><li><strong>Escalabilidad:</strong> ¿Tu proyecto crecerá en los próximos años?</li><li><strong>Presupuesto:</strong> Algunas tecnologías tienen costos de infraestructura más altos</li></ul><h3>Nuestra recomendación para 2026</h3><p>Para la mayoría de proyectos web, recomendamos <strong>React + TypeScript + Node.js + PostgreSQL</strong>. Es un stack probado, con enorme comunidad y talento disponible.</p><blockquote>"El mejor stack no es el más popular, sino el que resuelve tu problema específico con la menor complejidad posible."</blockquote>',
      externalLink: 'https://github.com/jsoftsolutions/blog',
      lessonsLearned: '<p>Hemos visto proyectos exitosos con tecnologías "no populares" y fracasos con stacks de moda. La clave está en alinear la tecnología con el problema de negocio.</p>',
      status: PostStatus.PUBLISHED,
      publishedAt: new Date('2026-04-15'),
    },
    {
      title: 'Arquitectura Limpia en Proyectos React: Guía Práctica',
      slug: 'arquitectura-limpia-react-guia',
      category: 'Arquitectura',
      shortDescription: 'Aprende a estructurar tus proyectos React para que sean mantenibles, testables y escalables.',
      coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=450&fit=crop',
      mediaGallery: [],
      body: '<h2>Organización de proyectos React</h2><p>La forma en que organizas tu proyecto React determina qué tan fácil será mantenerlo, testearlo y escalarlo en el tiempo.</p><h3>Estructura recomendada</h3><pre><code>src/\n├── api/       # Capa de comunicación con backend\n├── components/# Componentes reutilizables\n├── hooks/     # Lógica de estado y efectos\n├── pages/     # Páginas/rutas de la aplicación\n├── styles/    # Estilos globales y variables\n└── types/     # Tipos TypeScript compartidos</code></pre><p>Esta separación por <strong>responsabilidades</strong> (no por características) permite que cada capa sea testeable de forma independiente.</p>',
      externalLink: null,
      lessonsLearned: '<p>La estructura por tipo (api/, components/, hooks/) escala mejor que la estructura por feature cuando tienes múltiples desarrolladores. Es más fácil encontrar archivos y mantener consistencia.</p>',
      status: PostStatus.PUBLISHED,
      publishedAt: new Date('2026-03-20'),
    },
    {
      title: 'TypeScript 5.8: Novedades y Mejores Prácticas',
      slug: 'typescript-58-novedades',
      category: 'TypeScript',
      shortDescription: 'Resumen de las características más importantes de TypeScript 5.8 y cómo aprovecharlas en tus proyectos.',
      coverImage: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=450&fit=crop',
      mediaGallery: [],
      body: '<h2>TypeScript 5.8 ya está aquí</h2><p>La nueva versión de TypeScript trae mejoras significativas en rendimiento, inferencia de tipos y nuevas características que hacen el desarrollo más seguro y productivo.</p><h3>Principales novedades</h3><ul><li><strong>const type parameters:</strong> Mejor inferencia en genéricos</li><li><strong>--isolatedDeclarations:</strong> Compilación más rápida</li><li><strong>Mejoras en intellisense:</strong> Auto-completado más preciso</li></ul>',
      externalLink: 'https://devblogs.microsoft.com/typescript/',
      lessonsLearned: '<p>Actualizar TypeScript siempre trae mejoras. Nuestra regla: mantener la versión estable más reciente y migrar con cuidado, probando el build completo antes de hacer merge.</p>',
      status: PostStatus.DRAFT,
    },
  ];

  for (const post of posts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    });
  }
  console.log(`✅ ${posts.length} blog posts created`);

  // 7. ContactForms (sample)
  const contacts = [
    {
      firstName: 'Carlos',
      lastName: 'Mendoza',
      whatsapp: '+5215551234567',
      email: 'carlos@ejemplo.com',
      message: 'Hola, me interesa el servicio de Desarrollo Web Full Stack para mi empresa de logística. ¿Podemos agendar una llamada?',
      source: 'service:desarrollo-web-full-stack',
      originType: FormOrigin.CLIENT,
    },
    {
      firstName: 'Ana',
      lastName: 'López',
      whatsapp: '+50688887777',
      email: 'ana@techcr.com',
      message: 'Estamos buscando desarrollador para un proyecto de 6 meses. Adjunto mi LinkedIn para que vean mi perfil.',
      source: 'recruiter',
      originType: FormOrigin.RECRUITER,
    },
  ];

  for (const contact of contacts) {
    await prisma.contactForm.create({ data: contact });
  }
  console.log(`✅ ${contacts.length} contact forms created`);

  console.log('\n🎉 Seed completado exitosamente!');
  console.log('   Admin: admin / admin123');
  console.log(`   ${services.length} services`);
  console.log(`   ${products.length} products`);
  console.log(`   ${tools.length} tools`);
  console.log(`   ${cases.length} success cases`);
  console.log(`   ${posts.length} blog posts`);
  console.log(`   ${contacts.length} contact forms`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
    },
  });

  console.log('✅ Admin user created:', admin.username);

  // Create sample service for testing
  const service = await prisma.service.upsert({
    where: { slug: 'desarrollo-web-personalizado' },
    update: {},
    create: {
      title: 'Desarrollo Web Personalizado',
      slug: 'desarrollo-web-personalizado',
      classification: 'Desarrollo',
      shortDescription: 'Creación de sitios web y aplicaciones web a medida para tu negocio.',
      fullDescription: '<p>Servicio de desarrollo web personalizado...</p>',
      includedItems: ['Diseño responsive', 'Optimización SEO', 'Soporte técnico'],
      images: ['https://placehold.co/800x600/2563eb/white?text=Web+Development'],
      status: 'DRAFT',
      technicalExplanation: '<p>Desarrollado con React, Node.js y PostgreSQL...</p>',
    },
  });

  console.log('✅ Sample service created:', service.title);

  // Seed demo projects (tags-based classification — no type enum)
  const demoProjects = [
    {
      title: 'Portafolio Web v2',
      slug: 'portafolio-web-v2',
      shortDescription: 'Sitio web de portafolio profesional con panel de administración y API REST propia.',
      body: '<p>Proyecto que integra un panel de administración, una API REST y un sitio público para presentar servicios, productos, herramientas y casos de éxito.</p><p>Construido con React, Node.js, Express, Prisma y PostgreSQL.</p>',
      images: ['https://placehold.co/800x600/2563eb/white?text=Portafolio+Web'],
      repositoryUrl: 'https://github.com/jsoftsolutions/portafolio-v2',
      tags: ['proyecto-profesional', 'web'],
      featured: true,
      order: 1,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
    {
      title: 'API de Facturación Electrónica',
      slug: 'api-facturacion-electronica',
      shortDescription: 'API REST para la emisión de facturas electrónicas con validación de esquemas XML.',
      body: '<p>API REST desarrollada con Express y Prisma que permite emitir facturas electrónicas, validar esquemas XML y generar representaciones impresas.</p><p>Incluye autenticación JWT y documentación OpenAPI.</p>',
      images: ['https://placehold.co/800x600/16a34a/white?text=API+Facturacion'],
      repositoryUrl: 'https://github.com/jsoftsolutions/api-facturacion',
      tags: ['proyecto-rapido', 'api'],
      featured: false,
      order: 2,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
    {
      title: 'Simulador de Circuitos Eléctricos',
      slug: 'simulador-circuitos-electricos',
      shortDescription: 'Simulador interactivo de circuitos eléctricos diseñado para fines pedagógicos.',
      body: '<p>Simulador HTML/CSS/JS para la enseñanza de circuitos eléctricos básicos, con componentes interactivos y retroalimentación inmediata.</p><p>Usado en clases de física y tecnología.</p>',
      images: ['https://placehold.co/800x600/dc2626/white?text=Simulador'],
      repositoryUrl: 'https://github.com/jsoftsolutions/simulador-circuitos',
      tags: ['pedagogico', 'simulador'],
      featured: false,
      order: 3,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  ];

  for (const project of demoProjects) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: {},
      create: project,
    });
  }

  console.log(`✅ ${demoProjects.length} demo projects created`);

  // Seed default site sections
  const defaultSections = [
    { key: 'services', label: 'Servicios', visible: true, order: 0 },
    { key: 'products', label: 'Productos', visible: true, order: 1 },
    { key: 'tools', label: 'Herramientas', visible: true, order: 2 },
    { key: 'success-cases', label: 'Casos de Éxito', visible: true, order: 3 },
  ];

  for (const section of defaultSections) {
    await prisma.siteSection.upsert({
      where: { key: section.key },
      update: {},
      create: section,
    });
  }

  console.log('✅ Default site sections created');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
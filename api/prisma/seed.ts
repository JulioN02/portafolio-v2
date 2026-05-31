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
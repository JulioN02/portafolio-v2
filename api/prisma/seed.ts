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
      order: 1,
      featured: true,
      technicalExplanation: '<p>Desarrollado con React, Node.js y PostgreSQL...</p>',
    },
  });

  console.log('✅ Sample service created:', service.title);

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
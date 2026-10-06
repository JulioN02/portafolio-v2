/**
 * Focused backfill: creates the canonical homepage situations and links
 * existing non-deleted services by classification (max 3 per situation,
 * overflow left unlinked + flagged). Idempotent; does NOT touch users,
 * demo projects, sections or other content. Run: tsx prisma/backfill-situations.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SITUATION_SEED = [
  { title: 'No aparezco en Internet', description: 'Gana visibilidad y una presencia digital que explique tu propuesta.', order: 0 },
  { title: 'Muestro mis productos solo por redes', description: 'Convierte tu catálogo en una experiencia clara para explorar y comprar.', order: 1 },
  { title: 'Pierdo reservas o pedidos', description: 'Organiza solicitudes, citas y pedidos para que nada se pierda.', order: 2 },
  { title: 'Tengo procesos manuales', description: 'Reduce tareas repetitivas y recupera tiempo para atender tu negocio.', order: 3 },
  { title: 'Necesito un sistema', description: 'Ordena tu operación con una herramienta alineada a tu forma de trabajar.', order: 4 },
  { title: 'Necesito soporte tecnológico', description: 'Protege la continuidad de tus herramientas y resuelve incidencias con orden.', order: 5 },
];

const classificationToSituationTitle: Record<string, string> = {
  'desarrollo web': 'No aparezco en Internet',
  'presencia': 'No aparezco en Internet',
  'comercio electrónico': 'Muestro mis productos solo por redes',
  'comercio': 'Muestro mis productos solo por redes',
  'automatización': 'Pierdo reservas o pedidos',
  'automatizacion': 'Pierdo reservas o pedidos',
  'operacion': 'Pierdo reservas o pedidos',
  'operación': 'Pierdo reservas o pedidos',
  'sistemas a la medida': 'Necesito un sistema',
  'soporte tecnológico': 'Necesito soporte tecnológico',
  'soporte tecnologico': 'Necesito soporte tecnológico',
  'tecnologia': 'Necesito soporte tecnológico',
  'tecnología': 'Necesito soporte tecnológico',
};

async function main() {
  const situationByTitle = new Map<string, string>();
  for (const situation of SITUATION_SEED) {
    const row = await prisma.situation.upsert({
      where: { id: `seed-${situation.order}` },
      update: {},
      create: {
        id: `seed-${situation.order}`,
        title: situation.title,
        description: situation.description,
        active: true,
        order: situation.order,
      },
    });
    situationByTitle.set(situation.title, row.id);
  }
  console.log(`✅ ${SITUATION_SEED.length} situations ensured`);

  const existingServices = await prisma.service.findMany({
    where: { deletedAt: null },
    select: { id: true, classification: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const perSituation: Record<string, string[]> = {};
  const overflow: string[] = [];
  for (const service of existingServices) {
    const title = classificationToSituationTitle[service.classification.trim().toLocaleLowerCase()];
    const situationId = title ? situationByTitle.get(title) : undefined;
    if (!situationId) continue;
    const bucket = perSituation[situationId] ?? (perSituation[situationId] = []);
    if (bucket.length < 3) {
      bucket.push(service.id);
    } else {
      overflow.push(service.id);
    }
  }

  for (const [situationId, serviceIds] of Object.entries(perSituation)) {
    await prisma.service.updateMany({
      where: { id: { in: serviceIds }, deletedAt: null },
      data: { situationId },
    });
  }
  console.log(`✅ ${existingServices.length} services reviewed, ${Object.values(perSituation).flat().length} linked`);
  if (overflow.length > 0) {
    console.warn(`⚠️ ${overflow.length} service(s) exceeded the 3-per-situation limit and were left unlinked: ${overflow.join(', ')}`);
  }
  console.log('✅ Situation backfill completed');
}

main()
  .catch((error) => {
    console.error('❌ Backfill failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
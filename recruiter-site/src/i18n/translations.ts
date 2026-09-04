export type Language = 'es' | 'en';

export const translations: Record<Language, Record<string, string>> = {
  es: {
    // =========== HEADER ===========
    'nav.home': 'Inicio',
    'nav.projects': 'Proyectos',
    'nav.blog': 'Blog',
    'nav.contact': 'Contacto',
    'nav.toggleMenu': 'Toggle menu',
    'nav.toggleLang': 'Cambiar idioma',

    // =========== FOOTER ===========
    'footer.tagline': 'Desarrollo de software a medida. Transformamos tus ideas en soluciones digitales escalables y de alto impacto.',
    'footer.links': 'Enlaces',
    'footer.social': 'Redes',
    'footer.copyright': '© {year} J Soft Solutions. Todos los derechos reservados.',
    'footer.madeIn': 'Hecho con ❤️ en Colombia',
    'footer.privacy': 'Privacidad',
    'footer.terms': 'Términos',

    // =========== HOME ===========
    'home.meta.title': 'Julio Nieto | Ingeniero de Sistemas y Desarrollador Backend',
    'home.meta.description': 'Ingeniero de Sistemas y Desarrollador Backend. Consultor independiente y ex Coordinador Logístico Nacional. Node.js, TypeScript, PostgreSQL y más.',

    'home.cta.title': '¿Listo para trabajar juntos?',
    'home.cta.text': 'Estoy abierto a nuevas oportunidades laborales y proyectos desafiantes. Si buscas un desarrollador comprometido con la calidad y los resultados, hablemos.',
    'home.cta.button': 'Contáctame',

    // =========== PROJECTS ===========
    'projects.meta.title': 'Proyectos | Julio Nieto',
    'projects.meta.description': 'Explora los proyectos en los que he trabajado como desarrollador backend e ingeniero de sistemas.',

    // =========== CONTACT ===========
    'contact.title': 'Contacto',
    'contact.subtitle': '¿Interesado en mis servicios? Complete el formulario y me pondré en contacto a la brevedad.',
    'contact.backLink': '← Volver al inicio',
    'contact.alternative': 'También puedes contactarme por',

    // =========== BLOG ===========
    'blog.meta.title': 'Blog | Julio Nieto',
    'blog.meta.description': 'Artículos sobre desarrollo backend, ingeniería de software, metodologías y tecnología.',
    'blog.searchPlaceholder': 'Buscar artículos…',
    'blog.searchAriaLabel': 'Buscar artículos',
    'blog.categoryAriaLabel': 'Filtrar por categoría',
    'blog.categoryAll': 'Todas las categorías',
    'blog.tagFilterAriaLabel': 'Filtrar artículos por etiqueta',
    'blog.tagAll': 'Todas las etiquetas',

    // =========== BLOG POST ===========
    'blogPost.backLink': '← Volver al blog',
    'blogPost.notFound.title': 'Artículo no encontrado',
    'blogPost.notFound.message': 'El artículo que buscas no existe o ha sido eliminado.',
    'blogPost.error.message': 'Error al cargar el artículo.',
    'blogPost.viewAll': 'Ver todos los artículos',

    // =========== NOT FOUND ===========
    'notFound.meta.title': '404 - Página no encontrada | Julio Nieto',
    'notFound.code': '404',
    'notFound.title': 'Página no encontrada',
    'notFound.description': 'La página que buscas no existe o ha sido movida.',
    'notFound.homeButton': 'Volver al inicio',

    // =========== HERO ===========
    'hero.title': 'Ingeniero de Sistemas | Desarrollador Backend',
    'hero.summary': 'Ingeniero de Sistemas enfocado en desarrollo backend. Construyo APIs, integraciones y sistemas web robustos con Node.js, TypeScript y bases de datos relacionales, aplicando TDD y buenas prácticas de arquitectura.',
    'hero.cta.primary': 'Ver Proyectos',
    'hero.cta.secondary': 'Contactar',

    // =========== PROFILE TOGGLE ===========
    'profileToggle.sectionTitle': 'Sobre Mí',
    'profileToggle.professional': 'Perfil Profesional',
    'profileToggle.technical': 'Perfil Técnico',
    'profileToggle.professionalText': 'Soy Ingeniero de Sistemas y desarrollador backend. Desde Ene 2025 trabajo como consultor independiente en desarrollo de software, diseñando y construyendo APIs, integraciones y sistemas web robustos con Node.js, TypeScript y bases de datos relacionales.\n\nAntes de dedicarme al desarrollo, me desempeñé como Coordinador Logístico Nacional entre Ene 2018 y Ene 2025, un rol donde la disponibilidad y la trazabilidad de la información eran críticas para la operación. Esa experiencia me enseñó a priorizar la confiabilidad, el orden y la comunicación clara, valores que hoy aplico a cada proyecto de software.\n\nMe enfoco en la calidad: pruebas automatizadas, documentación clara y arquitectura mantenible.',
    'profileToggle.technicalText': 'Especializado en el ecosistema JavaScript/TypeScript con enfoque backend. Construyo APIs RESTful con Node.js y Express, modelado de datos con PostgreSQL y Prisma, y autenticación con JWT y control de acceso basado en roles (RBAC).\n\nAplico TDD (desarrollo guiado por pruebas), SDD (desarrollo guiado por especificaciones) y DDD (diseño dirigido por el dominio) para entregar software confiable y mantenible. También integro desarrollo asistido por IA para acelerar tareas repetitivas sin sacrificar calidad.\n\nCompetencias técnicas destacadas:\n• Backend: Node.js, Express, Nest.js, PostgreSQL, MySQL, Prisma, JWT, RBAC\n• Frontend: React, TypeScript\n• DevOps: Docker, Linux, Git/GitHub, CI/CD, Vercel, Supabase\n• Metodologías: TDD, SDD, DDD\n• Testing: Jest',

    // =========== TECH STACK ===========
    'techStack.title': 'Tech Stack',
    'techStack.subtitle': 'Tecnologías con las que trabajo día a día',
    'techStack.slideAria': 'Ir a {category}',

    // =========== TIMELINE ===========
    'timeline.experienceTitle': 'Experiencia',
    'timeline.educationTitle': 'Educación',
    'timeline.languagesTitle': 'Idiomas',
    'timeline.exp.0.role': 'Consultor independiente',
    'timeline.exp.0.org': 'Desarrollo de software',
    'timeline.exp.0.period': 'Ene 2025 – presente',
    'timeline.exp.0.dateTime': '2025-01',
    'timeline.exp.1.role': 'Coordinador Logístico Nacional',
    'timeline.exp.1.org': 'Operación logística',
    'timeline.exp.1.period': 'Ene 2018 – 2025',
    'timeline.exp.1.dateTime': '2018-01',
    'timeline.exp.1.metric': '100% disponibilidad/trazabilidad',
    'timeline.exp.2.role': 'Soporte técnico',
    'timeline.exp.2.org': 'Movexa',
    'timeline.exp.3.role': 'Operador',
    'timeline.exp.3.org': 'Homecenter',
    'timeline.edu.0.role': 'Ingeniería de Sistemas',
    'timeline.edu.0.org': 'UNAD',
    'timeline.edu.0.period': '2023 – 2028',
    'timeline.edu.0.dateTime': '2023-01',
    'timeline.edu.1.role': 'Desarrollo backend y JavaScript',
    'timeline.edu.1.org': 'PLATZI',
    'timeline.edu.1.period': '2025 – 2026',
    'timeline.edu.1.dateTime': '2025-01',
    'timeline.edu.2.role': 'Desarrollo web',
    'timeline.edu.2.org': 'TodoCode',
    'timeline.edu.2.period': '2024',
    'timeline.edu.2.dateTime': '2024-01',
    'timeline.languages': 'Español (nativo) · Inglés (A2)',

    // =========== STATS STRIP ===========
    'statsStrip.title': 'Cifras que respaldan mi trabajo',
    'statsStrip.availability': 'Disponibilidad y trazabilidad',
    'statsStrip.logisticsYears': 'Años en coordinación logística nacional',
    'statsStrip.techCount': 'Tecnologías en mi stack',
    'statsStrip.englishLevel': 'Nivel de inglés',

    // =========== CONTACT STRIP ===========
    'contactStrip.title': 'Contacto directo',
    'contactStrip.email': 'Correo',
    'contactStrip.phone': 'Teléfono',
    'contactStrip.whatsapp': 'WhatsApp',
    'contactStrip.linkedin': 'LinkedIn',
    'contactStrip.cv': 'Descargar CV',
    'contactStrip.cvAria': 'Descargar CV (PDF)',

    // =========== RECENT PROJECTS ===========
    'recentProjects.title': 'Proyectos Recientes',
    'recentProjects.subtitle': 'Conoce algunos de los proyectos en los que he trabajado',
    'recentProjects.loading': 'Cargando proyectos...',
    'recentProjects.error': 'No se pudieron cargar los proyectos.',
    'recentProjects.errorDetail': 'Error de conexión',
    'recentProjects.empty': 'Aún no hay proyectos publicados.',
    'recentProjects.viewAll': 'Ver todos los proyectos →',

    // =========== BLOG GRID ===========
    'blogGrid.error': 'No se pudieron cargar los artículos.',
    'blogGrid.errorDetail': 'Error de conexión',
    'blogGrid.retry': 'Intentar de nuevo',
    'blogGrid.empty': 'No hay artículos publicados aún.',
    'blogGrid.emptyDetail': 'Vuelve pronto para leer las últimas publicaciones.',
    'blogGrid.prevPage': '« Anterior',
    'blogGrid.nextPage': 'Siguiente »',
    'blogGrid.prevAria': 'Página anterior',
    'blogGrid.nextAria': 'Página siguiente',
    'blogGrid.pageAria': 'Ir a página {page}',
    'blogGrid.resultsCount.one': '{count} artículo publicado',
    'blogGrid.resultsCount.other': '{count} artículos publicados',

    // =========== BLOG POST CONTENT ===========
    'blogPostContent.galleryTitle': 'Galería',
    'blogPostContent.lessonsTitle': 'Lecciones aprendidas',
    'blogPostContent.externalLink': 'Ver proyecto relacionado',
    'blogPostContent.carousel.pause': 'Pausar',
    'blogPostContent.carousel.play': 'Reanudar',
    'blogPostContent.carousel.prev': 'Imagen anterior',
    'blogPostContent.carousel.next': 'Imagen siguiente',
    'blogPostContent.lightbox.close': 'Cerrar',
    'blogPostContent.lightbox.prev': 'Anterior',
    'blogPostContent.lightbox.next': 'Siguiente',
    'blogPostContent.lightbox.counter': '{current} de {total}',
    'blogPostContent.lightbox.dialogLabel': 'Visor de imágenes',
    'blogPostContent.media.expand': 'Ampliar',
    'blogPostContent.galleryImageAlt': '{title} — Imagen {index} de {total}',

    // =========== BLOG CARD ===========
    'blogCard.readArticle': 'Leer artículo: {title}',

    // =========== CONTACT FORM ===========
    'contactForm.nameLabel': 'Nombre completo *',
    'contactForm.namePlaceholder': 'Ej. Juan Pérez',
    'contactForm.emailLabel': 'Correo electrónico *',
    'contactForm.emailPlaceholder': 'ejemplo@correo.com',
    'contactForm.phoneLabel': 'Teléfono *',
    'contactForm.phonePlaceholder': '+57 300 000 0000',
    'contactForm.companyLabel': 'Empresa *',
    'contactForm.companyPlaceholder': 'Nombre de la empresa',
    'contactForm.positionLabel': 'Cargo *',
    'contactForm.positionPlaceholder': 'Ej. Tech Lead, HR Manager',
    'contactForm.budgetLabel': 'Presupuesto / Rango salarial *',
    'contactForm.budgetPlaceholder': '$50k–$80k USD o Por definir',
    'contactForm.preferredContactLabel': 'Medio de contacto preferido *',
    'contactForm.messageLabel': 'Mensaje *',
    'contactForm.messagePlaceholder': 'Cuénteme sobre la oportunidad, requisitos, y cualquier detalle relevante...',
    'contactForm.option.email': 'Email',
    'contactForm.option.phone': 'Teléfono',
    'contactForm.option.whatsapp': 'WhatsApp',
    'contactForm.submit': 'Enviar mensaje',
    'contactForm.submitting': 'Enviando...',
    'contactForm.success.title': '¡Mensaje enviado!',
    'contactForm.error.nameRequired': 'El nombre es obligatorio',
    'contactForm.error.emailRequired': 'El correo electrónico es obligatorio',
    'contactForm.error.emailInvalid': 'Ingrese un correo electrónico válido',
    'contactForm.error.phoneRequired': 'El teléfono es obligatorio',
    'contactForm.error.phoneInvalid': 'Ingrese un número de teléfono válido (ej. +57 300 000 0000)',
    'contactForm.error.companyRequired': 'La empresa es obligatoria',
    'contactForm.error.positionRequired': 'El cargo es obligatorio',
    'contactForm.error.budgetRequired': 'El presupuesto es obligatorio',
    'contactForm.error.messageRequired': 'El mensaje es obligatorio',
    'contactForm.error.preferredContactRequired': 'Seleccione un medio de contacto preferido',
    'contactForm.error.generic': 'Ocurrió un error al enviar el formulario. Intente nuevamente.',
    'contactForm.error.retry': 'Intentar de nuevo',
  },
  en: {
    // =========== HEADER ===========
    'nav.home': 'Home',
    'nav.projects': 'Projects',
    'nav.blog': 'Blog',
    'nav.contact': 'Contact',
    'nav.toggleMenu': 'Toggle menu',
    'nav.toggleLang': 'Switch language',

    // =========== FOOTER ===========
    'footer.tagline': 'Custom software development. We turn your ideas into scalable, high-impact digital solutions.',
    'footer.links': 'Links',
    'footer.social': 'Social',
    'footer.copyright': '© {year} J Soft Solutions. All rights reserved.',
    'footer.madeIn': 'Made with ❤️ in Colombia',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',

    // =========== HOME ===========
    'home.meta.title': 'Julio Nieto | Systems Engineer and Backend Developer',
    'home.meta.description': 'Systems Engineer and Backend Developer. Independent consultant and former National Logistics Coordinator. Node.js, TypeScript, PostgreSQL and more.',

    'home.cta.title': 'Ready to work together?',
    'home.cta.text': "I'm open to new job opportunities and challenging projects. If you're looking for a developer committed to quality and results, let's talk.",
    'home.cta.button': 'Contact Me',

    // =========== PROJECTS ===========
    'projects.meta.title': 'Projects | Julio Nieto',
    'projects.meta.description': 'Explore the projects I have worked on as a backend developer and systems engineer.',

    // =========== CONTACT ===========
    'contact.title': 'Contact',
    'contact.subtitle': 'Interested in my services? Fill out the form and I will get back to you shortly.',
    'contact.backLink': '← Back to home',
    'contact.alternative': 'You can also reach me at',

    // =========== BLOG ===========
    'blog.meta.title': 'Blog | Julio Nieto',
    'blog.meta.description': 'Articles about backend development, software engineering, methodologies and technology.',
    'blog.searchPlaceholder': 'Search articles…',
    'blog.searchAriaLabel': 'Search articles',
    'blog.categoryAriaLabel': 'Filter by category',
    'blog.categoryAll': 'All categories',
    'blog.tagFilterAriaLabel': 'Filter articles by tag',
    'blog.tagAll': 'All tags',

    // =========== BLOG POST ===========
    'blogPost.backLink': '← Back to blog',
    'blogPost.notFound.title': 'Article not found',
    'blogPost.notFound.message': 'The article you are looking for does not exist or has been removed.',
    'blogPost.error.message': 'Error loading the article.',
    'blogPost.viewAll': 'View all articles',

    // =========== NOT FOUND ===========
    'notFound.meta.title': '404 - Page Not Found | Julio Nieto',
    'notFound.code': '404',
    'notFound.title': 'Page Not Found',
    'notFound.description': 'The page you are looking for does not exist or has been moved.',
    'notFound.homeButton': 'Go back home',

    // =========== HERO ===========
    'hero.title': 'Systems Engineer | Backend Developer',
    'hero.summary': 'Systems Engineer focused on backend development. I build robust APIs, integrations and web systems with Node.js, TypeScript and relational databases, applying TDD and sound architecture practices.',
    'hero.cta.primary': 'View Projects',
    'hero.cta.secondary': 'Contact Me',

    // =========== PROFILE TOGGLE ===========
    'profileToggle.sectionTitle': 'About Me',
    'profileToggle.professional': 'Professional Profile',
    'profileToggle.technical': 'Technical Profile',
    'profileToggle.professionalText': "I am a Systems Engineer and backend developer. Since January 2025 I have been working as an independent software development consultant, designing and building robust APIs, integrations and web systems with Node.js, TypeScript and relational databases.\n\nBefore moving into development, I worked as National Logistics Coordinator from January 2018 to January 2025, a role where information availability and traceability were critical to operations. That experience taught me to prioritize reliability, order and clear communication — values I apply to every software project today.\n\nI focus on quality: automated testing, clear documentation and maintainable architecture.",
    'profileToggle.technicalText': "Specialized in the JavaScript/TypeScript ecosystem with a backend focus. I build RESTful APIs with Node.js and Express, data modeling with PostgreSQL and Prisma, and authentication with JWT and role-based access control (RBAC).\n\nI apply TDD (test-driven development), SDD (spec-driven development) and DDD (domain-driven design) to deliver reliable, maintainable software. I also integrate AI-assisted development to speed up repetitive tasks without sacrificing quality.\n\nKey technical skills:\n• Backend: Node.js, Express, Nest.js, PostgreSQL, MySQL, Prisma, JWT, RBAC\n• Frontend: React, TypeScript\n• DevOps: Docker, Linux, Git/GitHub, CI/CD, Vercel, Supabase\n• Methodologies: TDD, SDD, DDD\n• Testing: Jest",

    // =========== TECH STACK ===========
    'techStack.title': 'Tech Stack',
    'techStack.subtitle': 'Technologies I work with every day',
    'techStack.slideAria': 'Go to {category}',

    // =========== TIMELINE ===========
    'timeline.experienceTitle': 'Experience',
    'timeline.educationTitle': 'Education',
    'timeline.languagesTitle': 'Languages',
    'timeline.exp.0.role': 'Independent Consultant',
    'timeline.exp.0.org': 'Software development',
    'timeline.exp.0.period': 'Jan 2025 – present',
    'timeline.exp.0.dateTime': '2025-01',
    'timeline.exp.1.role': 'National Logistics Coordinator',
    'timeline.exp.1.org': 'Logistics operations',
    'timeline.exp.1.period': 'Jan 2018 – 2025',
    'timeline.exp.1.dateTime': '2018-01',
    'timeline.exp.1.metric': '100% availability/traceability',
    'timeline.exp.2.role': 'Technical Support',
    'timeline.exp.2.org': 'Movexa',
    'timeline.exp.3.role': 'Operator',
    'timeline.exp.3.org': 'Homecenter',
    'timeline.edu.0.role': 'Systems Engineering',
    'timeline.edu.0.org': 'UNAD',
    'timeline.edu.0.period': '2023 – 2028',
    'timeline.edu.0.dateTime': '2023-01',
    'timeline.edu.1.role': 'Backend development and JavaScript',
    'timeline.edu.1.org': 'PLATZI',
    'timeline.edu.1.period': '2025 – 2026',
    'timeline.edu.1.dateTime': '2025-01',
    'timeline.edu.2.role': 'Web development',
    'timeline.edu.2.org': 'TodoCode',
    'timeline.edu.2.period': '2024',
    'timeline.edu.2.dateTime': '2024-01',
    'timeline.languages': 'Spanish (native) · English (A2)',

    // =========== STATS STRIP ===========
    'statsStrip.title': 'Numbers that back my work',
    'statsStrip.availability': 'Availability and traceability',
    'statsStrip.logisticsYears': 'Years in national logistics coordination',
    'statsStrip.techCount': 'Technologies in my stack',
    'statsStrip.englishLevel': 'English level',

    // =========== CONTACT STRIP ===========
    'contactStrip.title': 'Direct contact',
    'contactStrip.email': 'Email',
    'contactStrip.phone': 'Phone',
    'contactStrip.whatsapp': 'WhatsApp',
    'contactStrip.linkedin': 'LinkedIn',
    'contactStrip.cv': 'Download CV',
    'contactStrip.cvAria': 'Download CV (PDF)',

    // =========== RECENT PROJECTS ===========
    'recentProjects.title': 'Recent Projects',
    'recentProjects.subtitle': 'Check out some of the projects I have worked on',
    'recentProjects.loading': 'Loading projects...',
    'recentProjects.error': 'Could not load projects.',
    'recentProjects.errorDetail': 'Connection error',
    'recentProjects.empty': 'No projects published yet.',
    'recentProjects.viewAll': 'View all projects →',

    // =========== BLOG GRID ===========
    'blogGrid.error': 'Could not load articles.',
    'blogGrid.errorDetail': 'Connection error',
    'blogGrid.retry': 'Try again',
    'blogGrid.empty': 'No articles published yet.',
    'blogGrid.emptyDetail': 'Come back soon to read the latest posts.',
    'blogGrid.prevPage': '« Previous',
    'blogGrid.nextPage': 'Next »',
    'blogGrid.prevAria': 'Previous page',
    'blogGrid.nextAria': 'Next page',
    'blogGrid.pageAria': 'Go to page {page}',
    'blogGrid.resultsCount.one': '{count} article published',
    'blogGrid.resultsCount.other': '{count} articles published',

    // =========== BLOG POST CONTENT ===========
    'blogPostContent.galleryTitle': 'Gallery',
    'blogPostContent.lessonsTitle': 'Lessons Learned',
    'blogPostContent.externalLink': 'View related project',
    'blogPostContent.carousel.pause': 'Pause',
    'blogPostContent.carousel.play': 'Resume',
    'blogPostContent.carousel.prev': 'Previous image',
    'blogPostContent.carousel.next': 'Next image',
    'blogPostContent.lightbox.close': 'Close',
    'blogPostContent.lightbox.prev': 'Previous',
    'blogPostContent.lightbox.next': 'Next',
    'blogPostContent.lightbox.counter': '{current} of {total}',
    'blogPostContent.lightbox.dialogLabel': 'Image viewer',
    'blogPostContent.media.expand': 'Expand',
    'blogPostContent.galleryImageAlt': '{title} — Image {index} of {total}',

    // =========== BLOG CARD ===========
    'blogCard.readArticle': 'Read article: {title}',

    // =========== CONTACT FORM ===========
    'contactForm.nameLabel': 'Full Name *',
    'contactForm.namePlaceholder': 'E.g. John Doe',
    'contactForm.emailLabel': 'Email *',
    'contactForm.emailPlaceholder': 'you@example.com',
    'contactForm.phoneLabel': 'Phone *',
    'contactForm.phonePlaceholder': '+1 555 123 4567',
    'contactForm.companyLabel': 'Company *',
    'contactForm.companyPlaceholder': 'Company name',
    'contactForm.positionLabel': 'Position *',
    'contactForm.positionPlaceholder': 'E.g. Tech Lead, HR Manager',
    'contactForm.budgetLabel': 'Budget / Salary Range *',
    'contactForm.budgetPlaceholder': '$50k–$80k USD or TBD',
    'contactForm.preferredContactLabel': 'Preferred Contact Method *',
    'contactForm.messageLabel': 'Message *',
    'contactForm.messagePlaceholder': 'Tell me about the opportunity, requirements, and any relevant details...',
    'contactForm.option.email': 'Email',
    'contactForm.option.phone': 'Phone',
    'contactForm.option.whatsapp': 'WhatsApp',
    'contactForm.submit': 'Send message',
    'contactForm.submitting': 'Sending...',
    'contactForm.success.title': 'Message sent!',
    'contactForm.error.nameRequired': 'Name is required',
    'contactForm.error.emailRequired': 'Email is required',
    'contactForm.error.emailInvalid': 'Enter a valid email address',
    'contactForm.error.phoneRequired': 'Phone is required',
    'contactForm.error.phoneInvalid': 'Enter a valid phone number (e.g. +1 555 123 4567)',
    'contactForm.error.companyRequired': 'Company is required',
    'contactForm.error.positionRequired': 'Position is required',
    'contactForm.error.budgetRequired': 'Budget is required',
    'contactForm.error.messageRequired': 'Message is required',
    'contactForm.error.preferredContactRequired': 'Select a preferred contact method',
    'contactForm.error.generic': 'An error occurred while sending the form. Please try again.',
    'contactForm.error.retry': 'Try again',
  },
};

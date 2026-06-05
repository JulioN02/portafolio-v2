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
    'home.meta.title': 'Julio Nieto | Desarrollador Full Stack',
    'home.meta.description': 'Desarrollador Full Stack especializado en React, Node.js y TypeScript. Conoce mi portafolio y experiencia.',

    'home.cta.title': '¿Listo para trabajar juntos?',
    'home.cta.text': 'Estoy abierto a nuevas oportunidades laborales y proyectos desafiantes. Si buscas un desarrollador comprometido con la calidad y los resultados, hablemos.',
    'home.cta.button': 'Contáctame',

    // =========== PROJECTS ===========
    'projects.meta.title': 'Proyectos | Julio Nieto',
    'projects.meta.description': 'Explora los proyectos en los que he trabajado como desarrollador Full Stack.',

    // =========== CONTACT ===========
    'contact.title': 'Contacto',
    'contact.subtitle': '¿Interesado en mis servicios? Complete el formulario y me pondré en contacto a la brevedad.',
    'contact.backLink': '← Volver al inicio',
    'contact.alternative': 'También puedes contactarme por',

    // =========== BLOG ===========
    'blog.meta.title': 'Blog | Julio Nieto',
    'blog.meta.description': 'Artículos sobre desarrollo web, tecnología y experiencia como desarrollador.',
    'blog.searchPlaceholder': 'Buscar artículos…',
    'blog.searchAriaLabel': 'Buscar artículos',
    'blog.categoryAriaLabel': 'Filtrar por categoría',
    'blog.categoryAll': 'Todas las categorías',

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
    'hero.title': 'Full Stack Developer',
    'hero.summary': 'Desarrollador Full Stack con experiencia en React, Node.js y TypeScript. Apasionado por construir aplicaciones web escalables y de alto rendimiento. Enfocado en crear soluciones que generen valor real para los usuarios y las empresas.',
    'hero.cta.primary': 'Ver Proyectos',
    'hero.cta.secondary': 'Contactar',

    // =========== PROFILE TOGGLE ===========
    'profileToggle.sectionTitle': 'Sobre Mí',
    'profileToggle.professional': 'Perfil Profesional',
    'profileToggle.technical': 'Perfil Técnico',
    'profileToggle.professionalText': 'Soy un desarrollador Full Stack con más de 5 años de experiencia creando soluciones digitales para empresas de diversos sectores. Mi enfoque está en entender las necesidades del negocio y traducirlas en productos funcionales, escalables y mantenibles.\n\nHe liderado equipos de desarrollo, coordinado entregas ágiles y trabajado directamente con stakeholders para garantizar que cada proyecto cumpla con los objetivos de negocio. Me apasiona la calidad del código, la documentación clara y la comunicación efectiva entre equipos técnicos y no técnicos.\n\nMi experiencia abarca desde startups hasta proyectos enterprise, siempre con el compromiso de entregar valor real a través de la tecnología.',
    'profileToggle.technicalText': 'Especializado en el ecosistema JavaScript/TypeScript con experiencia comprobada en React, Next.js y Node.js. Arquitectura de aplicaciones web modernas utilizando Server Components, API Routes, y patrones de estado con TanStack Query.\n\nEn el backend, domino Node.js con Express, bases de datos relacionales (PostgreSQL, Prisma ORM) y NoSQL (MongoDB). Experiencia en diseño de APIs RESTful, autenticación JWT, y despliegue con Docker.\n\nCompetencias técnicas destacadas:\n• Frontend: React 19, Next.js 15, TypeScript, CSS Modules, Tailwind CSS\n• Backend: Node.js, Express, PostgreSQL, Prisma, MongoDB\n• DevOps: Docker, Linux, Git/GitHub Actions, CI/CD\n• Testing: Jest, React Testing Library, Playwright\n• Herramientas: Figma, VS Code, Postman, Linear',

    // =========== TECH STACK ===========
    'techStack.title': 'Tech Stack',
    'techStack.subtitle': 'Tecnologías con las que trabajo día a día',
    'techStack.slideAria': 'Ir a {category}',

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

    // =========== BLOG CARD ===========
    'blogCard.readArticle': 'Leer artículo: {title}',

    // =========== CONTACT FORM ===========
    'contactForm.nameLabel': 'Nombre completo *',
    'contactForm.namePlaceholder': 'Ej. Juan Pérez',
    'contactForm.emailLabel': 'Correo electrónico *',
    'contactForm.emailPlaceholder': 'ejemplo@correo.com',
    'contactForm.phoneLabel': 'Teléfono *',
    'contactForm.phonePlaceholder': '+57 300 123 4567',
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
    'contactForm.error.phoneInvalid': 'Ingrese un número de teléfono válido (ej. +57 300 123 4567)',
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
    'home.meta.title': 'Julio Nieto | Full Stack Developer',
    'home.meta.description': 'Full Stack Developer specialized in React, Node.js and TypeScript. Check out my portfolio and experience.',

    'home.cta.title': 'Ready to work together?',
    'home.cta.text': "I'm open to new job opportunities and challenging projects. If you're looking for a developer committed to quality and results, let's talk.",
    'home.cta.button': 'Contact Me',

    // =========== PROJECTS ===========
    'projects.meta.title': 'Projects | Julio Nieto',
    'projects.meta.description': 'Explore the projects I have worked on as a Full Stack Developer.',

    // =========== CONTACT ===========
    'contact.title': 'Contact',
    'contact.subtitle': 'Interested in my services? Fill out the form and I will get back to you shortly.',
    'contact.backLink': '← Back to home',
    'contact.alternative': 'You can also reach me at',

    // =========== BLOG ===========
    'blog.meta.title': 'Blog | Julio Nieto',
    'blog.meta.description': 'Articles about web development, technology, and development experience.',
    'blog.searchPlaceholder': 'Search articles…',
    'blog.searchAriaLabel': 'Search articles',
    'blog.categoryAriaLabel': 'Filter by category',
    'blog.categoryAll': 'All categories',

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
    'hero.title': 'Full Stack Developer',
    'hero.summary': 'Full Stack Developer with experience in React, Node.js and TypeScript. Passionate about building scalable, high-performance web applications. Focused on creating solutions that deliver real value for users and businesses.',
    'hero.cta.primary': 'View Projects',
    'hero.cta.secondary': 'Contact Me',

    // =========== PROFILE TOGGLE ===========
    'profileToggle.sectionTitle': 'About Me',
    'profileToggle.professional': 'Professional Profile',
    'profileToggle.technical': 'Technical Profile',
    'profileToggle.professionalText': "I am a Full Stack Developer with over 5 years of experience creating digital solutions for companies across various industries. My focus is on understanding business needs and translating them into functional, scalable, and maintainable products.\n\nI have led development teams, coordinated agile deliveries, and worked directly with stakeholders to ensure each project meets business objectives. I am passionate about code quality, clear documentation, and effective communication between technical and non-technical teams.\n\nMy experience ranges from startups to enterprise projects, always with the commitment to deliver real value through technology.",
    'profileToggle.technicalText': "Specialized in the JavaScript/TypeScript ecosystem with proven experience in React, Next.js, and Node.js. Modern web application architecture using Server Components, API Routes, and state management with TanStack Query.\n\nOn the backend, I master Node.js with Express, relational databases (PostgreSQL, Prisma ORM) and NoSQL (MongoDB). Experience designing RESTful APIs, JWT authentication, and Docker deployment.\n\nKey technical skills:\n• Frontend: React 19, Next.js 15, TypeScript, CSS Modules, Tailwind CSS\n• Backend: Node.js, Express, PostgreSQL, Prisma, MongoDB\n• DevOps: Docker, Linux, Git/GitHub Actions, CI/CD\n• Testing: Jest, React Testing Library, Playwright\n• Tools: Figma, VS Code, Postman, Linear",

    // =========== TECH STACK ===========
    'techStack.title': 'Tech Stack',
    'techStack.subtitle': 'Technologies I work with every day',
    'techStack.slideAria': 'Go to {category}',

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

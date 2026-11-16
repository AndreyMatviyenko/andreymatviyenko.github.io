import projects from "./projects.js";

const selectProjects = (...ids) => projects.frontend.filter((project) => ids.includes(project.id));

const software = [
  {
    company: "TalkRemit", role: "Front-End Developer → Team Lead", uk: "Грудень 2020 — дотепер", en: "Dec 2020 — Present",
    projects: selectProjects("talkremit", "dahabshiil"),
    description: {
      uk: "Керую командою з трьох фронтенд-інженерів. Відповідаю за розробку й підтримку застосунків для грошових переказів, P2P- та агентських порталів, внутрішніх дашбордів і вебвіджетів. Ухвалюю архітектурні рішення для Vue / Nuxt, проводжу код-рев’ю, працюю з інтеграціями API / SDK, Docker і CI/CD. Долучаюся до переходу на мікросервіси та впровадження AI-assisted розробки.",
      en: "I lead a team of three Front-End engineers and oversee development and maintenance across remittance applications, P2P and agency portals, internal dashboards, and web widgets. I drive Vue / Nuxt architectural decisions and code reviews, work with API / SDK integrations, Docker, and CI/CD, and participate in the transition to microservices and the adoption of AI-assisted development workflows.",
    },
  },
  {
    company: "AgroOnline", role: "Front-End Developer", uk: "Січень — грудень 2020", en: "Jan — Dec 2020",
    projects: selectProjects("agroonline"),
    description: {
      uk: "Розробляв і підтримував вебзастосунки на Vue.js та JavaScript із використанням Node.js і сучасних інструментів збірки. Працював із Python у комерційній розробці та долучався до реалізації фронтенд- і бекенд-функціональності.",
      en: "Built and maintained web applications using Vue.js, JavaScript, Node.js, and modern frontend tooling. Used Python in commercial development and contributed across frontend and backend functionality.",
    },
  },
  {
    company: "Redwerk", role: "Front-End Developer", uk: "Березень 2018 — січень 2020", en: "Mar 2018 — Jan 2020",
    projects: selectProjects("openteams", "justinalexander"),
    description: {
      uk: "Долучився до розробки 13+ проєктів — від невеликих SPA до високонавантажених сайтів. Працював над OpenTeams на Vue.js / Nuxt.js та Justin Alexander на JavaScript, Sass і Webpack у середовищі Python / Django та Docker. Брав участь у найманні фронтенд-розробників: відборі резюме, технічних співбесідах і код-рев’ю.",
      en: "Contributed to 13+ projects, from small SPAs to high-traffic websites. Worked on OpenTeams with Vue.js / Nuxt.js and on Justin Alexander with JavaScript, Sass, and Webpack in a Python / Django and Docker environment. Participated in frontend hiring, including CV screening, technical interviews, and code reviews.",
    },
  },
  {
    company: "Pollee", role: "Front-End Developer", uk: "Травень 2016 — березень 2018", en: "May 2016 — Mar 2018",
    description: {
      uk: "Розробляв сайти, лендінги, теми та плагіни WordPress. Працював із JavaScript, React, Node.js, PHP, MODX та інструментами збірки фронтенду.",
      en: "Developed websites, landing pages, and WordPress themes and plugins using JavaScript, React, Node.js, PHP, MODX, and frontend build tools.",
    },
  },
  {
    company: { uk: "Фриланс", en: "Freelance" }, role: { uk: "Веброзробник", en: "Web Developer" }, uk: "Серпень 2015 — травень 2016", en: "Aug 2015 — May 2016",
    description: {
      uk: "Створював і підтримував сайти та лендінги на JavaScript, PHP, HTML / CSS і Sass.",
      en: "Built and maintained websites and landing pages using JavaScript, PHP, HTML / CSS, and Sass.",
    },
  },
  {
    company: "RubyKiev", role: "Junior Ruby Developer", uk: "Травень — серпень 2015", en: "May — Aug 2015",
    description: {
      uk: "Виконував фронтенд-завдання та тестував застосунок у середовищі Ruby on Rails із Bootstrap.",
      en: "Supported frontend tasks and application testing in a Ruby on Rails environment with Bootstrap.",
    },
  },
  {
    company: "Studio Nirvana", role: "Junior Game Developer", uk: "2015 (до травня)", en: "2015 (until May)",
    description: {
      uk: "Розробляв Flash-ігри на ActionScript 3.0.",
      en: "Developed Flash games using ActionScript 3.0.",
    },
  },
];
export default {
  frontend: software,
  deftech: [
    {
      company: "Embedded / UAV",
      role: { uk: "Практичні проєкти та волонтерство", en: "Hands-on projects and volunteering" },
      uk: "2 роки практичного досвіду", en: "2 years of hands-on experience",
      description: {
        uk: "Пройшов курс складання FPV-дронів і почав збирати дрони для Social Drones UA. Зібрав 18 семидюймових FPV-дронів та один десятидюймовий бомбер. Також зібрав і доопрацював детектор FPV-відеосигналів; розвиваю власні embedded-проєкти на ESP32.",
        en: "After completing an FPV drone assembly course, I started building drones for Social Drones UA. I assembled 18 seven-inch FPV drones and one ten-inch bomber. I also assembled and modified an FPV video-signal detector and am developing my own embedded projects with ESP32.",
      },
    },
    {
      company: "IT / Software Engineer",
      role: { uk: "Від розробника до тімліда", en: "From developer to team lead" },
      uk: "10+ років у розробці ПЗ", en: "10+ years in software development",
      description: {
        uk: "Працюю в ІТ з 2015 року. Пройшов шлях від розробки сайтів і застосунків до технічного лідерства. Із грудня 2020 року працюю в TalkRemit: керую командою з трьох фронтенд-інженерів, відповідаю за архітектуру, якість і розвиток фронтенду фінтех-продуктів.",
        en: "I have worked in IT since 2015, progressing from building websites and applications to technical leadership. Since December 2020, I have worked at TalkRemit, where I lead a team of three Front-End engineers and am responsible for frontend architecture, quality, and development across fintech products.",
      },
    },
    {
      company: "ДП “АНТОНОВ” / ANTONOV State Enterprise",
      role: { uk: "Інженер-технолог", en: "Manufacturing Engineer" },
      uk: "Вересень 2013 — червень 2015", en: "Sep 2013 — Jun 2015",
      description: {
        uk: "Розробляв технологічні процеси для обладнання з ЧПК, працював із виробничим оснащенням і процесами складання крил та їхніх компонентів.",
        en: "Developed manufacturing process plans for CNC equipment and worked with production tooling and assembly processes for wings and their components.",
      },
    },
  ],
};

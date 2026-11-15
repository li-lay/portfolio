export interface SocialLink {
  name: string;
  url: string;
  color: string;
  emoji: string;
}

export interface FocusArea {
  title: string;
  description: string;
}

export interface OpenSourceProject {
  name: string;
  description: string;
  url?: string;
}

export interface Project {
  title: string;
  description: string;
  demo?: string;
  source?: string;
  tech: string[];
}

export interface Profile {
  name: string;
  brand: string;
  role: string[];
  title: string;
  location: string;
  summary: string;
}

export const profile: Profile = {
  name: "Lilay",
  brand: "LILAY",
  role: ["Developer", "DevOps"],
  title: "Year 4 Computer Science student",
  location: "Kampong Speu, Cambodia",
  summary:
    "Lilay's personal portfolio - Year 4 Computer Science student passionate about DevOps, Linux, and open-source projects.",
};

export const now = "Building the AKUKS library and POS systems.";

export const socialLinks: SocialLink[] = [
  {
    name: "GitHub",
    url: "https://github.com/li-lay",
    color: "#98971a",
    emoji: "🐙",
  },
  {
    name: "GitLab",
    url: "https://gitlab.com/li-lay",
    color: "#d3869b",
    emoji: "🦊",
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/li-lay/",
    color: "#83a598",
    emoji: "💼",
  },
  {
    name: "Telegram",
    url: "https://t.me/ImLiLay",
    color: "#8ec07c",
    emoji: "💬",
  },
  {
    name: "Email",
    url: "mailto:contact@lilay.dev",
    color: "#d79921",
    emoji: "✉️",
  },
];

export const focusAreas: FocusArea[] = [
  {
    title: "DevOps",
    description: "Automating deployments and managing Fedora Copr builds",
  },
  {
    title: "Linux",
    description: "Daily-driving Linux since high school",
  },
  {
    title: "Infrastructure",
    description: "Self-hosting Kubernetes (K3s), Docker Swarm, and open-source services",
  },
  {
    title: "Editor",
    description: "Neovim, btw",
  },
];

export const openSource: OpenSourceProject[] = [
  {
    name: "topgrade (Fedora Copr)",
    description: "Maintainer of the Fedora Copr package for topgrade.",
    url: "https://copr.fedorainfracloud.org/coprs/lilay/topgrade/",
  },
  {
    name: "tealdeer (Fedora Copr)",
    description: "Maintainer of the Fedora Copr package for tealdeer.",
    url: "https://copr.fedorainfracloud.org/coprs/lilay/tealdeer/",
  },
  {
    name: ".dotfiles",
    description: "My .dotfiles, in case you are curious about my setup.",
    url: "https://github.com/li-lay/.dotfiles",
  },
];

export const projects: Project[] = [
  {
    title: "AKUKS POS",
    demo: "https://pos.akuks.com",
    tech: ["ASP.NET Core", "Razor", "Bootstrap", "Gruvbox"],
    description:
      "Khmer-language, login-gated university POS system built with ASP.NET Core MVC/Razor and a custom Gruvbox theme, with public online enrollment forms and cascading Cambodian address selects.",
  },
  {
    title: "AKUKS Library",
    demo: "https://library.akuks.com",
    tech: ["React", "Vite", "TanStack Query", "EmbedPDF"],
    description:
      "Bilingual digital research library with a public catalogue of 52 documents, an embedded PDF viewer, filters, citation copying, and browser-only QR and PDF-merge tools.",
  },
  {
    title: "AKUKS - akuks.com",
    demo: "https://akuks.com",
    tech: ["NextJS", "Prisma", "SQL Server"],
    description:
      "My first Intern project at my University. A Custom Full-Stack Content Management System (CMS) using NextJS, Prisma, and SQLServer.",
  },
  {
    title: "TrovTver",
    source: "https://github.com/li-lay/TrovTver",
    tech: [".NET", "MVC"],
    description: "Minimal Full-Stack Todo Web App built with .NET and MVC Pattern.",
  },
  {
    title: "3D Portfolio",
    demo: "https://3d.lilay.dev",
    source: "https://github.com/li-lay/portfolio/",
    tech: ["Three.js"],
    description:
      "My main portfolio in 3D for a while, a result from learning Web 3D rendering.",
  },
  {
    title: "Pomodoro Timer 3D",
    demo: "https://li-lay.github.io/Pomodoro-Timer-3D/",
    source: "https://github.com/li-lay/Pomodoro-Timer-3D/",
    tech: ["Three.js"],
    description: "Pomodoro Timer app, but it's in 3D.",
  },
  {
    title: "Counter 3D",
    demo: "https://li-lay.github.io/Counter-3D/",
    source: "https://github.com/li-lay/Counter-3D",
    tech: ["Three.js"],
    description: "Simple Counter app, but it's in 3D.",
  },
  {
    title: "Web 3D Journey",
    source: "https://github.com/li-lay/LearnThreeJS",
    tech: ["Three.js"],
    description: "I got that 3AM motivation to learn Web 3D.",
  },
  {
    title: "li-lay.github.io",
    demo: "https://li-lay.github.io",
    source: "https://github.com/li-lay/li-lay.github.io/",
    tech: ["Hugo"],
    description: "My very first static site made using Hugo SSG.",
  },
];

export const affiliation = {
  label: "Year 4 CS @ AKUKS",
  url: "https://akuks.com",
  name: "Angkor Khemara University, Kampong Speu Branch",
};

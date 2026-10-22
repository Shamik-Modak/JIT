import {
  Atom,
  BookOpen,
  Briefcase,
  Code2,
  Dna,
  Globe2,
  HeartPulse,
  Landmark,
  Languages,
  Music,
  Sigma,
  Palette,
  type LucideIcon,
} from "lucide-react";

export type Domain = {
  name: string;
  icon: LucideIcon;
  topics: string[];
};

export const DOMAINS: Domain[] = [
  {
    name: "Computer Science",
    icon: Code2,
    topics: ["Data Structures", "Algorithms", "Operating Systems", "Databases", "Networking", "Machine Learning"],
  },
  {
    name: "Mathematics",
    icon: Sigma,
    topics: ["Algebra", "Calculus", "Probability", "Linear Algebra", "Geometry", "Statistics"],
  },
  {
    name: "Physics",
    icon: Atom,
    topics: ["Newton's Laws", "Thermodynamics", "Electromagnetism", "Optics", "Quantum Basics", "Relativity"],
  },
  {
    name: "Biology",
    icon: Dna,
    topics: ["Cell Biology", "Genetics", "Evolution", "Human Anatomy", "Ecology", "Microbiology"],
  },
  {
    name: "Medicine",
    icon: HeartPulse,
    topics: ["Pharmacology", "Physiology", "Pathology", "Cardiology", "Immunology", "First Aid"],
  },
  {
    name: "History",
    icon: Landmark,
    topics: ["Ancient Civilisations", "World War II", "Indian Independence", "Renaissance", "Cold War", "Industrial Revolution"],
  },
  {
    name: "Economics",
    icon: Briefcase,
    topics: ["Supply & Demand", "Inflation", "Game Theory", "Macroeconomics", "Behavioural Economics", "Trade"],
  },
  {
    name: "Geography",
    icon: Globe2,
    topics: ["Climate Zones", "Plate Tectonics", "Rivers & Oceans", "Population", "Maps & Projections", "Natural Resources"],
  },
  {
    name: "Languages",
    icon: Languages,
    topics: ["English Grammar", "Vocabulary", "Spanish Basics", "French Basics", "Hindi Grammar", "Idioms"],
  },
  {
    name: "Literature",
    icon: BookOpen,
    topics: ["Shakespeare", "Poetry Forms", "Literary Devices", "Modern Novels", "Mythology", "Short Stories"],
  },
  {
    name: "Music",
    icon: Music,
    topics: ["Music Theory", "Scales", "Rhythm", "Instruments", "Classical Composers", "Chords"],
  },
  {
    name: "Art & Design",
    icon: Palette,
    topics: ["Colour Theory", "Typography", "Art History", "Composition", "UX Basics", "Sketching"],
  },
];

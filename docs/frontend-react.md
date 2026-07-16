# 🎨 Frontend Engineering: React 19, Tailwind CSS v4 & Framer Motion

This document explores the architectural design, animation engineering, and responsive styling system of the client tier.

---

## ⚛️ React 19 & TypeScript Architecture

The frontend is structured as a type-safe **React 19 Single Page Application (SPA)** bundled via **Vite 6**:
- **Strict TypeScript Boundaries**: Every API response, state object, and component prop is governed by explicit TypeScript interfaces (`src/types/*.ts`), eliminating runtime undefined errors and providing rich IDE auto-completion.
- **Modular Component Composition (`src/components/`)**:
  - `sections/`: Large, self-contained page blocks (`Hero`, `About`, `ProjectsGrid`, `ExperienceTimeline`).
  - `layout/`: Global wrappers that persist across route transitions (`Navbar`, `Footer`, `MainLayout`, `PageTransition`).
  - `ui/`: Atomic, highly reusable UI primitives (`Button`, `IconButton`, `Tag`, `IconPicker`, custom cards, and animated glowing borders).

---

## 🌌 Dark Glassmorphism Design System (Tailwind CSS v4)

To create an unforgettable, premium first impression, the UI leverages a tailored **Dark Glassmorphism** aesthetic powered by **Tailwind CSS v4**:
- **Deep Midnight & Neon Palettes**: Uses rich obsidian (`#0a0a0a` / `#050505`) backgrounds contrasted against vibrant cyan (`#06b6d4`), emerald (`#10b981`), and purple (`#8b5cf6`) accents.
- **Frosted Glass Cards**: Built using multi-layered backdrop filters (`backdrop-blur-md`, `bg-white/[0.03]`, `border-white/10`), creating depth and elevation above the dark canvas.
- **Dynamic Glow Effects**: Interactive cards feature subtle radial gradient glows on hover, utilizing pseudo-elements and CSS transforms to simulate ambient lighting around the user's cursor.

---

## 🎭 Micro-Animations & Motion Design (`Framer Motion`)

Static interfaces feel lifeless. We engineered dynamic, physics-based interactions using **Framer Motion (`framer-motion`)**:
1. **Centralized Motion Variants (`src/utils/motion.ts`)**: Rather than scattering inline animation configs across dozens of files, all motion curves are exported from a central utility:
   - `fadeUp`: Spring-damped vertical entrance (`stiffness: 120, damping: 25`).
   - `slideIn`: Directional spring entries for sidebars and drawers.
   - `staggerContainer`: Orchestrates sequential child item appearances (`staggerChildren: 0.1s`), making project grids and skill tags ripple into view cleanly.
2. **Scroll-Linked Animations (`useScrollProgress`)**: Custom hooks monitor window scroll depth and drive progress bars and parallax background elements.
3. **Route Transitions**: Page transitions are wrapped in `<AnimatePresence mode="wait">`, ensuring existing views smoothly fade out before incoming routes spring into place.

---

## 🚦 Routing & Route-Level Guarding (`React Router v7`)

The application utilizes **React Router v7** with a centralized routing manifest:
- **Public Portfolio Routes**: `/` (Home), `/projects` (Dedicated Showcase), `/about`, `/contact`.
- **Protected Administrative Routes**: `/secure-control/*` guarded by our `<ProtectedRoute />` component. If an unauthenticated user attempts to access `/secure-control/projects`, the guard intercepts the navigation and redirects them to `/login` while preserving the intended destination URL in router state.

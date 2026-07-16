# 🔒 Admin Control Engine: The `/secure-control` Dashboard & `useCrud` Hook

This guide details the inner workings of the protected `/secure-control` administrative suite, highlighting how complex data management across multiple MongoDB collections is simplified into clean, reusable abstractions.

---

## 🎛️ Anatomy of the Unified `useCrud` Hook

Building distinct state handlers, form loaders, submit handlers, and delete confirmation dialogues for 6+ separate database collections (Projects, Publications, Skills, Experiences, Education, Achievements) leads to massive boilerplate.

We solved this by engineering **`useCrud<T>` (`src/hooks/useCrud.ts`)**—a universal, generic TypeScript hook that encapsulates 100% of the data lifecycle:

### What `useCrud` Manages Automatically:
1. **Asynchronous Data Loading & Sorting**: Automatically fetches entities on mount and sorts them by their `order` weight (`(a.order || 0) - (b.order || 0)`).
2. **Form State & Direct Handlers**: Manages `formData`, `showForm`, and `editingId` states cleanly. Provides both generic form element input handlers (`handleChange`) and programmatic value setters (`handleDirectChange`).
3. **Smart Create vs. Update Routing**: When `handleSubmit` is called, the hook checks `editingId`. If `null`, it assigns an incremental order (`data.length * 10`) and executes a POST request. If set, it executes a PUT request.
4. **Drag-and-Drop Reordering (`@dnd-kit/sortable`)**: Integrates directly with drag-and-drop tables (`handleDragEnd`). When an administrator reorders rows, the hook calculates `arrayMove`, updates local state instantly for zero-latency UI response, recomputes `order = (index + 1) * 10` for every item, and fires a bulk reorder API mutation in the background.
5. **Instant Visibility Toggling**: Provides `toggleVisibility` (`isShow: !item.isShow`), allowing administrators to hide/unhide projects or skills from public view with a single click and real-time toast feedback (`react-hot-toast`).

---

## 🎨 Custom Interactive Components: `IconPicker`

Because our portfolio dynamically renders icons for technologies and projects (`FaReact`, `FaPython`, `SiFastapi`, etc.), we built a custom, accessible **`IconPicker` (`src/components/ui/forms/IconPicker.tsx`)** dropdown:
- **Visual Grid Selector**: Renders a custom glassmorphic grid of available icons (`ICONS` dictionary mapped from `react-icons`), showing live previews and labels alongside each option.
- **Click-Outside Resolution**: Uses `useRef` and document-level event listeners (`mousedown`) to close the selector dropdown cleanly whenever the user clicks outside the component boundary.
- **Dynamic Preview**: Immediately reflects the chosen icon symbol inside the form button header.

---

## 🔐 Session Management & Inactivity Protection

The dashboard is secured against both remote interception and physical workstation access:
- **HTTP-Only & Bearer JWT Validation**: All requests to `/api/*` administrative routes attach the active JWT token via Axios interceptors (`src/services/axios.ts`).
- **Automated Inactivity Logout**: To prevent unauthorized physical access if an administrator leaves their terminal open, our `AuthContext` tracks user interactions (`mousemove`, `keydown`). If the idle threshold is exceeded, the session token is purged from memory and the user is redirected to `/login`.

# System Patterns

## System Architecture
- React frontend (TypeScript) for UI and logic.
- Fetches server status via API calls (direct or via backend proxy if needed).
- Modular component structure for UI (Button, ServerCard, etc).

## Key Technical Decisions
- TypeScript for type safety and maintainability.
- Responsive design for cross-device compatibility.
- Use of hooks for state and effect management.
- Testing with Jest and React Testing Library.

## Design Patterns in Use
- Component-based UI (React best practices).
- Custom hooks for reusable logic (e.g., navigation, window dimensions).
- Separation of concerns: UI, logic, and data fetching are modularized.

## Component Relationships
- Pages composed of reusable components.
- Components communicate via props and context.

## Critical Implementation Paths
- Server status fetch: user input → API call → status display.
- Error handling for unreachable or invalid servers.
- Loading and feedback states for user actions.

# AI Studio Project Rules & Tech Stack

This document outlines the core technologies and specific rules for library usage within the Equity Analyst Pro application to ensure consistency, maintainability, and performance.

## 1. Core Technology Stack

The application is built on a modern, lightweight stack:

*   **Frontend Framework:** React (v19)
*   **Language:** TypeScript for type safety and robust development.
*   **Build Tool:** Vite for fast development and optimized bundling.
*   **Styling:** Tailwind CSS for utility-first, responsive design.
*   **AI Integration:** Google Gemini API via the `@google/genai` SDK for all market analysis and data grounding.
*   **Charting:** Recharts for rendering interactive price and historical data visualizations.
*   **Icons:** Lucide React for a consistent and lightweight icon set.
*   **Architecture:** Single-Page Application (SPA) structure managed by React state.

## 2. Library Usage Rules

To maintain a clean and efficient codebase, please adhere to the following rules when introducing new features or components:

| Category | Required Library | Rule / Notes |
| :--- | :--- | :--- |
| **Styling** | Tailwind CSS | Use utility classes exclusively. Avoid custom CSS files. |
| **Icons** | `lucide-react` | All icons must be sourced from this package. |
| **Charting** | `recharts` | Use `recharts` components (e.g., `AreaChart`, `ResponsiveContainer`) for all data visualization. |
| **AI/API** | `@google/genai` | All calls to the Gemini model must be routed through the `geminiService.ts` file using this SDK. |
| **UI Components** | Standard HTML/Tailwind | Prioritize simple, custom components built with Tailwind. |
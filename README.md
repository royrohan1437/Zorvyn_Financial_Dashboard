# Zorvyn Financial Dashboard

A responsive finance dashboard built for the frontend assignment with React, TypeScript, and Vite.

## Overview

This project focuses on clean UI structure, thoughtful interactions, and frontend state management without relying on a backend. The dashboard is intentionally built in production-style feature slices so each milestone can stand as a believable Git commit.

## Feature Highlights

- Financial summary cards for total balance, income, and expenses
- Balance trend visualization based on monthly closing balances
- Spending breakdown visualization by category
- Searchable, filterable, and sortable transaction history
- Simulated role-based UI with `Viewer` and `Admin` modes
- Admin-only transaction creation and editing
- Insight cards for highest spending category, monthly comparison, and standout observations
- Light and dark mode toggle with persistent theme state
- Local persistence for role, theme, and transaction changes using `localStorage`
- Responsive layouts for desktop and mobile, including mobile transaction cards
- Graceful empty-state handling across charts, transactions, and insights

## Requirement Mapping

### 1. Dashboard Overview

- Summary cards show total balance, income, and expenses
- Time-based visualization is provided through the balance trend chart
- Category-based visualization is provided through the spending breakdown chart

### 2. Transactions Section

- Transactions display date, amount, category, and type
- Search, type filter, category filter, and sorting are included

### 3. Basic Role Based UI

- `Viewer` mode is read-only
- `Admin` mode can add and edit transactions from the frontend
- Role switching is available from the dashboard header

### 4. Insights Section

- Highest spending category
- Month-over-month expense comparison
- Largest single expense
- Derived observations based on the current dataset

### 5. State Management

- Shared application state is managed with React Context and `useReducer`
- Transactions, selected role, and selected theme are centralized in the dashboard provider

### 6. UI and UX Expectations

- Responsive across desktop and mobile
- Dark mode and light mode supported
- Empty states handled for charts, transactions, and insights
- Local persistence keeps demo changes available across refreshes

## Tech Stack

- React 19
- TypeScript
- Vite
- Plain CSS with design tokens and responsive layouts

## Project Structure

```text
src/
  components/   UI sections and reusable dashboard blocks
  data/         Seed mock transaction data
  state/        Shared dashboard context and reducer
  types/        Domain types and category constants
  utils/        Financial calculations, filtering, and insights logic
```

## Local Persistence

The dashboard stores the following in `localStorage`:

- Theme preference
- Selected role
- Transactions data

Admin users can restore the original seeded demo dataset from the transactions section.

## Getting Started

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal after starting the dev server.

## Scripts

```bash
npm run dev
npm run build
npm run preview
```

## Build Verification

```bash
npm run build
```

## Implementation Notes

- All charts are frontend-derived and use shared transaction state
- The role-based experience is simulated on the client for demonstration
- No backend or external API is required
- The app starts with seed data but becomes browser-persistent after interaction

## Commit Strategy

The project was intentionally implemented in incremental slices to create a more realistic Git history:

1. App foundation and dashboard overview
2. Dark mode support
3. Transactions experience
4. Role-based controls
5. Insights
6. Persistence and documentation polish

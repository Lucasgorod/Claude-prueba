# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Apple-style quiz application built with React, TypeScript, Styled Components, and Supabase. The app features a dark mode aesthetic with glassmorphism effects and smooth animations.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Deploy
npm run deploy
```

## Architecture

- **React + TypeScript**: Main framework with strict typing
- **Styled Components**: CSS-in-JS with theme system
- **Framer Motion**: Smooth animations and transitions
- **Supabase**: Backend services (PostgreSQL Database, Auth, Realtime, Hosting)
- **React Router v6**: Client-side routing

## Key Design Principles

- Apple dark mode aesthetic (#000000 background, #1C1C1E surfaces, #007AFF primary)
- San Francisco font family (-apple-system)
- Glassmorphism effects with backdrop blur
- Touch-friendly mobile interfaces
- Subtle shadows and Apple-style border radius

## Component Structure

- **UI Components** (`src/components/ui/`): Reusable Apple-style components
- **Layout Components** (`src/components/layout/`): Navigation and page structure
- **Pages** (`src/pages/`): Feature-specific page components
- **Styles** (`src/styles/`): Theme, global styles, and animations

## Supabase Configuration

- Update `.env` with your Supabase URL and anon key
- Database tables for users, quizzes, sessions, participants, and responses
- Row Level Security (RLS) policies for data protection
- Real-time subscriptions for live quiz sessions
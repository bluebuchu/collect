# Sentence Sharing Application

## Overview
This is a full-stack web application designed for sharing and managing user-submitted sentences. It aims to create a community platform where users can discover, interact with, and contribute to a growing collection of impactful sentences from books or other sources. The application provides functionalities for submitting sentences with associated book details, liking content, searching, and managing personal contributions, fostering a rich textual repository.

## Recent Changes (2025-08-06)
- **UI Simplification**: Replaced large authentication form on landing page with minimal top-right corner buttons
- **Modal Authentication**: Implemented clean modal-based login/register system for better user experience
- **Logout Enhancement**: Added prominent logout button to main application with automatic redirect to landing page
- **Google OAuth 2.0 Integration**: Added complete Google Sign-In system with security best practices
  - Client-side only implementation for enhanced security
  - localStorage session management for Google users
  - Automatic domain detection and setup guidance for Replit environments
  - Seamless integration with existing authentication system
  - CORS error handling and origin_mismatch troubleshooting
- **Responsive Design**: Ensured all new UI elements work seamlessly across desktop and mobile devices

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter
- **Forms**: React Hook Form with Zod validation
- **UI/UX Decisions**:
    - Responsive design with mobile-first approach.
    - Dark/light theme toggle.
    - Modals for login, add sentence, delete confirmation, and export settings.
    - Sentence cards displaying content, likes, and actions.
    - Real-time search with debouncing.
    - Pagination for sentence display and navigation.
    - User profile management with stats display and profile image uploads.
    - Personal sentence management with multiple sorting and view modes (list, timeline, books).
    - Book-specific export functionality.
    - Typography hierarchy using Pretendard, Noto Serif KR, and Inter fonts.
    - Glassmorphism design elements on landing page.
    - Custom favicon.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js 20
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL
- **Session Management**: Express sessions with `connect-pg-simple`
- **Validation**: Zod schemas for API request/response validation
- **Authentication**: Full user registration and login with session-based authentication and password hashing. Includes password reset and email finding functionality.
- **API Endpoints**:
    - `POST /api/auth/verify`: Entry verification (legacy invite code system, now handled by full auth).
    - `GET /api/sentences`: Retrieve all sentences.
    - `POST /api/sentences`: Create new sentence.
    - `DELETE /api/sentences/:id`: Delete sentence with password verification.
    - `POST /api/sentences/:id/like`: Increment sentence likes.
    - `GET /api/sentences/search`: Search sentences by nickname, book title, author, and content.
    - Endpoints for user-specific sentence retrieval and statistics.
    - Endpoint for book search via external API.
    - Endpoint for profile image uploads.

### Data Storage Solutions
- **Primary Database**: PostgreSQL for persistent data storage.
- **Database Schema**:
    - `sentences`: `id`, `nickname`, `content`, `bookTitle`, `author`, `password`, `likes`, `createdAt`, `pageNumber`, `userId`.
    - `users`: For user accounts.
    - `sessions`: For session management.
    - `passwordResetTokens`: For password reset functionality.
- **Migrations**: Drizzle Kit for database schema migrations.

### Core Features
- **Sentence Submission**: Users submit sentences with nickname, content, password, book title, author, and page number.
- **Content Interaction**: Liking sentences, searching, and copying to clipboard.
- **Content Management**: Users can delete their own sentences with password verification. Admin deletion capability.
- **Search Functionality**: Comprehensive search across nickname, book title, author, and sentence content.
- **Statistics**: Dashboard with popular sentences, book rankings, and contributor rankings. User-specific statistics.
- **Export**: Export functionality with book-specific options and robust Korean title normalization.
- **Personal Content Management**: Dedicated "My Sentences" page with sorting, filtering, and multiple view modes.

## External Dependencies

- **@neondatabase/serverless**: Serverless PostgreSQL client.
- **drizzle-orm**: Type-safe SQL query builder.
- **@tanstack/react-query**: Server state management.
- **@radix-ui/***: Unstyled UI primitives.
- **tailwindcss**: Utility-first CSS framework.
- **zod**: TypeScript-first schema validation.
- **multer**: For handling file uploads (profile images).
- **Aladin Open API**: For book search functionality and auto-completion.
# IAM

Centralized identity and access management platform for multi-application environments.

This project is designed to provide a reusable authentication and access-control layer for business applications. It focuses on centralized login, role and permission management, application-based access control, API clients, and audit visibility.

## Overview

IAM works as a shared access layer for connected applications. Instead of each product handling authentication and authorization separately, this platform centralizes user access, security rules, and traceability in one place.

## Core features

- Centralized authentication
- Users, roles, and permissions
- Application-based access control
- API clients for machine-to-machine integrations
- Audit records for security and traceability

## Why I built it

I built this project as a reusable foundation for multi-application business environments. The goal is to avoid duplicated authentication logic across products and create a more structured, secure, and maintainable way to manage access.

## Tech stack

- TypeScript
- Next.js
- React
- Tailwind CSS
- Node.js
- PostgreSQL
- Drizzle ORM
- Zod

## Architecture direction

The platform is designed around a central IAM service that can support multiple applications. Each application can define its own access scope while still relying on a shared authentication layer.

Main ideas behind the architecture:

- one central identity source
- application-scoped roles and permissions
- secure token-based access
- auditability for important actions
- reusable foundation for future products

## Current status

This project is in active development. The current direction includes authentication flows, application management, role and permission handling, API client support, and audit-related functionality.

## Local development

```bash
git clone <repo-url>
cd iam
npm install
npm run dev

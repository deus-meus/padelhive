# Padelhive - AI Development Guide

## Project Context

Padelhive is a web-based padel court booking marketplace.

The complete product specification lives in:

PRD.md

Always review PRD.md before implementing major features.

---

# Current Phase

Current focus:

Frontend MVP Completion

Goals:

* Complete booking journey
* Complete owner dashboard
* Complete admin dashboard
* Complete authentication UI
* Complete UX states
* Complete responsive behavior

Avoid:

* Premature backend implementation
* Nice-to-have features before MVP completion

---

# Product Priorities

Always implement in this order:

1. Player Booking Journey
2. Venue Discovery
3. Availability Calendar
4. Booking Management
5. Payment Flow
6. Invite Friends
7. Split Payment
8. Venue Owner Dashboard
9. Super Admin Dashboard
10. Authentication
11. Backend Integration
12. Nice-to-Have Features

Do not prioritize Nice-to-Have features before MVP completion.

---

# Design Principles

Padelhive should feel:

* Premium
* Modern
* Sports-tech
* Fast
* Mobile-first

Reference products:

* Airbnb
* ClassPass
* Strava
* Linear

Avoid:

* Generic admin templates
* Excessive animations
* Random color palettes
* Inconsistent UI

---

# UI Standards

Maintain:

* Consistent spacing
* Consistent typography
* Consistent border radius
* Consistent button styles
* Consistent card layouts
* Consistent icon sizing

Every page must include:

* Loading states
* Empty states
* Error states
* Success states

Every interaction must:

* Navigate
* Update state
* Show feedback
* Or clearly indicate "Coming Soon"

Never leave dead buttons.

---

# Frontend Standards

Use:

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui
* Framer Motion

Requirements:

* Reusable components
* Shared UI primitives
* Strong typing
* Mobile responsiveness
* Accessibility-friendly interactions

Avoid:

* Duplicate components
* Inline business logic
* Unused code
* Console warnings
* Console errors

---

# Shared Components

Prefer reusable components for:

* EmptyState
* ErrorState
* LoadingState
* SuccessState
* ConfirmationModal
* NotFoundState
* Toast notifications

Reuse existing components before creating new ones.

---

# UX Quality Checklist

Before marking work complete:

Verify:

* Consistent spacing
* Consistent typography
* Consistent card layouts
* Consistent CTA placement
* Responsive layouts
* Mobile friendliness
* No horizontal overflow
* No clipping
* No hydration mismatches
* No broken routes
* No dead buttons

The application should feel like a complete MVP.

Not a collection of screens.

---

# Booking Flow Rules

The primary product flow is:

Venue Discovery
→ Venue Detail
→ Availability Calendar
→ Booking
→ Invite Friends
→ Split Payment
→ Payment
→ Success

Protect and optimize this flow above all others.

Any change should not break this journey.

---

# Dashboard Rules

Owner Dashboard priorities:

* Revenue
* Occupancy
* Bookings
* Pricing
* Court management

Admin Dashboard priorities:

* Venue approval
* Transactions
* Refunds
* Disputes
* Commission management

Avoid generic dashboard designs.

---

# Backend Rules

When backend implementation begins:

Stack:

* NestJS
* PostgreSQL
* Prisma
* REST API
* Socket.IO

Requirements:

* RBAC
* Booking locks
* Refund workflow
* Payment webhooks
* Real-time availability

Do not start backend implementation unless explicitly requested.

---

# Git Workflow

Never commit directly to main.

Branch naming:

Features:

feat/<description>

Examples:

feat/owner-dashboard
feat/payment-flow
feat/auth-ui

Bug fixes:

fix/<description>

Examples:

fix/mobile-overflow
fix/navbar-transition
fix/booking-summary

---

# GitHub Issue Workflow

Before creating issues:

1. Review PRD.md
2. Search existing issues
3. Avoid duplicates

Issue categories:

* frontend
* backend
* bug
* enhancement
* ux
* technical-debt

Issue format:

## Problem

Describe the problem.

## Expected Behavior

Describe the expected result.

## Scope

Affected pages/components.

## Acceptance Criteria

Checklist of requirements.

---

# Pull Request Workflow

For completed work:

1. Create feature branch
2. Implement changes
3. Run validation
4. Commit
5. Push
6. Create Pull Request

Never merge automatically.

Wait for approval.

PR must include:

## Summary

What changed.

## Validation

* npm run lint
* npm run build

## Screenshots

If UI changes were made.

---

# Validation Requirements

Always run:

npm run lint
npm run build

Before reporting completion.

Fix all issues before reporting success.

---

# Definition of Done

A task is complete only when:

* Requirements are implemented
* UI is polished
* Mobile is verified
* Build passes
* Lint passes
* No broken routes
* No dead buttons
* No major UX issues remain

Do not stop at reporting issues.

Implement fixes and validate them.

---

# Agent Behavior

Do not stop at analysis.

Do not stop at reporting.

Do not stop at planning.

Implement changes when requested.

Validate changes.

Then provide:

* Summary
* Files changed
* Validation results
* Remaining limitations

Focus on shipping working software.

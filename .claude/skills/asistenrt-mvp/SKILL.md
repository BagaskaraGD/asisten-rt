---
name: asistenrt-mvp
description: Builds and maintains the AsistenRT MVP web application for RT/RW administration with AI-assisted FAQ, draft letters, complaint tickets, admin approval, and audit logs. Use when developing AsistenRT features, database schema, AI prompts, user flows, or MVP implementation tasks.
metadata:
  version: 1.0.0
  project: asistenrt-ai
---

# AsistenRT MVP Skill

## Purpose

Use this skill when working on the AsistenRT MVP application.

AsistenRT is a web-first AI assistant for RT/RW administration. The app helps residents ask FAQ questions, request draft letters, and submit neighborhood complaints. Admin RT users review, approve, reject, and manage all official outputs.

## Critical Rules

1. AI never makes final administrative decisions.
2. AI may generate draft letters only.
3. Admin approval is required before a letter is considered approved.
4. AI must answer FAQ from the RT knowledge base.
5. If information is unavailable, AI must escalate to admin.
6. Do not implement WhatsApp integration in MVP v1.
7. Do not implement payment/iuran automation in MVP v1.
8. Do not store KTP/KK scans in MVP v1.
9. Every AI interaction must be logged in `ai_audit_logs`.
10. Prioritize simple, reliable workflows over complex automation.

## Product Context

Before implementing product logic, review:

- `references/product-context.md`
- `references/ai-guardrails.md`
- `references/mvp-user-stories.md`
- `references/database-design.md`
- `references/test-scenarios.md`

## MVP Features

### 1. Admin Dashboard

Admin can:
- manage RT profile
- manage FAQ
- manage letter templates
- review letter requests
- update complaint status

### 2. Resident Chat Simulator

Resident can:
- ask FAQ
- request a draft letter
- submit a complaint
- check basic request status

### 3. AI Assistant

The AI assistant handles:
- intent classification
- FAQ answering
- missing-field collection for letters
- draft letter generation
- complaint extraction
- admin summary generation

## Development Workflow

When asked to implement a feature:

1. Check MVP scope.
2. Check database impact.
3. Check role/access rules.
4. Implement minimal working version.
5. Add error and empty states.
6. Add audit logging if AI is involved.
7. Provide testing steps.

## Do Not Build Yet

- WhatsApp API
- payment gateway
- digital signature
- OCR
- mobile native app
- full accounting/kas RT
- complex multi-RW hierarchy
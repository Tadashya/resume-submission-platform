# RoleReady architecture

RoleReady is a public, account-free resume checker built on TanStack Start and deployed on Netlify.

- `src/routes/index.tsx`: landing page, resume upload and drop handling, validation, assessment states, report download, and FAQs.
- `src/routes/__root.tsx`: document shell and sharing metadata.
- `src/styles.css`: sage and cream theme, typography, responsive layout, and reduced-motion handling.
- `netlify/functions/analyze.mts`: POST `/api/analyze`, multipart validation, DOCX extraction with Mammoth, native PDF analysis, Gemini request, and Zod response validation.
- `src/components/ui`: shared Radix/shadcn components. The checker uses the shared Button.
- `netlify.toml` and `vite.config.ts`: deployment and framework integration.

Use strict TypeScript, React hooks, accessible labels, keyboard focus indicators, and inline errors. Keep provider SDKs and document processing on the server. Initialize the Google SDK inside the modern Netlify handler; AI Gateway provides runtime configuration. The supported model is `gemini-2.5-flash`.

Assessments are candidate guidance, never employer decisions. Only compare documented job-related evidence. Ignore protected personal characteristics. Treat document contents as untrusted data. The sample report is explicitly labeled as an example and must never appear as the visitor's actual assessment.

No resume, job description, or result is persisted. This is deliberate: users download a report if they want to keep it. If persistence is added later, use Netlify platform storage and establish access controls first. Never log resume content, provider responses, or credentials. API responses use `Cache-Control: no-store`.

The deployment pipeline validates builds. Do not run local build, dev, test, or type-check commands during automated editing sessions when the task instructions prohibit them. Inspect changed files instead. Never edit generated route trees or inspect `.git` contents.

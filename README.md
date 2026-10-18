# Resume Submission Platform

An account-free resume checker that compares a resume with a job description and provides an estimated match, strengths, evidence gaps, and practical suggestions. The assessment is advisory and does not make hiring decisions.

## Live demo

[Try Resume Submission Platform](https://resume-submission-platform.netlify.app/)

## Tech stack

- **Frontend:** React 19, TypeScript, TanStack Start and Router
- **Styling and UI:** Tailwind CSS 4, Radix UI, Lucide icons
- **Server and deployment:** Netlify Functions, Netlify AI Gateway
- **AI analysis:** Google Gemini (`gemini-2.5-flash`)
- **Document handling and validation:** Mammoth (DOCX), Zod
- **Build and tests:** Vite, Vitest, Testing Library

## Local development

Use Node.js 22.13+ and pnpm. Install dependencies with `pnpm install`, then run `netlify dev --port 8889` against the linked Netlify project. AI inference requires Netlify AI Gateway and an initial production deployment. Production builds are handled by Netlify using `netlify.toml`.

## Behavior and privacy

The app sends supplied documents to the AI provider for analysis but does not persist resumes, job descriptions, or assessment results. Refreshing clears the assessment. No documents are sent to recruiters. PDF content is read by Gemini; DOCX text is extracted server-side. Files are limited to 4 MB. Job descriptions must contain 100–18,000 characters. Results are guidance only, not hiring or eligibility decisions.

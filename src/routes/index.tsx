import { createFileRoute } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { z } from 'zod'
import { ArrowUpRight, ArrowRight, Check, CheckCheck, FileText, Upload, ShieldCheck, Sparkles, X, CircleHelp, Target, ListChecks, Download, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({ component: Home })
const assessmentSchema = z.object({
  validResume: z.literal(true),
  score: z.number().int().min(0).max(100),
  summary: z.string(),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  actions: z.array(z.string()),
})
type Assessment = z.infer<typeof assessmentSchema>
function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [job, setJob] = useState('')
  const [busy, setBusy] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<Assessment | null>(null)
  const [drag, setDrag] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const output = useRef<HTMLElement>(null)
  function choose(next?: File) {
    if (!next) return
    setError(''); setResult(null)
    if (!/\.(pdf|docx|txt)$/i.test(next.name) || next.size > 4 * 1024 * 1024 || !next.size) { setError('Choose a PDF, DOCX, or TXT file up to 4 MB.'); return }
    setFile(next)
  }
  async function analyze() {
    setError('')
    if (!file) { setError('Add your resume to get started.'); input.current?.focus(); return }
    if (job.trim().length < 100) { setError('Add a job description with at least 100 characters so we can compare the requirements.'); return }
    setBusy(true); setResult(null)
    try {
      const data = new FormData(); data.append('resume', file); data.append('job', job)
      const response = await fetch('/api/analyze', { method: 'POST', body: data, headers: { Accept: 'application/json' }, cache: 'no-store' })
      const unavailable = 'The resume checker is temporarily unavailable. Please try again in a moment.'
      if (!response.headers.get('content-type')?.toLowerCase().includes('application/json')) {
        throw new Error(response.status === 413 ? 'Please upload a file smaller than 4 MB.' : unavailable)
      }
      let body: unknown
      try { body = await response.json() }
      catch { throw new Error(unavailable) }
      if (!response.ok) {
        const failure = z.object({ error: z.string().min(1) }).safeParse(body)
        throw new Error(failure.success ? failure.data.error : unavailable)
      }
      const assessment = assessmentSchema.safeParse(body)
      if (!assessment.success) throw new Error('The assessment could not be read. Please try the check again.')
      setResult(assessment.data)
      setTimeout(() => output.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to complete the check. Please try again.') }
    finally { setBusy(false) }
  }
  async function download() {
    if (!result || downloading) return
    setDownloading(true)
    setError('')
    try {
      const { downloadReport } = await import('@/lib/download-report')
      await downloadReport(result)
    } catch {
      setError('The PDF could not be created. Please try downloading your report again.')
    } finally {
      setDownloading(false)
    }
  }
  return <div className="app-shell">
    <header className="header"><a className="brand" href="/" aria-label="RoleReady home"><span className="brand-icon"><CheckCheck size={24}/></span>RoleReady<span className="brand-dot">.</span></a><nav aria-label="Main navigation"><a href="#checker" className="active">Resume checker</a><a href="#how-it-works">How it works</a><a href="#faq">FAQs</a></nav><span className="header-note"><span/> A little clarity. A better next step.</span><a className="mobile-help" href="#faq" aria-label="Frequently asked questions"><CircleHelp size={21}/></a></header>
    <main className="page">
      <section className="hero"><div className="eyebrow"><span/> YOUR NEXT CHAPTER STARTS HERE</div><h1>The right role starts with<br/>knowing <span>your fit.</span><svg viewBox="0 0 80 70" className="hero-doodle" aria-hidden="true"><path d="M12 47 Q60 53 53 12 M53 12 L40 25 M53 12 L66 24"/></svg></h1><p>Turn “Am I a good fit?” into a clear next step. Compare your resume<br className="desktop-break"/> with a job description and apply with more confidence.</p><div className="hero-benefits"><span><Check size={15}/> Open to everyone</span><span><Check size={15}/> No sign-up needed</span><span><Check size={15}/> Feedback in moments</span></div></section>
      <div className="workspace" id="checker"><section className="checker-card"><div className="card-heading"><div><span className="mini-label">LET’S FIND YOUR FIT</span><h2>Your next opportunity, decoded.</h2></div><span className="step-badge">2 simple steps</span></div>
        <div className="form-section"><div className="field-heading"><span className="number">01</span><div><h3>Add your resume</h3><p>A little about you and everything you bring.</p></div></div><input ref={input} id="resume" type="file" accept=".pdf,.docx,.txt" disabled={busy} onChange={e => choose(e.target.files?.[0])} className="file-input" aria-label="Upload your resume"/>
        <div className={`dropzone ${drag ? 'dragging' : ''} ${file ? 'has-file' : ''}`} onDragOver={e => { e.preventDefault(); if (!busy) setDrag(true) }} onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); if (!busy) choose(e.dataTransfer.files[0]) }}>
        {file ? <><span className="upload-icon"><FileText size={25}/></span><strong className="filename">{file.name}</strong><p>{(file.size / 1024).toFixed(0)} KB · Ready to check</p><button className="text-button" disabled={busy} onClick={() => {setFile(null); setResult(null); if (input.current) input.current.value = ''}}><X size={14}/> Remove file</button></> : <><span className="upload-icon"><Upload size={25}/></span><strong>Drag & drop your resume here</strong><p>or <button className="browse" disabled={busy} onClick={() => input.current?.click()}>browse files</button> from your device</p><small>PDF, DOCX, or TXT · Up to 4 MB</small></>}
        </div></div>
        <div className="form-section job-section"><div className="field-heading"><span className="number">02</span><div><h3><label htmlFor="job">Add the job description</label></h3><p>The role you have your eye on.</p></div></div><textarea id="job" value={job} maxLength={18000} disabled={busy} onChange={e => { setJob(e.target.value); setResult(null) }} placeholder="Paste the job description here, including the responsibilities, required skills, and experience…"/><div className="textarea-caption"><span>More detail means a more useful match.</span><span>{job.length.toLocaleString()} / 18,000</span></div></div>
        {error && <div className="error-message" role="alert">{error}</div>}
        <Button className="analyze-button" disabled={busy} onClick={analyze}>{busy ? <><span className="loading-dot"/> Comparing your experience…</> : <><Sparkles size={18}/> Check my fit <ArrowRight size={18}/></>}</Button><p className="privacy-note"><ShieldCheck size={14}/> Your resume isn’t stored or shared with recruiters.</p>
      </section>
      <aside className="sidebar"><section className="insight-card"><div className="insight-top"><span className="insight-icon"><Target size={21}/></span><span>LESS GUESSWORK. MORE DIRECTION.</span></div><h2>A clearer picture of<br/>your next move.</h2><p>Go beyond a yes or no. Understand how your experience connects to the role.</p><div className="sample-report"><div className="sample-top"><span><FileText size={14}/> YOUR MATCH AT A GLANCE</span><span className="sample-label">Example</span></div><div className="sample-score"><div className="score-ring"><strong>82<span>%</span></strong></div><div><span className="match-badge"><span/> Strong match</span><p>You bring a lot to the table.</p></div></div><div className="sample-row"><span>Relevant skills</span><div><i style={{width:'88%'}}/></div><Check size={14}/></div><div className="sample-row"><span>Experience</span><div><i style={{width:'74%'}}/></div><Check size={14}/></div><div className="sample-row"><span>Qualifications</span><div><i style={{width:'82%'}}/></div><Check size={14}/></div></div><div className="insight-list"><div><span><Target size={18}/></span><p><strong>See where you stand</strong>A match estimate based on the role.</p></div><div><span><ListChecks size={18}/></span><p><strong>Find your strengths & gaps</strong>Know what fits and what’s missing.</p></div><div><span><ArrowUpRight size={18}/></span><p><strong>Make your next move</strong>Get practical ways to improve.</p></div></div></section><div className="gentle-note"><span className="note-spark">✳</span><div><h3>Your potential is more than a score.</h3><p>This is a guide, not a hiring decision. A gap on your resume doesn’t mean you shouldn’t apply.</p></div></div></aside></div>
      {(busy || result) && <section ref={output} className="results" aria-live="polite" aria-busy={busy}>{busy ? <><h2>Connecting your experience to the role…</h2><p>This usually takes a few moments. Keep this page open.</p><div className="skeleton"/><div className="skeleton short"/></> : result && <><div className="results-heading"><div><span className="mini-label">YOUR PERSONAL ROLE CHECK</span><h2>{result.score >= 75 ? 'Strong alignment' : result.score >= 50 ? 'Promising, with some gaps' : 'Significant gaps in the evidence'}</h2></div><strong className="result-score">{result.score}<span>% match</span></strong></div><p className="result-summary">{result.summary}</p><div className="result-columns">{[['Your strengths', result.strengths], ['Gaps in evidence', result.gaps], ['Your next steps', result.actions]].map(([title, items]) => <div key={title as string}><h3>{title as string}</h3><ul>{(items as string[]).length ? (items as string[]).map((item, i) => <li key={i}>{item}</li>) : <li>No specific gaps identified in the supplied information.</li>}</ul></div>)}</div><div className="result-footer"><p>AI-generated guidance based on your documents. Review it for accuracy. This is not a recruitment decision or a guarantee of eligibility.</p><Button variant="outline" onClick={download} disabled={downloading} aria-busy={downloading}><Download size={16}/> {downloading ? 'Preparing PDF…' : 'Download PDF report'}</Button></div></>}</section>}
      <section className="how-section" id="how-it-works"><div><span className="mini-label">FROM UNCERTAINTY TO A NEXT STEP</span><h2>A small check. A more confident application.</h2></div><div className="how-steps"><p><span>01</span><strong>Bring your experience</strong>Upload your current resume.</p><ArrowRight size={18}/><p><span>02</span><strong>Choose your opportunity</strong>Paste the role’s job description.</p><ArrowRight size={18}/><p><span>03</span><strong>Get your perspective</strong>Review your match and next steps.</p></div></section>
      <section id="faq" className="faq"><h2>A few things to know.</h2>{[['Is this a recruitment decision?', 'No. RoleReady offers an AI-generated comparison to help you prepare. Only the employer can determine eligibility and make recruitment decisions. You can still apply when your resume does not match every requirement.'], ['What happens to my resume?', 'Your resume and job description are sent securely to our AI provider to generate your assessment. This application does not save your documents or results, publish them, or send them to recruiters. Results are cleared when you reload; download your report to keep it. Avoid uploading sensitive personal information.'], ['Can anyone check their resume?', 'Yes. No account is required. Upload a PDF, DOCX, or TXT file of up to 4 MB and add a job description with at least 100 characters. For best results, use a readable, text-based resume.'], ['How is the match calculated?', 'AI compares evidence of your skills, experience, and qualifications with the supplied job requirements. The percentage is an estimate, not an objective hiring score. Missing evidence is flagged as a gap, and results may vary.']].map(([q,a]) => <details key={q}><summary>{q}<ChevronDown size={17}/></summary><p>{a}</p></details>)}</section>
    </main><footer><a className="brand" href="/"><span className="brand-icon small"><CheckCheck size={19}/></span>RoleReady<span className="brand-dot">.</span></a><span>A little clarity for your next big step.</span><span>Built for your next chapter.</span></footer>
  </div>
}

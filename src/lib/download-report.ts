import type { Content, TableCell, TDocumentDefinitions } from 'pdfmake/interfaces'

type Report = {
  score: number
  summary: string
  strengths: string[]
  gaps: string[]
  actions: string[]
}

export async function downloadReport(report: Report) {
  const [{ default: pdfMake }, { default: fonts }] = await Promise.all([
    import('pdfmake/build/pdfmake'),
    import('pdfmake/build/vfs_fonts'),
  ])
  const ink = '#26483F'
  const sage = '#658574'
  const muted = '#63716B'
  const date = new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(new Date())
  const alignment = report.score >= 75 ? 'Strong alignment' : report.score >= 50 ? 'Promising, with some gaps' : 'Significant gaps in the evidence'

  function section(number: string, title: string, items: string[], empty: string): Content {
    return {
      margin: [0, 22, 0, 0],
      table: {
        widths: [27, '*'],
        headerRows: 1,
        keepWithHeaderRows: 1,
        dontBreakRows: true,
        body: [
          [
            { text: number, color: sage, bold: true, margin: [0, 4, 0, 10] },
            { text: title, fontSize: 17, color: ink, bold: true, margin: [0, 0, 0, 10] },
          ],
          ...(items.length ? items : [empty]).map((text, index): TableCell[] => [
            { text: String(index + 1).padStart(2, '0'), color: sage, fontSize: 9, margin: [0, 9, 0, 9] },
            { text, margin: [0, 7, 0, 9] },
          ]),
        ],
      },
      layout: {
        hLineWidth: (i) => i === 1 ? 1 : 0,
        vLineWidth: () => 0,
        hLineColor: () => '#DCE5DD',
        paddingLeft: () => 0,
        paddingRight: () => 8,
        paddingTop: () => 0,
        paddingBottom: () => 0,
      },
    }
  }

  const document: TDocumentDefinitions = {
    pageSize: 'A4',
    pageMargins: [46, 93, 46, 64],
    info: { title: 'RoleReady | Your personal role check', author: 'RoleReady', subject: 'Candidate resume guidance' },
    defaultStyle: { font: 'Roboto', fontSize: 10.5, lineHeight: 1.35, color: '#35463E' },
    background: () => ({ canvas: [{ type: 'rect', x: 0, y: 0, w: 595.28, h: 7, color: ink }] }),
    header: {
      margin: [46, 28, 46, 0],
      stack: [
        {
          columns: [
            { svg: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="9" fill="${ink}"/><path d="M8 16l5 5 11-11" fill="none" stroke="#F4F5E9" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`, width: 32 },
            { text: 'RoleReady.', fontSize: 23, bold: true, color: ink, margin: [10, 0, 0, 0] },
            { text: 'CAREER CLARITY\nPersonal assessment', alignment: 'right', fontSize: 9, color: muted, margin: [0, 2, 0, 0] },
          ],
        },
        { canvas: [{ type: 'line', x1: 0, y1: 14, x2: 503, y2: 14, lineWidth: 0.7, lineColor: '#DCE5DD' }] },
      ],
    },
    footer: (page, count) => ({
      margin: [46, 17, 46, 0],
      columns: [
        { text: 'ROLEREADY  /  Candidate guidance, not a hiring decision.', fontSize: 8, color: muted },
        { text: `${page} / ${count}`, alignment: 'right', fontSize: 8, color: muted, width: 45 },
      ],
    }),
    content: [
      { text: 'YOUR NEXT CHAPTER', fontSize: 9, color: sage, bold: true, characterSpacing: 2, margin: [0, 4, 0, 9] },
      { text: 'Your personal role check', fontSize: 29, bold: true, color: ink, lineHeight: 1.1 },
      { text: `Prepared ${date}`, fontSize: 9, color: muted, margin: [0, 9, 0, 22] },
      {
        table: {
          widths: [110, '*'],
          body: [[
            { stack: [
              { text: `${report.score}%`, fontSize: 38, bold: true, color: ink },
              { text: 'ESTIMATED MATCH', fontSize: 8, bold: true, color: muted },
            ], margin: [16, 12, 0, 16] },
            { stack: [
              { text: alignment, fontSize: 16, bold: true, color: ink, margin: [0, 0, 0, 8] },
              { canvas: [
                { type: 'rect', x: 0, y: 0, w: 300, h: 7, color: '#DCE5DD' },
                ...(report.score > 0 ? [{ type: 'rect' as const, x: 0, y: 0, w: 300 * report.score / 100, h: 7, color: sage }] : []),
              ], margin: [0, 0, 0, 9] },
              { text: 'Based on documented evidence in your resume and the supplied job description.', fontSize: 9, color: muted },
            ], margin: [0, 19, 16, 16] },
          ]],
        },
        layout: { fillColor: () => '#F0F3E9', hLineWidth: () => 0, vLineWidth: () => 0 },
      },
      { text: 'At a glance', fontSize: 17, bold: true, color: ink, margin: [0, 23, 0, 9] },
      { text: report.summary },
      section('01', 'Your strengths', report.strengths, 'No specific strengths were identified in the supplied information.'),
      section('02', 'Gaps in evidence', report.gaps, 'No specific gaps were identified in the supplied information.'),
      section('03', 'Your next steps', report.actions, 'Review the job requirements and tailor your resume with relevant evidence.'),
      { text: 'Your potential is more than a score.', fontSize: 13, bold: true, color: ink, margin: [0, 25, 0, 7] },
      { text: 'This AI-generated report is preparation guidance. Review it for accuracy. Missing evidence is not proof of inability, and this assessment does not determine eligibility or guarantee an interview. Only the employer can make a hiring decision.', fontSize: 9, color: muted },
    ],
  }

  const blob = await new Promise<Blob>((resolve) => {
    pdfMake.createPdf(document, undefined, undefined, fonts).getBlob(resolve)
  })
  const url = URL.createObjectURL(blob)
  const link = documentLink(url)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000)
}

function documentLink(url: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = 'roleready-assessment.pdf'
  document.body.appendChild(link)
  return link
}

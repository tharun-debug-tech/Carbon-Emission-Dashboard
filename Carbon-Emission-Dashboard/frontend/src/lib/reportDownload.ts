type ReportSection = {
  heading: string
  rows: Array<[string, string | number]>
}

const sanitizePdfText = (value: string | number) =>
  String(value)
    .normalize('NFKD')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')

const wrapText = (text: string, maxLength = 86) => {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''

  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word
    if (next.length > maxLength && line) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  })

  if (line) lines.push(line)
  return lines
}

function createSimplePdf(title: string, sections: ReportSection[]) {
  const contentLines: string[] = [title, `Generated: ${new Date().toLocaleString()}`, '']

  sections.forEach((section) => {
    contentLines.push(section.heading)
    section.rows.forEach(([label, value]) => {
      contentLines.push(`${label}: ${value}`)
    })
    contentLines.push('')
  })

  const commands: string[] = ['BT', '/F1 18 Tf', '50 760 Td', `(${sanitizePdfText(contentLines[0])}) Tj`]
  let y = 0

  contentLines.slice(1).forEach((line, index) => {
    const wrapped = wrapText(line)
    wrapped.forEach((wrappedLine) => {
      y -= index === 0 && wrappedLine ? 26 : 16
      commands.push(`0 ${y} Td`)
      commands.push(`(${sanitizePdfText(wrappedLine)}) Tj`)
      y = 0
    })
  })

  commands.push('ET')
  const stream = commands.join('\n')
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>\nendobj\n',
    `4 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
  ]

  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((object) => {
    offsets.push(pdf.length)
    pdf += object
  })

  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += '0000000000 65535 f \n'
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return pdf
}

export function downloadPdfReport(title: string, filename: string, sections: ReportSection[]) {
  const pdf = createSimplePdf(title, sections)
  const blob = new Blob([pdf], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function reportDateStamp() {
  return new Date().toISOString().split('T')[0]
}

export function slugifyFilename(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

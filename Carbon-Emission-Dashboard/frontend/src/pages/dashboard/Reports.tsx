// src/pages/dashboard/Reports.tsx
import { useState } from 'react'
import { FileText, Download, Calendar, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { downloadPdfReport, reportDateStamp, slugifyFilename } from '@/lib/reportDownload'

interface ReportItem {
  id: string
  title: string
  period: string
  date: string
  status: 'ready' | 'generating'
  size: string
}

export default function Reports() {
  const [reports, setReports] = useState<ReportItem[]>([
    { id: '1', title: 'Monthly Carbon Audit - June 2024', period: 'June 1 - June 30, 2024', date: '2024-07-01', status: 'ready', size: '1.4 MB' },
    { id: '2', title: 'Quarterly Sustainability Summary Q1', period: 'Jan 1 - Mar 31, 2024', date: '2024-04-02', status: 'ready', size: '2.8 MB' },
    { id: '3', title: 'Annual GHG Emissions Report 2023', period: 'Jan 1 - Dec 31, 2023', date: '2024-01-05', status: 'ready', size: '4.5 MB' },
  ])

  const handleGenerateReport = () => {
    const newRep: ReportItem = {
      id: Date.now().toString(),
      title: `Carbon Audit Report - ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`,
      period: 'Current Month',
      date: new Date().toISOString().split('T')[0],
      status: 'ready',
      size: '1.2 MB',
    }
    setReports([newRep, ...reports])
    toast.success('New report generated successfully!')
  }

  const handleDownload = (report: ReportItem) => {
    downloadPdfReport(report.title, `${slugifyFilename(report.title)}-${reportDateStamp()}.pdf`, [
      {
        heading: 'Report Details',
        rows: [
          ['Title', report.title],
          ['Period', report.period],
          ['Generated Date', report.date],
          ['Status', report.status],
          ['Estimated Size', report.size],
        ],
      },
      {
        heading: 'EcoTrack Summary',
        rows: [
          ['Scope', 'Carbon auditing and GHG compliance'],
          ['Format', 'Client-generated PDF report'],
          ['Source', 'EcoTrack Analytics dashboard data'],
        ],
      },
    ])
    toast.success(`${report.title} downloaded.`)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <FileText className="text-emerald-400" /> Sustainability Reports
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Download certified PDF & CSV reports for carbon auditing and GHG compliance.
          </p>
        </div>

        <button
          onClick={handleGenerateReport}
          className="btn-primary py-2.5 px-5 text-sm flex items-center gap-2 self-start md:self-auto"
        >
          <FileText size={16} /> Generate New Report
        </button>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.map((rep) => (
          <div key={rep.id} className="card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-emerald-500/30 transition-all">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 flex-shrink-0">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base">{rep.title}</h3>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-3">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {rep.period}</span>
                  <span>•</span>
                  <span>Size: {rep.size}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 size={12} /> Ready
              </span>
              <button
                onClick={() => handleDownload(rep)}
                className="btn-secondary py-2 px-4 text-xs flex items-center gap-1.5"
              >
                <Download size={14} /> Download PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


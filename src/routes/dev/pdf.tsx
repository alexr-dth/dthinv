import { createFileRoute } from '@tanstack/react-router'
import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'

export const Route = createFileRoute('/dev/pdf')({
  component: RouteComponent,
})

function RouteComponent() {
  const head = [['Description/Name', 'SKU', 'Remarks', 'Price', 'Quantity']]
  const body = [
    [
      'Hammer, 16oz Claw asdadasddddddddddd dddddddddddddddddddd dddddddddddddddddddddd dddddddddddddddddddddddd ddddddd',
      'HD-001',
      'n/a',
      12.5,
      10,
    ],
    ['Screwdriver Set (6 pcs)', 'HD-002', 'Preferred brand: Stanley', 18.75, 5],
    ['Measuring Tape 5m', 'HD-003', 'n/a', 7.2, 12],
    ['Drill Bit Set (10 pcs, HSS)', 'HD-004', 'Urgent', 22.0, 4],
    ['Safety Gloves (Pair, Large)', 'HD-005', 'n/a', 3.5, 20],
  ]

  function generate({
    pdfName = `order-${new Date(Date.now()).toLocaleDateString()}`,
    head,
    body,
  }) {
    const doc = new jsPDF({
      orientation: 'p', // portrait
      unit: 'mm', // measurement unit
      format: 'letter', // 210 × 297 inmm
    })

    const inch = 25.4
    const margin = inch / 2
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const usableWidth = pageWidth - margin * 2
    const usableHeight = pageHeight - margin * 2

    let horizontal = margin
    let vertical = margin

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.text('Order Request', horizontal, vertical)

    autoTable(doc, {
      head: head,
      body: body,
      startY: vertical + 8,
      tableWidth: usableWidth,
      margin: { left: margin, right: margin, top: margin, bottom: margin },
      didDrawPage: (data) => {
        doc.setFontSize(9)
        doc.setTextColor(120)
        doc.text(
          `Page ${doc.internal?.getNumberOfPages()}`,
          margin,
          pageHeight - margin + getFontSizeHeight(9),
        )
      },
      styles: {},
      columnStyles: {
        0: {}, // Description/Name
        1: {}, // SKU
        2: {}, // Remarks
        3: { halign: 'center' }, // Price
        4: { halign: 'center' }, // Quantity
      },
    })

    doc.save(`${pdfName}.pdf`)
  }

  const getFontSizeHeight = (fontSize) => (fontSize * 25.4) / 72

  return (
    <div className="page-container">
      <button className="btn" onClick={() => generate({ head, body })}>
        Generate
      </button>
    </div>
  )
}

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const getFontSizeHeight = (fontSize) => (fontSize * 25.4) / 72

export default function generateOrderPdf({
  pdfName = `order-${new Date(Date.now()).toLocaleDateString()}`,
  order,
  head,
  body,
  marginInch = 0.5,
}) {
  const doc = new jsPDF({
    orientation: 'p', // portrait
    unit: 'mm', // measurement unit
    format: 'letter', // 210 × 297 inmm
  })

  const formatedDate = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const inch = 25.4
  const margin = inch * marginInch
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const usableWidth = pageWidth - margin * 2
  const usableHeight = pageHeight - margin * 2

  let horizontal = margin
  let vertical = margin

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('Order Details', horizontal, vertical)

  vertical += 8
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setLineWidth(2)
  doc.text('Order by: ', horizontal, vertical)
  vertical += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(14)
  doc.setLineWidth(1)
  doc.text(order.actor?.username || 'n/a', horizontal, vertical)

  vertical += 8
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setLineWidth(2)
  doc.text('Date: ', horizontal, vertical)
  vertical += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(14)
  doc.setLineWidth(1)
  doc.text(formatedDate, horizontal, vertical)

  vertical += 8
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setLineWidth(2)
  doc.text('Order name: ', horizontal, vertical)
  vertical += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(14)
  doc.setLineWidth(1)
  doc.text(order.name || 'n/a', horizontal, vertical)

  vertical += 8
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setLineWidth(2)
  doc.text('Notes: ', horizontal, vertical)
  vertical += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(14)
  doc.setLineWidth(1)
  doc.text(order.notes || 'n/a', horizontal, vertical)

  vertical += 8
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setLineWidth(2)
  doc.text('Supplier Order Number: ', horizontal, vertical)
  vertical += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(14)
  doc.setLineWidth(1)
  doc.text(order.supplier_tracking_id || 'n/a', horizontal, vertical)

  vertical += 8
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setLineWidth(2)
  doc.text('Products Included: ', horizontal, vertical)
  autoTable(doc, {
    head: head,
    body: body,
    startY: (vertical += 2),
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
    // columnStyles: {
    //   0: {}, // Image
    //   1: {}, // Name
    //   3: { halign: 'center' }, // Description
    //   4: { halign: 'center' }, // Quantity
    // },
  })

  doc.save(`${pdfName}.pdf`)
}

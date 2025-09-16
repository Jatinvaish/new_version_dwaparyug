// import PDFDocument from 'pdfkit'

// interface Generate80GCertificateData {
//   certificate_number: string
//   issue_date: string
//   financial_year: string
//   donor: {
//     name: string
//     email: string
//     phone?: string
//   }
//   organization: {
//     name: string
//     address: string
//     registration_number: string
//     pan: string
//     '80g_number': string
//     phone: string
//     email: string
//     website: string
//   }
//   donations: Array<{
//     id: number
//     amount: number
//     date: string
//     payment_id: string
//     campaign: string
//   }>
//   total_amount: number
//   amount_in_words: string
// }

// export async function generatePDF(
//   templateType: '80g-certificate',
//   data: Generate80GCertificateData
// ): Promise<Buffer> {
//   return new Promise((resolve, reject) => {
//     console.log("🚀 ~ generatePDF ~ new:",  )
//     try {
//       const doc = new PDFDocument({
//         size: 'A4',
//         margin: 50,
//         info: {
//           Title: '80G Tax Exemption Certificate',
//           Author: data.organization.name,
//           Subject: `Certificate ${data.certificate_number}`,
//           Keywords: '80G, Tax Exemption, Donation Certificate'
//         }
//       })

//       const buffers: Buffer[] = []
//       doc.on('data', buffers.push.bind(buffers))
//       doc.on('end', () => {
//         const pdfData = Buffer.concat(buffers)
//         resolve(pdfData)
//       })
//       doc.on('error', reject)

//       // Header
//       doc.fontSize(20)
//         .fillColor('#2c3e50')
//         .text('TAX EXEMPTION CERTIFICATE', 50, 50, { align: 'center' })
//         .fontSize(16)
//         .text('Under Section 80G of the Income Tax Act, 1961', 50, 80, { align: 'center' })

//       // Certificate border
//       doc.rect(40, 40, 515, 750).stroke('#2c3e50')

//       // Organization details
//       doc.fontSize(14)
//         .fillColor('#34495e')
//         .text(data.organization.name, 50, 120, { align: 'center' })
//         .fontSize(10)
//         .text(data.organization.address, 50, 140, { align: 'center' })
//         .text(`Email: ${data.organization.email} | Phone: ${data.organization.phone}`, 50, 155, { align: 'center' })
//         .text(`Website: ${data.organization.website}`, 50, 170, { align: 'center' })

//       // Certificate details section
//       doc.fontSize(12)
//         .fillColor('#2c3e50')
//         .text('CERTIFICATE DETAILS', 50, 210)
//         .fontSize(10)
//         .fillColor('#000')

//       const detailsY = 230
//       doc.text(`Certificate Number: ${data.certificate_number}`, 50, detailsY)
//         .text(`Issue Date: ${new Date(data.issue_date).toLocaleDateString('en-IN')}`, 300, detailsY)
//         .text(`Financial Year: ${data.financial_year}`, 50, detailsY + 15)
//         .text(`80G Registration Number: ${data.organization['80g_number']}`, 300, detailsY + 15)
//         .text(`PAN: ${data.organization.pan}`, 50, detailsY + 30)
//         .text(`Registration Number: ${data.organization.registration_number}`, 300, detailsY + 30)

//       // Donor details
//       doc.fontSize(12)
//         .fillColor('#2c3e50')
//         .text('DONOR DETAILS', 50, 310)
//         .fontSize(10)
//         .fillColor('#000')

//       const donorY = 330
//       doc.text(`Name: ${data.donor.name}`, 50, donorY)
//         .text(`Email: ${data.donor.email}`, 50, donorY + 15)

//       if (data.donor.phone) {
//         doc.text(`Phone: ${data.donor.phone}`, 50, donorY + 30)
//       }

//       // Donation details
//       doc.fontSize(12)
//         .fillColor('#2c3e50')
//         .text('DONATION DETAILS', 50, 400)

//       // Table headers
//       doc.fontSize(9)
//         .fillColor('#fff')
//         .rect(50, 420, 505, 20)
//         .fill('#34495e')
//         .fillColor('#fff')
//         .text('S.No', 55, 427)
//         .text('Date', 90, 427)
//         .text('Campaign', 150, 427)
//         .text('Payment ID', 280, 427)
//         .text('Amount (₹)', 450, 427)

//       // Table rows
//       let currentY = 445
//       doc.fillColor('#000')
//       data.donations.forEach((donation, index) => {
//         if (currentY > 650) { // Add new page if needed
//           doc.addPage()
//           currentY = 50
//         }

//         // Alternate row colors
//         if (index % 2 === 0) {
//           doc.rect(50, currentY - 5, 505, 20).fill('#f8f9fa')
//         }

//         doc.fillColor('#000')
//           .text((index + 1).toString(), 55, currentY)
//           .text(new Date(donation.date).toLocaleDateString('en-IN'), 90, currentY)
//           .text(donation.campaign.substring(0, 25) + (donation.campaign.length > 25 ? '...' : ''), 150, currentY)
//           .text(donation.payment_id.substring(0, 15) + '...', 280, currentY)
//           .text(donation.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }), 450, currentY)

//         currentY += 20
//       })

//       // Total amount section
//       const totalY = currentY + 20
//       doc.rect(50, totalY, 505, 25).fill('#e8f4fd')
//         .fillColor('#000')
//         .fontSize(11)
//         .text('TOTAL DONATION AMOUNT:', 300, totalY + 8)
//         .fontSize(12)
//         .fillColor('#2c3e50')
//         .text(`₹${data.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 450, totalY + 8)

//       // Amount in words
//       doc.fontSize(10)
//         .fillColor('#000')
//         .text(`Amount in Words: ${data.amount_in_words}`, 50, totalY + 40, { width: 500 })

//       // Certification statement
//       const certY = totalY + 80
//       doc.fontSize(11)
//         .text('CERTIFICATION', 50, certY)
//         .fontSize(10)
//         .text(`This is to certify that ${data.donor.name} has donated a total amount of ₹${data.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${data.amount_in_words}) to ${data.organization.name} during the financial year ${data.financial_year}.`, 50, certY + 20, { width: 500, align: 'justify' })
//         .text(`The donation(s) are eligible for deduction under Section 80G of the Income Tax Act, 1961. This certificate is issued for the purpose of claiming tax deduction.`, 50, certY + 60, { width: 500, align: 'justify' })

//       // Important notes
//       doc.fontSize(9)
//         .fillColor('#e74c3c')
//         .text('IMPORTANT NOTES:', 50, certY + 120)
//         .fillColor('#000')
//         .text('• This certificate is valid for Income Tax purposes only', 50, certY + 135)
//         .text('• Please retain this certificate for your tax filing records', 50, certY + 150)
//         .text('• This certificate is computer generated and does not require physical signature', 50, certY + 165)
//         .text(`• For any queries, please contact: ${data.organization.email}`, 50, certY + 180)

//       // Footer
//       doc.fontSize(8)
//         .fillColor('#7f8c8d')
//         .text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 50, 750, { align: 'left' })
//         .text(`Certificate ID: ${data.certificate_number}`, 350, 750, { align: 'right' })

//       doc.end()

//     } catch (error) {
//       reject(error)
//     }
//   })
// }





import PDFDocument from 'pdfkit'

interface Generate80GCertificateData {
  certificate_number: string
  issue_date: string
  financial_year: string
  donor: {
    name: string
    email: string
    phone?: string
  }
  organization: {
    name: string
    address: string
    registration_number: string
    pan: string
    '80g_number': string
    phone: string
    email: string
    website: string
  }
  donations: Array<{
    id: number
    amount: number
    date: string
    payment_id: string
    campaign: string
  }>
  total_amount: number
  amount_in_words: string
}

export async function generatePDF(
  templateType: '80g-certificate',
  data: Generate80GCertificateData
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    console.log("🚀 ~ generatePDF ~ new:")
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        // Remove font configuration to use default fonts
        info: {
          Title: '80G Tax Exemption Certificate',
          Author: data.organization.name,
          Subject: `Certificate ${data.certificate_number}`,
          Keywords: '80G, Tax Exemption, Donation Certificate'
        }
      })

      const buffers: Buffer[] = []
      doc.on('data', buffers.push.bind(buffers))
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers)
        resolve(pdfData)
      })
      doc.on('error', reject)

      // Header - Use default font (Helvetica is built-in)
      doc.font('Helvetica-Bold')
        .fontSize(20)
        .fillColor('#2c3e50')
        .text('TAX EXEMPTION CERTIFICATE', 50, 50, { align: 'center' })
        
      doc.font('Helvetica')
        .fontSize(16)
        .text('Under Section 80G of the Income Tax Act, 1961', 50, 80, { align: 'center' })

      // Certificate border
      doc.rect(40, 40, 515, 750).stroke('#2c3e50')

      // Organization details
      doc.font('Helvetica-Bold')
        .fontSize(14)
        .fillColor('#34495e')
        .text(data.organization.name, 50, 120, { align: 'center' })
        
      doc.font('Helvetica')
        .fontSize(10)
        .text(data.organization.address, 50, 140, { align: 'center' })
        .text(`Email: ${data.organization.email} | Phone: ${data.organization.phone}`, 50, 155, { align: 'center' })
        .text(`Website: ${data.organization.website}`, 50, 170, { align: 'center' })

      // Certificate details section
      doc.font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#2c3e50')
        .text('CERTIFICATE DETAILS', 50, 210)
        
      doc.font('Helvetica')
        .fontSize(10)
        .fillColor('#000')

      const detailsY = 230
      doc.text(`Certificate Number: ${data.certificate_number}`, 50, detailsY)
        .text(`Issue Date: ${new Date(data.issue_date).toLocaleDateString('en-IN')}`, 300, detailsY)
        .text(`Financial Year: ${data.financial_year}`, 50, detailsY + 15)
        .text(`80G Registration Number: ${data.organization['80g_number']}`, 300, detailsY + 15)
        .text(`PAN: ${data.organization.pan}`, 50, detailsY + 30)
        .text(`Registration Number: ${data.organization.registration_number}`, 300, detailsY + 30)

      // Donor details
      doc.font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#2c3e50')
        .text('DONOR DETAILS', 50, 310)
        
      doc.font('Helvetica')
        .fontSize(10)
        .fillColor('#000')

      const donorY = 330
      doc.text(`Name: ${data.donor.name}`, 50, donorY)
        .text(`Email: ${data.donor.email}`, 50, donorY + 15)

      if (data.donor.phone) {
        doc.text(`Phone: ${data.donor.phone}`, 50, donorY + 30)
      }

      // Donation details
      doc.font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#2c3e50')
        .text('DONATION DETAILS', 50, 400)

      // Table headers
      doc.font('Helvetica-Bold')
        .fontSize(9)
        .fillColor('#fff')
        .rect(50, 420, 505, 20)
        .fill('#34495e')
        .fillColor('#fff')
        .text('S.No', 55, 427)
        .text('Date', 90, 427)
        .text('Campaign', 150, 427)
        .text('Payment ID', 280, 427)
        .text('Amount (₹)', 450, 427)

      // Table rows
      let currentY = 445
      doc.font('Helvetica')
        .fillColor('#000')
      
      data.donations.forEach((donation, index) => {
        if (currentY > 650) { // Add new page if needed
          doc.addPage()
          currentY = 50
        }

        // Alternate row colors
        if (index % 2 === 0) {
          doc.rect(50, currentY - 5, 505, 20).fill('#f8f9fa')
        }

        doc.fillColor('#000')
          .text((index + 1).toString(), 55, currentY)
          .text(new Date(donation.date).toLocaleDateString('en-IN'), 90, currentY)
          .text(donation.campaign.substring(0, 25) + (donation.campaign.length > 25 ? '...' : ''), 150, currentY)
          .text(donation.payment_id.substring(0, 15) + '...', 280, currentY)
          .text(donation.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }), 450, currentY)

        currentY += 20
      })

      // Total amount section
      const totalY = currentY + 20
      doc.rect(50, totalY, 505, 25).fill('#e8f4fd')
        
      doc.font('Helvetica-Bold')
        .fillColor('#000')
        .fontSize(11)
        .text('TOTAL DONATION AMOUNT:', 300, totalY + 8)
        .fontSize(12)
        .fillColor('#2c3e50')
        .text(`₹${data.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 450, totalY + 8)

      // Amount in words
      doc.font('Helvetica')
        .fontSize(10)
        .fillColor('#000')
        .text(`Amount in Words: ${data.amount_in_words}`, 50, totalY + 40, { width: 500 })

      // Certification statement
      const certY = totalY + 80
      doc.font('Helvetica-Bold')
        .fontSize(11)
        .text('CERTIFICATION', 50, certY)
        
      doc.font('Helvetica')
        .fontSize(10)
        .text(`This is to certify that ${data.donor.name} has donated a total amount of ₹${data.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${data.amount_in_words}) to ${data.organization.name} during the financial year ${data.financial_year}.`, 50, certY + 20, { width: 500, align: 'justify' })
        .text(`The donation(s) are eligible for deduction under Section 80G of the Income Tax Act, 1961. This certificate is issued for the purpose of claiming tax deduction.`, 50, certY + 60, { width: 500, align: 'justify' })

      // Important notes
      doc.font('Helvetica-Bold')
        .fontSize(9)
        .fillColor('#e74c3c')
        .text('IMPORTANT NOTES:', 50, certY + 120)
        
      doc.font('Helvetica')
        .fillColor('#000')
        .text('• This certificate is valid for Income Tax purposes only', 50, certY + 135)
        .text('• Please retain this certificate for your tax filing records', 50, certY + 150)
        .text('• This certificate is computer generated and does not require physical signature', 50, certY + 165)
        .text(`• For any queries, please contact: ${data.organization.email}`, 50, certY + 180)

      // Footer
      doc.fontSize(8)
        .fillColor('#7f8c8d')
        .text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 50, 750, { align: 'left' })
        .text(`Certificate ID: ${data.certificate_number}`, 350, 750, { align: 'right' })

      doc.end()

    } catch (error) {
      reject(error)
    }
  })
}
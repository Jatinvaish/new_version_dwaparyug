// File: app/api/batches/generate-pdf/route.ts
// Alternative simpler approach

import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

interface PdfGenerationRequest {
  html: string
  options?: any
  filename?: string
}

export async function POST(request: NextRequest) {
  console.log('PDF Generation request received')
  
  try {
    const body: PdfGenerationRequest = await request.json()
    
    if (!body.html) {
      return NextResponse.json(
        { error: 'HTML content is required' },
        { status: 400 }
      )
    }

    console.log('HTML content length:', body.html.length)

    // Simpler Puppeteer configuration
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      timeout: 0
    })

    console.log('Browser launched')

    const page = await browser.newPage()
    
    console.log('New page created')

    // Set content with minimal waiting
    await page.setContent(body.html, { 
      waitUntil: 'load',
      timeout: 15000 
    })

    console.log('Content set')

    // Simple PDF options
    const pdfOptions = {
      format: 'A4' as const,
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      timeout: 15000
    }

    console.log('Generating PDF...')

    // Generate PDF
    const pdf:any = await page.pdf(pdfOptions)

    console.log('PDF generated, size:', pdf.length)

    // Close browser immediately after PDF generation
    await browser.close()

    console.log('Browser closed')

    // Return the PDF
    return new Response(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${body.filename || 'stickers.pdf'}"`,
        'Content-Length': pdf.length.toString(),
      }
    })

  } catch (error) {
    console.error('PDF Generation failed:', error)
    
    return NextResponse.json(
      {
        error: 'PDF generation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : '') : undefined
      },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  try {
    // Quick Puppeteer test
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    await browser.close()
    
    return NextResponse.json({ 
      status: 'ok', 
      message: 'Puppeteer is working',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      message: 'Puppeteer not working',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
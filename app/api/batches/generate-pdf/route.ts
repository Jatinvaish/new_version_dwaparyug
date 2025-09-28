// File: app/api/batches/generate-pdf/route.ts
// Fixed version with proper Chrome detection and fallbacks

import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

interface PdfGenerationRequest {
  html: string
  options?: any
  filename?: string
}

// Function to get Chrome executable path
function getChromeExecutablePath(): string | undefined {
  // Common Chrome paths on different systems
  const chromePaths = [
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/opt/google/chrome/chrome',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // macOS
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Windows
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe' // Windows 32-bit
  ]

  // Check if any of these paths exist
  const fs = require('fs')
  for (const path of chromePaths) {
    try {
      if (fs.existsSync(path)) {
        return path
      }
    } catch (error) {
      continue
    }
  }

  return undefined
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

    // Try to find Chrome executable
    const chromeExecutablePath = getChromeExecutablePath()
    
    // Enhanced Puppeteer configuration with fallback options
    const browserOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process', // This can help with resource-constrained environments
        '--disable-gpu'
      ],
      timeout: 30000,
      ...(chromeExecutablePath && { executablePath: chromeExecutablePath })
    }

    console.log('Launching browser with options:', {
      executablePath: chromeExecutablePath || 'bundled',
      args: browserOptions.args
    })

    const browser = await puppeteer.launch(browserOptions)

    console.log('Browser launched successfully')

    const page = await browser.newPage()
    
    console.log('New page created')

    // Set viewport to ensure consistent rendering
    await page.setViewport({ width: 1200, height: 800 })

    // Set content with extended timeout
    await page.setContent(body.html, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    })

    console.log('Content set and loaded')

    // PDF options with better defaults
    const pdfOptions = {
      format: 'A4' as const,
      printBackground: true,
      margin: { 
        top: '10mm', 
        right: '10mm', 
        bottom: '10mm', 
        left: '10mm' 
      },
      timeout: 30000,
      preferCSSPageSize: true
    }

    console.log('Generating PDF...')

    // Generate PDF
    const pdf:any = await page.pdf(pdfOptions)

    console.log('PDF generated successfully, size:', pdf.length)

    // Close browser
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
    
    // Enhanced error reporting
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const isChromeMissing = errorMessage.includes('Could not find Chrome') || 
                           errorMessage.includes('Could not find browser')
    
    return NextResponse.json(
      {
        error: 'PDF generation failed',
        message: errorMessage,
        suggestion: isChromeMissing ? 
          'Chrome browser not found. Please install Chrome or configure Puppeteer properly.' :
          'Check server logs for detailed error information.',
        stack: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.stack : '') : undefined
      },
      { status: 500 }
    )
  }
}

// Enhanced health check endpoint
export async function GET() {
  try {
    console.log('Health check: Testing Puppeteer configuration')
    
    const chromeExecutablePath = getChromeExecutablePath()
    console.log('Chrome path found:', chromeExecutablePath || 'Using bundled Chromium')
    
    // Test browser launch
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ],
      timeout: 15000,
      ...(chromeExecutablePath && { executablePath: chromeExecutablePath })
    })
    
    console.log('Browser launched successfully for health check')
    
    // Quick test
    const page = await browser.newPage()
    await page.setContent('<html><body><h1>Test</h1></body></html>')
    const pdf = await page.pdf({ format: 'A4' })
    
    await browser.close()
    console.log('Health check completed successfully')
    
    return NextResponse.json({ 
      status: 'ok', 
      message: 'Puppeteer is working correctly',
      chromeExecutablePath: chromeExecutablePath || 'bundled',
      testPdfSize: pdf.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Health check failed:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json({ 
      status: 'error', 
      message: 'Puppeteer health check failed',
      error: errorMessage,
      suggestion: errorMessage.includes('Could not find Chrome') ?
        'Install Chrome: sudo apt-get update && sudo apt-get install -y google-chrome-stable' :
        'Check server configuration and logs'
    }, { status: 500 })
  }
}



// File: app/api/batches/generate-pdf/route.ts
// Complete Vercel-optimized PDF generation API

// import { NextRequest, NextResponse } from 'next/server'
// import puppeteer from 'puppeteer-core'
// import chromium from '@sparticuz/chromium'

// interface PdfGenerationRequest {
//   html: string
//   options?: {
//     format?: 'A4' | 'A3' | 'A5' | 'Letter' | 'Legal'
//     margin?: {
//       top?: string
//       right?: string
//       bottom?: string
//       left?: string
//     }
//     printBackground?: boolean
//     landscape?: boolean
//     scale?: number
//   }
//   filename?: string
// }

// export async function POST(request: NextRequest) {
//   console.log('PDF Generation request received on Vercel')
  
//   try {
//     const body: PdfGenerationRequest = await request.json()
    
//     if (!body.html) {
//       return NextResponse.json(
//         { error: 'HTML content is required' },
//         { status: 400 }
//       )
//     }

//     console.log('HTML content length:', body.html.length)

//     // Vercel-optimized browser configuration
//     const browserOptions = {
//       args: [
//         ...chromium.args,
//         '--hide-scrollbars',
//         '--disable-web-security',
//         '--disable-features=VizDisplayCompositor',
//         '--disable-dev-shm-usage',
//         '--disable-gpu',
//         '--single-process',
//         '--no-zygote',
//         '--no-first-run'
//       ],
//       defaultViewport: {
//         width: 1280,
//         height: 720
//       },
//       executablePath: await chromium.executablePath(),
//       headless: true,
//       ignoreHTTPSErrors: true,
//     }

//     console.log('Launching browser on Vercel...')
//     const startTime = Date.now()

//     const browser = await puppeteer.launch(browserOptions)
//     console.log(`Browser launched in ${Date.now() - startTime}ms`)

//     const page = await browser.newPage()
    
//     // Set a reasonable viewport
//     await page.setViewport({ width: 1280, height: 720 })

//     // Set content with optimized loading strategy
//     await page.setContent(body.html, { 
//       waitUntil: 'networkidle2', // Faster than networkidle0
//       timeout: 25000 
//     })

//     console.log('Content loaded successfully')

//     // Build PDF options from request
//     const defaultOptions = {
//       format: 'A4' as const,
//       printBackground: true,
//       margin: { 
//         top: '10mm', 
//         right: '10mm', 
//         bottom: '10mm', 
//         left: '10mm' 
//       },
//       timeout: 25000,
//       preferCSSPageSize: true
//     }

//     const pdfOptions = {
//       ...defaultOptions,
//       ...(body.options && {
//         format: body.options.format || defaultOptions.format,
//         printBackground: body.options.printBackground ?? defaultOptions.printBackground,
//         landscape: body.options.landscape || false,
//         scale: body.options.scale || 1,
//         margin: body.options.margin ? {
//           top: body.options.margin.top || defaultOptions.margin.top,
//           right: body.options.margin.right || defaultOptions.margin.right,
//           bottom: body.options.margin.bottom || defaultOptions.margin.bottom,
//           left: body.options.margin.left || defaultOptions.margin.left,
//         } : defaultOptions.margin
//       })
//     }

//     console.log('Generating PDF with options:', JSON.stringify(pdfOptions, null, 2))

//     const pdfStartTime = Date.now()
//     const pdf = await page.pdf(pdfOptions)
//     console.log(`PDF generated in ${Date.now() - pdfStartTime}ms, size: ${pdf.length} bytes`)

//     await browser.close()
//     console.log(`Total processing time: ${Date.now() - startTime}ms`)

//     const filename = body.filename || `document-${Date.now()}.pdf`

//     return new Response(pdf, {
//       status: 200,
//       headers: {
//         'Content-Type': 'application/pdf',
//         'Content-Disposition': `attachment; filename="${filename}"`,
//         'Content-Length': pdf.length.toString(),
//         'Cache-Control': 'no-cache, no-store, must-revalidate',
//         'X-PDF-Size': pdf.length.toString(),
//         'X-Generation-Time': `${Date.now() - startTime}ms`
//       }
//     })

//   } catch (error) {
//     console.error('PDF Generation failed:', error)
    
//     const errorMessage = error instanceof Error ? error.message : 'Unknown error'
//     const stack = error instanceof Error ? error.stack : undefined
    
//     // Enhanced error response for debugging
//     return NextResponse.json(
//       {
//         error: 'PDF generation failed',
//         message: errorMessage,
//         platform: 'vercel',
//         timestamp: new Date().toISOString(),
//         suggestions: [
//           'Check that HTML is valid and not too complex',
//           'Verify @sparticuz/chromium is installed correctly',
//           'Ensure function timeout is sufficient',
//           'Consider reducing HTML complexity for faster generation'
//         ],
//         ...(process.env.NODE_ENV === 'development' && { stack })
//       },
//       { status: 500 }
//     )
//   }
// }

// // Health check endpoint optimized for Vercel
// export async function GET() {
//   const startTime = Date.now()
  
//   try {
//     console.log('Health check: Testing Puppeteer on Vercel')
    
//     // Test chromium executable path
//     const executablePath = await chromium.executablePath()
//     console.log('Chromium executable path:', executablePath)

//     const browser = await puppeteer.launch({
//       args: [
//         ...chromium.args,
//         '--hide-scrollbars',
//         '--disable-web-security',
//         '--disable-dev-shm-usage'
//       ],
//       defaultViewport: chromium.defaultViewport,
//       executablePath,
//       headless: true,
//     })
    
//     const browserStartTime = Date.now() - startTime
//     console.log(`Browser launched in ${browserStartTime}ms`)
    
//     const page = await browser.newPage()
//     await page.setContent(`
//       <html>
//         <head>
//           <style>
//             body { font-family: Arial, sans-serif; padding: 20px; }
//             .success { color: green; font-weight: bold; }
//             .info { color: blue; margin: 10px 0; }
//           </style>
//         </head>
//         <body>
//           <h1 class="success">✅ Vercel PDF Generation Health Check</h1>
//           <div class="info">Timestamp: ${new Date().toISOString()}</div>
//           <div class="info">Platform: Vercel Serverless</div>
//           <div class="info">Chromium: Ready</div>
//           <div class="info">Puppeteer: Working</div>
//         </body>
//       </html>
//     `, { waitUntil: 'networkidle2', timeout: 10000 })
    
//     const pdf = await page.pdf({ 
//       format: 'A4', 
//       printBackground: true,
//       margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
//     })
    
//     await browser.close()
    
//     const totalTime = Date.now() - startTime
//     console.log(`Health check completed in ${totalTime}ms`)
    
//     return NextResponse.json({ 
//       status: 'healthy',
//       message: '✅ PDF generation is working correctly on Vercel',
//       platform: 'vercel',
//       chromium: {
//         version: 'latest',
//         executablePath: executablePath.substring(0, 50) + '...'
//       },
//       performance: {
//         browserStartTime: `${browserStartTime}ms`,
//         totalTime: `${totalTime}ms`,
//         testPdfSize: pdf.length
//       },
//       capabilities: {
//         formats: ['A4', 'A3', 'A5', 'Letter', 'Legal'],
//         features: ['margins', 'backgrounds', 'landscape', 'scaling'],
//         maxTimeout: '30s (Pro plan)'
//       },
//       timestamp: new Date().toISOString()
//     })
    
//   } catch (error) {
//     console.error('Health check failed:', error)
    
//     const errorMessage = error instanceof Error ? error.message : 'Unknown error'
//     const totalTime = Date.now() - startTime
    
//     return NextResponse.json({ 
//       status: 'unhealthy',
//       message: '❌ PDF generation health check failed',
//       error: errorMessage,
//       platform: 'vercel',
//       performance: {
//         failedAfter: `${totalTime}ms`
//       },
//       troubleshooting: {
//         commonIssues: [
//           'Missing @sparticuz/chromium dependency',
//           'Function timeout (upgrade to Pro for 30s limit)',
//           'Memory limit exceeded',
//           'Invalid HTML causing render issues'
//         ],
//         solutions: [
//           'npm install puppeteer-core @sparticuz/chromium',
//           'Add "export const maxDuration = 30" to route',
//           'Simplify HTML content',
//           'Check Vercel function logs for details'
//         ]
//       },
//       timestamp: new Date().toISOString()
//     }, { status: 500 })
//   }
// }

// // Configure Vercel function settings
// export const maxDuration = 30 // Requires Pro plan for 30s, Hobby plan limited to 10s
// export const runtime = 'nodejs18.x'
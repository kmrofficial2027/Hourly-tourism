import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    console.error('================ CLIENT-SIDE ERROR CAUGHT ON DEVICE ================')
    console.error('URL:', body.url)
    console.error('Message:', body.message)
    console.error('Digest:', body.digest)
    console.error('Stack:', body.stack)
    console.error('=====================================================================')
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}


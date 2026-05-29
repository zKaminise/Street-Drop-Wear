import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    let bar = await (prisma as any).announcementBar.findFirst()
    if (!bar) {
      bar = { id: 'default', messages: '[]', active: false, speed: 5000 }
    }
    return NextResponse.json({
      ...bar,
      messages: JSON.parse(bar.messages || '[]'),
    })
  } catch {
    return NextResponse.json({ messages: [], active: false, speed: 5000 })
  }
}

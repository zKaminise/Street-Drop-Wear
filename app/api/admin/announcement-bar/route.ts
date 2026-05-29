import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    let bar = await (prisma as any).announcementBar.findFirst()
    if (!bar) bar = { id: null, messages: '[]', active: false, speed: 5000 }
    return NextResponse.json({ ...bar, messages: JSON.parse(bar.messages || '[]') })
  } catch {
    return NextResponse.json({ messages: [], active: false, speed: 5000 })
  }
}

export async function PUT(req: NextRequest) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const messages = Array.isArray(body.messages) ? body.messages : []
  const data = {
    messages: JSON.stringify(messages),
    active: Boolean(body.active),
    speed: Number(body.speed) || 5000,
  }

  try {
    const existing = await (prisma as any).announcementBar.findFirst()
    let bar
    if (existing) {
      bar = await (prisma as any).announcementBar.update({ where: { id: existing.id }, data })
    } else {
      bar = await (prisma as any).announcementBar.create({ data })
    }
    return NextResponse.json({ ...bar, messages: JSON.parse(bar.messages) })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 })
  }
}

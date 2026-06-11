import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await getAdminFromCookies()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { description, category, amount, date, notes } = await req.json()

    const updated = await (prisma as any).expense.update({
      where: { id: params.id },
      data: {
        ...(description !== undefined ? { description } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(amount !== undefined ? { amount } : {}),
        ...(date !== undefined ? { date: new Date(date) } : {}),
        ...(notes !== undefined ? { notes: notes || null } : {}),
      },
    })
    return NextResponse.json(updated)
  } catch (err: any) {
    console.error('[PUT /api/admin/expenses/[id]]', err)
    return NextResponse.json({ error: err?.message ?? 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await getAdminFromCookies()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await (prisma as any).expense.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[DELETE /api/admin/expenses/[id]]', err)
    return NextResponse.json({ error: err?.message ?? 'Erro interno' }, { status: 500 })
  }
}

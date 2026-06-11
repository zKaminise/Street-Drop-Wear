import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromCookies()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month') // format: "2026-06"

    let where: any = {}
    if (month) {
      const [year, m] = month.split('-').map(Number)
      const start = new Date(year, m - 1, 1)
      const end   = new Date(year, m, 1)
      where = { date: { gte: start, lt: end } }
    }

    const expenses = await (prisma as any).expense.findMany({
      where,
      orderBy: { date: 'desc' },
    })
    return NextResponse.json(expenses)
  } catch (err: any) {
    console.error('[GET /api/admin/expenses]', err)
    return NextResponse.json({ error: err?.message ?? 'Erro interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminFromCookies()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { description, category, amount, date, notes } = await req.json()

    if (!description || typeof amount !== 'number') {
      return NextResponse.json({ error: 'description e amount são obrigatórios.' }, { status: 400 })
    }

    const expense = await (prisma as any).expense.create({
      data: {
        description,
        category: category || 'Geral',
        amount,
        date: date ? new Date(date) : new Date(),
        notes: notes || null,
      },
    })
    return NextResponse.json(expense, { status: 201 })
  } catch (err: any) {
    console.error('[POST /api/admin/expenses]', err)
    return NextResponse.json({ error: err?.message ?? 'Erro interno' }, { status: 500 })
  }
}

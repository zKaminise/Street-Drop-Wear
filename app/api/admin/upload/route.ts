import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/admin-auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']
const MAX_SIZE_MB = 5

export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookies()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Form data inválido' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file || file.size === 0) return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })

  // Validate MIME type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `Tipo inválido: ${file.type}. Use JPG, PNG, WebP, SVG ou GIF.` },
      { status: 400 }
    )
  }

  // Validate size
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return NextResponse.json({ error: `Arquivo muito grande. Máximo ${MAX_SIZE_MB} MB.` }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Build safe unique filename
  const rawExt = path.extname(file.name).toLowerCase().replace(/[^.a-z0-9]/g, '')
  const ext = rawExt || '.png'
  const safeBase = file.name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .substring(0, 30)
  const filename = `${safeBase}-${Date.now()}${ext}`

  const folder = (formData.get('folder') as string | null) ?? 'stamps'
  const uploadDir = path.join(process.cwd(), 'public', folder)
  await mkdir(uploadDir, { recursive: true })
  await writeFile(path.join(uploadDir, filename), buffer)

  return NextResponse.json({ url: `/${folder}/${filename}` })
}

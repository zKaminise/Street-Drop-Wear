import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/admin-auth'

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

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `Tipo inválido: ${file.type}. Use JPG, PNG, WebP, SVG ou GIF.` },
      { status: 400 }
    )
  }

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return NextResponse.json({ error: `Arquivo muito grande. Máximo ${MAX_SIZE_MB} MB.` }, { status: 400 })
  }

  const folder = (formData.get('folder') as string | null) ?? 'stamps'

  // Build safe unique filename
  const rawExt = file.name.match(/\.[a-z0-9]+$/i)?.[0]?.toLowerCase() ?? '.png'
  const safeBase = file.name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .substring(0, 30)
  const filename = `${folder}/${safeBase}-${Date.now()}${rawExt}`

  // ── PRODUCTION: use Vercel Blob ──────────────────────────────────────────────
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import('@vercel/blob')
      const blob = await put(filename, file, { access: 'public' })
      return NextResponse.json({ url: blob.url })
    } catch (err) {
      console.error('Vercel Blob upload error:', err)
      return NextResponse.json({ error: 'Erro ao enviar para o storage. Verifique o BLOB_READ_WRITE_TOKEN.' }, { status: 500 })
    }
  }

  // ── DEVELOPMENT: local filesystem fallback ───────────────────────────────────
  try {
    const { writeFile, mkdir } = await import('fs/promises')
    const path = await import('path')
    const uploadDir = path.join(process.cwd(), 'public', folder)
    await mkdir(uploadDir, { recursive: true })
    const bytes = await file.arrayBuffer()
    await writeFile(path.join(uploadDir, `${safeBase}-${Date.now()}${rawExt}`), Buffer.from(bytes))
    return NextResponse.json({ url: `/${folder}/${safeBase}-${Date.now()}${rawExt}` })
  } catch (err) {
    console.error('Local upload error:', err)
    return NextResponse.json({ error: 'Erro ao salvar arquivo localmente.' }, { status: 500 })
  }
}

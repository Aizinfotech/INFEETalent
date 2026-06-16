import { existsSync } from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

import { getPayload } from '@/payload/getPayload'

export const dynamic = 'force-dynamic'

const diagnosticToken = 'infe-runtime-check-20260616'

const sanitize = (value: unknown) =>
  String(value)
    .replace(/(postgres(?:ql)?:\/\/[^:\s/]+):[^@\s/]+@/gi, '$1:***@')
    .replace(/(password=)[^&\s]+/gi, '$1***')
    .slice(0, 1200)

const databaseUrlKind = (databaseUrl?: string) => {
  if (!databaseUrl) {
    return 'missing'
  }

  if (/^file:/i.test(databaseUrl)) {
    return 'sqlite-file'
  }

  if (/^postgres(ql)?:\/\//i.test(databaseUrl)) {
    return 'postgres'
  }

  return 'other'
}

export async function GET(request: Request) {
  const url = new URL(request.url)

  if (url.searchParams.get('token') !== diagnosticToken) {
    return NextResponse.json({ ok: false }, { status: 404 })
  }

  const candidates = [
    path.resolve(process.cwd(), 'infe-talent.sqlite'),
    path.resolve(process.cwd(), '.next', 'server', 'infe-talent.sqlite'),
    '/tmp/infe-talent.sqlite',
  ]

  const diagnostics = {
    cwd: process.cwd(),
    databaseUrlKind: databaseUrlKind(process.env.DATABASE_URL),
    nodeEnv: process.env.NODE_ENV,
    payloadDatabaseAdapter: process.env.PAYLOAD_DATABASE_ADAPTER || process.env.PAYLOAD_DB_ADAPTER || null,
    payloadUsePostgres: process.env.PAYLOAD_USE_POSTGRES || null,
    platform: process.platform,
    sqliteCandidates: candidates.map((candidate) => ({
      exists: existsSync(candidate),
      path: candidate,
    })),
    vercel: process.env.VERCEL || null,
  }

  try {
    const payload = await getPayload()
    const pages = await payload.find({ collection: 'pages', limit: 1 })

    return NextResponse.json({
      ok: true,
      diagnostics,
      pages: pages.totalDocs,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        diagnostics,
        error: {
          code: error && typeof error === 'object' && 'code' in error ? sanitize(error.code) : null,
          message: error instanceof Error ? sanitize(error.message) : sanitize(error),
          name: error instanceof Error ? error.name : typeof error,
          stack: error instanceof Error ? sanitize(error.stack) : null,
        },
      },
      { status: 500 },
    )
  }
}

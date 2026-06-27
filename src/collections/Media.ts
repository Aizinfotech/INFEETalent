import type { CollectionConfig } from 'payload'

import { authenticated, publicRead } from '@/payload/access'
import { seoFields } from '@/globals/seo'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Content',
    useAsTitle: 'alt',
  },
  access: {
    create: authenticated,
    read: publicRead,
    update: authenticated,
    delete: authenticated,
  },
  upload: {
    staticDir: 'public/media',
    handlers: [
      (req, { params }) => {
        const url = new URL(`/media/${encodeURIComponent(params.filename)}`, req.url)

        return Response.redirect(url, 302)
      },
    ],
    mimeTypes: ['image/*', 'application/pdf'],
    imageSizes: [
      {
        name: 'card',
        width: 640,
        height: 420,
        position: 'centre',
      },
      {
        name: 'hero',
        width: 1440,
        height: 960,
        position: 'centre',
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        position: 'centre',
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
    },
    ...seoFields(),
  ],
}

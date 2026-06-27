/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { getPayload } from './getPayload'
import { figmaAssets } from '@/lib/assets'
import {
  careers,
  faqs,
  homePageFallback,
  services,
  teamMembers,
  testimonials,
} from '@/lib/default-content'
import { richTextFromPlain } from '@/lib/richText'
import { formatSlug } from '@/lib/slug'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const rootDir = path.resolve(dirname, '..', '..')

type CollectionSlug =
  | 'blogs'
  | 'careers'
  | 'faqs'
  | 'media'
  | 'pages'
  | 'services'
  | 'testimonials'
  | 'team-members'

const mimeTypes: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
}

const footerPartnerLabels = [
  'GDPR Approved',
  'ISO 27001:2022',
  'ISO 27701',
  'ISO 9001:2015',
  'TUV SUD ISO 14001',
  'Cyber Essentials',
  'HIPAA Compliant',
  'AICPA SOC 2',
]

const localFilePath = (publicPath: string) => path.join(rootDir, 'public', publicPath.replace(/^\//, ''))

const metaTitle = (title: string) => title.slice(0, 70)
const metaDescription = (description: string) => description.slice(0, 170)

const seedBlogs = [
  {
    title: 'How Recruitment Management Helps Companies Hire Faster',
    slug: 'how-recruitment-management-helps-companies-hire-faster',
    excerpt:
      'Recruitment management gives hiring teams clearer ownership, stronger pipelines, and faster decisions across high-volume roles.',
    category: 'Offshore Strategy',
    authorName: 'INFE Talent Team',
    publishedAt: '2026-05-08T00:00:00.000Z',
    readTime: '6 min read',
    featured: true,
    body:
      'Recruitment management helps companies hire faster by turning scattered activity into a repeatable delivery rhythm. When job intake, sourcing, screening, submission tracking, interview coordination, and follow-up are managed through one operating model, hiring teams spend less time chasing updates and more time making decisions.\n\nA dedicated recruitment management function also improves pipeline visibility. Recruiters can see which roles need more sourcing coverage, which candidates are moving, and which hiring managers need action. That visibility shortens delays before they become missed opportunities.\n\nFor staffing firms and growing businesses, the strongest results usually come from pairing local client ownership with offshore delivery capacity. This gives teams extended coverage, consistent sourcing output, and better control over daily recruitment execution.\n\nThe outcome is not just speed. Recruitment management improves quality because every candidate moves through a clearer qualification path, every role has accountable owners, and every stakeholder has better information before the next step.',
    seo: {
      metaTitle: 'How Recruitment Management Helps Companies Hire Faster',
      metaDescription:
        'Learn how recruitment management improves hiring speed through better sourcing, screening, coordination, and pipeline visibility.',
      keywords: [{ keyword: 'recruitment management' }, { keyword: 'hire faster' }, { keyword: 'offshore recruitment' }],
    },
  },
  {
    title: 'Soft Skills That Improve Career Growth',
    slug: 'soft-skills-that-improve-career-growth',
    excerpt:
      'Communication, ownership, adaptability, and problem solving can turn technical capability into long-term career momentum.',
    category: 'Career Growth',
    authorName: 'INFE Talent Team',
    publishedAt: '2026-05-10T00:00:00.000Z',
    readTime: '5 min read',
    featured: true,
    body:
      'Soft skills shape how people work when job descriptions become real business problems. Technical ability opens the door, but communication, reliability, curiosity, and ownership help professionals grow into trusted contributors.\n\nClear communication is one of the most valuable career skills because it reduces friction. People who explain blockers early, confirm expectations, and share progress clearly make it easier for teams to move quickly.\n\nAdaptability also matters. Modern careers rarely follow a straight line, and the people who keep learning across tools, workflows, and industries build resilience. They can step into new challenges without waiting for perfect conditions.\n\nCareer growth becomes much easier when professionals combine skill with accountability. Hiring managers notice people who take ownership, ask better questions, and follow through when work becomes complex.',
    seo: {
      metaTitle: 'Soft Skills That Improve Career Growth',
      metaDescription:
        'Explore the soft skills that support career growth, including communication, adaptability, ownership, and problem solving.',
      keywords: [{ keyword: 'soft skills' }, { keyword: 'career growth' }, { keyword: 'job market' }],
    },
  },
  {
    title: 'Why Executive Search Matters for Senior Roles',
    slug: 'why-executive-search-matters-for-senior-roles',
    excerpt:
      'Senior hiring requires more than active applicants. Executive search gives companies targeted access to proven leaders.',
    category: 'Case Studies',
    authorName: 'INFE Talent Team',
    publishedAt: '2026-05-12T00:00:00.000Z',
    readTime: '7 min read',
    featured: true,
    body:
      'Executive search matters because senior roles are rarely filled by waiting for applications. Leadership candidates are often passive, selective, and deeply embedded in their current organizations. Reaching them requires research, discretion, and a credible approach.\n\nA structured executive search process begins with market mapping. Recruiters identify target companies, comparable roles, leadership profiles, and signals that indicate a candidate may be ready for a new opportunity.\n\nThe process also protects confidentiality. Senior mandates can affect teams, clients, and competitors, so candidate engagement must be handled carefully from first outreach through shortlist presentation.\n\nFor businesses hiring leadership talent, executive search creates a stronger decision set. Instead of choosing only from visible applicants, companies can compare qualified leaders across the market and move forward with more confidence.',
    seo: {
      metaTitle: 'Why Executive Search Matters for Senior Roles',
      metaDescription:
        'Understand why executive search is important for senior hiring, confidential mandates, leadership mapping, and passive candidate engagement.',
      keywords: [{ keyword: 'executive search' }, { keyword: 'senior roles' }, { keyword: 'leadership hiring' }],
    },
  },
  {
    title: 'How HR Consulting Supports Business Growth',
    slug: 'how-hr-consulting-supports-business-growth',
    excerpt:
      'HR consulting helps growing teams improve process, compliance, onboarding, and people operations without losing momentum.',
    category: 'Compliance & Security',
    authorName: 'INFE Talent Team',
    publishedAt: '2026-05-14T00:00:00.000Z',
    readTime: '6 min read',
    featured: false,
    body:
      'Business growth often exposes gaps in people operations. Processes that worked for a small team can become inconsistent when headcount, hiring demand, and compliance requirements increase. HR consulting helps companies create structure before those gaps slow the business down.\n\nConsultants can review onboarding, documentation, policy alignment, workforce reporting, and handoffs between recruitment and HR teams. This makes daily operations clearer for employees and easier to manage for leaders.\n\nStrong HR consulting also supports compliance. As businesses work across regions and employment models, they need reliable documentation and repeatable processes that reduce avoidable risk.\n\nThe best consulting work is practical. It gives teams operating habits they can actually sustain, helping the business grow without creating unnecessary complexity.',
    seo: {
      metaTitle: 'How HR Consulting Supports Business Growth',
      metaDescription:
        'See how HR consulting supports business growth through better processes, compliance, onboarding, and people operations.',
      keywords: [{ keyword: 'HR consulting' }, { keyword: 'business growth' }, { keyword: 'people operations' }],
    },
  },
  {
    title: 'Top Hiring Trends for Modern Businesses',
    slug: 'top-hiring-trends-for-modern-businesses',
    excerpt:
      'Modern hiring is shaped by faster talent cycles, flexible delivery teams, better data, and stronger candidate communication.',
    category: 'Market Trends',
    authorName: 'INFE Talent Team',
    publishedAt: '2026-05-16T00:00:00.000Z',
    readTime: '5 min read',
    featured: false,
    body:
      'Modern businesses are hiring in a market where speed, quality, and flexibility all matter at the same time. Teams need stronger pipelines, but they also need better candidate communication and more reliable hiring data.\n\nOne trend is the rise of blended delivery models. Companies are combining internal recruiters, specialist partners, offshore sourcers, and recruitment operations support to increase capacity without overloading local teams.\n\nAnother trend is deeper focus on candidate experience. Hiring teams that communicate clearly, reduce delays, and prepare candidates well are more likely to keep strong talent engaged.\n\nData is also becoming more important. Submission quality, response time, interview conversion, source effectiveness, and offer acceptance rates help leaders understand what is working and where to improve.',
    seo: {
      metaTitle: 'Top Hiring Trends for Modern Businesses',
      metaDescription:
        'Review hiring trends for modern businesses, including flexible recruitment teams, candidate experience, and recruitment data.',
      keywords: [{ keyword: 'hiring trends' }, { keyword: 'modern businesses' }, { keyword: 'talent acquisition' }],
    },
  },
  {
    title: 'Career Tips for Freshers Entering the Job Market',
    slug: 'career-tips-for-freshers-entering-the-job-market',
    excerpt:
      'Freshers can stand out by building clarity, interview readiness, practical skills, and a consistent job search routine.',
    category: 'Career Growth',
    authorName: 'INFE Talent Team',
    publishedAt: '2026-05-18T00:00:00.000Z',
    readTime: '4 min read',
    featured: false,
    body:
      'Entering the job market as a fresher can feel overwhelming, but a clear routine makes the process easier. Start by understanding the roles you want, the skills they require, and the evidence you can show through projects, internships, coursework, or practical examples.\n\nA strong resume should be simple, specific, and honest. Focus on relevant skills, measurable work, and outcomes rather than generic claims. Recruiters move quickly, so clarity matters.\n\nInterview preparation is equally important. Practice explaining your projects, your learning process, and how you solve problems. Employers do not expect freshers to know everything, but they do look for curiosity and accountability.\n\nFinally, stay consistent. A thoughtful job search combines applications, networking, follow-ups, and learning. Small daily progress compounds into better opportunities.',
    seo: {
      metaTitle: 'Career Tips for Freshers Entering the Job Market',
      metaDescription:
        'Career tips for freshers entering the job market, including resume clarity, interview preparation, practical skills, and search routines.',
      keywords: [{ keyword: 'career tips' }, { keyword: 'freshers' }, { keyword: 'job market' }],
    },
  },
]

async function ensureMedia(alt: string, publicPath: string) {
  const payload = (await getPayload()) as any
  const filePath = localFilePath(publicPath)
  const filename = `${formatSlug(alt)}-${path.basename(filePath)}`
  const existing = await payload.find({
    collection: 'media',
    limit: 1,
    where: {
      or: [
        {
          alt: {
            equals: alt,
          },
        },
        {
          filename: {
            equals: filename,
          },
        },
      ],
    },
  })

  if (existing.docs[0]) {
    return existing.docs[0]
  }

  const data = await fs.readFile(filePath)
  const extension = path.extname(filePath).toLowerCase()

  return payload.create({
    collection: 'media',
    data: { alt },
    file: {
      data,
      mimetype: mimeTypes[extension] || 'application/octet-stream',
      name: filename,
      size: data.byteLength,
    },
  })
}

async function upsert(collection: CollectionSlug, slug: string, data: Record<string, unknown>) {
  const payload = (await getPayload()) as any
  const existing = await payload.find({
    collection,
    limit: 1,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  if (existing.docs[0]) {
    return payload.update({
      collection,
      id: existing.docs[0].id,
      data,
      overrideAccess: true,
    })
  }

  return payload.create({
    collection,
    data,
    overrideAccess: true,
  } as any)
}

async function upsertByField(
  collection: CollectionSlug,
  field: string,
  value: string,
  data: Record<string, unknown>,
) {
  const payload = (await getPayload()) as any
  const existing = await payload.find({
    collection,
    limit: 1,
    where: {
      [field]: {
        equals: value,
      },
    },
  })

  if (existing.docs[0]) {
    return payload.update({
      collection,
      id: existing.docs[0].id,
      data,
      overrideAccess: true,
    })
  }

  return payload.create({
    collection,
    data,
    overrideAccess: true,
  } as any)
}

async function run() {
  const payload = (await getPayload()) as any

  const media = {
    logo: await ensureMedia('INFE Talent logo', figmaAssets.logo),
    hero: await ensureMedia('Hero interview', figmaAssets.heroInterview),
    teamOffice: await ensureMedia('Team office collaboration', figmaAssets.teamOffice),
    profileCard: await ensureMedia('Profile testimonial portrait', figmaAssets.profileCard),
    avatarOne: await ensureMedia('Client avatar portrait', figmaAssets.avatarOne),
    avatarTwo: await ensureMedia('Client avatar portrait 2', figmaAssets.avatarTwo),
    avatarThree: await ensureMedia('Client avatar portrait 3', figmaAssets.avatarThree),
    avatarFour: await ensureMedia('Client avatar portrait 4', figmaAssets.avatarFour),
    testimonialVideo: await ensureMedia('Testimonial video thumbnail', figmaAssets.testimonialVideo),
    aboutTall: await ensureMedia('About office tall', figmaAssets.aboutOfficeTall),
    aboutSide: await ensureMedia('About office side', figmaAssets.aboutOfficeSide),
    insights: await Promise.all(
      figmaAssets.insights.map((asset, index) => ensureMedia(`Insight ${index + 1}`, asset)),
    ),
    partners: await Promise.all(
      figmaAssets.partners.map((asset, index) =>
        ensureMedia(footerPartnerLabels[index] || `Partner certification ${index + 1}`, asset),
      ),
    ),
    awards: await Promise.all(figmaAssets.awards.map((asset, index) => ensureMedia(`Award ${index + 1}`, asset))),
  }
  const serviceImagePool = [
    media.hero,
    media.aboutSide,
    media.aboutTall,
    media.insights[0],
    media.insights[1],
    media.insights[2],
  ].filter(Boolean)

  const serviceDocs = await Promise.all(
    services.map((service, index) =>
      upsert('services', service.slug || service.title, {
        ...service,
        featuredImage: service.featuredImage || serviceImagePool[index % serviceImagePool.length]?.id,
        content: richTextFromPlain(typeof service.content === 'string' ? service.content : service.summary),
        cta: service.cta || { label: 'Talk To An Expert', url: '/contact' },
        seo: service.seo || {
          metaTitle: metaTitle(`${service.title} | INFE Talent`),
          metaDescription: metaDescription(service.summary),
          keywords: [{ keyword: service.title }, { keyword: 'offshore recruitment' }],
        },
        _status: 'published',
      }),
    ),
  )
  const activeServiceSlugs = new Set(services.map((service) => service.slug || formatSlug(service.title)))
  const existingServiceDocs = await payload.find({
    collection: 'services',
    depth: 0,
    draft: true,
    limit: 100,
  })

  await Promise.all(
    existingServiceDocs.docs
      .filter((service: { id: string | number; slug?: string }) => service.slug && !activeServiceSlugs.has(service.slug))
      .map((service: { id: string | number }) =>
        payload.update({
          collection: 'services',
          id: service.id,
          data: { _status: 'draft' },
          overrideAccess: true,
        }),
      ),
  )

  for (const [index, service] of serviceDocs.entries()) {
    await payload.update({
      collection: 'services',
      id: service.id,
      data: {
        relatedServices: [
          serviceDocs[(index + 1) % serviceDocs.length]?.id,
          serviceDocs[(index + 2) % serviceDocs.length]?.id,
          serviceDocs[(index + 3) % serviceDocs.length]?.id,
        ].filter(Boolean),
      },
      overrideAccess: true,
    })
  }

  const testimonialMediaPool = [
    media.testimonialVideo,
    media.profileCard,
    media.avatarOne,
    media.teamOffice,
    media.hero,
    media.aboutTall,
    media.aboutSide,
  ].filter(Boolean)
  const testimonialDocs = await Promise.all(
    testimonials.map((testimonial, index) => {
      const avatar = testimonialMediaPool[index % testimonialMediaPool.length]
      const thumbnail = testimonialMediaPool[(index + 1) % testimonialMediaPool.length]

      return upsertByField('testimonials', 'name', testimonial.name, {
        ...testimonial,
        avatar: avatar?.id,
        videoThumbnail: testimonial.testimonialType === 'video' ? thumbnail?.id || avatar?.id : undefined,
        videoUrl: testimonial.videoUrl || undefined,
        sortOrder: testimonial.sortOrder ?? index + 1,
        seo: {
          metaTitle: metaTitle(`${testimonial.name} Testimonial | INFE Talent`),
          metaDescription: metaDescription(testimonial.quote),
        },
        _status: 'published',
      })
    }),
  )
  const activeTestimonialNames = new Set(testimonials.map((testimonial) => testimonial.name))
  const existingTestimonialDocs = await payload.find({
    collection: 'testimonials',
    depth: 0,
    draft: true,
    limit: 100,
  })

  await Promise.all(
    existingTestimonialDocs.docs
      .filter((testimonial: { id: string | number; name?: string }) => testimonial.name && !activeTestimonialNames.has(testimonial.name))
      .map((testimonial: { id: string | number }) =>
        payload.update({
          collection: 'testimonials',
          id: testimonial.id,
          data: { _status: 'draft' },
          overrideAccess: true,
        }),
      ),
  )

  await Promise.all(
    faqs.map((faq, index) =>
      upsertByField('faqs', 'question', faq.question, {
        ...faq,
        answer: richTextFromPlain(String(faq.answer || '')),
        order: index + 1,
        seo: {
          metaTitle: metaTitle(`${faq.question} | INFE Talent FAQ`),
          metaDescription: metaDescription(String(faq.answer || '')),
        },
        _status: 'published',
      }),
    ),
  )

  await Promise.all(
    teamMembers.map((member, index) =>
      upsert('team-members', formatSlug(member.slug || member.name), {
        ...member,
        photo: index === 0 ? media.hero.id : index === 1 ? media.aboutTall.id : media.aboutSide.id,
        bio: richTextFromPlain(String(member.bio || '')),
        order: index + 1,
        seo: {
          metaTitle: metaTitle(`${member.name} | INFE Talent`),
          metaDescription: metaDescription(String(member.bio || member.role)),
        },
        _status: 'published',
      }),
    ),
  )

  const blogImagePool = [
    media.insights[0],
    media.insights[1],
    media.insights[2],
    media.hero,
    media.teamOffice,
    media.aboutTall,
  ].filter(Boolean)
  const blogDocs = await Promise.all(
    seedBlogs.map((blog, index) => {
      const featuredImage = blogImagePool[index % blogImagePool.length]
      const authorImage = index % 2 === 0 ? media.avatarOne : media.profileCard

      return upsert('blogs', blog.slug || blog.title, {
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt,
        category: blog.category,
        authorName: blog.authorName,
        authorImage: authorImage?.id,
        readTime: blog.readTime,
        featured: blog.featured,
        publishedAt: blog.publishedAt,
        featuredImage: featuredImage?.id,
        content: richTextFromPlain(blog.body),
        seo: {
          ...blog.seo,
          metaTitle: metaTitle(blog.seo.metaTitle),
          metaDescription: metaDescription(blog.seo.metaDescription),
          openGraphImage: featuredImage?.id,
        },
        _status: 'published',
      })
    }),
  )
  const activeBlogSlugs = new Set(seedBlogs.map((blog) => blog.slug))
  const existingBlogDocs = await payload.find({
    collection: 'blogs',
    depth: 0,
    draft: true,
    limit: 100,
  })

  await Promise.all(
    existingBlogDocs.docs
      .filter((blog: { id: string | number; slug?: string }) => blog.slug && !activeBlogSlugs.has(blog.slug))
      .map((blog: { id: string | number }) =>
        payload.update({
          collection: 'blogs',
          id: blog.id,
          data: { _status: 'draft' },
          overrideAccess: true,
        }),
      ),
  )

  await Promise.all(
    careers.map((career) =>
      upsert('careers', career.slug || career.title, {
        ...career,
        jobDetails: career.jobDetails?.map((detail) => ({
          heading: detail.heading,
          content: richTextFromPlain(String(detail.content)),
        })),
        seo: {
          metaTitle: metaTitle(`${career.title} | INFE Talent Careers`),
          metaDescription: metaDescription(career.summary),
        },
        _status: 'published',
      }),
    ),
  )

  const homeLayout = homePageFallback.layout?.map((block) => {
    if (block.blockType === 'hero') {
      return { ...block, media: media.hero.id }
    }

    if (block.blockType === 'contentImage') {
      return {
        ...block,
        body: richTextFromPlain(block.bodyText?.join('\n') || ''),
        media: media.aboutTall.id,
        mediaSecondary: media.aboutSide.id,
      }
    }

    if (block.blockType === 'servicesGrid') {
      return { ...block, services: serviceDocs.map((service) => service.id) }
    }

    if (block.blockType === 'awards') {
      return {
        ...block,
        items: block.items?.map((item, index) => ({ ...item, image: media.awards[index]?.id })),
      }
    }

    if (block.blockType === 'testimonials') {
      return { ...block, items: testimonialDocs.map((testimonial) => testimonial.id) }
    }

    if (block.blockType === 'blogListing') {
      return { ...block, posts: blogDocs.map((blog) => blog.id) }
    }

    return block
  })

  await upsert('pages', 'home', {
    title: homePageFallback.title,
    slug: 'home',
    layout: homeLayout,
    seo: {
      ...homePageFallback.seo,
      metaDescription: metaDescription(homePageFallback.seo?.metaDescription || ''),
      openGraphImage: media.hero.id,
    },
    _status: 'published',
  })

  await upsert('pages', 'about', {
    title: 'About',
    slug: 'about',
    layout: [
      {
        blockType: 'hero',
        variant: 'textOnly',
        heading: "We Don't Just Fill Positions. We Fulfil Possibilities.",
        highlight: 'We Fulfil Possibilities.',
        description:
          "For over 20 years, INFE Talent has been the trusted offshore recruitment partner that transforms staffing challenges into global growth opportunities. When it's about people, we make it possible.",
      },
      {
        blockType: 'hero',
        variant: 'darkSplit',
        imagePosition: 'left',
        heading: 'The Bridge Between Ambition And Achievement.',
        highlight: 'Achievement.',
        description:
          "In 2001, while the world was still discovering the potential of offshore partnerships, we had a different vision. We believed that distance shouldn't diminish quality, and that offshore could mean enhancement rather than replacement.\n\nToday, INFE Talent stands as proof that when you combine global talent with local understanding, extraordinary things happen. We are not just a service provider; we are the catalyst for your business's next chapter.",
        media: media.hero.id,
        featureCard: {
          image: media.aboutTall.id,
        },
        stats: [
          { value: '3000+', label: 'Professionals Joined' },
          { value: '20+', label: 'Years of Experience' },
        ],
      },
      {
        blockType: 'statsStrip',
        layout: 'cards',
        heading: 'Global Impact Stats',
        description: 'Measurable outcomes from offshore recruitment delivery teams built for scale.',
        items: [
          { icon: 'Quality', value: '20+', label: 'Trusted Partners Globally' },
          { icon: 'People', value: '3000+', label: 'Team Members operating from global delivery centres' },
          { icon: 'Building2', value: '50+', label: 'Industries served across US & UK markets' },
          { icon: 'Quality', value: '3', label: 'State-of-the-art Delivery Centers' },
          { icon: 'HandCoins', value: '50+', label: 'Net Promoter Score (NPS)' },
        ],
      },
      {
        blockType: 'contentImage',
        layout: 'split',
        imagePosition: 'right',
        settings: { background: 'blue' },
        heading: "If It's About PEOPLE, We Make It POSSIBLE!",
        highlight: 'PEOPLE',
        body: richTextFromPlain(
          "Our mission extends beyond matching resumes to requirements. We're in the business of unlocking human potential-helping talented individuals find meaningful careers while empowering organisations to achieve their boldest ambitions. We measure success in careers transformed and businesses grown.",
        ),
        media: media.hero.id,
        mediaSecondary: media.aboutSide.id,
        primaryAction: { label: 'Consultation Session', url: '/contact' },
        stats: [
          { value: '3000+', label: 'Professionals Joined' },
          { value: '$3,000', label: 'Online Session:' },
          { value: '$60,000', label: 'Full Month:' },
        ],
        overlayCard: {
          name: 'Jack Wang',
          role: 'Full Stack Developer',
        },
      },
      {
        blockType: 'industries',
        eyebrow: 'OUR EXPERTISE',
        heading: 'Specialised Recruitment Across 10+ Verticals',
        description:
          'INFE Talent delivers offshore sourcing and recruitment support across the sectors that matter most to our partners.',
        primaryAction: { label: 'Explore Services', url: '/services' },
        secondaryAction: { label: 'Contact Us', url: '/contact' },
        items: [
          { label: 'Healthcare & Allied Health' },
          { label: 'Information Technology' },
          { label: 'Finance & Banking' },
          { label: 'Engineering & Infrastructure' },
          { label: 'Professional Services' },
          { label: 'Sales & Commercial' },
          { label: 'Construction & Property' },
          { label: 'Executive & Leadership' },
          { label: 'Supply Chain & Logistics' },
          { label: 'Government & Public Sector' },
        ],
      },
      {
        blockType: 'testimonials',
        eyebrow: 'WHAT PARTNERS SAY',
        heading: 'Built On Trust. Proven By Results.',
        description:
          'Hear from the staffing leaders who rely on INFE Talent for consistent offshore recruitment delivery.',
        items: testimonialDocs.map((t) => t.id),
        display: 'grid',
      },
      {
        blockType: 'awards',
        heading: 'Recognised For Delivery Excellence.',
        description: 'Industry recognition for the standards we hold in offshore recruitment partnership and service delivery.',
        items: [
          { title: 'Best Offshore Recruitment Partner', description: '2024 Staffing Industry Awards', image: media.awards[0]?.id },
          { title: 'Global Delivery Excellence', description: '2023 RPO Leadership Award', image: media.awards[1]?.id },
          { title: 'Top 10 Offshore Staffing Firm', description: '2023 SIA Recognition', image: media.awards[2]?.id },
          { title: 'Innovation In Recruitment', description: '2022 HRD Awards Asia-Pacific', image: media.awards[3]?.id },
          { title: 'Best Employer Certification', description: '2022 Great Place To Work', image: media.awards[4]?.id },
        ],
      },
      {
        blockType: 'advantage',
        heading: 'The INFE Talent Advantage',
        highlight: 'Advantage',
        description:
          'Lorem ipsum dolor sit amet consectetur. Sit habitant interdum dolor scelerisque viverra sed adipiscing. Feugiat viverra libero faucibus platea adipiscing id imperdiet diam.',
        items: [
          {
            icon: 'Headset',
            title: '24/7 Global Operations',
            description: 'Uninterrupted service delivery across time zones to accelerate your hiring cycle.',
          },
          {
            icon: 'FileCheck2',
            title: 'Strict Compliance',
            description: 'Fully GDPR, HIPAA, and ISO compliant, ensuring absolute data security for US and UK markets.',
          },
          {
            icon: 'Users',
            title: 'Scalable Dedicated Teams',
            description: 'Interview, select, and scale your own dedicated offshore recruiters and sourcers.',
          },
          {
            icon: 'HandCoins',
            title: 'Industry Expertise',
            description: 'Specialized domain knowledge across Healthcare, IT, Engineering, Finance, and Manufacturing.',
          },
        ],
      },
      {
        blockType: 'contact',
        eyebrow: "LET'S CONNECT",
        heading: 'Ready To Make The Impossible, Possible?',
        description:
          'Tell us about your recruitment goals. We will design a tailored offshore delivery model that fits your team, timeline, and targets.',
        formHeading: 'Start Your Partnership Journey',
        contactMethods: [
          { label: 'UK', value: '+44 203 878 3559', url: 'tel:+442038783559' },
          { label: 'US', value: '+1 614 266 3317', url: 'tel:+16142663317' },
          { label: 'AUS', value: '+61 740 620 017', url: 'tel:+61740620017' },
          { label: 'Email', value: 'info@infetalent.com', url: 'mailto:info@infetalent.com' },
        ],
        joinTeam: {
          enabled: true,
          heading: 'Looking To Join Our Global Team?',
          description:
            "We are always searching for ambitious, globally-minded professionals to join our state-of-the-art delivery centers. If you are passionate about talent acquisition and want to build a rewarding career with an industry leader, let's grow together.",
          action: {
            label: 'Explore Career Opportunities',
            url: '/careers',
            newTab: false,
          },
          yearsStat: {
            value: '20+',
            label: 'Years of Experience',
          },
          professionalsStat: {
            value: '3000+',
            label: 'Professionals Joined',
          },
          images: {
            portraitImage: media.avatarOne.id,
            interviewImage: media.hero.id,
            advisorImage: media.aboutSide.id,
          },
          avatars: {
            avatarOne: media.avatarOne.id,
            avatarTwo: media.avatarTwo.id,
            avatarThree: media.avatarThree.id,
            avatarFour: media.avatarFour.id,
          },
        },
      },
    ],
    seo: {
      metaTitle: 'About INFE Talent | Offshore Recruitment Partner',
      metaDescription: 'Learn how INFE Talent supports staffing firms with offshore recruitment delivery teams built for quality, coverage, and scale.',
      openGraphImage: media.aboutTall.id,
    },
    _status: 'published',
  })

  await upsert('pages', 'services', {
    title: 'Services',
    slug: 'services',
    layout: [
      {
        blockType: 'hero',
        variant: 'textOnly',
        heading: 'Scalable Offshore Recruitment Services For Global Growth',
        highlight: 'Scalable Offshore Recruitment',
        description:
          'Empower your staffing agency with our end-to-end talent acquisition, comprehensive compliance, and dedicated back-office support.',
        primaryAction: { label: 'Partner With Us', url: '/contact' },
        secondaryAction: { label: 'Get In Touch', url: '/contact' },
      },
      {
        blockType: 'statsStrip',
        layout: 'strip',
        items: [
          { value: '250+', label: 'Clients Globally' },
          { value: '20+', label: 'Years Of Experience' },
          { value: '3000+', label: 'Professionals' },
          { value: '97%', label: 'NPS Score' },
        ],
      },
      {
        blockType: 'advantage',
        heading: 'The INFE Talent Advantage',
        highlight: 'Advantage',
        description:
          'Lorem ipsum dolor sit amet consectetur. Sit habitant interdum dolor scelerisque viverra sed adipiscing. Feugiat viverra libero faucibus platea adipiscing id imperdiet diam.',
        items: [
          {
            icon: 'Headset',
            title: '24/7 Global Operations',
            description: 'Uninterrupted service delivery across time zones to accelerate your hiring cycle.',
          },
          {
            icon: 'FileCheck2',
            title: 'Strict Compliance',
            description: 'Fully GDPR, HIPAA, and ISO compliant, ensuring absolute data security for US and UK markets.',
          },
          {
            icon: 'Users',
            title: 'Scalable Dedicated Teams',
            description: 'Interview, select, and scale your own dedicated offshore recruiters and sourcers.',
          },
          {
            icon: 'HandCoins',
            title: 'Industry Expertise',
            description: 'Specialized domain knowledge across Healthcare, IT, Engineering, Finance, and Manufacturing.',
          },
        ],
      },
      {
        blockType: 'contact',
        eyebrow: 'GET IN TOUCH',
        heading: 'Ready To Transform Your Recruitment Engine?',
        description:
          'Tell us about your hiring goals. We will come back within one business day with a tailored model and a clear path to scale.',
        formHeading: 'Get In Touch Today!',
        contactMethods: [
          { label: 'UK', value: '+44 203 878 3559', url: 'tel:+442038783559' },
          { label: 'US', value: '+1 614 266 3317', url: 'tel:+16142663317' },
          { label: 'AUS', value: '+61 740 620 017', url: 'tel:+61740620017' },
        ],
      },
    ],
    seo: {
      metaTitle: 'Offshore Recruitment Services | INFE Talent',
      metaDescription: 'Explore INFE Talent services for recruitment management, sourcing, market mapping, compliance, onboarding, and administrative support.',
      openGraphImage: media.hero.id,
    },
    _status: 'published',
  })

  await upsert('pages', 'testimonials', {
    title: 'Testimonials',
    slug: 'testimonials',
    layout: [
      {
        blockType: 'hero',
        variant: 'textOnly',
        eyebrow: 'Home / Testimonials',
        heading: 'Trusted By 3000+ Global Staffing Leaders',
        highlight: '3000+ Global Staffing',
        description:
          'Do not just take our word for it. Hear from the recruitment agencies, MSPs, and global enterprises that have scaled their operations with INFE Talent.',
      },
      {
        blockType: 'statsStrip',
        layout: 'strip',
        items: [
          { value: '250+', label: 'Clients Globally' },
          { value: '20+', label: 'Years Of Experience' },
          { value: '3000+', label: 'Professionals' },
          { value: '97%', label: 'NPS Score' },
        ],
      },
      {
        blockType: 'contact',
        eyebrow: 'GET IN TOUCH',
        heading: "Let's Design Your Offshore Recruitment Engine.",
        description:
          'Tell us about your hiring goals. We will come back within one business day with a tailored model and a clear path to scale.',
        formHeading: 'Get In Touch Today!',
        contactMethods: [
          { label: 'UK', value: '+44 203 878 3559', url: 'tel:+442038783559' },
          { label: 'US', value: '+1 614 266 3317', url: 'tel:+16142663317' },
          { label: 'AUS', value: '+61 740 620 017', url: 'tel:+61740620017' },
        ],
      },
    ],
    seo: {
      metaTitle: 'Testimonials | INFE Talent',
      metaDescription:
        'Read testimonials from staffing leaders, recruitment partners, candidates, and corporate clients who work with INFE Talent.',
      openGraphImage: media.testimonialVideo.id,
    },
    _status: 'published',
  })

  await upsert('pages', 'blogs', {
    title: 'Blogs',
    slug: 'blogs',
    layout: [
      {
        blockType: 'hero',
        variant: 'textOnly',
        eyebrow: 'Home / Blogs',
        heading: 'Insights For The Modern Recruitment Leader',
        highlight: 'Modern Recruitment Leader',
        description: 'Practical ideas for staffing leaders, HR teams, and growing businesses building better recruitment engines.',
      },
      {
        blockType: 'blogListing',
        selectionMode: 'manual',
        heading: 'Latest Blogs',
        description: 'Ideas and operating guidance for staffing leaders building resilient recruitment pipelines.',
        posts: blogDocs.map((blog) => blog.id),
        limit: 9,
      },
      {
        blockType: 'contact',
        eyebrow: 'GET IN TOUCH',
        heading: "Let's Design Your Offshore Recruitment Engine.",
        description:
          'Tell us about your hiring goals. We will come back within one business day with a tailored model and a clear path to scale.',
        formHeading: 'Get In Touch Today!',
        contactMethods: [
          { label: 'UK', value: '+44 203 878 3559', url: 'tel:+442038783559' },
          { label: 'US', value: '+1 614 266 3317', url: 'tel:+16142663317' },
          { label: 'AUS', value: '+61 740 620 017', url: 'tel:+61740620017' },
        ],
      },
    ],
    seo: {
      metaTitle: 'Recruitment Blogs | INFE Talent',
      metaDescription:
        'Read INFE Talent blogs covering recruitment management, offshore strategy, executive search, HR consulting, hiring trends, and career growth.',
      openGraphImage: media.insights[0]?.id,
    },
    _status: 'published',
  })

  await upsert('pages', 'careers', {
    title: 'Careers',
    slug: 'careers',
    layout: [
      {
        blockType: 'hero',
        variant: 'centered',
        eyebrow: 'Careers',
        heading: 'Build Your Career With A Global Recruitment Delivery Team.',
        description: 'Join a team that values ownership, communication, and the craft of connecting people to opportunity.',
        media: media.hero.id,
        careerCollage: {
          imageOne: media.hero.id,
          imageTwo: media.aboutSide.id,
          imageThree: media.teamOffice.id,
        },
      },
      {
        blockType: 'career',
        selectionMode: 'latest',
        heading: 'Open Roles',
        description: 'Explore current opportunities with INFE Talent.',
        showFilters: true,
      },
    ],
    seo: {
      metaTitle: 'Careers at INFE Talent',
      metaDescription: 'Explore open recruitment and operations roles at INFE Talent.',
      openGraphImage: media.hero.id,
    },
    _status: 'published',
  })

  await upsert('pages', 'contact', {
    title: 'Contact',
    slug: 'contact',
    layout: [
      {
        blockType: 'contact',
        eyebrow: 'Contact',
        heading: 'Let Us Design Your Offshore Recruitment Engine.',
        description: 'Tell us about your hiring goals. We will come back with a tailored model and a clear path to scale.',
        formHeading: 'Get in Touch Today!',
        contactMethods: [
          { label: 'UK', value: '+44 203 878 3559', url: 'tel:+442038783559' },
          { label: 'US', value: '+1 614 266 3317', url: 'tel:+16142663317' },
          { label: 'AUS', value: '+61 740 620 017', url: 'tel:+61740620017' },
          { label: 'Email', value: 'info@infetalent.com', url: 'mailto:info@infetalent.com' },
        ],
      },
    ],
    seo: {
      metaTitle: 'Contact INFE Talent',
      metaDescription: 'Contact INFE Talent to discuss offshore recruitment support, sourcing teams, and scalable staffing delivery models.',
      openGraphImage: media.hero.id,
    },
    _status: 'published',
  })

  const headerNavigation = [
    { label: 'About Us', url: '/about', newTab: false },
    { label: 'Services', url: '/services', newTab: false },
    { label: 'Blogs', url: '/blogs', newTab: false },
    { label: 'Careers', url: '/careers', newTab: false },
    { label: 'Testimonials', url: '/testimonials', newTab: false },
    { label: 'Contact Us', url: '/contact', newTab: false },
  ]
  const footerContact = {
    address: '2972 Westheimer Rd. Santa Ana, Illinois 85486',
    phone: '+44 203 878 3559',
    ukPhone: '+44 203 878 3559',
    usPhone: '+1 614 266 3317',
    ausPhone: '+61 740 620 017',
    email: 'info@infetalent.com',
  }
  const socialLinks: { iconName: string; newTab: boolean; platformName: string; url: string }[] = [
    {
      platformName: 'LinkedIn',
      url: 'https://www.linkedin.com/company/infe-talent',
      iconName: 'linkedin',
      newTab: true,
    },
    {
      platformName: 'Facebook',
      url: 'https://www.facebook.com/infetalent',
      iconName: 'facebook',
      newTab: true,
    },
    {
      platformName: 'Instagram',
      url: 'https://www.instagram.com/infetalent',
      iconName: 'instagram',
      newTab: true,
    },
  ]

  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      brandName: 'INFE Talent',
      logo: media.logo.id,
      header: {
        logo: media.logo.id,
        logoAlt: 'INFE Talent',
        navigation: headerNavigation,
        cta: {
          enabled: true,
          label: 'Get Started',
          url: '/contact',
          variant: 'primary',
          newTab: false,
        },
        stickyEnabled: true,
      },
      footer: {
        logo: media.logo.id,
        logoAlt: 'INFE Talent',
        description: 'Offshore recruitment support for staffing teams across the USA, UK, APAC, and Australia.',
        navigationColumns: [
          {
            title: 'Quick Links',
            links: headerNavigation,
          },
        ],
        contact: footerContact,
        socialLinks,
        cta: {
          enabled: false,
          label: 'Contact Us',
          url: '/contact',
          variant: 'primary',
          newTab: false,
        },
        copyright: 'Copyright 2026 INFE Talent. All rights reserved.',
      },
      primaryNavigation: headerNavigation,
      footerNavigation: headerNavigation,
      footerPartners: media.partners.map((partner, index) => ({
        image: partner.id,
        label: footerPartnerLabels[index] || `Partner certification ${index + 1}`,
        newTab: false,
      })),
      copyright: 'Copyright 2026 INFE Talent. All rights reserved.',
      contact: {
        officeAddress: '2972 Westheimer Rd. Santa Ana, Illinois 85486',
        ukPhone: '+44 203 878 3559',
        usPhone: '+1 614 266 3317',
        ausPhone: '+61 740 620 017',
        email: 'info@infetalent.com',
      },
      socialLinks: socialLinks.map(({ platformName, url, newTab }) => ({
        label: platformName,
        url,
        newTab,
      })),
    },
    overrideAccess: true,
  })
}

run()
  .then(() => {
    console.log('Seed complete')
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

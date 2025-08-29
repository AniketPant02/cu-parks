import { getBlogPosts } from 'app/park/utils'

export const baseUrl = 'https://parks.aniketpant.me'

export default async function sitemap() {
  let parks = getBlogPosts().map((post) => ({
    url: `${baseUrl}/park/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }))

  let routes = ['', '/park'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  return [...routes, ...parks]
}

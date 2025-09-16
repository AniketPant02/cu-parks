import Link from 'next/link'
import { formatDate, getBlogPosts } from 'app/park/utils'

export function BlogPosts() {
  let allBlogs = getBlogPosts()

  return (
    <div>
      {allBlogs
        .sort((a, b) => {
          if (
            new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
          ) {
            return -1
          }
          return 1
        })
        .map((post) => (
          <Link
            key={post.slug}
            className="flex flex-col space-y-1 mb-4"
            href={`/park/${post.slug}`}
          >
            <div className="w-full flex flex-col md:flex-row space-x-0 md:space-x-2">
              <p className="text-stone-500 w-[180px] tabular-nums">
                {formatDate(post.metadata.publishedAt, false)}
              </p>
              <p className="font-medium text-amber-800 hover:text-amber-900 tracking-tight">
                {post.metadata.title}
              </p>
            </div>
          </Link>
        ))}
        <div className="text-stone-500 text-sm">{allBlogs.length} posts</div>
    </div>
  )
}

import { BlogPosts } from 'app/components/posts'

export const metadata = {
  title: 'Blog',
  description: 'A log of parks I\'ve visited in Urbana-Champaign.',
}

export default function Page() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">Parks I've visited</h1>
      <BlogPosts />
    </section>
  )
}

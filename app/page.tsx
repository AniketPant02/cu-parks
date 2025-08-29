import { BlogPosts } from 'app/components/posts'

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        Parks @ Urbana-Champaign
      </h1>
      <p className="mb-4">
        {
          `During my time at the UIUC, I've enjoyed visiting a variety of parks in the area, each offering its own unique charm and beauty. 
           This blog documents my visits.
           
           If you find any issues or suggestions, please reach out.
           `
        }
      </p>
      <div className="my-8">
        <BlogPosts />
      </div>
    </section>
  )
}

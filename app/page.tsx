import { BlogPosts } from 'app/components/posts'

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl text-stone-800 font-semibold tracking-tighter">
        Parks @ Urbana-Champaign
      </h1>
      <p className="mb-4 text-stone-800">
        {
          `During my time at the UIUC, I've enjoyed visiting a variety of parks in the area, each offering its own unique charm and beauty. 
           This blog documents my visits. I am trying to visit 50 parks by the end of the semester.
           `
        }
      </p>
      <p className="mb-4 text-stone-800">
        <b>Update: </b>
        {
          `Originally, this blog began as a personal challenge to visit 50 parks during FA2025 at UIUC. Over time, it evolved into a more general blog of key events during the FA2025 semester. I might remove these later.
           `
        }
      </p>
      <div className="my-8">
        <BlogPosts />
      </div>
    </section>
  )
}

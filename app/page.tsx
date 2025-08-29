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

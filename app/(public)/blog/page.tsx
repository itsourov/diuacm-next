import { getBlogMeta } from "./utils/mdx";
import BlogCard from "./components/BlogCard";

export const metadata = {
  title: 'Programming Blog & Tutorials | DIU ACM Community',
  description: 'Read insightful articles, tutorials, and community updates about competitive programming, algorithms, and problem-solving techniques from DIU ACM members.',
  keywords: ['programming blog', 'competitive programming tutorials', 'algorithm tutorials', 'coding tips', 'DIU ACM blog']
};

export default function BlogPage() {
  const posts = getBlogMeta();

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-b from-blue-50/20 to-transparent dark:from-blue-900/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Our Blog
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover tutorials, insights, and updates from the DIU ACM community. 
              Learn, share, and grow with us.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </main>
  );
}

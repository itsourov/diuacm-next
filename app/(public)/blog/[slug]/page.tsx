import { getBlogPost, getBlogMeta } from "../utils/mdx";
import { notFound } from "next/navigation";
import BlogContent from "../components/BlogContent";
import { Calendar, Clock } from "lucide-react";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;  // Changed to Promise
}

export async function generateStaticParams() {
  const posts = getBlogMeta();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = await params;  // Await params here
  const post = getBlogPost(resolvedParams.slug);
  if (!post) notFound();

  return (
    <article className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Gradient Background Section */}
      <div className="bg-gradient-to-b from-blue-50/20 to-transparent dark:from-blue-900/10 pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Header Section */}
          <header className="mb-8">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-sm rounded-full 
                           bg-blue-50 dark:bg-blue-900/20 
                           text-blue-600 dark:text-blue-400 
                           border border-blue-100 dark:border-blue-800"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold 
                         text-gray-900 dark:text-white mb-6 
                         tracking-tight leading-tight">
              {post.title}
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-600 dark:text-gray-300 
                       mb-8 leading-relaxed">
              {post.description}
            </p>

            {/* Author and Meta Info */}
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center 
                         sm:justify-between p-6 bg-white dark:bg-gray-800 
                         rounded-xl shadow-sm border border-gray-100 
                         dark:border-gray-700">
              {/* Author Info */}
              <div>
                <div className="font-medium text-gray-900 dark:text-white mb-1">
                  {post.author.name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {post.author.bio}
                </div>
              </div>

              {/* Post Meta */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 
                           dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {post.readingTime}
                </div>
              </div>
            </div>
          </header>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 
                     sm:p-8 shadow-sm border border-gray-100 
                     dark:border-gray-700">
          <div className="prose prose-lg dark:prose-invert max-w-none
                       prose-headings:scroll-mt-20
                       prose-headings:font-display
                       prose-a:text-blue-600 dark:prose-a:text-blue-400
                       prose-img:rounded-xl prose-img:shadow-lg
                       prose-pre:border prose-pre:border-gray-200 
                       dark:prose-pre:border-gray-700
                       prose-headings:text-gray-900 
                       dark:prose-headings:text-white
                       prose-p:text-gray-600 dark:prose-p:text-gray-300
                       prose-strong:text-gray-900 
                       dark:prose-strong:text-white">
            <BlogContent content={post.content} />
          </div>
        </div>
      </div>
    </article>
  );
}

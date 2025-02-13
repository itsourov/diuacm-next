import { getBlogPost, getBlogMeta } from "../utils/mdx";
import { notFound } from "next/navigation";
import BlogContent from "../components/BlogContent";
import Image from "next/image";
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
      {/* Featured Image with Overlay */}
      <div className="relative h-[40vh] sm:h-[50vh] lg:h-[60vh]">
        <Image
          src={post.featuredImage}
          alt={post.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/50 to-gray-900/90" />
        
        {/* Hero Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 lg:pb-16">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-sm rounded-full 
                           bg-white/10 backdrop-blur-sm text-white
                           border border-white/20"
                >
                  {tag}
                </span>
              ))}
            </div>
            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
              {post.title}
            </h1>
            {/* Description */}
            <p className="text-lg text-gray-200 max-w-3xl mb-6">
              {post.description}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 relative z-10">
        {/* Author and Meta Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg mb-8 
                       backdrop-blur-lg border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            {/* Author Info */}
            <div className="flex items-center gap-3 min-w-0">
              <Image
                src={post.author.image}
                alt={post.author.name}
                width={48}
                height={48}
                className="rounded-full ring-2 ring-white dark:ring-gray-700"
              />
              <div className="min-w-0">
                <div className="font-medium text-gray-900 dark:text-white truncate">
                  {post.author.name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {post.author.bio}
                </div>
              </div>
            </div>
            {/* Divider */}
            <div className="hidden sm:block w-px h-8 bg-gray-200 dark:bg-gray-700" />
            {/* Post Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
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
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-8 lg:p-12 shadow-lg 
                     border border-gray-100 dark:border-gray-700">
          <div className="prose prose-lg dark:prose-invert max-w-none
                        prose-headings:scroll-mt-20
                        prose-a:text-blue-600 dark:prose-a:text-blue-400
                        prose-img:rounded-xl prose-img:shadow-lg
                        prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-700">
            <BlogContent content={post.content} />
          </div>
        </div>
      </div>
    </article>
  );
}

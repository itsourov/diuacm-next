import { BlogMeta } from "../types/blog";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock } from "lucide-react";

interface BlogCardProps {
  post: BlogMeta;
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden
                hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      <div className="relative aspect-[16/9]">
        <Image
          src={post.featuredImage}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 text-sm rounded-full bg-blue-50 dark:bg-blue-900/20 
                         text-blue-600 dark:text-blue-400 font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 
                       group-hover:text-blue-600 dark:group-hover:text-blue-400 
                       transition-colors duration-200">
          {post.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-3 flex-1">
          {post.description}
        </p>
        <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <time dateTime={post.date}>{new Date(post.date).toLocaleDateString()}</time>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{post.readingTime}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

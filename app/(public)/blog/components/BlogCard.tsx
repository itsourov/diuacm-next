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
      className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden
                hover:shadow-xl transition-all duration-200"
    >
      <div className="relative aspect-[16/9]">
        <Image
          src={post.featuredImage}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 text-sm rounded-full bg-blue-50 dark:bg-blue-900/20 
                         text-blue-600 dark:text-blue-400"
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
          {post.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {post.description}
        </p>
        <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date(post.date).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {post.readingTime}
          </div>
        </div>
      </div>
    </Link>
  );
}

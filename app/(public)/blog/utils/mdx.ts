import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { BlogMeta, BlogPost } from '../types/blog';
import readingTime from 'reading-time';

const blogDirectory = path.join(process.cwd(), 'app/(public)/blog/content');

export function getBlogMeta(): BlogMeta[] {
  const files = fs.readdirSync(blogDirectory);
  const posts = files
    .filter(file => file.endsWith('.mdx'))
    .map(file => {
      const filePath = path.join(blogDirectory, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContent);
      const stats = readingTime(content);

      return {
        slug: file.replace('.mdx', ''),
        title: data.title,
        description: data.description,
        date: data.date,
        author: data.author,
        featuredImage: data.featuredImage,
        tags: data.tags,
        readingTime: stats.text,
      };
    });

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getBlogPost(slug: string): BlogPost | null {
  try {
    const filePath = path.join(blogDirectory, `${slug}.mdx`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    const stats = readingTime(content);

    return {
      slug,
      title: data.title,
      description: data.description,
      date: data.date,
      author: data.author,
      content,
      featuredImage: data.featuredImage,
      tags: data.tags,
      readingTime: stats.text,
    };
  } catch {
    return null;
  }
}

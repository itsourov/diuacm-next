'use client';

import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Image from 'next/image';


interface BlogContentProps {
  content: string;
}

interface CodeProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function BlogContent({ content }: BlogContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath, remarkGfm]}
      rehypePlugins={[rehypeKatex]}
      components={{
        code({ inline, className, children, ...props }: CodeProps) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={oneDark}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        img({ src, alt }) {
          // Render images without wrapping p tag
          return (
            <span className="block relative aspect-video my-8">
              <Image
                src={src || ''}
                alt={alt || ''}
                fill
                className="object-contain"
              />
            </span>
          );
        },
        p({ children }) {
          // Check if children contains an image
          const hasImage = (Array.isArray(children) 
            ? children.some(child => typeof child === 'object' && 'type' in child && child.type === 'img')
            : false);
          
          // If it contains an image, render without p tag
          if (hasImage) {
            return <>{children}</>;
          }
          
          return <p className="my-4 leading-relaxed">{children}</p>;
        },
        // Custom heading styles
        h1: (props) => <h1 className="text-4xl font-bold mt-8 mb-4" {...props} />,
        h2: (props) => <h2 className="text-3xl font-bold mt-8 mb-4" {...props} />,
        h3: (props) => <h3 className="text-2xl font-bold mt-6 mb-3" {...props} />,
        h4: (props) => <h4 className="text-xl font-bold mt-6 mb-3" {...props} />,
        // Custom paragraph and link styles
        a: (props) => (
          <a
            className="text-blue-600 dark:text-blue-400 hover:underline"
            {...props}
          />
        ),
        // Custom list styles
        ul: (props) => <ul className="list-disc list-inside my-4" {...props} />,
        ol: (props) => (
          <ol className="list-decimal list-inside my-4" {...props} />
        ),
        // Custom blockquote style
        blockquote: (props) => (
          <blockquote
            className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-4 italic"
            {...props}
          />
        ),
        // Custom table styles - Use div wrapper for tables
        table: (props) => (
          <div className="my-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" {...props} />
          </div>
        ),
        thead: (props) => <thead className="bg-gray-50 dark:bg-gray-800" {...props} />,
        th: (props) => (
          <th
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            {...props}
          />
        ),
        td: (props) => (
          <td className="px-6 py-4 whitespace-nowrap text-sm" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

'use client';

import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Image from 'next/image';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

interface BlogContentProps {
  content: string;
}

interface CodeProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// Add new interface for code block state
interface CodeBlockProps extends CodeProps {
  language?: string;
}

export default function BlogContent({ content }: BlogContentProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="markdown-content prose dark:prose-invert max-w-none prose-pre:p-0 
                    prose-headings:font-display prose-h1:text-5xl prose-h2:text-4xl 
                    prose-h3:text-3xl prose-h4:text-2xl prose-p:text-lg 
                    prose-p:text-gray-700 dark:prose-p:text-gray-300 
                    prose-a:text-blue-600 dark:prose-a:text-blue-400 
                    hover:prose-a:text-blue-800 dark:hover:prose-a:text-blue-300 
                    prose-img:rounded-lg prose-img:shadow-md prose-li:text-lg">
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ inline, className, children, ...props }: CodeBlockProps) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const code = String(children).replace(/\n$/, '');

            return !inline && match ? (
              <div className="relative group">
                <div className="absolute right-4 top-4 flex items-center gap-2 opacity-0 
                              group-hover:opacity-100 transition-opacity">
                  <span className="text-sm text-gray-400 bg-gray-800/70 px-2 py-1 rounded-md 
                                 font-mono backdrop-blur-sm">
                    {language}
                  </span>
                  <button
                    onClick={() => handleCopy(code)}
                    className="p-2 text-gray-400 hover:text-white transition-all rounded-lg 
                             bg-gray-800/70 hover:bg-gray-700/80 backdrop-blur-sm
                             hover:scale-105 active:scale-95"
                    title="Copy code"
                  >
                    {copiedCode === code ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <SyntaxHighlighter
                  style={coldarkDark}
                  language={language}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    borderRadius: '0.75rem',
                    padding: '2rem 1.5rem',
                    paddingTop: '3rem',
                    backgroundColor: 'rgb(17 24 39)',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                    fontSize: '1.1rem',
                    lineHeight: '1.75'
                  }}
                  {...props}
                >
                  {code}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className="px-1.5 py-0.5 rounded-md bg-gray-200 dark:bg-gray-800 
                             font-mono text-base" {...props}>
                {children}
              </code>
            );
          },
          img({ src, alt }) {
            return (
              <Image
                src={src || ''}
                alt={alt || ''}
                width={1920}
                height={1080}
                className="w-full h-auto hover:scale-105 transition-transform duration-500 
                          rounded-lg shadow-lg hover:shadow-xl my-8"
                style={{ maxHeight: '80vh' }}
              />
            );
          },
          // Modify p component to handle images differently
          p({ children, ...props }) {
            const hasOnlyImage = (Array.isArray(children)
              && children.length === 1
              && typeof children[0] === 'object'
              && 'type' in children[0]
              && children[0].type === 'img');

            // If it's an image, wrap it in a div with the desired styles
            if (hasOnlyImage) {
              return (
                <div className="overflow-hidden my-8">
                  {children}
                </div>
              );
            }

            // Otherwise return normal paragraph
            return <p className="my-4 leading-relaxed text-gray-700 dark:text-gray-300" {...props}>{children}</p>;
          },
          // Custom heading styles
          h1: (props) => (
            <h1 className="text-5xl font-bold mt-12 mb-6 text-gray-900 
                          dark:text-white tracking-tight" {...props} />
          ),
          h2: (props) => (
            <h2 className="text-4xl font-bold mt-10 mb-5 text-gray-800 
                          dark:text-gray-100 tracking-tight" {...props} />
          ),
          h3: (props) => (
            <h3 className="text-3xl font-bold mt-8 mb-4 text-gray-800 
                          dark:text-gray-100" {...props} />
          ),
          h4: (props) => <h4 className="text-2xl font-bold mt-6 mb-3" {...props} />,
          // Custom paragraph and link styles
          a: (props) => (
            <a className="text-blue-600 dark:text-blue-400 hover:text-blue-800 
                         dark:hover:text-blue-300 transition-colors duration-200 
                         underline-offset-2 decoration-2" {...props} />
          ),
          // Custom list styles
          ul: (props) => (
            <ul className="list-disc list-inside my-6 space-y-3 text-lg text-gray-700 
                          dark:text-gray-300" {...props} />
          ),
          ol: (props) => (
            <ol className="list-decimal list-inside my-6 space-y-3 text-lg text-gray-700 
                          dark:text-gray-300" {...props} />
          ),
          // Custom blockquote style
          blockquote: (props) => (
            <blockquote className="border-l-4 border-blue-500 dark:border-blue-400 
                                  pl-4 my-6 italic text-gray-700 dark:text-gray-300 
                                  bg-gray-50 dark:bg-gray-800/50 py-2 rounded-r-lg" {...props} />
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
              className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              {...props}
            />
          ),
          td: (props) => (
            <td className="px-6 py-4 whitespace-nowrap text-base" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

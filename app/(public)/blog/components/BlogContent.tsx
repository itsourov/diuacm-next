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
    <div className="markdown-content prose dark:prose-invert max-w-none prose-pre:p-0">
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
                {/* Language label */}
                <div className="absolute right-4 top-4 flex items-center gap-2">
                  <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded">
                    {language}
                  </span>
                  <button
                    onClick={() => handleCopy(code)}
                    className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg 
                             bg-gray-800/50 hover:bg-gray-700/50"
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
                    borderRadius: '6px',
                    paddingTop: '2.5rem',
                  }}
                  {...props}
                >
                  {code}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          img({ src, alt }) {
            // Return just the Image component without a wrapper
            return (
              <Image
                src={src || ''}
                alt={alt || ''}
                width={1920}
                height={1080}
                className="w-full h-auto my-8"
                style={{ maxHeight: '80vh' }}
              />
            );
          },
          // Modify p component to handle images differently
          p({ children, ...props }) {
            // Check if children is an image
            const hasOnlyImage = (Array.isArray(children)
              && children.length === 1
              && typeof children[0] === 'object'
              && 'type' in children[0]
              && children[0].type === 'img');

            // If it's just an image, return the children directly without p wrapper
            if (hasOnlyImage) {
              return <>{children}</>;
            }

            // Otherwise return normal paragraph
            return <p className="my-4 leading-relaxed" {...props}>{children}</p>;
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
    </div>
  );
}


// To use this component, you need to install react-markdown and remark-gfm:
// npm install react-markdown remark-gfm
// yarn add react-markdown remark-gfm

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className="prose prose-slate max-w-none prose-p:leading-relaxed prose-headings:font-semibold prose-a:text-blue-600 hover:prose-a:text-blue-500"
    >
      {content}
    </ReactMarkdown>
  );
};

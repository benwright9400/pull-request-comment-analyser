"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

export default function CommentBody({ body }: { body: string }) {
    return (
        <div className="mt-2 text-sm text-gray-600 prose prose-sm max-w-none prose-p:my-1 prose-pre:my-2">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{body}</ReactMarkdown>
        </div>
    );
}

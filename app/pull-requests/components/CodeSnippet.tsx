"use client";

import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/prism-light";
import diff from "react-syntax-highlighter/dist/esm/languages/prism/diff";
import oneDark from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";

SyntaxHighlighter.registerLanguage("diff", diff);

export default function CodeSnippet({ diffHunk }: { diffHunk: string }) {
    return (
        <SyntaxHighlighter
            language="diff"
            style={oneDark}
            customStyle={{ margin: 0, fontSize: "0.75rem" }}
        >
            {diffHunk}
        </SyntaxHighlighter>
    );
}

import ReactMarkDown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import SyntaxHighlighter from "react-syntax-highlighter";
import { github } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { TwitterTweetEmbed } from "react-twitter-embed";

export const Markdown = (props) => {
  return (
    <ReactMarkDown
      className="markdown-body"
      children={props.md}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        code({ inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <SyntaxHighlighter
              language={match[1]}
              PreTag="div"
              {...props}
              style={github}
              showLineNumbers={true}
              wrapLongLines={true}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        /* Twitter Embed Support */
        /* https://stackoverflow.com/questions/66941072/how-to-parse-embeddable-links-from-markdown-and-render-custom-react-components */
        a: (props) => {
          return props.href.startsWith("https://twitter.com") ? (
            <TwitterTweetEmbed
              tweetId={props.href.split("/")[5].split("?")[0]}
            /> // Render Twitter links with custom component
          ) : (
            <a href={props.href}>{props.children}</a> // All other links
          );
        },
      }}
    />
  );
};

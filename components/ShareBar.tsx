// components/ShareBar.tsx
"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

type Props = {
  slug: string;
  title: string;
  description?: string;
};

export default function ShareBar({ slug, title, description }: Props) {
  const [copied, setCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState(
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://scalecards.dev"
  );
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setBaseUrl(window.location.origin);
    setMounted(true);
  }, []);

  const currentTheme = mounted ? (theme === 'system' ? systemTheme : theme) || 'dark' : 'dark';

  const cardUrl = `${baseUrl}/v/${slug}`;
  const encodedUrl = encodeURIComponent(cardUrl);

  // Construct Twitter share text
  let twitterText = title;
  if (description) {
    // Keep it relatively short for Twitter
    const shortDesc = description.length > 150 ? description.substring(0, 147) + '...' : description;
    // Use standard spacing for the web intent text to avoid URL truncation issues
    twitterText = `${title} — ${shortDesc}`;
  }
  const encodedTwitterText = encodeURIComponent(twitterText);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cardUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleNativeShare = async () => {
    try {
      if (!navigator.share) {
        alert("Your browser doesn't support the native Web Share API. Please use the other buttons.");
        return;
      }

      // Try fetching the image to attach
      const response = await fetch(`/api/og/${slug}?download=true&theme=${currentTheme}`);
      const blob = await response.blob();
      const file = new File([blob], `${slug}-preview.png`, { type: 'image/png' });

      const shareData = {
        title: title,
        text: twitterText,
        url: cardUrl,
        files: [file]
      };

      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback without the image if the OS/browser doesn't support file sharing
        await navigator.share({
          title: title,
          text: twitterText,
          url: cardUrl
        });
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4 mt-2">
      {/* Copy link */}
      <button
        onClick={handleCopy}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500/20 via-pink-500/20 to-yellow-500/20 border border-border text-sm font-mono text-gradient transition-colors font-semibold ${copied ? 'ring-2 ring-pink-400' : ''}`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M9 5H5V9" />
          <rect x="2" y="2" width="7" height="7" rx="1" />
          <path d="M5 9H9V5" />
          <rect x="5" y="5" width="7" height="7" rx="1" />
        </svg>
        {copied ? "Copied!" : "Copy link"}
      </button>

      {/* Share to X */}
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTwitterText}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#000000]/5 hover:bg-[#000000]/10 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-border text-sm font-mono text-zinc-900 dark:text-zinc-100 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Share on X
      </a>

      {/* Share to LinkedIn */}
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0a66c2]/10 hover:bg-[#0a66c2]/20 dark:bg-[#0a66c2]/80 dark:hover:bg-[#0a66c2] border border-[#0a66c2]/20 dark:border-transparent text-sm font-mono text-[#0a66c2] dark:text-white transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
        LinkedIn
      </a>

      {/* Export SVG */}
      <a
        href={`/api/export/${slug}?theme=${currentTheme}`}
        download={`${slug}.svg`}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500/30 via-pink-500/30 to-yellow-500/30 border border-indigo-500/20 text-sm font-mono text-gradient transition-colors font-semibold"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M7 2V10M7 10L4 7M7 10L10 7" />
          <path d="M2 12H12" />
        </svg>
        Export SVG
      </a>

      {/* Export PNG */}
      <a
        href={`/api/og/${slug}?download=true&theme=${currentTheme}`}
        download={`${slug}-preview.png`}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-indigo-500/30 border border-blue-500/20 text-sm font-mono text-gradient transition-colors font-semibold"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="2" y="2" width="10" height="10" rx="2" />
          <circle cx="5" cy="5" r="1.5" />
          <path d="M2 10L6 6L12 12" />
        </svg>
        Export PNG
      </a>

      {/* Native Share / OS Share Sheet */}
      <button
        onClick={handleNativeShare}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface hover:bg-zinc-800/50 dark:hover:bg-zinc-700 border border-border text-sm font-mono text-foreground transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
        Share with Image...
      </button>
    </div>
  );
}

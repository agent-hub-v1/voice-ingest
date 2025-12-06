---
name: supadata-docs
description: Supadata API documentation for YouTube transcript extraction. Use when implementing YouTube URL transcript fetching, video metadata retrieval, or batch transcript operations. Supports 100 requests/month on free tier. Available via REST API, JavaScript SDK, or MCP server.
---

# Supadata Documentation

Official Supadata API documentation for YouTube transcript extraction and video metadata.

## PRIMARY DOCUMENT

**START HERE → [docs/index.md](docs/index.md)**

The `index.md` file contains a comprehensive reference covering:
- API endpoints (transcript, metadata, batch)
- Authentication (x-api-key header)
- JavaScript SDK usage
- MCP server integration
- Response formats and error handling
- Free tier limits (100 requests/month)
- Complete code examples (TypeScript/JavaScript)

**Read `index.md` FIRST before any implementation.**

## Purpose

This skill provides bundled official documentation for Supadata's transcript extraction API. Primary use case is fetching transcripts from YouTube videos by URL.

## When to Use

**ALWAYS invoke this skill BEFORE**:
- Implementing YouTube transcript extraction
- Fetching video metadata from YouTube
- Setting up batch transcript operations
- Configuring the Supadata MCP server
- Any Supadata API integration

## Key Concepts

### Transcript Extraction
Submit a YouTube URL → get transcript with timestamps. Supports:
- Native transcripts (captions/subtitles)
- AI-generated transcripts (fallback)
- Translation to other languages

### Integration Options
1. **REST API**: Direct HTTP requests
2. **JavaScript SDK**: `@supadata/js` npm package
3. **MCP Server**: `@supadata/mcp` for AI assistants

### Free Tier
- 100 requests per month
- 1 credit per native transcript
- 2 credits per minute for AI-generated

## Critical Rules

1. **NEVER implement from memory** - API may have changed
2. **ALWAYS read `index.md`** before implementation
3. **Follow exact patterns** shown in code examples
4. **Handle async responses** - some requests return jobId for polling
5. **Check for 202 status** - indicates async processing needed

---

## Official Documentation Links

Source: https://docs.supadata.ai/llms.txt

### API Reference

- [Introduction](https://docs.supadata.ai/api-reference/introduction.md): Supadata API Reference
- [Get Account Information](https://docs.supadata.ai/api-reference/endpoint/account/me.md): Retrieve organization details, plan information, and credit usage.
- [Metadata](https://docs.supadata.ai/api-reference/endpoint/metadata/metadata.md): Fetch metadata from any supported internet media including YouTube, TikTok, Instagram, Twitter/X and Facebook posts.
- [Transcript](https://docs.supadata.ai/api-reference/endpoint/transcript/transcript.md): Get transcript from a supported video platform or file URL.
- [Transcript Result](https://docs.supadata.ai/api-reference/endpoint/transcript/transcript-get.md): Get results for a transcript job by job ID.

### YouTube Endpoints

- [Video](https://docs.supadata.ai/api-reference/endpoint/youtube/video-get.md): Get metadata for a YouTube video.
- [Transcript](https://docs.supadata.ai/api-reference/endpoint/youtube/transcript.md): Get transcript from YouTube video in various formats and languages.
- [Translate Transcript](https://docs.supadata.ai/api-reference/endpoint/youtube/translation.md): Translate YouTube video transcript into different languages.
- [Search](https://docs.supadata.ai/api-reference/endpoint/youtube/search.md): Search YouTube for videos, channels, and playlists with advanced filters.
- [Channel](https://docs.supadata.ai/api-reference/endpoint/youtube/channel.md): Get metadata for a YouTube channel.
- [Channel Videos](https://docs.supadata.ai/api-reference/endpoint/youtube/channel-videos.md): Get video IDs from a YouTube channel.
- [Playlist](https://docs.supadata.ai/api-reference/endpoint/youtube/playlist.md): Get metadata for a YouTube playlist.
- [Playlist Videos](https://docs.supadata.ai/api-reference/endpoint/youtube/playlist-videos.md): Get video IDs from a YouTube playlist.
- [Transcript Batch](https://docs.supadata.ai/api-reference/endpoint/youtube/transcript-batch.md): Create a batch job to get transcripts of multiple YouTube videos.
- [Video Batch](https://docs.supadata.ai/api-reference/endpoint/youtube/video-batch.md): Create a batch job to fetch metadata of multiple YouTube videos.
- [Batch Result](https://docs.supadata.ai/api-reference/endpoint/youtube/batch-get.md): Get the status and results of a YouTube batch job.

### Web Endpoints

- [Scrape](https://docs.supadata.ai/api-reference/endpoint/web/scrape.md): Extract content from any web page to Markdown format.
- [Map](https://docs.supadata.ai/api-reference/endpoint/web/map.md): Extract all links found on a whole website.
- [Crawl](https://docs.supadata.ai/api-reference/endpoint/web/crawl.md): Create a crawl job to extract content from all pages on a website.
- [Crawl Status](https://docs.supadata.ai/api-reference/endpoint/web/crawl-get.md): Get the status and results of a crawl by job ID.

### Feature Guides

- [Transcript](https://docs.supadata.ai/get-transcript.md): Fetch text transcript from YouTube, TikTok, Instagram, X, Facebook or public file URL.
- [Metadata](https://docs.supadata.ai/get-metadata.md): Fetch metadata from videos and posts with unified schema.
- [YouTube Transcript](https://docs.supadata.ai/youtube/get-transcript.md): Fetch text transcript from a YouTube video in various formats and languages.
- [YouTube Translation](https://docs.supadata.ai/youtube/get-transcript-translation.md): Translate YouTube transcripts to different languages.
- [YouTube Video Metadata](https://docs.supadata.ai/youtube/video.md): Fetch metadata from a YouTube video.
- [YouTube Channel](https://docs.supadata.ai/youtube/channel.md): Fetch metadata from a YouTube channel.
- [YouTube Playlist](https://docs.supadata.ai/youtube/playlist.md): Fetch metadata from a YouTube playlist.
- [YouTube Search](https://docs.supadata.ai/youtube/search.md): Search YouTube with advanced filtering options.
- [YouTube Batch](https://docs.supadata.ai/youtube/batch.md): Get multiple transcripts or video metadata from playlists, channels, or URL lists.
- [YouTube URL Formats](https://docs.supadata.ai/youtube/supported-url-formats.md): Supported YouTube URL formats for videos, playlists, and channels.
- [YouTube Languages](https://docs.supadata.ai/youtube/supported-language-codes.md): Supported languages for YouTube transcripts.

### SDKs & Integrations

- [Overview](https://docs.supadata.ai/integrations/overview.md): Supadata SDKs and integrations.
- [Node.js SDK](https://docs.supadata.ai/integrations/node.md): JavaScript/TypeScript SDK for Supadata API.
- [Python SDK](https://docs.supadata.ai/integrations/python.md): Python SDK for Supadata API.
- [MCP Server](https://docs.supadata.ai/integrations/mcp.md): Model Context Protocol server for AI-powered web and video scraping.
- [n8n](https://docs.supadata.ai/integrations/n8n.md): Open-source workflow automation integration.
- [Zapier](https://docs.supadata.ai/integrations/zapier.md): Connect Supadata with 5,000+ apps.
- [Make](https://docs.supadata.ai/integrations/make.md): Visual automation workflows.
- [Active Pieces](https://docs.supadata.ai/integrations/activepieces.md): Open-source no-code automation.

### Error Handling

- [Error Codes](https://docs.supadata.ai/errors/list.md): Comprehensive list of all error codes.
- [Invalid Request](https://docs.supadata.ai/errors/invalid-request.md): Invalid request parameters.
- [Unauthorized](https://docs.supadata.ai/errors/unauthorized.md): Authentication errors.
- [Not Found](https://docs.supadata.ai/errors/not-found.md): Resource not found.
- [Limit Exceeded](https://docs.supadata.ai/errors/limit-exceeded.md): Rate limit or quota exceeded.
- [Upgrade Required](https://docs.supadata.ai/errors/upgrade-required.md): Feature not available on current plan.
- [Transcript Unavailable](https://docs.supadata.ai/errors/transcript-unavailable.md): No transcript available for video.
- [Internal Error](https://docs.supadata.ai/errors/internal-error.md): Server error.

### Resources

- [Introduction](https://docs.supadata.ai/index.md): Welcome to Supadata documentation.
- [Community Resources](https://docs.supadata.ai/community-resources.md): Tutorials, guides, and videos.
- [Playground](https://supadata.ai/playground): Interactive API testing.
- [Feedback](https://supadata.featurebase.app): Feature requests and feedback.

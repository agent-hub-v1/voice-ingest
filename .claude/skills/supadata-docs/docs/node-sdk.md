https://docs.supadata.ai/llms-full.txt# Node

> Supadata Node SDK is a wrapper around the Supadata API to help you easily turn videos into transcripts and websites into markdown.

## Installation

To install the Supadata Node SDK, you can use npm (or pnpm, yarn, bun, etc.):

```bash Node theme={null}
npm install @supadata/js
```

## Usage

Get an API key from [dash.supadata.ai](https://dash.supadata.ai), then use it with the SDK.

Here's an example of how to use the SDK with error handling:

```js Node theme={null}
import {
  Crawl,
  CrawlJob,
  JobResult,
  Map,
  Scrape,
  Supadata,
  Transcript,
  TranscriptOrJobId,
  YoutubeChannel,
  YoutubePlaylist,
  YoutubeVideo,
} from "@supadata/js";

// Initialize the client
const supadata = new Supadata({
  apiKey: "YOUR_API_KEY",
});

// Get transcript from any supported platform (YouTube, TikTok, Instagram, X (Twitter)) or file
const transcriptResult = await supadata.transcript({
  url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  lang: "en", // optional
  text: true, // optional: return plain text instead of timestamped chunks
  mode: "auto", // optional: 'native', 'auto', or 'generate'
});

// Check if we got a transcript directly or a job ID for async processing
if ("jobId" in transcriptResult) {
  // For large files, we get a job ID and need to poll for results
  console.log(`Started transcript job: ${transcriptResult.jobId}`);

  // Poll for job status
  const jobResult = await supadata.transcript.getJobStatus(
    transcriptResult.jobId
  );
  if (jobResult.status === "completed") {
    console.log("Transcript:", jobResult.content);
  } else if (jobResult.status === "failed") {
    console.error("Transcript failed:", jobResult.error);
  } else {
    console.log("Job status:", jobResult.status); // 'queued' or 'active'
  }
} else {
  // For smaller files, we get the transcript directly
  console.log("Transcript:", transcriptResult);
}
```

### Transcripts

Get transcript from any supported platform (YouTube, TikTok, Instagram, X (Twitter)) or file

```js Node theme={null}
import { Supadata } from "@supadata/js";

// Initialize the client
const supadata = new Supadata({
  apiKey: "YOUR_API_KEY",
});

// Get transcript from any supported platform (YouTube, TikTok, Instagram, X (Twitter)) or file
const transcriptResult = await supadata.transcript({
  url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  lang: "en", // optional
  text: true, // optional: return plain text instead of timestamped chunks
  mode: "auto", // optional: 'native', 'auto', or 'generate'
});
```

### YouTube

Get YouTube video, channel, playlist metadata.

```js Node theme={null}
const transcript: Transcript = await supadata.youtube.transcript({
  url: 'https://youtu.be/dQw4w9WgXcQ',
});

// Translate YouTube transcript
const translated: Transcript = await supadata.youtube.translate({
  videoId: 'dQw4w9WgXcQ',
  lang: 'es',
});

// Get a YouTube Video metadata
const video: YoutubeVideo = await supadata.youtube.video({
  id: 'dQw4w9WgXcQ', // can be url or video id
});

// Get a YouTube channel metadata
const channel: YoutubeChannel = await supadata.youtube.channel({
  id: 'https://youtube.com/@RickAstleyVEVO', // can be url, channel id, handle
});

// Get a list of video IDs from a YouTube channel
const channelVideos: VideoIds = await supadata.youtube.channel.videos({
  id: 'https://youtube.com/@RickAstleyVEVO', // can be url, channel id, handle
  type: 'all', // 'video', 'short', 'live', 'all'
  limit: 10,
});

// Get the metadata of a YouTube playlist
const playlist: YoutubePlaylist = await supadata.youtube.playlist({
  id: 'PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI', // can be url or playlist id
});

// Get a list of video IDs from a YouTube playlist
const playlistVideos: VideoIds = await supadata.youtube.playlist.videos({
  id: 'https://www.youtube.com/playlist?list=PLlaN88a7y2_plecYoJxvRFTLHVbIVAOoc', // can be url or playlist id
  limit: 10,
});

// Start a YouTube transcript batch job
const transcriptBatch = await supadata.youtube.transcript.batch({
  videoIds: ['dQw4w9WgXcQ', 'xvFZjo5PgG0'],
  // playlistId: 'PLlaN88a7y2_plecYoJxvRFTLHVbIVAOoc' // alternatively
  // channelId: 'UC_9-kyTW8ZkZNDHQJ6FgpwQ' // alternatively
  lang: 'en',
});
console.log(`Started transcript batch job: ${transcriptBatch.jobId}`);

// Start a YouTube video metadata batch job
const videoBatch = await supadata.youtube.video.batch({
  videoIds: ['dQw4w9WgXcQ', 'xvFZjo5PgG0', 'L_jWHffIx5E'],
  // playlistId: 'PLlaN88a7y2_plecYoJxvRFTLHVbIVAOoc' // alternatively
  // channelId: 'UC_9-kyTW8ZkZNDHQJ6FgpwQ' // alternatively
});
console.log(`Started video batch job: ${videoBatch.jobId}`);

// Get results for a batch job (poll until status is 'completed' or 'failed')
const batchResults = await supadata.youtube.batch.getBatchResults(
  transcriptBatch.jobId
); // or videoBatch.jobId
if (batchResults.status === 'completed') {
  console.log('Batch job completed:', batchResults.results);
  console.log('Stats:', batchResults.stats);
} else {
  console.log('Batch job status:', batchResults.status);
}
```

### Web

Scrape and crawl web content.

```js Node theme={null}
const webContent: Scrape = await supadata.web.scrape('https://supadata.ai');

// Map website URLs
const siteMap: Map = await supadata.web.map('https://supadata.ai');

// Crawl website
const crawl: JobId = await supadata.web.crawl({
  url: 'https://supadata.ai',
  limit: 10,
});

// Get crawl job results
const crawlResults: CrawlJob = await supadata.web.getCrawlResults(crawl.jobId);
```

### Error Handling

The SDK throws `SupadataError` for API-related errors. You can catch and handle these errors as follows:

```js Node theme={null}
import { SupadataError } from '@supadata/js';

try {
  const transcript = await supadata.youtube.transcript({
    videoId: 'INVALID_ID',
  });
} catch (e) {
  if (e instanceof SupadataError) {
    console.error(e.error); // e.g., 'video-not-found'
    console.error(e.message); // Human readable error message
    console.error(e.details); // Detailed error description
    console.error(e.documentationUrl); // Link to error documentation (optional)
  }
}
```


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://docs.supadata.ai/llms.txt
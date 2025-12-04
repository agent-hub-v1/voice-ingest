# iOS Shortcut Setup for Voice Ingest

This guide explains how to build an iOS Shortcut that uploads Voice Memos to the Voice Ingest app.

## Prerequisites

- Your `INGEST_SECRET` from the app's environment variables
- A folder in the Files app where you export Voice Memos

## Shortcut Overview

The shortcut performs a two-step upload:
1. Request an upload token from the API
2. Upload the file directly to Vercel Blob storage

This bypasses the 4.5MB serverless function limit, allowing large audio files.

---

## Step-by-Step Instructions

### Step 1: Get File from Folder

- **Action:** "Get File from Folder"
- **Folder:** Select the folder where you export Voice Memos (e.g., `iCloud Drive/Voice Memos/`)
- This opens a file picker when the shortcut runs

### Step 2: Get the Filename

- **Action:** "Get Details of Files"
- **Input:** The file from Step 1
- **Get:** "Name"
- **Save to variable:** `filename`

### Step 3: Add File Extension

iOS sometimes strips the extension from the filename.

- **Action:** "Text"
- **Content:** `[filename variable].m4a`
- **Save to variable:** `filenameWithExt`

### Step 4: Request Upload Token

- **Action:** "Get Contents of URL"
- **URL:** `https://voice-ingest.vercel.app/api/upload/token`
- **Method:** POST
- **Headers:**
  | Header | Value |
  |--------|-------|
  | Authorization | `Bearer YOUR_INGEST_SECRET` |
  | Content-Type | `application/json` |
- **Request Body:** JSON
  | Key | Value |
  |-----|-------|
  | filename | `[filenameWithExt variable]` |
- **Save to variable:** `response`

### Step 5: Extract Token and URL

Extract the client token:
- **Action:** "Get Dictionary Value"
- **Input:** `response` variable
- **Key:** `clientToken`
- **Save to variable:** `token`

Extract the upload URL:
- **Action:** "Get Dictionary Value"
- **Input:** `response` variable
- **Key:** `uploadUrl`
- **Save to variable:** `url`

### Step 6: Upload File to Blob Storage

- **Action:** "Get Contents of URL"
- **URL:** `[url variable]`
- **Method:** PUT
- **Headers:**
  | Header | Value |
  |--------|-------|
  | Authorization | `Bearer [token variable]` |
  | x-api-version | `11` |
- **Request Body:** File
  - Select the file from Step 1 (the actual Voice Memo file)

### Step 7 (Optional): Show Confirmation

- **Action:** "Show Alert"
- **Title:** "Upload Complete"
- **Message:** "Voice memo uploaded successfully"

---

## Complete Shortcut Summary

```
1. Get File from Folder
         ↓
2. Get Details of Files (Name) → filename
         ↓
3. Text: [filename].m4a → filenameWithExt
         ↓
4. Get Contents of URL (POST /api/upload/token)
   - Auth: Bearer YOUR_SECRET
   - Body: {"filename": filenameWithExt}
   → response
         ↓
5. Get Dictionary Value (clientToken) → token
         ↓
6. Get Dictionary Value (uploadUrl) → url
         ↓
7. Get Contents of URL (PUT to url)
   - Auth: Bearer [token]
   - Header: x-api-version: 11
   - Body: File from step 1
         ↓
8. Show Alert "Upload Complete"
```

---

## Troubleshooting

### "Network connection was lost"
- Force quit the Shortcuts app and try again
- Toggle WiFi or Airplane Mode
- This is usually an iOS glitch, not your shortcut

### "Cannot get store id or token from authorization header"
- Make sure the Authorization header in Step 6 starts with `Bearer ` (with a space)
- The token variable should come right after the space

### "contentType is not allowed"
- The file type isn't in the allowed list
- Currently allowed: audio/*, video/mp4, video/quicktime, application/octet-stream

### "Unauthorized" error
- Check that your INGEST_SECRET matches what's in the Vercel environment variables
- Make sure there's no extra whitespace in the Authorization header

### Token expired
- Tokens are valid for 1 hour
- Always run the full shortcut from the beginning to get a fresh token

---

## Alternative: Simple Upload (Small Files Only)

For files under 4.5MB, you can use the simpler single-request method:

- **Action:** "Get Contents of URL"
- **URL:** `https://voice-ingest.vercel.app/api/ingest`
- **Method:** POST
- **Headers:**
  | Header | Value |
  |--------|-------|
  | Authorization | `Bearer YOUR_INGEST_SECRET` |
- **Request Body:** File (the Voice Memo)

This won't work for larger files due to Vercel's serverless function limits.

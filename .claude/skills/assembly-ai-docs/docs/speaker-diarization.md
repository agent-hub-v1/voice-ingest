---
title: Speaker Diarization
description: Add speaker labels to your transcript
---

import { LanguageTable } from "../../../assets/components/LanguagesTable";

<AccordionGroup>

<Accordion title="Supported languages">
  <LanguageTable
    languages={[
      { name: "Global English", code: "en" },
      { name: "Australian English", code: "en_au" },
      { name: "British English", code: "en_uk" },
      { name: "US English", code: "en_us" },
      { name: "Spanish", code: "es" },
      { name: "French", code: "fr" },
      { name: "German", code: "de" },
      { name: "Italian", code: "it" },
      { name: "Portuguese", code: "pt" },
      { name: "Dutch", code: "nl" },
      { name: "Hindi", code: "hi" },
      { name: "Japanese", code: "ja" },
      { name: "Chinese", code: "zh" },
      { name: "Finnish", code: "fi" },
      { name: "Korean", code: "ko" },
      { name: "Polish", code: "pl" },
      { name: "Russian", code: "ru" },
      { name: "Turkish", code: "tr" },
      { name: "Ukrainian", code: "uk" },
      { name: "Vietnamese", code: "vi" },
      { name: "Afrikaans", code: "af" },
      { name: "Albanian", code: "sq" },
      { name: "Amharic", code: "am" },
      { name: "Arabic", code: "ar" },
      { name: "Armenian", code: "hy" },
      { name: "Assamese", code: "as" },
      { name: "Azerbaijani", code: "az" },
      { name: "Bashkir", code: "ba" },
      { name: "Basque", code: "eu" },
      { name: "Belarusian", code: "be" },
      { name: "Bengali", code: "bn" },
      { name: "Bosnian", code: "bs" },
      { name: "Breton", code: "br" },
      { name: "Bulgarian", code: "bg" },
      { name: "Catalan", code: "ca" },
      { name: "Croatian", code: "hr" },
      { name: "Czech", code: "cs" },
      { name: "Danish", code: "da" },
      { name: "Estonian", code: "et" },
      { name: "Faroese", code: "fo" },
      { name: "Galician", code: "gl" },
      { name: "Georgian", code: "ka" },
      { name: "Greek", code: "el" },
      { name: "Gujarati", code: "gu" },
      { name: "Haitian", code: "ht" },
      { name: "Hausa", code: "ha" },
      { name: "Hawaiian", code: "haw" },
      { name: "Hebrew", code: "he" },
      { name: "Hungarian", code: "hu" },
      { name: "Icelandic", code: "is" },
      { name: "Indonesian", code: "id" },
      { name: "Javanese", code: "jw" },
      { name: "Kannada", code: "kn" },
      { name: "Kazakh", code: "kk" },
      { name: "Lao", code: "lo" },
      { name: "Latin", code: "la" },
      { name: "Latvian", code: "lv" },
      { name: "Lingala", code: "ln" },
      { name: "Lithuanian", code: "lt" },
      { name: "Luxembourgish", code: "lb" },
      { name: "Macedonian", code: "mk" },
      { name: "Malagasy", code: "mg" },
      { name: "Malay", code: "ms" },
      { name: "Malayalam", code: "ml" },
      { name: "Maltese", code: "mt" },
      { name: "Maori", code: "mi" },
      { name: "Marathi", code: "mr" },
      { name: "Mongolian", code: "mn" },
      { name: "Nepali", code: "ne" },
      { name: "Norwegian", code: "no" },
      { name: "Norwegian Nynorsk", code: "nn" },
      { name: "Occitan", code: "oc" },
      { name: "Panjabi", code: "pa" },
      { name: "Pashto", code: "ps" },
      { name: "Persian", code: "fa" },
      { name: "Romanian", code: "ro" },
      { name: "Sanskrit", code: "sa" },
      { name: "Serbian", code: "sr" },
      { name: "Shona", code: "sn" },
      { name: "Sindhi", code: "sd" },
      { name: "Sinhala", code: "si" },
      { name: "Slovak", code: "sk" },
      { name: "Slovenian", code: "sl" },
      { name: "Somali", code: "so" },
      { name: "Sundanese", code: "su" },
      { name: "Swahili", code: "sw" },
      { name: "Swedish", code: "sv" },
      { name: "Tagalog", code: "tl" },
      { name: "Tajik", code: "tg" },
      { name: "Tamil", code: "ta" },
      { name: "Tatar", code: "tt" },
      { name: "Telugu", code: "te" },
      { name: "Turkmen", code: "tk" },
      { name: "Urdu", code: "ur" },
      { name: "Uzbek", code: "uz" },
      { name: "Welsh", code: "cy" },
      { name: "Yiddish", code: "yi" },
      { name: "Yoruba", code: "yo" }
    ]}
    columns={2}
  />
  <br />
</Accordion>

<Accordion title="Supported models">
  <LanguageTable
    languages={[
      { name: "Slam-1", code: "slam-1" },
      { name: "Universal", code: "universal" },
    ]}
    columns={2}
  />
  <br />
</Accordion>

<Accordion title="Supported regions">
  US & EU <br />
</Accordion>

</AccordionGroup>

The Speaker Diarization model lets you detect multiple speakers in an audio file and what each speaker said.

If you enable Speaker Diarization, the resulting transcript will return a list of _utterances_, where each utterance corresponds to an uninterrupted segment of speech from a single speaker.

<Warning title="Speaker Diarization and Multichannel">

Speaker Diarization doesn't support multichannel transcription. Enabling both Speaker Diarization and [multichannel](/docs/speech-to-text/pre-recorded-audio/multichannel-transcription) will result in an error.

</Warning>

<Info>
Looking to identify speakers by name across multiple audio files? Check out our [Speaker Identification guide](/docs/speech-understanding/speaker-identification) to learn how to match speaker labels with actual speaker names.
</Info>

## Quickstart

<Tabs groupId="language">
<Tab language="python-sdk" title="Python SDK" default>

To enable Speaker Diarization, set `speaker_labels` to `True` in the transcription config.

```python {14,19-20} maxLines=15
import assemblyai as aai

aai.settings.api_key = "<YOUR_API_KEY>"

# You can use a local filepath:
# audio_file = "./example.mp3"

# Or use a publicly-accessible URL:
audio_file = (
    "https://assembly.ai/wildfires.mp3"
)

config = aai.TranscriptionConfig(
  speaker_labels=True,
)

transcript = aai.Transcriber().transcribe(audio_file, config)

for utterance in transcript.utterances:
  print(f"Speaker {utterance.speaker}: {utterance.text}")
```

</Tab>
<Tab language="python" title="Python">

To enable Speaker Diarization, set `speaker_labels` to `True` in the POST request body:

```python {19,41,42} maxLines=15
import requests
import time

base_url = "https://api.assemblyai.com"

headers = {
    "authorization": "<YOUR_API_KEY>"
}

with open("./my-audio.mp3", "rb") as f:
  response = requests.post(base_url + "/v2/upload",
                          headers=headers,
                          data=f)

upload_url = response.json()["upload_url"]

data = {
    "audio_url": upload_url, # You can also use a URL to an audio or video file on the web
    "speaker_labels": True
}

url = base_url + "/v2/transcript"
response = requests.post(url, json=data, headers=headers)

transcript_id = response.json()['id']
polling_endpoint = base_url + "/v2/transcript/" + transcript_id

while True:
  transcription_result = requests.get(polling_endpoint, headers=headers).json()

  if transcription_result['status'] == 'completed':
    print(f"Transcript ID:", transcript_id)
    break

  elif transcription_result['status'] == 'error':
    raise RuntimeError(f"Transcription failed: {transcription_result['error']}")

  else:
    time.sleep(3)

for utterance in transcription_result['utterances']:
  print(f"Speaker {utterance['speaker']}: {utterance['text']}")
```

</Tab>
<Tab language="javascript-sdk" title="JavaScript SDK">

To enable Speaker Diarization, set `speaker_labels` to `true` in the transcription config.

```javascript {15,21-23} maxLines=15
import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
  apiKey: "<YOUR_API_KEY>",
});

// You can use a local filepath:
// const audioFile = "./example.mp3"

// Or use a publicly-accessible URL:
const audioFile = "https://assembly.ai/wildfires.mp3";

const params = {
  audio: audioFile,
  speaker_labels: true,
};

const run = async () => {
  const transcript = await client.transcripts.transcribe(params);

  for (const utterance of transcript.utterances!) {
    console.log(`Speaker ${utterance.speaker}: ${utterance.text}`);
  }
};

run();
```

</Tab>
<Tab language="javascript" title="JavaScript">

To enable Speaker Diarization, set `speaker_labels` to `true` in the POST request body:

```javascript highlight={21, 35-37} maxLines=15
import axios from "axios";
import fs from "fs-extra";

const baseUrl = "https://api.assemblyai.com";

const headers = {
  authorization: "<YOUR_API_KEY>",
};

const path = "./audio/audio.mp3";
const audioData = await fs.readFile(path);

const uploadResponse = await axios.post(`${baseUrl}/v2/upload`, audioData, {
  headers,
});

const uploadUrl = uploadResponse.data.upload_url;

const data = {
  audio_url: uploadUrl, // You can also use a URL to an audio or video file on the web
  speaker_labels: true,
};

const url = `${baseUrl}/v2/transcript`;
const response = await axios.post(url, data, { headers });

const transcriptId = response.data.id;
const pollingEndpoint = `${baseUrl}/v2/transcript/${transcriptId}`;

while (true) {
  const pollingResponse = await axios.get(pollingEndpoint, { headers });
  const transcriptionResult = pollingResponse.data;

  if (transcriptionResult.status === "completed") {
    for (const utterance of transcriptionResult.utterances) {
      console.log(`Speaker ${utterance.speaker}: ${utterance.text}`);
    }
    break;
  } else if (transcriptionResult.status === "error") {
    throw new Error(`Transcription failed: ${transcriptionResult.error}`);
  } else {
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}
```

</Tab>
<Tab language="csharp" title="C#">

To enable Speaker Diarization, set `speaker_labels` to `true` in the POST request body:

```csharp highlight={73, 43-49} maxLines=15
using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

public class Transcript
{
    public string Id { get; set; }
    public string Status { get; set; }
    public string Text { get; set; }
    public string Error { get; set; }
    public Utterance[] Utterances { get; set; }
}

public class Utterance
{
    public string Speaker { get; set; }
    public string Text { get; set; }
}

class Program
{
    static void Main(string[] args)
    {
        MainAsync(args).GetAwaiter().GetResult();
    }

    static async Task MainAsync(string[] args)
    {
        using (var httpClient = new HttpClient())
        {
            httpClient.DefaultRequestHeaders.Add("authorization", "<YOUR-API-KEY>");

            var uploadUrl = await UploadFileAsync("audio.mp3", httpClient);
            var transcript = await CreateTranscriptAsync(uploadUrl, httpClient);
            transcript = await WaitForTranscriptToProcess(transcript, httpClient);

            if (transcript.Utterances != null)
            {
                foreach (var utterance in transcript.Utterances)
                {
                    Console.WriteLine($"Speaker {utterance.Speaker}: {utterance.Text}");
                }
            }
        }
    }

    static async Task<string> UploadFileAsync(string filePath, HttpClient httpClient)
    {
        using (var fileStream = File.OpenRead(filePath))
        using (var content = new StreamContent(fileStream))
        {
            content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");

            var response = await httpClient.PostAsync("https://api.assemblyai.com/v2/upload", content);
            response.EnsureSuccessStatusCode();

            var jsonDoc = await response.Content.ReadFromJsonAsync<JsonDocument>();
            return jsonDoc.RootElement.GetProperty("upload_url").GetString();
        }
    }

    static async Task<Transcript> CreateTranscriptAsync(string audioUrl, HttpClient httpClient)
    {
        var data = new
        {
          audio_url = audioUrl,
          speaker_labels = true
        };

        var content = new StringContent(JsonSerializer.Serialize(data), Encoding.UTF8, "application/json");

        using (var response = await httpClient.PostAsync("https://api.assemblyai.com/v2/transcript", content))
        {
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<Transcript>();
        }
    }

    static async Task<Transcript> WaitForTranscriptToProcess(Transcript transcript, HttpClient httpClient)
    {
        var pollingEndpoint = $"https://api.assemblyai.com/v2/transcript/{transcript.Id}";

        while (true)
        {
            var pollingResponse = await httpClient.GetAsync(pollingEndpoint);
            transcript = await pollingResponse.Content.ReadFromJsonAsync<Transcript>();

            switch (transcript.Status)
            {
                case "queued":
                case "processing":
                    await Task.Delay(TimeSpan.FromSeconds(3));
                    break;
                case "completed":
                    return transcript;
                case "error":
                    throw new Exception($"Transcription failed: {transcript.Error}");
                default:
                    throw new Exception("Unexpected transcript status.");
            }
        }
    }
}
```

</Tab>
<Tab language="ruby" title="Ruby">

To enable Speaker Diarization, set `speaker_labels` to `true` in the POST request body:

```ruby highlight={23, 54-55} maxLines=15
require 'net/http'
require 'json'

base_url = 'https://api.assemblyai.com'

headers = {
  'authorization' => '<YOUR_API_KEY>',
  'content-type' => 'application/json'
}

path = "./my-audio.mp3"
uri = URI("#{base_url}/v2/upload")
request = Net::HTTP::Post.new(uri, headers)
request.body = File.read(path)

http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true
upload_response = http.request(request)
upload_url = JSON.parse(upload_response.body)["upload_url"]

data = {
  "audio_url" => upload_url, # You can also use a URL to an audio or video file on the web
  "speaker_labels" => true
}

uri = URI.parse("#{base_url}/v2/transcript")
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Post.new(uri.request_uri, headers)
request.body = data.to_json

response = http.request(request)
response_body = JSON.parse(response.body)

unless response.is_a?(Net::HTTPSuccess)
  raise "API request failed with status #{response.code}: #{response.body}"
end

transcript_id = response_body['id']
puts "Transcript ID: #{transcript_id}"

polling_endpoint = URI.parse("#{base_url}/v2/transcript/#{transcript_id}")

while true
  polling_http = Net::HTTP.new(polling_endpoint.host, polling_endpoint.port)
  polling_http.use_ssl = true
  polling_request = Net::HTTP::Get.new(polling_endpoint.request_uri, headers)
  polling_response = polling_http.request(polling_request)

  transcription_result = JSON.parse(polling_response.body)

  if transcription_result['status'] == 'completed'
    transcription_result['utterances'].each do |utterance|
      puts "Speaker #{utterance['speaker']}: #{utterance['text']}"
    end
    break
  elsif transcription_result['status'] == 'error'
    raise "Transcription failed: #{transcription_result['error']}"
  else
    puts 'Waiting for transcription to complete...'
    sleep(3)
  end
end

```

</Tab>

<Tab language="php" title="PHP">

To enable Speaker Diarization, set `speaker_labels` to `true` in the POST request body:

```php highlight={30, 61-63} maxLines=15
<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$base_url = "https://api.assemblyai.com";

$headers = array(
    "authorization: <YOUR_API_KEY>",
    "content-type: application/json"
);

$path = "./my-audio.mp3";

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $base_url . "/v2/upload");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, file_get_contents($path));
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

$response = curl_exec($ch);
$response_data = json_decode($response, true);
$upload_url = $response_data["upload_url"];

curl_close($ch);

$data = array(
    "audio_url" => $upload_url, // You can also use a URL to an audio or video file on the web
    "speaker_labels" => true
);

$url = $base_url . "/v2/transcript";
$curl = curl_init($url);

curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($curl);

$response = json_decode($response, true);

curl_close($curl);

$transcript_id = $response['id'];
echo "Transcript ID: $transcript_id\n";

$polling_endpoint = $base_url . "/v2/transcript/" . $transcript_id;

while (true) {
    $polling_response = curl_init($polling_endpoint);

    curl_setopt($polling_response, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($polling_response, CURLOPT_RETURNTRANSFER, true);

    $transcription_result = json_decode(curl_exec($polling_response), true);

    if ($transcription_result['status'] === "completed") {
        foreach ($transcription_result['utterances'] as $utterance) {
            echo "Speaker {$utterance['speaker']}: {$utterance['text']}\n";
        }
        break;
    } else if ($transcription_result['status'] === "error") {
        throw new Exception("Transcription failed: " . $transcription_result['error']);
    } else {
        sleep(3);
    }
}
```

</Tab>
</Tabs>

## Set number of speakers expected

You can set the number of speakers expected in the audio file by setting the `speakers_expected` parameter.

<Warning>Only use this parameter if you are certain about the number of speakers in the audio file.</Warning>

<Tabs groupId="language">
<Tab language="python-sdk" title="Python SDK" default>

```python {15} maxLines=15
import assemblyai as aai

aai.settings.api_key = "<YOUR_API_KEY>"

# You can use a local filepath:
# audio_file = "./example.mp3"

# Or use a publicly-accessible URL:
audio_file = (
    "https://assembly.ai/wildfires.mp3"
)

config = aai.TranscriptionConfig(
  speaker_labels=True,
  speakers_expected=5,
)

transcript = aai.Transcriber().transcribe(audio_file, config)

for utterance in transcript.utterances:
  print(f"Speaker {utterance.speaker}: {utterance.text}")
```

</Tab>
<Tab language="python" title="Python">

```python {20} maxLines=15
import requests
import time

base_url = "https://api.assemblyai.com"

headers = {
    "authorization": "<YOUR_API_KEY>"
}

with open("./my-audio.mp3", "rb") as f:
  response = requests.post(base_url + "/v2/upload",
                          headers=headers,
                          data=f)

upload_url = response.json()["upload_url"]

data = {
    "audio_url": upload_url, # You can also use a URL to an audio or video file on the web
    "speaker_labels": True,
    "speakers_expected": 5
}

url = base_url + "/v2/transcript"
response = requests.post(url, json=data, headers=headers)

transcript_id = response.json()['id']
polling_endpoint = base_url + "/v2/transcript/" + transcript_id

while True:
  transcription_result = requests.get(polling_endpoint, headers=headers).json()

  if transcription_result['status'] == 'completed':
    print(f"Transcript ID:", transcript_id)
    break

  elif transcription_result['status'] == 'error':
    raise RuntimeError(f"Transcription failed: {transcription_result['error']}")

  else:
    time.sleep(3)

for utterance in transcription_result['utterances']:
  print(f"Speaker {utterance['speaker']}: {utterance['text']}")
```

</Tab>
<Tab language="javascript-sdk" title="JavaScript SDK">

```javascript {16} maxLines=15
import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
  apiKey: "<YOUR_API_KEY>",
});

// You can use a local filepath:
// const audioFile = "./example.mp3"

// Or use a publicly-accessible URL:
const audioFile = "https://assembly.ai/wildfires.mp3";

const params = {
  audio: audioFile,
  speaker_labels: true,
  speakers_expected: 5
};

const run = async () => {
  const transcript = await client.transcripts.transcribe(params);

  for (const utterance of transcript.utterances!) {
    console.log(`Speaker ${utterance.speaker}: ${utterance.text}`);
  }
};

run();
```

</Tab>
<Tab language="javascript" title="JavaScript">

```javascript highlight={22} maxLines=15
import axios from "axios";
import fs from "fs-extra";

const baseUrl = "https://api.assemblyai.com";

const headers = {
  authorization: "<YOUR_API_KEY>",
};

const path = "./audio/audio.mp3";
const audioData = await fs.readFile(path);

const uploadResponse = await axios.post(`${baseUrl}/v2/upload`, audioData, {
  headers,
});

const uploadUrl = uploadResponse.data.upload_url;

const data = {
  audio_url: uploadUrl, // You can also use a URL to an audio or video file on the web
  speaker_labels: true,
  speakers_expected: 5
};

const url = `${baseUrl}/v2/transcript`;
const response = await axios.post(url, data, { headers });

const transcriptId = response.data.id;
const pollingEndpoint = `${baseUrl}/v2/transcript/${transcriptId}`;

while (true) {
  const pollingResponse = await axios.get(pollingEndpoint, { headers });
  const transcriptionResult = pollingResponse.data;

  if (transcriptionResult.status === "completed") {
    for (const utterance of transcriptionResult.utterances) {
      console.log(`Speaker ${utterance.speaker}: ${utterance.text}`);
    }
    break;
  } else if (transcriptionResult.status === "error") {
    throw new Error(`Transcription failed: ${transcriptionResult.error}`);
  } else {
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}
```

</Tab>
<Tab language="csharp" title="C#">

```csharp highlight={74} maxLines=15
using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

public class Transcript
{
    public string Id { get; set; }
    public string Status { get; set; }
    public string Text { get; set; }
    public string Error { get; set; }
    public Utterance[] Utterances { get; set; }
}

public class Utterance
{
    public string Speaker { get; set; }
    public string Text { get; set; }
}

class Program
{
    static void Main(string[] args)
    {
        MainAsync(args).GetAwaiter().GetResult();
    }

    static async Task MainAsync(string[] args)
    {
        using (var httpClient = new HttpClient())
        {
            httpClient.DefaultRequestHeaders.Add("authorization", "<YOUR-API-KEY>");

            var uploadUrl = await UploadFileAsync("audio.mp3", httpClient);
            var transcript = await CreateTranscriptAsync(uploadUrl, httpClient);
            transcript = await WaitForTranscriptToProcess(transcript, httpClient);

            if (transcript.Utterances != null)
            {
                foreach (var utterance in transcript.Utterances)
                {
                    Console.WriteLine($"Speaker {utterance.Speaker}: {utterance.Text}");
                }
            }
        }
    }

    static async Task<string> UploadFileAsync(string filePath, HttpClient httpClient)
    {
        using (var fileStream = File.OpenRead(filePath))
        using (var content = new StreamContent(fileStream))
        {
            content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");

            var response = await httpClient.PostAsync("https://api.assemblyai.com/v2/upload", content);
            response.EnsureSuccessStatusCode();

            var jsonDoc = await response.Content.ReadFromJsonAsync<JsonDocument>();
            return jsonDoc.RootElement.GetProperty("upload_url").GetString();
        }
    }

    static async Task<Transcript> CreateTranscriptAsync(string audioUrl, HttpClient httpClient)
    {
        var data = new
        {
          audio_url = audioUrl,
          speaker_labels = true,
          speakers_expected = 5
        };

        var content = new StringContent(JsonSerializer.Serialize(data), Encoding.UTF8, "application/json");

        using (var response = await httpClient.PostAsync("https://api.assemblyai.com/v2/transcript", content))
        {
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<Transcript>();
        }
    }

    static async Task<Transcript> WaitForTranscriptToProcess(Transcript transcript, HttpClient httpClient)
    {
        var pollingEndpoint = $"https://api.assemblyai.com/v2/transcript/{transcript.Id}";

        while (true)
        {
            var pollingResponse = await httpClient.GetAsync(pollingEndpoint);
            transcript = await pollingResponse.Content.ReadFromJsonAsync<Transcript>();

            switch (transcript.Status)
            {
                case "queued":
                case "processing":
                    await Task.Delay(TimeSpan.FromSeconds(3));
                    break;
                case "completed":
                    return transcript;
                case "error":
                    throw new Exception($"Transcription failed: {transcript.Error}");
                default:
                    throw new Exception("Unexpected transcript status.");
            }
        }
    }
}
```

</Tab>
<Tab language="ruby" title="Ruby">

```ruby highlight={24} maxLines=15
require 'net/http'
require 'json'

base_url = 'https://api.assemblyai.com'

headers = {
  'authorization' => '<YOUR_API_KEY>',
  'content-type' => 'application/json'
}

path = "./my-audio.mp3"
uri = URI("#{base_url}/v2/upload")
request = Net::HTTP::Post.new(uri, headers)
request.body = File.read(path)

http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true
upload_response = http.request(request)
upload_url = JSON.parse(upload_response.body)["upload_url"]

data = {
  "audio_url" => upload_url, # You can also use a URL to an audio or video file on the web
  "speaker_labels" => true,
  "speakers_expected" => 5
}

uri = URI.parse("#{base_url}/v2/transcript")
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Post.new(uri.request_uri, headers)
request.body = data.to_json

response = http.request(request)
response_body = JSON.parse(response.body)

unless response.is_a?(Net::HTTPSuccess)
  raise "API request failed with status #{response.code}: #{response.body}"
end

transcript_id = response_body['id']
puts "Transcript ID: #{transcript_id}"

polling_endpoint = URI.parse("#{base_url}/v2/transcript/#{transcript_id}")

while true
  polling_http = Net::HTTP.new(polling_endpoint.host, polling_endpoint.port)
  polling_http.use_ssl = true
  polling_request = Net::HTTP::Get.new(polling_endpoint.request_uri, headers)
  polling_response = polling_http.request(polling_request)

  transcription_result = JSON.parse(polling_response.body)

  if transcription_result['status'] == 'completed'
    transcription_result['utterances'].each do |utterance|
      puts "Speaker #{utterance['speaker']}: #{utterance['text']}"
    end
    break
  elsif transcription_result['status'] == 'error'
    raise "Transcription failed: #{transcription_result['error']}"
  else
    puts 'Waiting for transcription to complete...'
    sleep(3)
  end
end

```

</Tab>
<Tab language="php" title="PHP">

```php highlight={31} maxLines=15
<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$base_url = "https://api.assemblyai.com";

$headers = array(
    "authorization: <YOUR_API_KEY>",
    "content-type: application/json"
);

$path = "./my-audio.mp3";

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $base_url . "/v2/upload");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, file_get_contents($path));
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

$response = curl_exec($ch);
$response_data = json_decode($response, true);
$upload_url = $response_data["upload_url"];

curl_close($ch);

$data = array(
    "audio_url" => $upload_url, // You can also use a URL to an audio or video file on the web
    "speaker_labels" => true,
    "speakers_expected" => 5
);

$url = $base_url . "/v2/transcript";
$curl = curl_init($url);

curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($curl);

$response = json_decode($response, true);

curl_close($curl);

$transcript_id = $response['id'];
echo "Transcript ID: $transcript_id\n";

$polling_endpoint = $base_url . "/v2/transcript/" . $transcript_id;

while (true) {
    $polling_response = curl_init($polling_endpoint);

    curl_setopt($polling_response, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($polling_response, CURLOPT_RETURNTRANSFER, true);

    $transcription_result = json_decode(curl_exec($polling_response), true);

    if ($transcription_result['status'] === "completed") {
        foreach ($transcription_result['utterances'] as $utterance) {
            echo "Speaker {$utterance['speaker']}: {$utterance['text']}\n";
        }
        break;
    } else if ($transcription_result['status'] === "error") {
        throw new Exception("Transcription failed: " . $transcription_result['error']);
    } else {
        sleep(3);
    }
}
```

</Tab>
</Tabs>

## Set a range of possible speakers

You can set a range of possible speakers in the audio file by setting the `speaker_options` parameter. By default, the model will return between 1 and 10 speakers.

This parameter is suitable for use cases where there is a known minimum/maximum number of speakers in the audio file that is outside the bounds of the default value of 1 to 10 speakers.

<Warning>
  Setting `max_speakers_expected` too high may reduce diarization accuracy, causing sentences from the same speaker to be split across multiple speaker labels.
</Warning>

<Tabs groupId="language">
<Tab language="python-sdk" title="Python SDK" default>

```python {15-18} maxLines=15
import assemblyai as aai

aai.settings.api_key = "<YOUR_API_KEY>"

# You can use a local filepath:
# audio_file = "./example.mp3"

# Or use a publicly-accessible URL:
audio_file = (
    "https://assembly.ai/wildfires.mp3"
)

config = aai.TranscriptionConfig(
  speaker_labels=True,
  speaker_options=aai.SpeakerOptions(
    min_speakers_expected=3,
    max_speakers_expected=5
  ),
)

transcript = aai.Transcriber().transcribe(audio_file, config)

for utterance in transcript.utterances:
  print(f"Speaker {utterance.speaker}: {utterance.text}")
```

</Tab>
<Tab language="python" title="Python">

```python {20-23} maxLines=15
import requests
import time

base_url = "https://api.assemblyai.com"

headers = {
    "authorization": "<YOUR_API_KEY>"
}

with open("./my-audio.mp3", "rb") as f:
  response = requests.post(base_url + "/v2/upload",
                          headers=headers,
                          data=f)

upload_url = response.json()["upload_url"]

data = {
    "audio_url": upload_url, # You can also use a URL to an audio or video file on the web
    "speaker_labels": True,
    "speaker_options": {
      "min_speakers_expected": 3,
      "max_speakers_expected": 5
    }
}

url = base_url + "/v2/transcript"
response = requests.post(url, json=data, headers=headers)

transcript_id = response.json()['id']
polling_endpoint = base_url + "/v2/transcript/" + transcript_id

while True:
  transcription_result = requests.get(polling_endpoint, headers=headers).json()

  if transcription_result['status'] == 'completed':
    print(f"Transcript ID:", transcript_id)
    break

  elif transcription_result['status'] == 'error':
    raise RuntimeError(f"Transcription failed: {transcription_result['error']}")

  else:
    time.sleep(3)

for utterance in transcription_result['utterances']:
  print(f"Speaker {utterance['speaker']}: {utterance['text']}")
```

</Tab>
<Tab language="javascript-sdk" title="JavaScript SDK">

```javascript {16-19} maxLines=15
import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
  apiKey: "<YOUR_API_KEY>",
});

// You can use a local filepath:
// const audioFile = "./example.mp3"

// Or use a publicly-accessible URL:
const audioFile = "https://assembly.ai/wildfires.mp3";

const params = {
  audio: audioFile,
  speaker_labels: true,
  speaker_options: {
    min_speakers_expected: 3,
    max_speakers_expected: 5
  }
};

const run = async () => {
  const transcript = await client.transcripts.transcribe(params);

  for (const utterance of transcript.utterances!) {
    console.log(`Speaker ${utterance.speaker}: ${utterance.text}`);
  }
};

run();
```

</Tab>
<Tab language="javascript" title="JavaScript">

```javascript highlight={22-25} maxLines=15
import axios from "axios";
import fs from "fs-extra";

const baseUrl = "https://api.assemblyai.com";

const headers = {
  authorization: "<YOUR_API_KEY>",
};

const path = "./audio/audio.mp3";
const audioData = await fs.readFile(path);

const uploadResponse = await axios.post(`${baseUrl}/v2/upload`, audioData, {
  headers,
});

const uploadUrl = uploadResponse.data.upload_url;

const data = {
  audio_url: uploadUrl, // You can also use a URL to an audio or video file on the web
  speaker_labels: true,
  speaker_options: {
    min_speakers_expected: 3,
    max_speakers_expected: 5
  }
};

const url = `${baseUrl}/v2/transcript`;
const response = await axios.post(url, data, { headers });

const transcriptId = response.data.id;
const pollingEndpoint = `${baseUrl}/v2/transcript/${transcriptId}`;

while (true) {
  const pollingResponse = await axios.get(pollingEndpoint, { headers });
  const transcriptionResult = pollingResponse.data;

  if (transcriptionResult.status === "completed") {
    for (const utterance of transcriptionResult.utterances) {
      console.log(`Speaker ${utterance.speaker}: ${utterance.text}`);
    }
    break;
  } else if (transcriptionResult.status === "error") {
    throw new Error(`Transcription failed: ${transcriptionResult.error}`);
  } else {
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}
```

</Tab>
<Tab language="csharp" title="C#">

```csharp highlight={74-78} maxLines=15
using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

public class Transcript
{
    public string Id { get; set; }
    public string Status { get; set; }
    public string Text { get; set; }
    public string Error { get; set; }
    public Utterance[] Utterances { get; set; }
}

public class Utterance
{
    public string Speaker { get; set; }
    public string Text { get; set; }
}

class Program
{
    static void Main(string[] args)
    {
        MainAsync(args).GetAwaiter().GetResult();
    }

    static async Task MainAsync(string[] args)
    {
        using (var httpClient = new HttpClient())
        {
            httpClient.DefaultRequestHeaders.Add("authorization", "<YOUR-API-KEY>");

            var uploadUrl = await UploadFileAsync("audio.mp3", httpClient);
            var transcript = await CreateTranscriptAsync(uploadUrl, httpClient);
            transcript = await WaitForTranscriptToProcess(transcript, httpClient);

            if (transcript.Utterances != null)
            {
                foreach (var utterance in transcript.Utterances)
                {
                    Console.WriteLine($"Speaker {utterance.Speaker}: {utterance.Text}");
                }
            }
        }
    }

    static async Task<string> UploadFileAsync(string filePath, HttpClient httpClient)
    {
        using (var fileStream = File.OpenRead(filePath))
        using (var content = new StreamContent(fileStream))
        {
            content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");

            var response = await httpClient.PostAsync("https://api.assemblyai.com/v2/upload", content);
            response.EnsureSuccessStatusCode();

            var jsonDoc = await response.Content.ReadFromJsonAsync<JsonDocument>();
            return jsonDoc.RootElement.GetProperty("upload_url").GetString();
        }
    }

    static async Task<Transcript> CreateTranscriptAsync(string audioUrl, HttpClient httpClient)
    {
        var data = new
        {
          audio_url = audioUrl,
          speaker_labels = true,
          speaker_options = new
            {
              min_speakers_expected = 3,
              max_speakers_expected = 5 
            }
        };

        var content = new StringContent(JsonSerializer.Serialize(data), Encoding.UTF8, "application/json");

        using (var response = await httpClient.PostAsync("https://api.assemblyai.com/v2/transcript", content))
        {
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<Transcript>();
        }
    }

    static async Task<Transcript> WaitForTranscriptToProcess(Transcript transcript, HttpClient httpClient)
    {
        var pollingEndpoint = $"https://api.assemblyai.com/v2/transcript/{transcript.Id}";

        while (true)
        {
            var pollingResponse = await httpClient.GetAsync(pollingEndpoint);
            transcript = await pollingResponse.Content.ReadFromJsonAsync<Transcript>();

            switch (transcript.Status)
            {
                case "queued":
                case "processing":
                    await Task.Delay(TimeSpan.FromSeconds(3));
                    break;
                case "completed":
                    return transcript;
                case "error":
                    throw new Exception($"Transcription failed: {transcript.Error}");
                default:
                    throw new Exception("Unexpected transcript status.");
            }
        }
    }
}
```

</Tab>
<Tab language="ruby" title="Ruby">

```ruby highlight={24-27} maxLines=15
require 'net/http'
require 'json'

base_url = 'https://api.assemblyai.com'

headers = {
  'authorization' => '<YOUR_API_KEY>',
  'content-type' => 'application/json'
}

path = "./my-audio.mp3"
uri = URI("#{base_url}/v2/upload")
request = Net::HTTP::Post.new(uri, headers)
request.body = File.read(path)

http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true
upload_response = http.request(request)
upload_url = JSON.parse(upload_response.body)["upload_url"]

data = {
  "audio_url" => upload_url, # You can also use a URL to an audio or video file on the web
  "speaker_labels" => true,
  "speaker_options" => {
    "min_speakers_expected" => 3,
    "max_speakers_expected" => 5
  }
}

uri = URI.parse("#{base_url}/v2/transcript")
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Post.new(uri.request_uri, headers)
request.body = data.to_json

response = http.request(request)
response_body = JSON.parse(response.body)

unless response.is_a?(Net::HTTPSuccess)
  raise "API request failed with status #{response.code}: #{response.body}"
end

transcript_id = response_body['id']
puts "Transcript ID: #{transcript_id}"

polling_endpoint = URI.parse("#{base_url}/v2/transcript/#{transcript_id}")

while true
  polling_http = Net::HTTP.new(polling_endpoint.host, polling_endpoint.port)
  polling_http.use_ssl = true
  polling_request = Net::HTTP::Get.new(polling_endpoint.request_uri, headers)
  polling_response = polling_http.request(polling_request)

  transcription_result = JSON.parse(polling_response.body)

  if transcription_result['status'] == 'completed'
    transcription_result['utterances'].each do |utterance|
      puts "Speaker #{utterance['speaker']}: #{utterance['text']}"
    end
    break
  elsif transcription_result['status'] == 'error'
    raise "Transcription failed: #{transcription_result['error']}"
  else
    puts 'Waiting for transcription to complete...'
    sleep(3)
  end
end

```

</Tab>
<Tab language="php" title="PHP">

```php highlight={31-34} maxLines=15
<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$base_url = "https://api.assemblyai.com";

$headers = array(
    "authorization: <YOUR_API_KEY>",
    "content-type: application/json"
);

$path = "./my-audio.mp3";

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $base_url . "/v2/upload");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, file_get_contents($path));
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

$response = curl_exec($ch);
$response_data = json_decode($response, true);
$upload_url = $response_data["upload_url"];

curl_close($ch);

$data = array(
    "audio_url" => $upload_url, // You can also use a URL to an audio or video file on the web
    "speaker_labels" => true,
    "speaker_options" => [
      "min_speakers_expected" => 3,
      "max_speakers_expected" => 5
    ]
);

$url = $base_url . "/v2/transcript";
$curl = curl_init($url);

curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($curl);

$response = json_decode($response, true);

curl_close($curl);

$transcript_id = $response['id'];
echo "Transcript ID: $transcript_id\n";

$polling_endpoint = $base_url . "/v2/transcript/" . $transcript_id;

while (true) {
    $polling_response = curl_init($polling_endpoint);

    curl_setopt($polling_response, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($polling_response, CURLOPT_RETURNTRANSFER, true);

    $transcription_result = json_decode(curl_exec($polling_response), true);

    if ($transcription_result['status'] === "completed") {
        foreach ($transcription_result['utterances'] as $utterance) {
            echo "Speaker {$utterance['speaker']}: {$utterance['text']}\n";
        }
        break;
    } else if ($transcription_result['status'] === "error") {
        throw new Exception("Transcription failed: " . $transcription_result['error']);
    } else {
        sleep(3);
    }
}
```

</Tab>
</Tabs>

## API reference

### Request

**Speakers Expected**

```bash {7} maxLines=15
curl https://api.assemblyai.com/v2/transcript \
--header "Authorization: <YOUR_API_KEY>" \
--header "Content-Type: application/json" \
--data '{
  "audio_url": "YOUR_AUDIO_URL",
  "speaker_labels": true,
  "speakers_expected": 3
}'
```
**Speaker Options**

```bash {7-10} maxlines=15
curl https://api.assemblyai.com/v2/transcript \
--header "Authorization: <YOUR_API_KEY>" \
--header "Content-Type: application/json" \
--data '{
  "audio_url": "YOUR_AUDIO_URL",
  "speaker_labels": true,
  "speaker_options": {
    "min_speakers_expected": 3,
    "max_speakers_expected": 5
  }
}'
```

| Key                                     | Type    | Description                                                |
| --------------------------------------- | ------- | ---------------------------------------------------------- |
| `speaker_labels`                        | boolean | Enable Speaker Diarization.                                |
| `speakers_expected`                     | number  | Set number of speakers.                                    |
| `speaker_options`                       | object  | Set range of possible speakers.                            |
| `speaker_options.min_speakers_expected` | number  | The minimum number of speakers expected in the audio file. |
| `speaker_options.max_speakers_expected` | number  | The maximum number of speakers expected in the audio file. |

### Response

<Json
  json={{
    utterances: [
      {
        confidence: 0.9359033333333334,
        end: 26950,
        speaker: "A",
        start: 250,
        text: "Smoke from hundreds of wildfires in Canada is triggering air quality alerts throughout the US. Skylines from Maine to Maryland to Minnesota are gray and smoggy. And in some places, the air quality warnings include the warning to stay inside. We wanted to better understand what's happening here and why, so we called Peter de Carlo, an associate professor in the Department of Environmental Health and Engineering at Johns Hopkins University Varsity. Good morning, professor.",
        words: [
          {
            text: "Smoke",
            start: 250,
            end: 650,
            confidence: 0.97503,
            speaker: "A",
          },
          {
            text: "from",
            start: 730,
            end: 1022,
            confidence: 0.99999,
            speaker: "A",
          },
          {
            text: "hundreds",
            start: 1076,
            end: 1418,
            confidence: 0.99843,
            speaker: "A",
          },
          {
            text: "of",
            start: 1434,
            end: 1614,
            confidence: 0.85,
            speaker: "A",
          },
          {
            text: "wildfires",
            start: 1652,
            end: 2346,
            confidence: 0.89657,
            speaker: "A",
          },
          {
            text: "in",
            start: 2378,
            end: 2526,
            confidence: 0.99994,
            speaker: "A",
          },
          {
            text: "Canada",
            start: 2548,
            end: 3130,
            confidence: 0.93864,
            speaker: "A",
          },
          {
            text: "is",
            start: 3210,
            end: 3454,
            confidence: 0.999,
            speaker: "A",
          },
          {
            text: "triggering",
            start: 3492,
            end: 3946,
            confidence: 0.75366,
            speaker: "A",
          },
          {
            text: "air",
            start: 3978,
            end: 4174,
            confidence: 1.0,
            speaker: "A",
          },
          {
            text: "quality",
            start: 4212,
            end: 4558,
            confidence: 0.87745,
            speaker: "A",
          },
          {
            text: "alerts",
            start: 4644,
            end: 5114,
            confidence: 0.94739,
            speaker: "A",
          },
          {
            text: "throughout",
            start: 5162,
            end: 5466,
            confidence: 0.99726,
            speaker: "A",
          },
          {
            text: "the",
            start: 5498,
            end: 5694,
            confidence: 0.79,
            speaker: "A",
          },
          {
            text: "US.",
            start: 5732,
            end: 6382,
            confidence: 0.88,
            speaker: "A",
          },
          {
            text: "Skylines",
            start: 6516,
            end: 7226,
            confidence: 0.94906,
            speaker: "A",
          },
          {
            text: "from",
            start: 7258,
            end: 7454,
            confidence: 0.99997,
            speaker: "A",
          },
          {
            text: "Maine",
            start: 7492,
            end: 7914,
            confidence: 0.46929,
            speaker: "A",
          },
          {
            text: "to",
            start: 7962,
            end: 8174,
            confidence: 1.0,
            speaker: "A",
          },
          {
            text: "Maryland",
            start: 8212,
            end: 8634,
            confidence: 0.99855,
            speaker: "A",
          },
          {
            text: "to",
            start: 8682,
            end: 8894,
            confidence: 1.0,
            speaker: "A",
          },
          {
            text: "Minnesota",
            start: 8932,
            end: 9578,
            confidence: 0.93339,
            speaker: "A",
          },
          {
            text: "are",
            start: 9674,
            end: 9934,
            confidence: 0.99978,
            speaker: "A",
          },
          {
            text: "gray",
            start: 9972,
            end: 10186,
            confidence: 0.68,
            speaker: "A",
          },
          {
            text: "and",
            start: 10218,
            end: 10414,
            confidence: 1.0,
            speaker: "A",
          },
          {
            text: "smoggy.",
            start: 10452,
            end: 11050,
            confidence: 0.99223,
            speaker: "A",
          },
          {
            text: "And",
            start: 11130,
            end: 11326,
            confidence: 1.0,
            speaker: "A",
          },
          {
            text: "in",
            start: 11348,
            end: 11534,
            confidence: 0.9947,
            speaker: "A",
          },
          {
            text: "some",
            start: 11572,
            end: 11774,
            confidence: 1.0,
            speaker: "A",
          },
          {
            text: "places,",
            start: 11812,
            end: 12106,
            confidence: 0.99991,
            speaker: "A",
          },
          {
            text: "the",
            start: 12138,
            end: 12286,
            confidence: 0.9,
            speaker: "A",
          },
          {
            text: "air",
            start: 12308,
            end: 12494,
            confidence: 0.99995,
            speaker: "A",
          },
          {
            text: "quality",
            start: 12532,
            end: 12830,
            confidence: 0.9966,
            speaker: "A",
          },
          {
            text: "warnings",
            start: 12900,
            end: 13434,
            confidence: 0.99939,
            speaker: "A",
          },
          {
            text: "include",
            start: 13482,
            end: 13866,
            confidence: 0.99998,
            speaker: "A",
          },
          {
            text: "the",
            start: 13898,
            end: 13998,
            confidence: 1.0,
            speaker: "A",
          },
          {
            text: "warning",
            start: 14004,
            end: 14234,
            confidence: 0.94734,
            speaker: "A",
          },
          {
            text: "to",
            start: 14282,
            end: 14542,
            confidence: 0.95,
            speaker: "A",
          },
          {
            text: "stay",
            start: 14596,
            end: 14910,
            confidence: 0.99999,
            speaker: "A",
          },
          {
            text: "inside.",
            start: 14980,
            end: 15646,
            confidence: 0.99997,
            speaker: "A",
          },
          {
            text: "We",
            start: 15828,
            end: 16126,
            confidence: 0.99997,
            speaker: "A",
          },
          {
            text: "wanted",
            start: 16148,
            end: 16334,
            confidence: 0.99817,
            speaker: "A",
          },
          {
            text: "to",
            start: 16372,
            end: 16526,
            confidence: 1.0,
            speaker: "A",
          },
          {
            text: "better",
            start: 16548,
            end: 16734,
            confidence: 0.99999,
            speaker: "A",
          },
          {
            text: "understand",
            start: 16772,
            end: 17070,
            confidence: 1.0,
            speaker: "A",
          },
          {
            text: "what's",
            start: 17140,
            end: 17466,
            confidence: 0.99955,
            speaker: "A",
          },
          {
            text: "happening",
            start: 17498,
            end: 17742,
            confidence: 0.99999,
            speaker: "A",
          },
          {
            text: "here",
            start: 17796,
            end: 17966,
            confidence: 1.0,
            speaker: "A",
          },
          {
            text: "and",
            start: 17988,
            end: 18174,
            confidence: 0.54,
            speaker: "A",
          },
          {
            text: "why,",
            start: 18212,
            end: 18414,
            confidence: 0.99999,
            speaker: "A",
          },
          {
            text: "so",
            start: 18452,
            end: 18606,
            confidence: 0.99974,
            speaker: "A",
          },
          {
            text: "we",
            start: 18628,
            end: 18766,
            confidence: 0.98861,
            speaker: "A",
          },
          {
            text: "called",
            start: 18788,
            end: 18926,
            confidence: 0.99987,
            speaker: "A",
          },
          {
            text: "Peter",
            start: 18948,
            end: 19274,
            confidence: 0.99971,
            speaker: "A",
          },
          {
            text: "de",
            start: 19322,
            end: 19486,
            confidence: 0.59364,
            speaker: "A",
          },
          {
            text: "Carlo,",
            start: 19508,
            end: 19930,
            confidence: 0.73053,
            speaker: "A",
          },
          {
            text: "an",
            start: 20010,
            end: 20254,
            confidence: 0.97545,
            speaker: "A",
          },
          {
            text: "associate",
            start: 20292,
            end: 20746,
            confidence: 0.98965,
            speaker: "A",
          },
          {
            text: "professor",
            start: 20778,
            end: 21194,
            confidence: 0.99117,
            speaker: "A",
          },
          {
            text: "in",
            start: 21242,
            end: 21358,
            confidence: 0.99997,
            speaker: "A",
          },
          {
            text: "the",
            start: 21364,
            end: 21486,
            confidence: 1.0,
            speaker: "A",
          },
          {
            text: "Department",
            start: 21508,
            end: 21834,
            confidence: 0.99998,
            speaker: "A",
          },
          {
            text: "of",
            start: 21882,
            end: 22046,
            confidence: 1.0,
            speaker: "A",
          },
          {
            text: "Environmental",
            start: 22068,
            end: 22666,
            confidence: 0.53495,
            speaker: "A",
          },
          {
            text: "Health",
            start: 22698,
            end: 22942,
            confidence: 0.9976,
            speaker: "A",
          },
          {
            text: "and",
            start: 22996,
            end: 23214,
            confidence: 1.0,
            speaker: "A",
          },
          {
            text: "Engineering",
            start: 23252,
            end: 23706,
            confidence: 0.99983,
            speaker: "A",
          },
          {
            text: "at",
            start: 23738,
            end: 23934,
            confidence: 1.0,
            speaker: "A",
          },
          {
            text: "Johns",
            start: 23972,
            end: 24266,
            confidence: 0.9997,
            speaker: "A",
          },
          {
            text: "Hopkins",
            start: 24298,
            end: 24714,
            confidence: 0.99874,
            speaker: "A",
          },
          {
            text: "University",
            start: 24762,
            end: 25042,
            confidence: 0.93732,
            speaker: "A",
          },
          {
            text: "Varsity.",
            start: 25066,
            end: 25490,
            confidence: 0.47413,
            speaker: "A",
          },
          {
            text: "Good",
            start: 25570,
            end: 25766,
            confidence: 0.73108,
            speaker: "A",
          },
          {
            text: "morning,",
            start: 25788,
            end: 26022,
            confidence: 0.99997,
            speaker: "A",
          },
          {
            text: "professor.",
            start: 26076,
            end: 26950,
            confidence: 0.99999,
            speaker: "A",
          },
        ],
      },
      {
        confidence: 0.9929600000000001,
        end: 28840,
        speaker: "B",
        start: 27850,
        text: "Good morning.",
        words: [
          {
            text: "Good",
            start: 27850,
            end: 28214,
            confidence: 0.99999,
            speaker: "B",
          },
          {
            text: "morning.",
            start: 28252,
            end: 28840,
            confidence: 0.98593,
            speaker: "B",
          },
        ],
      },
      {
        confidence: 0.8863582608695653,
        end: 37400,
        speaker: "A",
        start: 29610,
        text: "What is it about the conditions right now that have caused this round of wildfires to affect so many people so far away?",
        words: [
          {
            text: "What",
            start: 29610,
            end: 29926,
            confidence: 0.9999,
            speaker: "A",
          },
          {
            text: "is",
            start: 29948,
            end: 30134,
            confidence: 0.88563,
            speaker: "A",
          },
          {
            text: "it",
            start: 30172,
            end: 30278,
            confidence: 0.99993,
            speaker: "A",
          },
          {
            text: "about",
            start: 30284,
            end: 30502,
            confidence: 0.61503,
            speaker: "A",
          },
          {
            text: "the",
            start: 30556,
            end: 30726,
            confidence: 1.0,
            speaker: "A",
          },
          {
            text: "conditions",
            start: 30748,
            end: 31314,
            confidence: 0.77568,
            speaker: "A",
          },
          {
            text: "right",
            start: 31362,
            end: 31622,
            confidence: 1.0,
            speaker: "A",
          },
          {
            text: "now",
            start: 31676,
            end: 32086,
            confidence: 1.0,
            speaker: "A",
          },
          {
            text: "that",
            start: 32188,
            end: 32406,
            confidence: 0.99998,
            speaker: "A",
          },
          {
            text: "have",
            start: 32428,
            end: 32614,
            confidence: 0.76635,
            speaker: "A",
          },
          {
            text: "caused",
            start: 32652,
            end: 33026,
            confidence: 0.81005,
            speaker: "A",
          },
          {
            text: "this",
            start: 33058,
            end: 33254,
            confidence: 1.0,
            speaker: "A",
          },
          {
            text: "round",
            start: 33292,
            end: 33506,
            confidence: 0.98965,
            speaker: "A",
          },
          {
            text: "of",
            start: 33538,
            end: 33782,
            confidence: 0.63,
            speaker: "A",
          },
          {
            text: "wildfires",
            start: 33836,
            end: 34546,
            confidence: 0.80401,
            speaker: "A",
          },
          {
            text: "to",
            start: 34578,
            end: 34726,
            confidence: 1.0,
            speaker: "A",
          },
          {
            text: "affect",
            start: 34748,
            end: 35074,
            confidence: 0.9824,
            speaker: "A",
          },
          {
            text: "so",
            start: 35122,
            end: 35334,
            confidence: 0.66533,
            speaker: "A",
          },
          {
            text: "many",
            start: 35372,
            end: 35574,
            confidence: 0.99999,
            speaker: "A",
          },
          {
            text: "people",
            start: 35612,
            end: 36054,
            confidence: 0.5659,
            speaker: "A",
          },
          {
            text: "so",
            start: 36172,
            end: 36502,
            confidence: 0.9931,
            speaker: "A",
          },
          {
            text: "far",
            start: 36556,
            end: 36774,
            confidence: 1.0,
            speaker: "A",
          },
          {
            text: "away?",
            start: 36812,
            end: 37400,
            confidence: 0.90331,
            speaker: "A",
          },
        ],
      },
      {
        confidence: 0.92182406779661,
        end: 56142,
        speaker: "B",
        start: 38970,
        text: "Well, there's a couple of things. The season has been pretty dry already. And then the fact that we're getting hit in the US. Is because there's a couple of weather systems that are essentially channeling the smoke from those Canadian wildfires through Pennsylvania into the Mid Atlantic and the Northeast and kind of just dropping the smoke there.",
        words: [
          {
            text: "Well,",
            start: 38970,
            end: 39334,
            confidence: 0.98456,
            speaker: "B",
          },
          {
            text: "there's",
            start: 39372,
            end: 39538,
            confidence: 0.99997,
            speaker: "B",
          },
          {
            text: "a",
            start: 39554,
            end: 39686,
            confidence: 0.97,
            speaker: "B",
          },
          {
            text: "couple",
            start: 39708,
            end: 39846,
            confidence: 1.0,
            speaker: "B",
          },
          {
            text: "of",
            start: 39868,
            end: 40006,
            confidence: 0.99,
            speaker: "B",
          },
          {
            text: "things.",
            start: 40028,
            end: 40694,
            confidence: 1.0,
            speaker: "B",
          },
          {
            text: "The",
            start: 40892,
            end: 41302,
            confidence: 1.0,
            speaker: "B",
          },
          {
            text: "season",
            start: 41356,
            end: 41634,
            confidence: 0.99996,
            speaker: "B",
          },
          {
            text: "has",
            start: 41682,
            end: 41846,
            confidence: 0.99998,
            speaker: "B",
          },
          {
            text: "been",
            start: 41868,
            end: 42006,
            confidence: 0.99999,
            speaker: "B",
          },
          {
            text: "pretty",
            start: 42028,
            end: 42130,
            confidence: 1.0,
            speaker: "B",
          },
          {
            text: "dry",
            start: 42140,
            end: 42374,
            confidence: 0.76633,
            speaker: "B",
          },
          {
            text: "already.",
            start: 42422,
            end: 42922,
            confidence: 0.99996,
            speaker: "B",
          },
          {
            text: "And",
            start: 43056,
            end: 43306,
            confidence: 1.0,
            speaker: "B",
          },
          {
            text: "then",
            start: 43328,
            end: 43610,
            confidence: 0.56978,
            speaker: "B",
          },
          {
            text: "the",
            start: 43680,
            end: 43914,
            confidence: 0.6,
            speaker: "B",
          },
          {
            text: "fact",
            start: 43952,
            end: 44106,
            confidence: 0.99998,
            speaker: "B",
          },
          {
            text: "that",
            start: 44128,
            end: 44266,
            confidence: 0.99706,
            speaker: "B",
          },
          {
            text: "we're",
            start: 44288,
            end: 44486,
            confidence: 0.92122,
            speaker: "B",
          },
          {
            text: "getting",
            start: 44518,
            end: 44714,
            confidence: 0.99998,
            speaker: "B",
          },
          {
            text: "hit",
            start: 44752,
            end: 45002,
            confidence: 0.51955,
            speaker: "B",
          },
          {
            text: "in",
            start: 45056,
            end: 45178,
            confidence: 0.99999,
            speaker: "B",
          },
          {
            text: "the",
            start: 45184,
            end: 45306,
            confidence: 1.0,
            speaker: "B",
          },
          {
            text: "US.",
            start: 45328,
            end: 45898,
            confidence: 0.87,
            speaker: "B",
          },
          {
            text: "Is",
            start: 46064,
            end: 46442,
            confidence: 0.55822,
            speaker: "B",
          },
          {
            text: "because",
            start: 46496,
            end: 46714,
            confidence: 0.99996,
            speaker: "B",
          },
          {
            text: "there's",
            start: 46752,
            end: 46998,
            confidence: 0.9991,
            speaker: "B",
          },
          {
            text: "a",
            start: 47014,
            end: 47098,
            confidence: 1.0,
            speaker: "B",
          },
          {
            text: "couple",
            start: 47104,
            end: 47226,
            confidence: 0.99361,
            speaker: "B",
          },
          {
            text: "of",
            start: 47248,
            end: 47338,
            confidence: 0.86,
            speaker: "B",
          },
          {
            text: "weather",
            start: 47344,
            end: 47606,
            confidence: 0.99983,
            speaker: "B",
          },
          {
            text: "systems",
            start: 47638,
            end: 47958,
            confidence: 0.99999,
            speaker: "B",
          },
          {
            text: "that",
            start: 47974,
            end: 48106,
            confidence: 1.0,
            speaker: "B",
          },
          {
            text: "are",
            start: 48128,
            end: 48218,
            confidence: 0.99996,
            speaker: "B",
          },
          {
            text: "essentially",
            start: 48224,
            end: 48502,
            confidence: 0.66886,
            speaker: "B",
          },
          {
            text: "channeling",
            start: 48566,
            end: 48998,
            confidence: 0.9995,
            speaker: "B",
          },
          {
            text: "the",
            start: 49014,
            end: 49146,
            confidence: 1.0,
            speaker: "B",
          },
          {
            text: "smoke",
            start: 49168,
            end: 49398,
            confidence: 0.99997,
            speaker: "B",
          },
          {
            text: "from",
            start: 49414,
            end: 49546,
            confidence: 0.99937,
            speaker: "B",
          },
          {
            text: "those",
            start: 49568,
            end: 49706,
            confidence: 0.99991,
            speaker: "B",
          },
          {
            text: "Canadian",
            start: 49728,
            end: 50086,
            confidence: 1.0,
            speaker: "B",
          },
          {
            text: "wildfires",
            start: 50118,
            end: 51062,
            confidence: 0.49043,
            speaker: "B",
          },
          {
            text: "through",
            start: 51206,
            end: 51610,
            confidence: 0.99999,
            speaker: "B",
          },
          {
            text: "Pennsylvania",
            start: 51680,
            end: 52326,
            confidence: 0.99493,
            speaker: "B",
          },
          {
            text: "into",
            start: 52358,
            end: 52506,
            confidence: 0.99998,
            speaker: "B",
          },
          {
            text: "the",
            start: 52528,
            end: 52618,
            confidence: 1.0,
            speaker: "B",
          },
          {
            text: "Mid",
            start: 52624,
            end: 52758,
            confidence: 1.0,
            speaker: "B",
          },
          {
            text: "Atlantic",
            start: 52784,
            end: 53178,
            confidence: 0.68127,
            speaker: "B",
          },
          {
            text: "and",
            start: 53194,
            end: 53278,
            confidence: 0.71,
            speaker: "B",
          },
          {
            text: "the",
            start: 53284,
            end: 53406,
            confidence: 1.0,
            speaker: "B",
          },
          {
            text: "Northeast",
            start: 53428,
            end: 53866,
            confidence: 0.98714,
            speaker: "B",
          },
          {
            text: "and",
            start: 53898,
            end: 54190,
            confidence: 0.99,
            speaker: "B",
          },
          {
            text: "kind",
            start: 54260,
            end: 54398,
            confidence: 0.99994,
            speaker: "B",
          },
          {
            text: "of",
            start: 54404,
            end: 54574,
            confidence: 0.53,
            speaker: "B",
          },
          {
            text: "just",
            start: 54612,
            end: 54766,
            confidence: 0.99999,
            speaker: "B",
          },
          {
            text: "dropping",
            start: 54788,
            end: 55146,
            confidence: 0.74603,
            speaker: "B",
          },
          {
            text: "the",
            start: 55178,
            end: 55278,
            confidence: 1.0,
            speaker: "B",
          },
          {
            text: "smoke",
            start: 55284,
            end: 55594,
            confidence: 0.99134,
            speaker: "B",
          },
          {
            text: "there.",
            start: 55642,
            end: 56142,
            confidence: 0.99999,
            speaker: "B",
          },
        ],
      },
      {
        confidence: 0.9296276470588234,
        end: 61070,
        speaker: "A",
        start: 56276,
        text: "So what is it in this haze that makes it harmful? And I'm assuming it is harmful.",
        words: [
          {
            text: "So",
            start: 56276,
            end: 56574,
            confidence: 0.57369,
            speaker: "A",
          },
          {
            text: "what",
            start: 56612,
            end: 56814,
            confidence: 0.98951,
            speaker: "A",
          },
          {
            text: "is",
            start: 56852,
            end: 56958,
            confidence: 0.99994,
            speaker: "A",
          },
          {
            text: "it",
            start: 56964,
            end: 57086,
            confidence: 0.98926,
            speaker: "A",
          },
          {
            text: "in",
            start: 57108,
            end: 57246,
            confidence: 0.86342,
            speaker: "A",
          },
          {
            text: "this",
            start: 57268,
            end: 57454,
            confidence: 1.0,
            speaker: "A",
          },
          {
            text: "haze",
            start: 57492,
            end: 57866,
            confidence: 0.64143,
            speaker: "A",
          },
          {
            text: "that",
            start: 57898,
            end: 58094,
            confidence: 1.0,
            speaker: "A",
          },
          {
            text: "makes",
            start: 58132,
            end: 58334,
            confidence: 0.99999,
            speaker: "A",
          },
          {
            text: "it",
            start: 58372,
            end: 58718,
            confidence: 0.88877,
            speaker: "A",
          },
          {
            text: "harmful?",
            start: 58804,
            end: 59274,
            confidence: 0.99998,
            speaker: "A",
          },
          {
            text: "And",
            start: 59322,
            end: 59438,
            confidence: 1.0,
            speaker: "A",
          },
          {
            text: "I'm",
            start: 59444,
            end: 59626,
            confidence: 0.99865,
            speaker: "A",
          },
          {
            text: "assuming",
            start: 59658,
            end: 59978,
            confidence: 0.99992,
            speaker: "A",
          },
          {
            text: "it",
            start: 59994,
            end: 60078,
            confidence: 1.0,
            speaker: "A",
          },
          {
            text: "is",
            start: 60084,
            end: 60254,
            confidence: 0.88077,
            speaker: "A",
          },
          {
            text: "harmful.",
            start: 60292,
            end: 61070,
            confidence: 0.97834,
            speaker: "A",
          },
        ],
      },
      {
        confidence: 0.9549970909090907,
        end: 82950,
        speaker: "B",
        start: 62290,
        text: "It is. The levels outside right now in Baltimore are considered unhealthy. And most of that is due to what's called particulate matter, which are tiny particles, microscopic smaller than the width of your hair that can get into your lungs and impact your respiratory system, your cardiovascular system, and even your neurological your brain.",
        words: [
          {
            text: "It",
            start: 62290,
            end: 62606,
            confidence: 0.76898,
            speaker: "B",
          },
          {
            text: "is.",
            start: 62628,
            end: 63150,
            confidence: 0.99647,
            speaker: "B",
          },
          {
            text: "The",
            start: 63300,
            end: 63566,
            confidence: 1.0,
            speaker: "B",
          },
          {
            text: "levels",
            start: 63588,
            end: 64042,
            confidence: 0.99769,
            speaker: "B",
          },
          {
            text: "outside",
            start: 64106,
            end: 64490,
            confidence: 0.99999,
            speaker: "B",
          },
          {
            text: "right",
            start: 64580,
            end: 64786,
            confidence: 0.99999,
            speaker: "B",
          },
          {
            text: "now",
            start: 64808,
            end: 64946,
            confidence: 1.0,
            speaker: "B",
          },
          {
            text: "in",
            start: 64968,
            end: 65058,
            confidence: 0.99994,
            speaker: "B",
          },
          {
            text: "Baltimore",
            start: 65064,
            end: 65534,
            confidence: 0.56902,
            speaker: "B",
          },
          {
            text: "are",
            start: 65582,
            end: 65746,
            confidence: 0.99996,
            speaker: "B",
          },
          {
            text: "considered",
            start: 65768,
            end: 66046,
            confidence: 0.99992,
            speaker: "B",
          },
          {
            text: "unhealthy.",
            start: 66078,
            end: 67010,
            confidence: 0.92699,
            speaker: "B",
          },
          {
            text: "And",
            start: 67750,
            end: 68114,
            confidence: 0.96,
            speaker: "B",
          },
          {
            text: "most",
            start: 68152,
            end: 68306,
            confidence: 0.99998,
            speaker: "B",
          },
          {
            text: "of",
            start: 68328,
            end: 68466,
            confidence: 0.71,
            speaker: "B",
          },
          {
            text: "that",
            start: 68488,
            end: 68626,
            confidence: 0.99995,
            speaker: "B",
          },
          {
            text: "is",
            start: 68648,
            end: 68834,
            confidence: 1.0,
            speaker: "B",
          },
          {
            text: "due",
            start: 68872,
            end: 69038,
            confidence: 0.99999,
            speaker: "B",
          },
          {
            text: "to",
            start: 69054,
            end: 69282,
            confidence: 1.0,
            speaker: "B",
          },
          {
            text: "what's",
            start: 69336,
            end: 69566,
            confidence: 0.99943,
            speaker: "B",
          },
          {
            text: "called",
            start: 69598,
            end: 69794,
            confidence: 1.0,
            speaker: "B",
          },
          {
            text: "particulate",
            start: 69832,
            end: 70238,
            confidence: 0.99076,
            speaker: "B",
          },
          {
            text: "matter,",
            start: 70254,
            end: 70482,
            confidence: 0.99998,
            speaker: "B",
          },
          {
            text: "which",
            start: 70536,
            end: 70706,
            confidence: 1.0,
            speaker: "B",
          },
          {
            text: "are",
            start: 70728,
            end: 70866,
            confidence: 0.99999,
            speaker: "B",
          },
          {
            text: "tiny",
            start: 70888,
            end: 71166,
            confidence: 0.99994,
            speaker: "B",
          },
          {
            text: "particles,",
            start: 71198,
            end: 71902,
            confidence: 0.9992,
            speaker: "B",
          },
          {
            text: "microscopic",
            start: 72046,
            end: 72894,
            confidence: 0.63173,
            speaker: "B",
          },
          {
            text: "smaller",
            start: 72942,
            end: 73246,
            confidence: 0.99984,
            speaker: "B",
          },
          {
            text: "than",
            start: 73278,
            end: 73426,
            confidence: 0.99999,
            speaker: "B",
          },
          {
            text: "the",
            start: 73448,
            end: 73538,
            confidence: 1.0,
            speaker: "B",
          },
          {
            text: "width",
            start: 73544,
            end: 73726,
            confidence: 0.99994,
            speaker: "B",
          },
          {
            text: "of",
            start: 73758,
            end: 74002,
            confidence: 0.97,
            speaker: "B",
          },
          {
            text: "your",
            start: 74056,
            end: 74226,
            confidence: 0.99999,
            speaker: "B",
          },
          {
            text: "hair",
            start: 74248,
            end: 75002,
            confidence: 0.85775,
            speaker: "B",
          },
          {
            text: "that",
            start: 75166,
            end: 75542,
            confidence: 0.9669,
            speaker: "B",
          },
          {
            text: "can",
            start: 75596,
            end: 75766,
            confidence: 1.0,
            speaker: "B",
          },
          {
            text: "get",
            start: 75788,
            end: 75926,
            confidence: 0.99999,
            speaker: "B",
          },
          {
            text: "into",
            start: 75948,
            end: 76086,
            confidence: 0.99999,
            speaker: "B",
          },
          {
            text: "your",
            start: 76108,
            end: 76246,
            confidence: 1.0,
            speaker: "B",
          },
          {
            text: "lungs",
            start: 76268,
            end: 76546,
            confidence: 0.86865,
            speaker: "B",
          },
          {
            text: "and",
            start: 76578,
            end: 76870,
            confidence: 0.99,
            speaker: "B",
          },
          {
            text: "impact",
            start: 76940,
            end: 77314,
            confidence: 0.99879,
            speaker: "B",
          },
          {
            text: "your",
            start: 77362,
            end: 77622,
            confidence: 1.0,
            speaker: "B",
          },
          {
            text: "respiratory",
            start: 77676,
            end: 78226,
            confidence: 0.99164,
            speaker: "B",
          },
          {
            text: "system,",
            start: 78258,
            end: 78454,
            confidence: 1.0,
            speaker: "B",
          },
          {
            text: "your",
            start: 78492,
            end: 78646,
            confidence: 0.99997,
            speaker: "B",
          },
          {
            text: "cardiovascular",
            start: 78668,
            end: 79522,
            confidence: 0.99909,
            speaker: "B",
          },
          {
            text: "system,",
            start: 79586,
            end: 80198,
            confidence: 0.99999,
            speaker: "B",
          },
          {
            text: "and",
            start: 80364,
            end: 80646,
            confidence: 1.0,
            speaker: "B",
          },
          {
            text: "even",
            start: 80668,
            end: 81046,
            confidence: 0.60772,
            speaker: "B",
          },
          {
            text: "your",
            start: 81148,
            end: 81414,
            confidence: 0.9985,
            speaker: "B",
          },
          {
            text: "neurological",
            start: 81452,
            end: 82034,
            confidence: 0.939,
            speaker: "B",
          },
          {
            text: "your",
            start: 82082,
            end: 82246,
            confidence: 0.78769,
            speaker: "B",
          },
          {
            text: "brain.",
            start: 82268,
            end: 82950,
            confidence: 0.99951,
            speaker: "B",
          },
        ],
      },
    ],
  }}
/>


| Key                                 | Type   | Description                                                                                                                                                |
| ----------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `utterances`                        | array  | A turn-by-turn temporal sequence of the transcript, where the i-th element is an object containing information about the i-th utterance in the audio file. |
| `utterances[i].confidence`          | number | The confidence score for the transcript of this utterance.                                                                                                 |
| `utterances[i].end`                 | number | The ending time, in milliseconds, of the utterance in the audio file.                                                                                      |
| `utterances[i].speaker`             | string | The speaker of this utterance, where each speaker is assigned a sequential capital letter. For example, "A" for Speaker A, "B" for Speaker B, and so on.   |
| `utterances[i].start`               | number | The starting time, in milliseconds, of the utterance in the audio file.                                                                                    |
| `utterances[i].text`                | string | The transcript for this utterance.                                                                                                                         |
| `utterances[i].words`               | array  | A sequential array for the words in the transcript, where the j-th element is an object containing information about the j-th word in the utterance.       |
| `utterances[i].words[j].text`       | string | The text of the j-th word in the i-th utterance.                                                                                                           |
| `utterances[i].words[j].start`      | number | The starting time for when the j-th word is spoken in the i-th utterance, in milliseconds.                                                                 |
| `utterances[i].words[j].end`        | number | The ending time for when the j-th word is spoken in the i-th utterance, in milliseconds.                                                                   |
| `utterances[i].words[j].confidence` | number | The confidence score for the transcript of the j-th word in the i-th utterance.                                                                            |
| `utterances[i].words[j].speaker`    | string | The speaker who uttered the j-th word in the i-th utterance.                                                                                               |

The response also includes the request parameters used to generate the transcript.

## Frequently asked questions & troubleshooting

<AccordionGroup>
  <Accordion title="How can I improve the performance of the Speaker Diarization model?" theme="dark" iconColor="white" >  
  To improve the performance of the Speaker Diarization model, it's recommended to ensure that each speaker speaks for at least 30 seconds uninterrupted. Avoiding scenarios where a person only speaks a few short phrases like “Yeah”, “Right”, or “Sounds good” can also help. If possible, avoiding cross-talking can also improve performance.
  </Accordion>

{" "}

<Accordion
  title="How many speakers can the model handle?"
  theme="dark"
  iconColor="white"
>
  By default, the upper limit on the number of speakers for Speaker Diarization
  is 10. If you expect more than 10 speakers, you can use
  [`speaker_options`](/docs/api-reference/transcripts/submit#request.body.speaker_options)
  to set a range of possible speakers. Please note, setting `max_speakers_expected` too high may reduce diarization accuracy, causing sentences from the same speaker to be split across multiple speaker labels.
</Accordion>

{" "}

<Accordion
  title="How accurate is the Speaker Diarization model?"
  theme="dark"
  iconColor="white"
>
  The accuracy of the Speaker Diarization model depends on several factors,
  including the quality of the audio, the number of speakers, and the length of
  the audio file. Ensuring that each speaker speaks for at least 30 seconds
  uninterrupted and avoiding scenarios where a person only speaks a few short
  phrases can improve accuracy. However, it's important to note that the model
  isn't perfect and may make mistakes, especially in more challenging scenarios.
</Accordion>

  <Accordion title="Why is the speaker diarization not performing as expected?" theme="dark" iconColor="white" >
  The speaker diarization may be performing poorly if a speaker only speaks once or infrequently throughout the audio file. Additionally, if the speaker speaks in short or single-word utterances, the model may struggle to create separate clusters for each speaker. Lastly, if the speakers sound similar, there may be difficulties in accurately identifying and separating them. Background noise, cross-talk, or an echo may also cause issues.
  </Accordion>

  {" "}

  <Accordion title="When should I use `speakers_expected` and when should I use `speaker_options` to set a range of speakers?" theme="dark" iconColor="white">
  `speakers_expected` should be used only when you are confident that your audio file contains exactly the number of speakers you specify. If this number is incorrect, the diarization process, being forced to find an incorrect number of speakers, may produce random splits of single-speaker segments or merge multiple speakers into one in order to return the specified number of speakers. There are various scenarios where the audio file may include unexpected speakers, such as playback of recorded audio during a conversation or background speech from other people. To account for such cases, it is generally recommended to use `min_speakers_expected` instead of `speakers_expected` and to set `max_speakers_expected` slightly higher (e.g., `min_speakers_expected` + 2) to allow some flexibility.
  </Accordion>
</AccordionGroup>

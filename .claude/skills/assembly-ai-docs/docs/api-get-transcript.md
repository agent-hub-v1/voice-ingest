# Get transcript

GET https://api.assemblyai.com/v2/transcript/{transcript_id}

<Note>To retrieve your transcriptions on our EU server, replace `api.assemblyai.com` with `api.eu.assemblyai.com`.</Note>
Get the transcript resource. The transcript is ready when the "status" is "completed".


Reference: https://www.assemblyai.com/docs/api-reference/transcripts/get

## OpenAPI Specification

```yaml
openapi: 3.1.1
info:
  title: Get transcript
  version: endpoint_transcripts.get
paths:
  /v2/transcript/{transcript_id}:
    get:
      operationId: get
      summary: Get transcript
      description: >
        <Note>To retrieve your transcriptions on our EU server, replace
        `api.assemblyai.com` with `api.eu.assemblyai.com`.</Note>

        Get the transcript resource. The transcript is ready when the "status"
        is "completed".
      tags:
        - - subpackage_transcripts
      parameters:
        - name: transcript_id
          in: path
          description: ID of the transcript
          required: true
          schema:
            type: string
        - name: Authorization
          in: header
          required: true
          schema:
            type: string
      responses:
        '200':
          description: The transcript resource
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Transcript'
        '400':
          description: Bad request
          content: {}
        '401':
          description: Unauthorized
          content: {}
        '404':
          description: Not found
          content: {}
        '429':
          description: Too many requests
          content: {}
        '500':
          description: An error occurred while processing the request
          content: {}
        '503':
          description: Service unavailable
          content: {}
        '504':
          description: Gateway timeout
          content: {}
components:
  schemas:
    TranscriptStatus:
      type: string
      enum:
        - description: The audio file is in the queue to be processed by the API.
          value: queued
        - description: The audio file is being processed by the API.
          value: processing
        - description: The transcript job has been completed successfully.
          value: completed
        - description: An error occurred while processing the audio file.
          value: error
    TranscriptLanguageCode:
      type: string
      enum:
        - value: en
        - value: en_au
        - value: en_uk
        - value: en_us
        - value: es
        - value: fr
        - value: de
        - value: it
        - value: pt
        - value: nl
        - value: af
        - value: sq
        - value: am
        - value: ar
        - value: hy
        - value: as
        - value: az
        - value: ba
        - value: eu
        - value: be
        - value: bn
        - value: bs
        - value: br
        - value: bg
        - value: my
        - value: ca
        - value: zh
        - value: hr
        - value: cs
        - value: da
        - value: et
        - value: fo
        - value: fi
        - value: gl
        - value: ka
        - value: el
        - value: gu
        - value: ht
        - value: ha
        - value: haw
        - value: he
        - value: hi
        - value: hu
        - value: is
        - value: id
        - value: ja
        - value: jw
        - value: kn
        - value: kk
        - value: km
        - value: ko
        - value: lo
        - value: la
        - value: lv
        - value: ln
        - value: lt
        - value: lb
        - value: mk
        - value: mg
        - value: ms
        - value: ml
        - value: mt
        - value: mi
        - value: mr
        - value: mn
        - value: ne
        - value: 'no'
        - value: nn
        - value: oc
        - value: pa
        - value: ps
        - value: fa
        - value: pl
        - value: ro
        - value: ru
        - value: sa
        - value: sr
        - value: sn
        - value: sd
        - value: si
        - value: sk
        - value: sl
        - value: so
        - value: su
        - value: sw
        - value: sv
        - value: tl
        - value: tg
        - value: ta
        - value: tt
        - value: te
        - value: th
        - value: bo
        - value: tr
        - value: tk
        - value: uk
        - value: ur
        - value: uz
        - value: vi
        - value: cy
        - value: yi
        - value: yo
    TranscriptLanguageDetectionOptions:
      type: object
      properties:
        expected_languages:
          type: array
          items:
            description: Any type
        fallback_language:
          type: string
        code_switching:
          type: boolean
        code_switching_confidence_threshold:
          description: >
            The confidence threshold for code switching detection. If the code
            switching confidence is below this threshold, the transcript will be
            processed in the language with the highest
            `language_detection_confidence` score.
    SpeechModel:
      type: string
      enum:
        - description: >-
            The model optimized for accuracy, low latency, ease of use, and
            mutli-language support.
          value: best
        - description: A contextual model optimized for customization.
          value: slam-1
        - description: >-
            The model optimized for accuracy, low latency, ease of use, and
            mutli-language support.
          value: universal
    TranscriptWord:
      type: object
      properties:
        confidence:
          type: number
          format: double
        start:
          type: integer
        end:
          type: integer
        text:
          type: string
        channel:
          type:
            - string
            - 'null'
        speaker:
          type:
            - string
            - 'null'
      required:
        - confidence
        - start
        - end
        - text
        - speaker
    TranscriptUtterance:
      type: object
      properties:
        confidence:
          type: number
          format: double
        start:
          type: integer
        end:
          type: integer
        text:
          type: string
        words:
          type: array
          items:
            $ref: '#/components/schemas/TranscriptWord'
        channel:
          type:
            - string
            - 'null'
        speaker:
          type: string
      required:
        - confidence
        - start
        - end
        - text
        - words
        - speaker
    AudioIntelligenceModelStatus:
      type: string
      enum:
        - value: success
        - value: unavailable
    Timestamp:
      type: object
      properties:
        start:
          type: integer
        end:
          type: integer
      required:
        - start
        - end
    AutoHighlightResult:
      type: object
      properties:
        count:
          type: integer
        rank:
          type: number
          format: double
        text:
          type: string
        timestamps:
          type: array
          items:
            $ref: '#/components/schemas/Timestamp'
      required:
        - count
        - rank
        - text
        - timestamps
    AutoHighlightsResult:
      type: object
      properties:
        status:
          $ref: '#/components/schemas/AudioIntelligenceModelStatus'
        results:
          type: array
          items:
            $ref: '#/components/schemas/AutoHighlightResult'
      required:
        - status
        - results
    RedactPiiAudioQuality:
      type: string
      enum:
        - description: MP3 audio format is lower quality and lower size than WAV.
          value: mp3
        - description: >-
            WAV audio format is the highest quality (no compression) and larger
            size than MP3.
          value: wav
    PiiPolicy:
      type: string
      enum:
        - description: >-
            Customer account or membership identification number (e.g., Policy
            No. 10042992, Member ID: HZ-5235-001)
          value: account_number
        - description: Banking information, including account and routing numbers
          value: banking_information
        - description: Blood type (e.g., O-, AB positive)
          value: blood_type
        - description: 'Credit card verification code (e.g., CVV: 080)'
          value: credit_card_cvv
        - description: Expiration date of a credit card
          value: credit_card_expiration
        - description: Credit card number
          value: credit_card_number
        - description: Specific calendar date (e.g., December 18)
          value: date
        - description: >-
            Broader time periods, including date ranges, months, seasons, years,
            and decades (e.g., 2020-2021, 5-9 May, January 1984)
          value: date_interval
        - description: 'Date of birth (e.g., Date of Birth: March 7,1961)'
          value: date_of_birth
        - description: Driver's license number. (e.g., DL# 356933-540)
          value: drivers_license
        - description: >-
            Medications, vitamins, or supplements (e.g., Advil, Acetaminophen,
            Panadol)
          value: drug
        - description: >-
            Periods of time, specified as a number and a unit of time (e.g., 8
            months, 2 years)
          value: duration
        - description: Email address (e.g., support@assemblyai.com)
          value: email_address
        - description: Name of an event or holiday (e.g., Olympics, Yom Kippur)
          value: event
        - description: >-
            Names of computer files, including the extension or filepath (e.g.,
            Taxes/2012/brad-tax-returns.pdf)
          value: filename
        - description: >-
            Terms indicating gender identity or sexual orientation, including
            slang terms (e.g., female, bisexual, trans)
          value: gender_sexuality
        - description: >-
            Healthcare numbers and health plan beneficiary numbers (e.g., Policy
            No.: 5584-486-674-YM)
          value: healthcare_number
        - description: Bodily injury (e.g., I broke my arm, I have a sprained wrist)
          value: injury
        - description: >-
            Internet IP address, including IPv4 and IPv6 formats (e.g.,
            192.168.0.1)
          value: ip_address
        - description: Name of a natural language (e.g., Spanish, French)
          value: language
        - description: >-
            Any Location reference including mailing address, postal code, city,
            state, province, country, or coordinates. (e.g., Lake Victoria, 145
            Windsor St., 90210)
          value: location
        - description: >-
            Terms indicating marital status (e.g., Single, common-law, ex-wife,
            married)
          value: marital_status
        - description: >-
            Name of a medical condition, disease, syndrome, deficit, or disorder
            (e.g., chronic fatigue syndrome, arrhythmia, depression)
          value: medical_condition
        - description: >-
            Medical process, including treatments, procedures, and tests (e.g.,
            heart surgery, CT scan)
          value: medical_process
        - description: Name and/or amount of currency (e.g., 15 pesos, $94.50)
          value: money_amount
        - description: >-
            Terms indicating nationality, ethnicity, or race (e.g., American,
            Asian, Caucasian)
          value: nationality
        - description: >-
            Numerical PII (including alphanumeric strings) that doesn't fall
            under other categories
          value: number_sequence
        - description: Job title or profession (e.g., professor, actors, engineer, CPA)
          value: occupation
        - description: >-
            Name of an organization (e.g., CNN, McDonalds, University of Alaska,
            Northwest General Hospital)
          value: organization
        - description: >-
            Passport numbers, issued by any country (e.g., PA4568332,
            NU3C6L86S12)
          value: passport_number
        - description: >-
            Account passwords, PINs, access keys, or verification answers (e.g.,
            27%alfalfa, temp1234, My mother's maiden name is Smith)
          value: password
        - description: Number associated with an age (e.g., 27, 75)
          value: person_age
        - description: Name of a person (e.g., Bob, Doug Jones, Dr. Kay Martinez, MD)
          value: person_name
        - description: Telephone or fax number
          value: phone_number
        - description: >-
            Distinctive bodily attributes, including terms indicating race
            (e.g., I'm 190cm tall, He belongs to the Black students'
            association)
          value: physical_attribute
        - description: >-
            Terms referring to a political party, movement, or ideology (e.g.,
            Republican, Liberal)
          value: political_affiliation
        - description: Terms indicating religious affiliation (e.g., Hindu, Catholic)
          value: religion
        - description: Medical statistics (e.g., 18%, 18 percent)
          value: statistics
        - description: Expressions indicating clock times (e.g., 19:37:28, 10pm EST)
          value: time
        - description: Internet addresses (e.g., https://www.assemblyai.com/)
          value: url
        - description: Social Security Number or equivalent
          value: us_social_security_number
        - description: Usernames, login names, or handles (e.g., @AssemblyAI)
          value: username
        - description: >-
            Vehicle identification numbers (VINs), vehicle serial numbers, and
            license plate numbers (e.g., 5FNRL38918B111818, BIF7547)
          value: vehicle_id
        - description: Names of Zodiac signs (e.g., Aries, Taurus)
          value: zodiac_sign
    SubstitutionPolicy:
      type: string
      enum:
        - value: entity_name
        - value: hash
    ContentSafetyLabel:
      type: object
      properties:
        label:
          type: string
        confidence:
          type: number
          format: double
        severity:
          type: number
          format: double
      required:
        - label
        - confidence
        - severity
    ContentSafetyLabelResult:
      type: object
      properties:
        text:
          type: string
        labels:
          type: array
          items:
            $ref: '#/components/schemas/ContentSafetyLabel'
        sentences_idx_start:
          type: integer
        sentences_idx_end:
          type: integer
        timestamp:
          $ref: '#/components/schemas/Timestamp'
      required:
        - text
        - labels
        - sentences_idx_start
        - sentences_idx_end
        - timestamp
    SeverityScoreSummary:
      type: object
      properties:
        low:
          type: number
          format: double
        medium:
          type: number
          format: double
        high:
          type: number
          format: double
      required:
        - low
        - medium
        - high
    ContentSafetyLabelsResult:
      type: object
      properties:
        status:
          $ref: '#/components/schemas/AudioIntelligenceModelStatus'
        results:
          type: array
          items:
            $ref: '#/components/schemas/ContentSafetyLabelResult'
        summary:
          type: object
          additionalProperties:
            type: number
            format: double
        severity_score_summary:
          type: object
          additionalProperties:
            $ref: '#/components/schemas/SeverityScoreSummary'
      required:
        - status
        - results
        - summary
        - severity_score_summary
    TopicDetectionResultLabelsItems:
      type: object
      properties:
        relevance:
          type: number
          format: double
        label:
          type: string
      required:
        - relevance
        - label
    TopicDetectionResult:
      type: object
      properties:
        text:
          type: string
        labels:
          type: array
          items:
            $ref: '#/components/schemas/TopicDetectionResultLabelsItems'
        timestamp:
          $ref: '#/components/schemas/Timestamp'
      required:
        - text
    TopicDetectionModelResult:
      type: object
      properties:
        status:
          $ref: '#/components/schemas/AudioIntelligenceModelStatus'
        results:
          type: array
          items:
            $ref: '#/components/schemas/TopicDetectionResult'
        summary:
          type: object
          additionalProperties:
            type: number
            format: double
      required:
        - status
        - results
        - summary
    TranscriptCustomSpelling:
      type: object
      properties:
        from:
          type: array
          items:
            type: string
        to:
          type: string
      required:
        - from
        - to
    Chapter:
      type: object
      properties:
        gist:
          type: string
        headline:
          type: string
        summary:
          type: string
        start:
          type: integer
        end:
          type: integer
      required:
        - gist
        - headline
        - summary
        - start
        - end
    Sentiment:
      type: string
      enum:
        - value: POSITIVE
        - value: NEUTRAL
        - value: NEGATIVE
    SentimentAnalysisResult:
      type: object
      properties:
        text:
          type: string
        start:
          type: integer
        end:
          type: integer
        sentiment:
          $ref: '#/components/schemas/Sentiment'
        confidence:
          type: number
          format: double
        channel:
          type:
            - string
            - 'null'
        speaker:
          type:
            - string
            - 'null'
      required:
        - text
        - start
        - end
        - sentiment
        - confidence
        - speaker
    EntityType:
      type: string
      enum:
        - description: >-
            Customer account or membership identification number (e.g., Policy
            No. 10042992, Member ID: HZ-5235-001)
          value: account_number
        - description: Banking information, including account and routing numbers
          value: banking_information
        - description: Blood type (e.g., O-, AB positive)
          value: blood_type
        - description: 'Credit card verification code (e.g., CVV: 080)'
          value: credit_card_cvv
        - description: Expiration date of a credit card
          value: credit_card_expiration
        - description: Credit card number
          value: credit_card_number
        - description: Specific calendar date (e.g., December 18)
          value: date
        - description: >-
            Broader time periods, including date ranges, months, seasons, years,
            and decades (e.g., 2020-2021, 5-9 May, January 1984)
          value: date_interval
        - description: 'Date of birth (e.g., Date of Birth: March 7,1961)'
          value: date_of_birth
        - description: Driver's license number. (e.g., DL# 356933-540)
          value: drivers_license
        - description: >-
            Medications, vitamins, or supplements (e.g., Advil, Acetaminophen,
            Panadol)
          value: drug
        - description: >-
            Periods of time, specified as a number and a unit of time (e.g., 8
            months, 2 years)
          value: duration
        - description: Email address (e.g., support@assemblyai.com)
          value: email_address
        - description: Name of an event or holiday (e.g., Olympics, Yom Kippur)
          value: event
        - description: >-
            Names of computer files, including the extension or filepath (e.g.,
            Taxes/2012/brad-tax-returns.pdf)
          value: filename
        - description: >-
            Terms indicating gender identity or sexual orientation, including
            slang terms (e.g., female, bisexual, trans)
          value: gender_sexuality
        - description: >-
            Healthcare numbers and health plan beneficiary numbers (e.g., Policy
            No.: 5584-486-674-YM)
          value: healthcare_number
        - description: Bodily injury (e.g., I broke my arm, I have a sprained wrist)
          value: injury
        - description: >-
            Internet IP address, including IPv4 and IPv6 formats (e.g.,
            192.168.0.1)
          value: ip_address
        - description: Name of a natural language (e.g., Spanish, French)
          value: language
        - description: >-
            Any Location reference including mailing address, postal code, city,
            state, province, country, or coordinates. (e.g., Lake Victoria, 145
            Windsor St., 90210)
          value: location
        - description: >-
            Terms indicating marital status (e.g., Single, common-law, ex-wife,
            married)
          value: marital_status
        - description: >-
            Name of a medical condition, disease, syndrome, deficit, or disorder
            (e.g., chronic fatigue syndrome, arrhythmia, depression)
          value: medical_condition
        - description: >-
            Medical process, including treatments, procedures, and tests (e.g.,
            heart surgery, CT scan)
          value: medical_process
        - description: Name and/or amount of currency (e.g., 15 pesos, $94.50)
          value: money_amount
        - description: >-
            Terms indicating nationality, ethnicity, or race (e.g., American,
            Asian, Caucasian)
          value: nationality
        - description: >-
            Numerical PII (including alphanumeric strings) that doesn't fall
            under other categories
          value: number_sequence
        - description: Job title or profession (e.g., professor, actors, engineer, CPA)
          value: occupation
        - description: >-
            Name of an organization (e.g., CNN, McDonalds, University of Alaska,
            Northwest General Hospital)
          value: organization
        - description: >-
            Passport numbers, issued by any country (e.g., PA4568332,
            NU3C6L86S12)
          value: passport_number
        - description: >-
            Account passwords, PINs, access keys, or verification answers (e.g.,
            27%alfalfa, temp1234, My mother's maiden name is Smith)
          value: password
        - description: Number associated with an age (e.g., 27, 75)
          value: person_age
        - description: Name of a person (e.g., Bob, Doug Jones, Dr. Kay Martinez, MD)
          value: person_name
        - description: Telephone or fax number
          value: phone_number
        - description: >-
            Distinctive bodily attributes, including terms indicating race
            (e.g., I'm 190cm tall, He belongs to the Black students'
            association)
          value: physical_attribute
        - description: >-
            Terms referring to a political party, movement, or ideology (e.g.,
            Republican, Liberal)
          value: political_affiliation
        - description: Terms indicating religious affiliation (e.g., Hindu, Catholic)
          value: religion
        - description: Medical statistics (e.g., 18%, 18 percent)
          value: statistics
        - description: Expressions indicating clock times (e.g., 19:37:28, 10pm EST)
          value: time
        - description: Internet addresses (e.g., https://www.assemblyai.com/)
          value: url
        - description: Social Security Number or equivalent
          value: us_social_security_number
        - description: Usernames, login names, or handles (e.g., @AssemblyAI)
          value: username
        - description: >-
            Vehicle identification numbers (VINs), vehicle serial numbers, and
            license plate numbers (e.g., 5FNRL38918B111818, BIF7547)
          value: vehicle_id
        - description: Names of Zodiac signs (e.g., Aries, Taurus)
          value: zodiac_sign
    Entity:
      type: object
      properties:
        entity_type:
          $ref: '#/components/schemas/EntityType'
        text:
          type: string
        start:
          type: integer
        end:
          type: integer
      required:
        - entity_type
        - text
        - start
        - end
    TranslationRequestBodyTranslation:
      type: object
      properties:
        target_languages:
          type: array
          items:
            type: string
        formal:
          type: boolean
      required:
        - target_languages
    TranslationRequestBody:
      type: object
      properties:
        translation:
          $ref: '#/components/schemas/TranslationRequestBodyTranslation'
      required:
        - translation
    SpeakerIdentificationRequestBodySpeakerIdentificationSpeakerType:
      type: string
      enum:
        - value: role
        - value: name
    SpeakerIdentificationRequestBodySpeakerIdentification:
      type: object
      properties:
        speaker_type:
          $ref: >-
            #/components/schemas/SpeakerIdentificationRequestBodySpeakerIdentificationSpeakerType
        known_values:
          type: array
          items:
            type: string
      required:
        - speaker_type
    SpeakerIdentificationRequestBody:
      type: object
      properties:
        speaker_identification:
          $ref: >-
            #/components/schemas/SpeakerIdentificationRequestBodySpeakerIdentification
      required:
        - speaker_identification
    CustomFormattingRequestBodyCustomFormatting:
      type: object
      properties:
        date:
          type: string
        phone_number:
          type: string
        email:
          type: string
        format_utterances:
          type: boolean
    CustomFormattingRequestBody:
      type: object
      properties:
        custom_formatting:
          $ref: '#/components/schemas/CustomFormattingRequestBodyCustomFormatting'
      required:
        - custom_formatting
    TranscriptSpeechUnderstandingRequest:
      oneOf:
        - $ref: '#/components/schemas/TranslationRequestBody'
        - $ref: '#/components/schemas/SpeakerIdentificationRequestBody'
        - $ref: '#/components/schemas/CustomFormattingRequestBody'
    TranslationResponseTranslation:
      type: object
      properties:
        status:
          type: string
    TranslationResponse:
      type: object
      properties:
        translation:
          $ref: '#/components/schemas/TranslationResponseTranslation'
    SpeakerIdentificationResponseSpeakerIdentification:
      type: object
      properties:
        status:
          type: string
    SpeakerIdentificationResponse:
      type: object
      properties:
        speaker_identification:
          $ref: >-
            #/components/schemas/SpeakerIdentificationResponseSpeakerIdentification
    CustomFormattingResponseCustomFormatting:
      type: object
      properties:
        mapping:
          type: object
          additionalProperties:
            type: string
        formatted_text:
          type: string
    CustomFormattingResponse:
      type: object
      properties:
        custom_formatting:
          $ref: '#/components/schemas/CustomFormattingResponseCustomFormatting'
    TranscriptSpeechUnderstandingResponse:
      oneOf:
        - $ref: '#/components/schemas/TranslationResponse'
        - $ref: '#/components/schemas/SpeakerIdentificationResponse'
        - $ref: '#/components/schemas/CustomFormattingResponse'
    TranscriptSpeechUnderstanding:
      type: object
      properties:
        request:
          $ref: '#/components/schemas/TranscriptSpeechUnderstandingRequest'
        response:
          $ref: '#/components/schemas/TranscriptSpeechUnderstandingResponse'
      required:
        - request
    TranscriptTranslatedTexts:
      type: object
      properties:
        language_code:
          type: string
    Transcript:
      type: object
      properties:
        id:
          type: string
          format: uuid
        audio_url:
          type: string
          format: url
        status:
          $ref: '#/components/schemas/TranscriptStatus'
        language_code:
          $ref: '#/components/schemas/TranscriptLanguageCode'
        language_codes:
          type:
            - array
            - 'null'
          items:
            $ref: '#/components/schemas/TranscriptLanguageCode'
        language_detection:
          type:
            - boolean
            - 'null'
        language_detection_options:
          $ref: '#/components/schemas/TranscriptLanguageDetectionOptions'
        language_confidence_threshold:
          type:
            - number
            - 'null'
          format: double
        language_confidence:
          type:
            - number
            - 'null'
          format: double
        speech_model:
          oneOf:
            - $ref: '#/components/schemas/SpeechModel'
            - type: 'null'
        speech_models:
          type:
            - array
            - 'null'
          items:
            $ref: '#/components/schemas/SpeechModel'
        speech_model_used:
          $ref: '#/components/schemas/SpeechModel'
        text:
          type:
            - string
            - 'null'
        words:
          type:
            - array
            - 'null'
          items:
            $ref: '#/components/schemas/TranscriptWord'
        utterances:
          type:
            - array
            - 'null'
          items:
            $ref: '#/components/schemas/TranscriptUtterance'
        confidence:
          type:
            - number
            - 'null'
          format: double
        audio_duration:
          type:
            - integer
            - 'null'
        punctuate:
          type:
            - boolean
            - 'null'
        format_text:
          type:
            - boolean
            - 'null'
        disfluencies:
          type:
            - boolean
            - 'null'
        multichannel:
          type:
            - boolean
            - 'null'
        audio_channels:
          type: integer
        dual_channel:
          type:
            - boolean
            - 'null'
        webhook_url:
          type:
            - string
            - 'null'
          format: url
        webhook_status_code:
          type:
            - integer
            - 'null'
        webhook_auth:
          type: boolean
        webhook_auth_header_name:
          type:
            - string
            - 'null'
        speed_boost:
          type:
            - boolean
            - 'null'
        auto_highlights:
          type: boolean
        auto_highlights_result:
          oneOf:
            - $ref: '#/components/schemas/AutoHighlightsResult'
            - type: 'null'
        audio_start_from:
          type:
            - integer
            - 'null'
        audio_end_at:
          type:
            - integer
            - 'null'
        filter_profanity:
          type:
            - boolean
            - 'null'
        redact_pii:
          type: boolean
        redact_pii_audio:
          type:
            - boolean
            - 'null'
        redact_pii_audio_quality:
          oneOf:
            - $ref: '#/components/schemas/RedactPiiAudioQuality'
            - type: 'null'
        redact_pii_policies:
          type:
            - array
            - 'null'
          items:
            $ref: '#/components/schemas/PiiPolicy'
        redact_pii_sub:
          $ref: '#/components/schemas/SubstitutionPolicy'
        speaker_labels:
          type:
            - boolean
            - 'null'
        speakers_expected:
          type:
            - integer
            - 'null'
        content_safety:
          type:
            - boolean
            - 'null'
        content_safety_labels:
          oneOf:
            - $ref: '#/components/schemas/ContentSafetyLabelsResult'
            - type: 'null'
        iab_categories:
          type:
            - boolean
            - 'null'
        iab_categories_result:
          oneOf:
            - $ref: '#/components/schemas/TopicDetectionModelResult'
            - type: 'null'
        custom_spelling:
          type:
            - array
            - 'null'
          items:
            $ref: '#/components/schemas/TranscriptCustomSpelling'
        keyterms_prompt:
          type: array
          items:
            type: string
        prompt:
          type: string
        auto_chapters:
          type:
            - boolean
            - 'null'
        chapters:
          type:
            - array
            - 'null'
          items:
            $ref: '#/components/schemas/Chapter'
        summarization:
          type: boolean
        summary_type:
          type:
            - string
            - 'null'
        summary_model:
          type:
            - string
            - 'null'
        summary:
          type:
            - string
            - 'null'
        custom_topics:
          type:
            - boolean
            - 'null'
        topics:
          type: array
          items:
            type: string
        sentiment_analysis:
          type:
            - boolean
            - 'null'
        sentiment_analysis_results:
          type:
            - array
            - 'null'
          items:
            $ref: '#/components/schemas/SentimentAnalysisResult'
        entity_detection:
          type:
            - boolean
            - 'null'
        entities:
          type:
            - array
            - 'null'
          items:
            $ref: '#/components/schemas/Entity'
        speech_threshold:
          type:
            - number
            - 'null'
          format: double
        throttled:
          type:
            - boolean
            - 'null'
        error:
          type: string
        language_model:
          type: string
        acoustic_model:
          type: string
        speech_understanding:
          $ref: '#/components/schemas/TranscriptSpeechUnderstanding'
        translated_texts:
          $ref: '#/components/schemas/TranscriptTranslatedTexts'
      required:
        - id
        - audio_url
        - status
        - language_confidence_threshold
        - language_confidence
        - speech_model
        - webhook_auth
        - auto_highlights
        - redact_pii
        - summarization
        - language_model
        - acoustic_model

```
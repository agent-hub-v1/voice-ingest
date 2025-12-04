Finish voice ingest app

Notes
○ Export button should save file into a symbiont doc ingest folder, not pick a folder (or, have a select box where I can change the file save location)
○ There should be more thought put into the categorization of these files. The shortcuts should have quick button options (so that I can select journal, or dev prompt, or new feature idea, or memory… maybe these can correspond with symbiont’s eternal memory data types)

○ Once I build the “doc workshop”, that zen agent in charge should be in charge of queuing up these voice transcripts for vector embedding. Some slash command or something to batch process them. Also, as part of that - some mechanism for Mycelia to read through certain types of voice memos, such as journal entries and memories

○ The free models need to be vetted to find the best ones, gpt-oss-20B is good (https://openrouter.ai/models/?q=free)

- probably for long transcripts, it would be worth using a good but cheap model. would be good to add a toggle for free/paid, and then also with a paid model, once the api call is complete, the dashboard displays the total cost of that call (input plus output). If under one cent, display would be a fraction (ie. 1/76 cents) - so i know i can get 76 of that amount of text per cent.  if over a cent, it would be displayed as 3.25 cents or 137.14 cents. (2 decimal places, and not as $0.03)

cheap paid models
○ Grok 4.1 fast might be best for long transcripts
○ gpt-oss-120b
○ GPT 5 nano
○ Kimi k2
○ Gemini 2.5 Flash Lite Preview 09-2025

# Meta WhatsApp Conversation Optimizer

Production-ready system to analyze Meta Ads WhatsApp conversation performance and output data-backed optimization decisions. The system is intentionally strict: if required signals are missing, it blocks conclusions and returns `INSUFFICIENT_DATA`.

## Setup

```bash
cd meta_whatsapp_optimizer
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

## Clean GitHub setup (recommended for a new repo)

Use these steps to move this project into a fresh GitHub repo like
`https://github.com/muhammedshabeel/meta-analyser.git`.

### 1) Create a zip from this project (in the source environment)

```bash
cd meta_whatsapp_optimizer
./scripts/export_project.sh
```

This will create `meta_whatsapp_optimizer.zip` next to the project folder.

### 2) On your Mac: clone the empty repo and unzip

```bash
git clone https://github.com/muhammedshabeel/meta-analyser.git
cd meta-analyser
unzip ~/Downloads/meta_whatsapp_optimizer.zip
```

### 3) Commit and push

```bash
git add meta_whatsapp_optimizer
git commit -m "Add Meta WhatsApp optimizer project"
git push origin main
```

If your default branch is `master`, replace `main` with `master`.

### Meta token setup

Provide a valid Meta Marketing API access token and an Ad Account ID (e.g., `act_123`). Ensure the token has permissions to read insights, ad, ad set, and creative data.

## Run

```bash
./run.sh
```

The API will be available at `http://127.0.0.1:8000`.

## Example API call

```bash
curl -X POST http://127.0.0.1:8000/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "access_token": "YOUR_ACCESS_TOKEN",
    "ad_account_id": "act_123",
    "ad_ids": ["1234567890"]
  }'
```

## Sample response

```json
{
  "status": "OK",
  "account": {
    "name": "account",
    "spend": 1200.0,
    "impressions": 300000,
    "clicks": 9000,
    "reach": 220000,
    "actions": {
      "messaging_conversation_started": 120,
      "onsite_conversion.messaging_conversation_started": 30
    },
    "cost_per_action": {
      "messaging_conversation_started": 8.75
    },
    "whatsapp_events": {
      "messaging_conversation_started": 120,
      "onsite_conversion_messaging_conversation_started": 30
    },
    "account_id": "act_123"
  },
  "ads": [],
  "country_analysis": [],
  "decisions": [],
  "ai_analysis": null
}
```

## Notes

- The system only considers WhatsApp conversation events: `messaging_conversation_started` and `onsite_conversion.messaging_conversation_started`.
- If spend is present but WhatsApp events are missing, or if country breakdowns are missing, the API returns `INSUFFICIENT_DATA`.
- The AI analysis layer is optional. Configure `LLM_PROVIDER` and `LLM_ENDPOINT` to enable.

#!/usr/bin/env bash
set -euo pipefail

URL="${1:-http://localhost:3000/docs/__ai__/chat}"
BODY='{"messages":[{"id":"1","role":"user","parts":[{"type":"text","text":"What is Directus?"}]}]}'

curl -i "$URL" \
  -H 'Content-Type: application/json' \
  -H 'Origin: http://localhost:3000' \
  -H 'Referer: http://localhost:3000/docs' \
  -H 'Sec-Fetch-Site: same-origin' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'User-Agent: Mozilla/5.0 Chrome/120 Safari/537.36' \
  -H 'Accept-Language: en-US' \
  --data "$BODY"

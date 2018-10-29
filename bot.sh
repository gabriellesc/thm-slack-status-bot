#!/usr/bin/env sh
TEXT="`fortune -s -n 101`"
EMOJI_FILE=animal_emoji_list
EMOJI=:`shuf -n 1 "$EMOJI_FILE"`:

curl -H "Content-Type: application/json; charset=utf-8" \
     -H "X-Slack-User: $USER_ID" \
     -H "Authorization: Bearer $TOKEN" \
     -X POST \
     -d "{\"profile\": {\"status_text\": \"$TEXT\", \"status_emoji\": \"$EMOJI\", \"status_expiration\": 0}}" \
     https://slack.com/api/users.profile.set

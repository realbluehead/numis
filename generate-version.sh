#!/bin/bash
# Generate version.json with current build date/time

DATE_FORMATTED=$(date "+%d/%m/%Y %H:%M")
TIMESTAMP=$(node -e "console.log(Date.now())")

cat > src/assets/version.json << EOF
{
  "buildDate": "$DATE_FORMATTED",
  "buildTimestamp": $TIMESTAMP
}
EOF

echo "✓ Generated version.json with build date: $DATE_FORMATTED"

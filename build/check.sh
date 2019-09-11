#!/usr/bin/env sh

SUBMISSION_FILE="$(dirname ${0})/submission.zip"
FILESIZE_LIMIT=13312 # bytes

if [ -f "${SUBMISSION_FILE}" ]; then
  SUBMISSION_FILESIZE=$(wc -c < "${SUBMISSION_FILE}")
  if [ "${SUBMISSION_FILESIZE}" -le "${FILESIZE_LIMIT}" ]; then
    echo "Songbirds is under 13K! \( ﾟヮﾟ)/"
  else
    echo "Oh no! Songbirds is over 13K... (╯°□°)╯︵ ┻━┻"
  fi
else
  echo "Unable to find submission.zip. Did you run 'make build'?"
fi


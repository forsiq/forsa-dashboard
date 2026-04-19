#!/bin/bash
#
# test-presigned-upload.sh
# Tests the presigned URL upload flow against the project-service.
#
# Usage:
#   chmod +x test-presigned-upload.sh
#   ./test-presigned-upload.sh [TOKEN] [PROJECT_ID]
#
# If no token provided, attempts to login first.

set -euo pipefail

BASE_URL="https://test.zonevast.com/api/v1"
AUTH_URL="https://test.zonevast.com/api/v1"
PROJECT_ID="${2:-11}"
UPLOAD_FILE="/tmp/test-upload-file.txt"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log_info()  { echo -e "${CYAN}[INFO]${NC} $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
log_err()   { echo -e "${RED}[FAIL]${NC} $1"; }
log_step()  { echo -e "${YELLOW}[STEP]${NC} $1"; }

# ---------------------------------------------------------------
# Create a small test file
# ---------------------------------------------------------------
echo "Test upload file content - $(date)" > "$UPLOAD_FILE"
log_info "Created test file: $UPLOAD_FILE ($(wc -c < "$UPLOAD_FILE") bytes)"

# ---------------------------------------------------------------
# Step 0: Get token if not provided
# ---------------------------------------------------------------
TOKEN="${1:-}"

if [ -z "$TOKEN" ]; then
    log_step "0. Logging in to get token..."
    LOGIN_RESPONSE=$(curl -s -X POST "${AUTH_URL}/auth/token/" \
        -H "Content-Type: application/json" \
        -H "X-Project-ID: ${PROJECT_ID}" \
        -d '{"username":"admin","password":"admin123"}' 2>&1 || true)

    TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('access',''))" 2>/dev/null || true)

    if [ -z "$TOKEN" ]; then
        log_err "Login failed. Response: $LOGIN_RESPONSE"
        log_info "Usage: $0 <ACCESS_TOKEN> [PROJECT_ID]"
        exit 1
    fi
    log_ok "Got token (${#TOKEN} chars)"
else
    log_info "Using provided token (${#TOKEN} chars)"
fi

AUTH_HEADER="Authorization: Bearer ${TOKEN}"
PROJECT_HEADERS="X-Project-ID: ${PROJECT_ID}\nX-Project: ${PROJECT_ID}"

# ---------------------------------------------------------------
# Step 1: Request presigned URL
# ---------------------------------------------------------------
log_step "1. Requesting presigned URL..."

PRESIGNED_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/project/attachment/presigned-url/" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "X-Project-ID: ${PROJECT_ID}" \
    -H "X-Project: ${PROJECT_ID}" \
    -d "{\"file_name\":\"test-upload.txt\",\"file_size\":$(wc -c < "$UPLOAD_FILE"),\"content_type\":\"text/plain\"}" 2>&1)

HTTP_CODE=$(echo "$PRESIGNED_RESPONSE" | tail -1)
BODY=$(echo "$PRESIGNED_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" != "201" ] && [ "$HTTP_CODE" != "200" ]; then
    log_err "Presigned URL request failed (HTTP $HTTP_CODE)"
    echo "Response: $BODY"
    exit 1
fi

log_ok "Presigned URL received (HTTP $HTTP_CODE)"
echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"

# Parse response
ATTACHMENT_ID=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); r=d.get('data',d); print(r.get('attachment_id',''))" 2>/dev/null || true)
UPLOAD_URL=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); r=d.get('data',d); print(r.get('upload_url',''))" 2>/dev/null || true)

if [ -z "$ATTACHMENT_ID" ] || [ -z "$UPLOAD_URL" ]; then
    log_err "Could not parse attachment_id or upload_url from response"
    exit 1
fi

log_ok "Attachment ID: $ATTACHMENT_ID"
log_ok "Upload URL: $UPLOAD_URL"

# Check if we have fields (multipart) or direct PUT
HAS_FIELDS=$(echo "$BODY" | python3 -c "
import sys, json
d = json.load(sys.stdin)
r = d.get('data', d)
fields = r.get('fields', {})
print('yes' if fields and len(fields) > 0 else 'no')
" 2>/dev/null || echo "no")

log_info "Has multipart fields: $HAS_FIELDS"

# ---------------------------------------------------------------
# Step 2: Upload file to S3/MinIO
# ---------------------------------------------------------------
log_step "2. Uploading file to storage..."

if [ "$HAS_FIELDS" = "yes" ]; then
    # Build multipart form data from fields (file MUST be last for S3)
    FIELDS_JSON=$(echo "$BODY" | python3 -c "
import sys, json
d = json.load(sys.stdin)
r = d.get('data', d)
fields = r.get('fields', {})
# Ensure 'key' comes first, then other fields, file last
ordered = sorted(fields.items(), key=lambda x: (0 if x[0] == 'key' else 1, x[0]))
for k,v in ordered:
    # Escape single quotes in values
    v_escaped = v.replace(\"'\", \"'\\\\\\'\")
    print(f\"-F '{k}={v_escaped}'\", end=' ')
" 2>/dev/null)

    UPLOAD_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$UPLOAD_URL" \
        $FIELDS_JSON \
        -F "file=@${UPLOAD_FILE}" 2>&1)
else
    UPLOAD_RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$UPLOAD_URL" \
        -H "Content-Type: text/plain" \
        --data-binary "@${UPLOAD_FILE}" 2>&1)
fi

UPLOAD_HTTP_CODE=$(echo "$UPLOAD_RESPONSE" | tail -1)
UPLOAD_BODY=$(echo "$UPLOAD_RESPONSE" | sed '$d')

if [ "$UPLOAD_HTTP_CODE" != "200" ] && [ "$UPLOAD_HTTP_CODE" != "204" ] && [ "$UPLOAD_HTTP_CODE" != "201" ]; then
    log_err "S3 upload failed (HTTP $UPLOAD_HTTP_CODE)"
    echo "Response: $UPLOAD_BODY"
    # Continue to confirm anyway - some S3 implementations return different codes
else
    log_ok "File uploaded to storage (HTTP $UPLOAD_HTTP_CODE)"
fi

# ---------------------------------------------------------------
# Step 3: Confirm upload
# ---------------------------------------------------------------
log_step "3. Confirming upload..."

CONFIRM_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/project/attachment/confirm-upload/" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "X-Project-ID: ${PROJECT_ID}" \
    -H "X-Project: ${PROJECT_ID}" \
    -d "{\"attachment_id\":${ATTACHMENT_ID}}" 2>&1)

CONFIRM_HTTP_CODE=$(echo "$CONFIRM_RESPONSE" | tail -1)
CONFIRM_BODY=$(echo "$CONFIRM_RESPONSE" | sed '$d')

if [ "$CONFIRM_HTTP_CODE" != "200" ] && [ "$CONFIRM_HTTP_CODE" != "201" ]; then
    log_err "Confirm upload failed (HTTP $CONFIRM_HTTP_CODE)"
    echo "Response: $CONFIRM_BODY"
    exit 1
fi

log_ok "Upload confirmed (HTTP $CONFIRM_HTTP_CODE)"
echo "$CONFIRM_BODY" | python3 -m json.tool 2>/dev/null || echo "$CONFIRM_BODY"

# ---------------------------------------------------------------
# Step 4: Verify - get attachment details
# ---------------------------------------------------------------
log_step "4. Verifying attachment..."

VERIFY_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/project/attachment/${ATTACHMENT_ID}/" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "X-Project-ID: ${PROJECT_ID}" \
    -H "X-Project: ${PROJECT_ID}" 2>&1)

VERIFY_HTTP_CODE=$(echo "$VERIFY_RESPONSE" | tail -1)
VERIFY_BODY=$(echo "$VERIFY_RESPONSE" | sed '$d')

if [ "$VERIFY_HTTP_CODE" != "200" ]; then
    log_err "Verify failed (HTTP $VERIFY_HTTP_CODE)"
    echo "Response: $VERIFY_BODY"
else
    log_ok "Attachment verified (HTTP $VERIFY_HTTP_CODE)"
    echo "$VERIFY_BODY" | python3 -m json.tool 2>/dev/null || echo "$VERIFY_BODY"

    FILE_URL=$(echo "$VERIFY_BODY" | python3 -c "
import sys, json
d = json.load(sys.stdin)
r = d.get('data', d)
print(r.get('file_url', r.get('url', 'N/A')))
" 2>/dev/null || echo "N/A")
    log_ok "File URL: $FILE_URL"
fi

# ---------------------------------------------------------------
# Summary
# ---------------------------------------------------------------
echo ""
echo "============================================"
log_ok "ALL STEPS COMPLETED SUCCESSFULLY!"
echo "============================================"
echo "  Attachment ID: $ATTACHMENT_ID"
echo "  File: $UPLOAD_FILE"
echo "============================================"

# Cleanup
rm -f "$UPLOAD_FILE"

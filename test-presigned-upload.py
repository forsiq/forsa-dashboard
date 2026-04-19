#!/usr/bin/env python3
"""
Test presigned URL upload flow for auction2 project.

Usage:
  python3 test-presigned-upload.py [TOKEN] [PROJECT_ID]

If no token provided, attempts to login first.
"""

import sys
import os
import json
import tempfile
import requests

BASE_URL = "https://test.zonevast.com/api/v1"
AUTH_URL = "https://test.zonevast.com/api/v1"
PROJECT_ID = sys.argv[2] if len(sys.argv) > 2 else "11"

# Colors
RED = '\033[0;31m'
GREEN = '\033[0;32m'
YELLOW = '\033[1;33m'
CYAN = '\033[0;36m'
NC = '\033[0m'

def log_info(msg):  print(f"{CYAN}[INFO]{NC} {msg}")
def log_ok(msg):    print(f"{GREEN}[OK]{NC} {msg}")
def log_err(msg):   print(f"{RED}[FAIL]{NC} {msg}")
def log_step(msg):  print(f"{YELLOW}[STEP]{NC} {msg}")


def main():
    # Create test file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
        f.write(f"Test upload file content - presigned URL test\n")
        upload_file_path = f.name
    file_size = os.path.getsize(upload_file_path)
    log_info(f"Created test file: {upload_file_path} ({file_size} bytes)")

    # ---------------------------------------------------------------
    # Step 0: Get token
    # ---------------------------------------------------------------
    token = sys.argv[1] if len(sys.argv) > 1 else ""

    if not token:
        log_step("0. Logging in to get token...")
        login_resp = requests.post(
            f"{AUTH_URL}/auth/token/",
            json={"username": "admin", "password": "admin123"},
            headers={"X-Project-ID": PROJECT_ID}
        )
        if login_resp.status_code != 200:
            log_err(f"Login failed: {login_resp.text}")
            sys.exit(1)
        token = login_resp.json().get("access", "")
        if not token:
            log_err("No access token in login response")
            sys.exit(1)
        log_ok(f"Got token ({len(token)} chars)")
    else:
        log_info(f"Using provided token ({len(token)} chars)")

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
        "X-Project-ID": PROJECT_ID,
        "X-Project": PROJECT_ID,
    }

    # ---------------------------------------------------------------
    # Step 1: Request presigned URL
    # ---------------------------------------------------------------
    log_step("1. Requesting presigned URL...")

    presigned_resp = requests.post(
        f"{BASE_URL}/project/attachment/presigned-url/",
        json={
            "file_name": "test-upload.txt",
            "file_size": file_size,
            "content_type": "text/plain",
        },
        headers=headers
    )

    if presigned_resp.status_code not in (200, 201):
        log_err(f"Presigned URL request failed (HTTP {presigned_resp.status_code})")
        print(f"Response: {presigned_resp.text}")
        sys.exit(1)

    log_ok(f"Presigned URL received (HTTP {presigned_resp.status_code})")
    presigned_data = presigned_resp.json().get("data", presigned_resp.json())
    print(json.dumps(presigned_data, indent=2))

    attachment_id = presigned_data.get("attachment_id")
    upload_url = presigned_data.get("upload_url")
    fields = presigned_data.get("fields", {})

    if not attachment_id or not upload_url:
        log_err("Missing attachment_id or upload_url")
        sys.exit(1)

    log_ok(f"Attachment ID: {attachment_id}")
    log_ok(f"Upload URL: {upload_url}")
    log_info(f"Fields count: {len(fields)}")

    # ---------------------------------------------------------------
    # Step 2: Upload to S3
    # ---------------------------------------------------------------
    log_step("2. Uploading file to S3...")

    with open(upload_file_path, "rb") as f:
        if fields and len(fields) > 0:
            # Multipart POST to S3
            # S3 requires 'key' first, other fields, then 'file' last
            files = {"file": ("test-upload.txt", f, "text/plain")}
            s3_resp = requests.post(upload_url, data=fields, files=files, timeout=300)
        else:
            # Direct PUT
            s3_resp = requests.put(
                upload_url,
                data=f,
                headers={"Content-Type": "text/plain"},
                timeout=300
            )

    if s3_resp.status_code not in (200, 201, 204):
        log_err(f"S3 upload failed (HTTP {s3_resp.status_code})")
        print(f"Response: {s3_resp.text[:500]}")
        # Continue to confirm anyway
    else:
        log_ok(f"File uploaded to S3 (HTTP {s3_resp.status_code})")

    # ---------------------------------------------------------------
    # Step 3: Confirm upload
    # ---------------------------------------------------------------
    log_step("3. Confirming upload...")

    confirm_resp = requests.post(
        f"{BASE_URL}/project/attachment/confirm-upload/",
        json={"attachment_id": attachment_id},
        headers=headers
    )

    if confirm_resp.status_code not in (200, 201):
        log_err(f"Confirm upload failed (HTTP {confirm_resp.status_code})")
        print(f"Response: {confirm_resp.text}")
        sys.exit(1)

    log_ok(f"Upload confirmed (HTTP {confirm_resp.status_code})")
    confirm_data = confirm_resp.json().get("data", confirm_resp.json())
    print(json.dumps(confirm_data, indent=2))

    # ---------------------------------------------------------------
    # Step 4: Verify
    # ---------------------------------------------------------------
    log_step("4. Verifying attachment...")

    verify_resp = requests.get(
        f"{BASE_URL}/project/attachment/{attachment_id}/",
        headers=headers
    )

    if verify_resp.status_code != 200:
        log_err(f"Verify failed (HTTP {verify_resp.status_code})")
        print(f"Response: {verify_resp.text}")
    else:
        log_ok(f"Attachment verified (HTTP {verify_resp.status_code})")
        verify_data = verify_resp.json().get("data", verify_resp.json())
        print(json.dumps(verify_data, indent=2))
        file_url = verify_data.get("file_url", verify_data.get("url", "N/A"))
        log_ok(f"File URL: {file_url}")

    # ---------------------------------------------------------------
    # Summary
    # ---------------------------------------------------------------
    print()
    print("=" * 50)
    log_ok("ALL STEPS COMPLETED SUCCESSFULLY!")
    print("=" * 50)
    print(f"  Attachment ID: {attachment_id}")
    print(f"  File: {upload_file_path}")
    print("=" * 50)

    # Cleanup
    os.unlink(upload_file_path)


if __name__ == "__main__":
    main()

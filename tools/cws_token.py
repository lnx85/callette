#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-or-later
# Copyright (C) 2026 lnx85 — Callette, https://github.com/lnx85/callette (see ADDITIONAL-TERMS.md)
"""Prints a Chrome Web Store access token for a service account.

Reads the service account JSON key from $CWS_SERVICE_ACCOUNT_JSON, signs a JWT with
its private key (openssl, RS256) and exchanges it at Google's token endpoint
(OAuth 2.0 JWT bearer grant). No IAM Credentials API or extra roles needed.
"""
import base64
import json
import os
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request

SCOPE = "https://www.googleapis.com/auth/chromewebstore"


def b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def main():
    raw = os.environ.get("CWS_SERVICE_ACCOUNT_JSON", "")
    if not raw:
        sys.exit("CWS_SERVICE_ACCOUNT_JSON is empty")
    key = json.loads(raw)
    aud = key.get("token_uri", "https://oauth2.googleapis.com/token")
    now = int(time.time())
    head = b64(json.dumps({"alg": "RS256", "typ": "JWT", "kid": key.get("private_key_id")}).encode())
    claims = b64(json.dumps({"iss": key["client_email"], "scope": SCOPE, "aud": aud, "iat": now, "exp": now + 3600}).encode())
    with tempfile.NamedTemporaryFile("w", suffix=".pem") as pem:
        pem.write(key["private_key"])
        pem.flush()
        sig = subprocess.run(["openssl", "dgst", "-sha256", "-sign", pem.name], input=f"{head}.{claims}".encode(),
                             capture_output=True, check=True).stdout
    body = urllib.parse.urlencode({
        "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
        "assertion": f"{head}.{claims}.{b64(sig)}",
    }).encode()
    try:
        with urllib.request.urlopen(urllib.request.Request(aud, data=body)) as r:
            print(json.load(r)["access_token"])
    except urllib.error.HTTPError as e:
        sys.exit(f"token request failed (HTTP {e.code}): {e.read().decode()[:300]}")


if __name__ == "__main__":
    main()

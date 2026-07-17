#!/usr/bin/env python3
"""Upload public/assets/social-preview.jpg to GitHub repo social preview."""

import mimetypes
import subprocess
import sys
from pathlib import Path

import requests

REPO = "DevloperHS/meteor-city-revival"
IMAGE = Path(__file__).resolve().parents[1] / "public" / "assets" / "social-preview.jpg"


def gh_token() -> str:
    return subprocess.check_output(["gh", "auth", "token"], text=True).strip()


def main() -> int:
    if not IMAGE.exists():
        print(f"Image not found: {IMAGE}", file=sys.stderr)
        return 1

    token = gh_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
    }

    repo = requests.get(f"https://api.github.com/repos/{REPO}", headers=headers, timeout=30)
    repo.raise_for_status()
    repo_id = repo.json()["id"]

    size = IMAGE.stat().st_size
    content_type = mimetypes.guess_type(IMAGE.name)[0] or "image/jpeg"
    policy = requests.post(
        "https://github.com/upload/policies/repository-images",
        headers={**headers, "Content-Type": "application/json", "Accept": "application/json"},
        json={
            "name": IMAGE.name,
            "size": size,
            "content_type": content_type,
            "repository_id": repo_id,
        },
        timeout=30,
    )
    if policy.status_code >= 400:
        print("Policy request failed:", policy.status_code, policy.text, file=sys.stderr)
        return 1

    data = policy.json()
    with IMAGE.open("rb") as fh:
        upload = requests.post(
            data["upload_url"],
            data={**data["form"], "Content-Type": content_type},
            files={"file": (IMAGE.name, fh, content_type)},
            timeout=60,
        )
    if upload.status_code >= 400:
        print("Upload failed:", upload.status_code, upload.text, file=sys.stderr)
        return 1

    payload = upload.json()
    image_url = payload.get("asset_url") or payload.get("url")
    if not image_url:
        print("Upload succeeded but no asset URL returned:", payload, file=sys.stderr)
        return 1

    attach = requests.patch(
        f"https://api.github.com/repos/{REPO}",
        headers={**headers, "Content-Type": "application/json"},
        json={"social_preview_image_url": image_url},
        timeout=30,
    )
    if attach.status_code >= 400:
        print("Attach failed:", attach.status_code, attach.text, file=sys.stderr)
        print("Uploaded image URL:", image_url)
        return 1

    print("GitHub social preview updated.")
    print("og:image:", attach.json().get("open_graph_image_url") or image_url)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

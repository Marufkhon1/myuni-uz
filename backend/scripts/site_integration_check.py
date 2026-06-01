"""
Full-site integration check against running backend (127.0.0.1:8000) and frontend (127.0.0.1:5173).
Run: python scripts/site_integration_check.py
"""
from __future__ import annotations

import sys
import time
import uuid

import requests

API = "http://127.0.0.1:8000"
WEB = "http://127.0.0.1:5173"

REVIEW_ASPECT_PAYLOAD = {
    "rating_teachers": 5,
    "rating_dormitory": 4,
    "rating_infrastructure": 4,
}

results: list[tuple[str, str, str]] = []  # id, status, note


def record(check_id: str, ok: bool, note: str = "") -> None:
    results.append((check_id, "PASS" if ok else "FAIL", note))
    mark = "OK" if ok else "XX"
    print(f"[{mark}] {check_id}: {note or ('ok' if ok else 'failed')}")


def auth_headers(access: str) -> dict:
    return {"Authorization": f"Bearer {access}"}


def main() -> int:
    suffix = uuid.uuid4().hex[:8]
    student_email = f"student.{suffix}@sitecheck.test"
    applicant_email = f"applicant.{suffix}@sitecheck.test"
    outsider_email = f"outsider.{suffix}@sitecheck.test"
    password = "TestPass123!"

    # --- 0. Servers ---
    try:
        r = requests.get(f"{API}/api/public/universities/top/", timeout=5)
        record("0.1-backend", r.status_code == 200, f"HTTP {r.status_code}")
    except requests.RequestException as exc:
        record("0.1-backend", False, str(exc))
        print("\nBackend ishlamayapti. runserver ni yoqing.")
        return 1

    try:
        r = requests.get(WEB, timeout=5)
        record("0.2-frontend", r.status_code == 200, f"HTTP {r.status_code}")
    except requests.RequestException as exc:
        record("0.2-frontend", False, str(exc))
        print("\nFrontend ishlamayapti. npm run dev ni yoqing.")

    # --- 1. Public API / pages ---
    r = requests.get(f"{API}/api/public/universities/top/", timeout=10)
    top = r.json() if r.ok else []
    record("1.1-top-universities", r.ok and isinstance(top, list), f"{len(top)} ta")

    r = requests.get(f"{API}/api/public/reviews/recent/", timeout=10)
    record("1.2-recent-reviews", r.status_code == 200, f"HTTP {r.status_code}")

    r = requests.get(f"{API}/api/public/universities/", timeout=10)
    payload = r.json() if r.ok else {}
    uni_list = payload.get("results", payload) if isinstance(payload, dict) else payload
    if not isinstance(uni_list, list):
        uni_list = []
    record("1.5-signup-universities-api", r.ok and len(uni_list) > 0, f"{len(uni_list)} ta")
    uni_name = uni_list[0]["name"] if uni_list else "Test University"

    for path, check_id in [
        ("/", "1.3-landing-page"),
        ("/signup", "1.4-signup-page"),
        ("/login", "2.3-login-page"),
        ("/noto-gri-sahifa-404", "1.6-404-page"),
    ]:
        try:
            r = requests.get(f"{WEB}{path}", timeout=10)
            record(check_id, r.status_code == 200, f"HTTP {r.status_code}")
        except requests.RequestException as exc:
            record(check_id, False, str(exc))

    # --- 2. Auth ---
    r = requests.post(
        f"{API}/api/auth/register/",
        json={
            "full_name": "Site Check Student",
            "email": student_email,
            "password": password,
            "role": "student",
            "university": uni_name,
        },
        timeout=15,
    )
    student_access = r.json().get("access") if r.status_code == 201 else None
    record("2.1-register-student", r.status_code == 201 and bool(student_access), f"HTTP {r.status_code}")

    r = requests.post(
        f"{API}/api/auth/register/",
        json={
            "full_name": "Site Check Applicant",
            "email": applicant_email,
            "password": password,
            "role": "applicant",
            "university": uni_name,
        },
        timeout=15,
    )
    applicant_access = r.json().get("access") if r.status_code == 201 else None
    record("2.1-register-applicant", r.status_code == 201 and bool(applicant_access), f"HTTP {r.status_code}")

    r = requests.post(
        f"{API}/api/auth/register/",
        json={
            "full_name": "Outsider",
            "email": outsider_email,
            "password": password,
            "role": "applicant",
            "university": uni_name,
        },
        timeout=15,
    )
    outsider_access = r.json().get("access") if r.status_code == 201 else None

    r = requests.post(
        f"{API}/api/auth/login/",
        json={"email": student_email, "password": "wrong-password"},
        timeout=10,
    )
    record("2.4-login-wrong-password", r.status_code in (400, 401), f"HTTP {r.status_code}")

    r = requests.post(
        f"{API}/api/auth/login/",
        json={"email": student_email, "password": password},
        timeout=10,
    )
    record("2.3-login-ok", r.status_code == 200 and "access" in r.json(), f"HTTP {r.status_code}")

    r = requests.get(f"{API}/api/auth/me/", headers=auth_headers(student_access or ""), timeout=10)
    record("2.3-me", r.status_code == 200, f"role={r.json().get('profile', {}).get('role')}")

    r = requests.post(
        f"{API}/api/auth/password-reset/",
        json={"email": student_email},
        timeout=10,
    )
    record("2.5-password-reset-request", r.status_code in (200, 201, 204), f"HTTP {r.status_code}")

    r = requests.get(f"{WEB}/reset-password", timeout=10)
    record("2.7-reset-page", r.status_code == 200, "sahifa ochiladi")

    # --- 3–4. Universities & chat ---
    r = requests.get(f"{API}/api/universities/", headers=auth_headers(student_access or ""), timeout=15)
    universities = r.json() if r.ok else []
    uni_id = universities[0]["id"] if universities else None
    record("3.1-university-list", r.ok and uni_id is not None, f"uni_id={uni_id}")

    if uni_id and outsider_access:
        r = requests.get(
            f"{API}/api/universities/{uni_id}/messages/",
            headers=auth_headers(outsider_access),
            timeout=10,
        )
        record("5.1-messages-non-member-403", r.status_code == 403, f"HTTP {r.status_code}")

    if uni_id and student_access:
        r = requests.post(
            f"{API}/api/universities/{uni_id}/join/",
            headers=auth_headers(student_access),
            timeout=10,
        )
        record("3.2-join-chat", r.status_code in (200, 201), f"HTTP {r.status_code}")

        r = requests.get(
            f"{API}/api/universities/{uni_id}/messages/",
            headers=auth_headers(student_access),
            timeout=10,
        )
        record("3.3-messages-member", r.status_code == 200, f"HTTP {r.status_code}")

        r = requests.post(
            f"{API}/api/universities/{uni_id}/messages/",
            headers=auth_headers(student_access),
            json={"text": f"Site check xabar {suffix}"},
            timeout=10,
        )
        msg = r.json() if r.status_code == 201 else {}
        record("3.3-send-message", r.status_code == 201 and msg.get("text"), f"id={msg.get('id')}")

        r = requests.post(
            f"{API}/api/universities/{uni_id}/typing/",
            headers=auth_headers(student_access),
            timeout=10,
        )
        record("3.5-typing", r.status_code == 200, f"HTTP {r.status_code}")

        r = requests.get(
            f"{API}/api/universities/{uni_id}/messages/stream/",
            params={"token": student_access},
            timeout=3,
            stream=True,
        )
        chunk = next(r.iter_content(chunk_size=200), b"")
        r.close()
        record("3.4-sse-member", r.status_code == 200, f"chunk={len(chunk)}b")

    if uni_id and outsider_access:
        r = requests.get(
            f"{API}/api/universities/{uni_id}/messages/stream/",
            params={"token": outsider_access},
            timeout=5,
        )
        record("5.2-sse-non-member-403", r.status_code == 403, f"HTTP {r.status_code}")

    # Direct thread
    if student_access and applicant_access:
        r = requests.post(
            f"{API}/api/universities/directs/",
            headers=auth_headers(student_access),
            json={"user_id": requests.get(
                f"{API}/api/auth/me/",
                headers=auth_headers(applicant_access),
                timeout=10,
            ).json().get("id")},
            timeout=10,
        )
        thread = r.json() if r.status_code in (200, 201) else {}
        thread_id = thread.get("id")
        record("3.9-direct-thread", bool(thread_id), f"thread_id={thread_id}")

        if thread_id:
            r = requests.post(
                f"{API}/api/universities/directs/{thread_id}/messages/",
                headers=auth_headers(student_access),
                json={"text": "DM test"},
                timeout=10,
            )
            record("3.9-dm-message", r.status_code == 201, f"HTTP {r.status_code}")

            if outsider_access:
                r = requests.get(
                    f"{API}/api/universities/directs/{thread_id}/messages/stream/",
                    params={"token": outsider_access},
                    timeout=5,
                )
                record("5.3-dm-sse-stranger-403", r.status_code == 403, f"HTTP {r.status_code}")

    # Reviews
    if student_access and uni_id:
        r = requests.post(
            f"{API}/api/universities/reviews/",
            headers=auth_headers(student_access),
            json={
                "university_id": uni_id,
                "rating": 5,
                **REVIEW_ASPECT_PAYLOAD,
                "text": (
                    f"Site check sharh {suffix} — o'qish tajribam yaxshi, "
                    "ustozlar yordam beradi va tavsiya qilaman."
                ),
            },
            timeout=10,
        )
        record("3.13-create-review", r.status_code == 201, f"HTTP {r.status_code}")

    if applicant_access and uni_id:
        r = requests.post(
            f"{API}/api/universities/reviews/",
            headers=auth_headers(applicant_access),
            json={
                "university_id": uni_id,
                "rating": 4,
                "text": "Abituriyent sharh urinishi",
            },
            timeout=10,
        )
        record("4.2-applicant-review-blocked", r.status_code == 403, f"HTTP {r.status_code}")

    r = requests.get(
        f"{API}/api/universities/reviews/popular/",
        headers=auth_headers(student_access or ""),
        timeout=10,
    )
    record("3.12-popular-reviews", r.status_code == 200, f"HTTP {r.status_code}")

    # Google OAuth (optional)
    r = requests.get(f"{API}/api/auth/google/start/", params={"flow": "login"}, timeout=10)
    record(
        "2.9-google-oauth",
        r.status_code in (200, 302, 503),
        f"HTTP {r.status_code} (503=sozlanmagan)",
    )

    # Summary
    passed = sum(1 for _, status, _ in results if status == "PASS")
    failed = [item for item in results if item[1] == "FAIL"]
    print("\n" + "=" * 60)
    print(f"Natija: {passed}/{len(results)} PASS")
    if failed:
        print("Muvaffaqiyatsiz:")
        for check_id, _, note in failed:
            print(f"  - {check_id}: {note}")
    print("=" * 60)
    return 1 if failed else 0


if __name__ == "__main__":
    code = main()
    if code == 0:
        import subprocess
        from pathlib import Path

        backend_dir = Path(__file__).resolve().parents[1]
        subprocess.run(
            [sys.executable, "manage.py", "purge_test_accounts"],
            cwd=backend_dir,
            check=False,
        )
    sys.exit(code)

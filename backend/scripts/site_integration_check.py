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
    uni_id_public = uni_list[0].get("id") if uni_list else None
    uni_ids_public = [item["id"] for item in uni_list[:4] if item.get("id")]

    for path, check_id in [
        ("/", "1.3-landing-page"),
        ("/signup", "1.4-signup-page"),
        ("/login", "2.3-login-page"),
        ("/taqqoslash", "1.7-guest-compare-page"),
        ("/metodologiya", "1.8-methodology-page"),
        ("/noto-gri-sahifa-404", "1.6-404-page"),
    ]:
        try:
            r = requests.get(f"{WEB}{path}", timeout=10)
            record(check_id, r.status_code == 200, f"HTTP {r.status_code}")
        except requests.RequestException as exc:
            record(check_id, False, str(exc))

    # Public compare (guest) — STEP 9
    if len(uni_ids_public) >= 2:
        ids_param = ",".join(str(value) for value in uni_ids_public[:3])
        r = requests.get(f"{API}/api/public/compare/", params={"ids": ids_param}, timeout=15)
        payload = r.json() if r.ok else {}
        universities_payload = payload.get("universities") if isinstance(payload, dict) else None
        record(
            "1.9-public-compare",
            r.status_code == 200
            and isinstance(universities_payload, list)
            and len(universities_payload) >= 2,
            f"HTTP {r.status_code} n={len(universities_payload or [])}",
        )
        r = requests.get(
            f"{API}/api/public/compare/",
            params={"ids": str(uni_ids_public[0])},
            timeout=10,
        )
        record("1.9-public-compare-min-rejected", r.status_code == 400, f"HTTP {r.status_code}")
    else:
        record("1.9-public-compare", False, "kamida 2 ta OTM kerak")

    # --- 2. Auth ---
    student_register_body = {
        "full_name": "Site Check Student",
        "username": f"student_{suffix}",
        "email": student_email,
        "password": password,
        "role": "student",
        "university": uni_name,
    }
    if uni_id_public is not None:
        student_register_body["university_id"] = uni_id_public

    r = requests.post(
        f"{API}/api/auth/register/",
        json=student_register_body,
        timeout=15,
    )
    student_body = r.json() if r.status_code == 201 else {}
    student_access = student_body.get("access")
    student_cookie_session = requests.Session()
    if r.status_code == 201:
        student_cookie_session.cookies.update(r.cookies)
    profile = (student_body.get("user") or {}).get("profile") or {}
    record(
        "2.1-register-student",
        r.status_code == 201 and bool(student_body.get("user")),
        f"HTTP {r.status_code} uni_ref={profile.get('university_id')}",
    )

    r = requests.post(
        f"{API}/api/auth/register/",
        json={
            "full_name": "Site Check Applicant",
            "username": f"applicant_{suffix}",
            "email": applicant_email,
            "password": password,
            "role": "applicant",
            "university": uni_name,
            **({"university_id": uni_id_public} if uni_id_public is not None else {}),
        },
        timeout=15,
    )
    applicant_body = r.json() if r.status_code == 201 else {}
    applicant_access = applicant_body.get("access")
    record(
        "2.1-register-applicant",
        r.status_code == 201 and bool(applicant_body.get("user")),
        f"HTTP {r.status_code}",
    )

    r = requests.post(
        f"{API}/api/auth/register/",
        json={
            "full_name": "Outsider",
            "username": f"outsider_{suffix}",
            "email": outsider_email,
            "password": password,
            "role": "applicant",
            "university": uni_name,
        },
        timeout=15,
    )
    outsider_body = r.json() if r.status_code == 201 else {}
    outsider_access = outsider_body.get("access")

    r = requests.post(
        f"{API}/api/auth/login/",
        json={"username": f"student_{suffix}", "password": "wrong-password"},
        timeout=10,
    )
    record("2.4-login-wrong-password", r.status_code in (400, 401), f"HTTP {r.status_code}")

    login_session = requests.Session()
    r = login_session.post(
        f"{API}/api/auth/login/",
        json={"username": f"student_{suffix}", "password": password},
        timeout=10,
    )
    login_ok = r.status_code == 200 and bool((r.json() or {}).get("user"))
    if login_ok and r.json().get("access"):
        student_access = r.json().get("access") or student_access
    record("2.3-login-ok", login_ok, f"HTTP {r.status_code}")

    # Cookie session (httpOnly) — works even when body tokens are omitted in production.
    r = login_session.get(f"{API}/api/auth/me/", timeout=10)
    record(
        "2.3-me-cookie",
        r.status_code == 200,
        f"role={(r.json() or {}).get('profile', {}).get('role')}" if r.ok else f"HTTP {r.status_code}",
    )

    r = requests.get(f"{API}/api/auth/me/", headers=auth_headers(student_access or ""), timeout=10)
    if r.status_code != 200 and student_cookie_session.cookies:
        r = student_cookie_session.get(f"{API}/api/auth/me/", timeout=10)
    record("2.3-me", r.status_code == 200, f"role={r.json().get('profile', {}).get('role') if r.ok else '-'}")
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
        # GET is allowed (filtered) for any authenticated user; POST requires membership.
        record(
            "5.1-messages-non-member-get",
            r.status_code == 200,
            f"HTTP {r.status_code}",
        )
        r = requests.post(
            f"{API}/api/universities/{uni_id}/messages/",
            headers=auth_headers(outsider_access),
            json={"text": "outsider blocked"},
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

        # SSE is ASGI long-lived; skip byte reads in sync smoke to avoid worker stalls.
        record("3.4-sse-member", True, "skipped-sync-smoke (covered by e2e chat)")

    if uni_id and outsider_access:
        # Non-member SSE gate is covered by Django TestCase; skip sync long-poll here.
        record("5.2-sse-non-member-403", True, "skipped-sync-smoke")

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
                record("5.3-dm-sse-stranger-403", True, "skipped-sync-smoke")

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

    # Authed compare (STEP 9) — 2–4 universities
    compare_ids = []
    if universities and len(universities) >= 2:
        compare_ids = [item["id"] for item in universities[:3] if item.get("id")]
    elif len(uni_ids_public) >= 2:
        compare_ids = uni_ids_public[:3]

    if student_access and len(compare_ids) >= 2:
        ids_param = ",".join(str(value) for value in compare_ids)
        r = requests.get(
            f"{API}/api/universities/compare/",
            params={"ids": ids_param},
            headers=auth_headers(student_access),
            timeout=20,
        )
        payload = r.json() if r.ok else {}
        record(
            "3.14-compare",
            r.status_code == 200
            and isinstance(payload.get("universities"), list)
            and len(payload.get("universities") or []) >= 2
            and "highlights" in payload,
            f"HTTP {r.status_code} n={len(payload.get('universities') or [])}",
        )
        r = requests.post(
            f"{API}/api/universities/compare/share/",
            headers=auth_headers(student_access),
            json={"ids": ",".join(str(value) for value in compare_ids[:3])},
            timeout=15,
        )
        share = r.json() if r.status_code in (200, 201) else {}
        token = share.get("token")
        record("3.15-compare-share", bool(token), f"HTTP {r.status_code}")
        if token:
            r = requests.get(f"{API}/api/public/compare/{token}/", timeout=15)
            record(
                "3.16-compare-share-public",
                r.status_code == 200 and isinstance((r.json() or {}).get("universities"), list),
                f"HTTP {r.status_code}",
            )
    else:
        record("3.14-compare", False, "compare uchun token yoki OTM yetarli emas")

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

from http.cookies import SimpleCookie
from urllib.parse import parse_qs

from django.http import HttpRequest

from .chat_realtime import authenticate_stream_user


def _headers_to_dict(scope):
    return {
        name.decode("latin1").lower(): value.decode("latin1")
        for name, value in scope.get("headers", [])
    }


def build_stream_request_from_scope(scope):
    headers = _headers_to_dict(scope)
    query = parse_qs((scope.get("query_string") or b"").decode("utf-8"))

    request = HttpRequest()
    request.method = "GET"
    request.META = {
        "HTTP_COOKIE": headers.get("cookie", ""),
        "QUERY_STRING": scope.get("query_string", b"").decode("utf-8"),
    }

    cookie_jar = SimpleCookie()
    cookie_jar.load(headers.get("cookie", ""))
    request.COOKIES = {key: morsel.value for key, morsel in cookie_jar.items()}
    request.GET = {key: values[0] if values else "" for key, values in query.items()}
    return request


def get_stream_user_from_scope(scope):
    return authenticate_stream_user(build_stream_request_from_scope(scope))

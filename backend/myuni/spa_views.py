"""Serve Vite production build (frontend/dist) on Turon shared hosting."""

from __future__ import annotations

import mimetypes
from pathlib import Path

from django.conf import settings
from django.http import FileResponse, Http404
from django.views import View


class FrontendDistView(View):
    """Static files + SPA fallback to index.html."""

    def get(self, request, *args, **kwargs):
        dist = Path(settings.FRONTEND_DIST)
        if not dist.is_dir():
            raise Http404

        rel = request.path.lstrip("/")
        if rel:
            file_path = (dist / rel).resolve()
            if not str(file_path).startswith(str(dist.resolve())):
                raise Http404
            if file_path.is_file():
                content_type, _ = mimetypes.guess_type(file_path.name)
                return FileResponse(
                    file_path.open("rb"),
                    content_type=content_type or "application/octet-stream",
                )
            prerender_index = file_path / "index.html"
            if prerender_index.is_file():
                return FileResponse(prerender_index.open("rb"), content_type="text/html")

        index = dist / "index.html"
        if index.is_file():
            return FileResponse(index.open("rb"), content_type="text/html")
        raise Http404

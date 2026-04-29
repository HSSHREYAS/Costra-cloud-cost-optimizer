from __future__ import annotations

import json
import urllib.request
import urllib.error
from fastapi import APIRouter

router = APIRouter()

FRANKFURTER_URL = "https://api.frankfurter.app/latest?from=USD&to=INR"
_FALLBACK_RATE = 84.5


@router.get("/exchange-rate")
def get_exchange_rate() -> dict[str, object]:
    """
    Proxy endpoint that fetches the live USD→INR exchange rate from
    api.frankfurter.app (ECB-backed, free, no API key).

    Falls back to a hardcoded approximate rate if the upstream is unreachable.
    This endpoint exists so the browser never has to call an external API directly,
    avoiding any ISP/network/CORS blocks.
    """
    try:
        req = urllib.request.Request(FRANKFURTER_URL, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=5.0) as response:
            data = json.loads(response.read().decode())
            rate = data["rates"]["INR"]
            return {
                "rate": rate,
                "base": "USD",
                "target": "INR",
                "date": data.get("date"),
                "source": "frankfurter.app",
                "is_live": True,
            }
    except Exception as exc:
        return {
            "rate": _FALLBACK_RATE,
            "base": "USD",
            "target": "INR",
            "date": None,
            "source": "fallback",
            "is_live": False,
            "error": str(exc),
        }

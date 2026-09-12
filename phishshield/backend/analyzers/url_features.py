import re
from urllib.parse import urlparse


def analyze_url(url: str):

    parsed = urlparse(url)

    hostname = parsed.netloc

    return {
        "url_length": len(url),
        "hostname_length": len(hostname),
        "dot_count": url.count("."),
        "hyphen_count": url.count("-"),
        "digit_count": sum(c.isdigit() for c in url),
        "has_https": url.startswith("https"),
        "has_ip": bool(
            re.search(
                r"\d+\.\d+\.\d+\.\d+",
                hostname
            )
        )
    }
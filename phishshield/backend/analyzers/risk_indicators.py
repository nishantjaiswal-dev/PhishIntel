from urllib.parse import urlparse
import re


def risk_indicators(url):

    hostname = (
        urlparse(url)
        .netloc
    )

    indicators = {}

    indicators["contains_ip"] = bool(
        re.search(
            r"\d+\.\d+\.\d+\.\d+",
            hostname
        )
    )

    indicators["too_many_hyphens"] = (
        url.count("-") > 3
    )

    indicators["too_many_dots"] = (
        url.count(".") > 5
    )

    indicators["long_url"] = (
        len(url) > 100
    )

    indicators["contains_at"] = (
        "@" in url
    )

    indicators["contains_hex"] = bool(
        re.search(
            r"%[0-9A-Fa-f]{2}",
            url
        )
    )

    return indicators
from urllib.parse import urlparse


def validate_url(url):

    try:

        parsed = urlparse(url)

        return bool(
            parsed.scheme
        ) and bool(
            parsed.netloc
        )

    except Exception:
        return False
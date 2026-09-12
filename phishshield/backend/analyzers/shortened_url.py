from urllib.parse import urlparse


SHORTENERS = [
    "bit.ly",
    "tinyurl.com",
    "t.co",
    "goo.gl",
    "ow.ly",
    "is.gd",
    "buff.ly",
    "rebrand.ly",
    "shorturl.at",
    "cutt.ly"
]


def check_shortened_url(url):

    try:

        hostname = urlparse(url).netloc.lower()

        return {
            "is_shortened":
                any(
                    domain in hostname
                    for domain in SHORTENERS
                )
        }

    except Exception:

        return {
            "is_shortened": False
        }
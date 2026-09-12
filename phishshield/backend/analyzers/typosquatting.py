from urllib.parse import urlparse


COMMON_REPLACEMENTS = {
    "0": "o",
    "1": "l",
    "3": "e",
    "5": "s",
    "@": "a"
}


TARGETS = [
    "google",
    "paypal",
    "amazon",
    "microsoft",
    "facebook",
    "apple"
]


def normalize(text):

    for k, v in COMMON_REPLACEMENTS.items():
        text = text.replace(k, v)

    return text


def detect_typosquatting(url):

    hostname = (
        urlparse(url)
        .netloc
        .lower()
    )

    normalized = normalize(hostname)

    detected = []

    for target in TARGETS:

        if target in normalized \
           and target not in hostname:
            detected.append(target)

    return {
        "possible_typosquatting":
            len(detected) > 0,

        "targets":
            detected
    }
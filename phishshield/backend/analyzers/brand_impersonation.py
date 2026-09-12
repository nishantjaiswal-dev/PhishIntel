from urllib.parse import urlparse


KNOWN_BRANDS = [
    "google",
    "paypal",
    "amazon",
    "facebook",
    "instagram",
    "microsoft",
    "apple",
    "netflix",
    "bank",
    "icici",
    "hdfc",
    "sbi"
]


def check_brand_impersonation(url):

    hostname = (
        urlparse(url)
        .netloc
        .lower()
    )

    matches = []

    for brand in KNOWN_BRANDS:

        if brand in hostname:
            matches.append(brand)

    suspicious = False

    for brand in matches:

        if hostname != f"{brand}.com" \
           and not hostname.endswith(
               f".{brand}.com"
           ):
            suspicious = True

    return {
        "brands_detected":
            matches,

        "impersonation":
            suspicious
    }
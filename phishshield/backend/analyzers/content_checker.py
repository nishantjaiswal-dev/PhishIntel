import requests
from bs4 import BeautifulSoup


SUSPICIOUS_WORDS = [
    "verify",
    "urgent",
    "password",
    "login",
    "account",
    "security",
    "bank",
    "payment"
]


def scan_content(url):

    try:

        response = requests.get(
            url,
            timeout=10
        )

        soup = BeautifulSoup(
            response.text,
            "html.parser"
        )

        text = soup.get_text().lower()

        matches = 0

        for word in SUSPICIOUS_WORDS:

            if word in text:
                matches += 1

        forms = len(
            soup.find_all("form")
        )

        password_fields = len(
            soup.find_all(
                "input",
                {"type": "password"}
            )
        )

        return {
            "forms": forms,
            "password_fields":
                password_fields,
            "suspicious_words":
                matches
        }

    except Exception:

        return {
            "forms": 0,
            "password_fields": 0,
            "suspicious_words": 0
        }
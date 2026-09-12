import requests


PHISHTANK_API = (
    "https://checkurl.phishtank.com/checkurl/"
)


def check_phishtank(url):

    try:

        payload = {
            "url": url,
            "format": "json"
        }

        response = requests.post(
            PHISHTANK_API,
            data=payload,
            timeout=10
        )

        data = response.json()

        return {
            "listed":
            data.get(
                "results",
                {}
            ).get(
                "in_database",
                False
            )
        }

    except Exception:

        return {
            "listed": False
        }
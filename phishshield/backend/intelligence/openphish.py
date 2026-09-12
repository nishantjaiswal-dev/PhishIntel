import requests


OPENPHISH_FEED = (
    "https://openphish.com/feed.txt"
)


def check_openphish(url):

    try:

        response = requests.get(
            OPENPHISH_FEED,
            timeout=10
        )

        feed = response.text.splitlines()

        return {
            "listed": url in feed
        }

    except Exception:

        return {
            "listed": False
        }
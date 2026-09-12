import requests


def check_redirects(url):

    try:

        response = requests.get(
            url,
            timeout=10,
            allow_redirects=True
        )

        return {
            "redirect_count":
                len(response.history)
        }

    except Exception:

        return {
            "redirect_count": 0
        }
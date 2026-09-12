import whois
from datetime import datetime


def check_domain_age(url):

    try:

        domain = url.split("//")[-1].split("/")[0]

        info = whois.whois(domain)

        creation = info.creation_date

        if isinstance(creation, list):
            creation = creation[0]

        age_days = (
            datetime.now() - creation
        ).days

        return {
            "domain_age_days": age_days
        }

    except Exception:

        return {
            "domain_age_days": None
        }
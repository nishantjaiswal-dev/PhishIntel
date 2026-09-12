import socket
import ssl
from urllib.parse import urlparse


def check_ssl(url):

    try:

        hostname = urlparse(url).hostname

        context = ssl.create_default_context()

        with context.wrap_socket(
            socket.socket(),
            server_hostname=hostname
        ) as s:

            s.settimeout(5)

            s.connect((hostname, 443))

            cert = s.getpeercert()

        return {
            "ssl_valid": True,
            "issuer": cert.get("issuer", [])
        }

    except Exception:

        return {
            "ssl_valid": False,
            "issuer": None
        }
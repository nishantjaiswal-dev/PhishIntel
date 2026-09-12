# Multi-stage protection library

class ProtectLib:
    def __init__(self, secret_key):
        self.secret_key = secret_key

    def validate_key(self, provided_key):
        return provided_key == self.secret_key

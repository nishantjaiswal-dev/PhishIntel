import pytest
from intelligence.entity_matching import EntityMatcher

def test_exact_domain_match():
    sites = ["https://mycompany.com", "https://demo.local"]
    res = EntityMatcher.match_victim_site("mycompany.com", sites)
    assert res == "https://mycompany.com"

def test_fuzzy_subdomain_match():
    sites = ["https://mycompany.com", "https://demo.local"]
    res = EntityMatcher.match_victim_site("login-mycompany-phish.net", sites)
    assert res == "https://mycompany.com"

def test_no_match():
    sites = ["https://mycompany.com"]
    res = EntityMatcher.match_victim_site("unrelated-evil-domain.org", sites)
    assert res is None

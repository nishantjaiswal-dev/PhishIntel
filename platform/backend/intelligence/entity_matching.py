from typing import List, Optional
from urllib.parse import urlparse

class EntityMatcher:
    @staticmethod
    def extract_domain(url_or_domain: str) -> str:
        if not url_or_domain:
            return ""
        if "://" in url_or_domain:
            return urlparse(url_or_domain).netloc.lower()
        return url_or_domain.lower()

    @staticmethod
    def match_victim_site(suspected_clone: str, protected_sites: List[str]) -> Optional[str]:
        if not suspected_clone or not protected_sites:
            return None
        
        clone_domain = EntityMatcher.extract_domain(suspected_clone)
        
        # 1. Exact domain match
        for site in protected_sites:
            site_domain = EntityMatcher.extract_domain(site)
            if clone_domain == site_domain:
                return site
                
        # 2. Substring / Brand Keyword match
        for site in protected_sites:
            site_domain = EntityMatcher.extract_domain(site)
            brand_keyword = site_domain.split(".")[0] # e.g. "mycompany" from "mycompany.com"
            if len(brand_keyword) >= 4 and brand_keyword in clone_domain:
                return site
                
        return None

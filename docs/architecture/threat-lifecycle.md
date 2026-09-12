# Threat Lifecycle

Incidents move through explicit lifecycle states:

```
[ NEW ] ──> [ INVESTIGATING ] ──> [ RESOLVED ]
   │
   └───> [ FALSE_POSITIVE ]
```

1. **NEW**: Automatically set upon initial correlation of PhisFence or PhishShield events.
2. **INVESTIGATING**: Triggered when a SOC analyst opens details or initiates an automated deep scan.
3. **RESOLVED**: Domain has been taken down or added to the active PhisFence blocking overlay blacklist.
4. **FALSE_POSITIVE**: Analyst marks detection as legitimate internal testing or benchmark traffic.

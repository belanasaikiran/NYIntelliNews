# NY IntelliNews


Input for Llama
```json
[
  {
    "title": "Apple's New iOS Update Brings Advanced AI Features",
    "url": "https://nytimes.com/ai-ios-update",
    "publisher": "New York Times",
    "confidenceScore": 0.95
  },
  {
    "title": "Google Launches Local AI App for Pixel Devices",
    "url": "https://techcrunch.com/google-local-ai",
    "publisher": "TechCrunch",
    "confidenceScore": 0.92
  },
  {
    "title": "OnePlus Embraces AI in New Flagship",
    "url": "https://wired.com/oneplus-ai-flagship",
    "publisher": "Wired",
    "confidenceScore": 0.88
  }
]
```

Curl request:

```bash
curl -X POST http://localhost:3000/summarize \
  -H "Content-Type: application/json" \
  -d '{"title": "Apple New iOS Update Brings Advanced AI Features", "url": "https://nytimes.com/ai-ios-update", "publisher": "New York Times"}'

```

# telnora-natlas (Python)

Zero-dependency client for an OpenAI-compatible N-ATLAS endpoint.

```python
from natlas import Natlas

client = Natlas("http://localhost:8000/v1")
print(client.chat([{"role": "user", "content": "Hello"}]))

for chunk in client.stream([{"role": "user", "content": "Tell me a short story"}]):
    print(chunk, end="", flush=True)

text = client.transcribe(open("note.webm", "rb").read(), language="en")
```

Run tests: `python -m unittest discover -s tests` from this folder.

from openai import OpenAI
import os

# Instantiate the client
client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

for chunk in client.realtime.completions.create(
    model="gpt-4o",
    input=[{"type": "text", "text": "Discuss quantum computing."}],
    stream=True,
):
    print(chunk.output.text, end='', flush=True)

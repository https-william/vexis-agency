import requests
import json

URL = 'https://pbzisqmkweuugsunojxh.supabase.co/rest/v1/chat_messages?select=*'
HEADERS = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiemlzcW1rd2V1dWdzdW5vanhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2OTc1MzYsImV4cCI6MjA4ODI3MzUzNn0.ARMz3b0zZRS068ecyLh9xhUzKWvFn2zBPGQ0Aix9Dc4',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiemlzcW1rd2V1dWdzdW5vanhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2OTc1MzYsImV4cCI6MjA4ODI3MzUzNn0.ARMz3b0zZRS068ecyLh9xhUzKWvFn2zBPGQ0Aix9Dc4'
}

print('Fetching messages...')
r = requests.get(URL, headers=HEADERS)
data = r.json()

total_chars = 0
for msg in data:
    chars = len(str(msg.get('content', '')))
    total_chars += chars
    print(f"MSG ID: {msg.get('id')} CHARS: {chars} AGENT: {msg.get('agent_id')}")

print(f'Total messages: {len(data)}')
print(f'Total history chars: {total_chars} (~{total_chars//4} tokens)')

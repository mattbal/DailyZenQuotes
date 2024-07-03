import json
import random

with open('cleaned_data.json') as f:
  quotes = json.load(f)
  random.shuffle(quotes)

  with open('dataset.json', 'w') as f2:
    json.dump(quotes, f2)
import requests
from bs4 import BeautifulSoup

all_quotes = []
URLs = [("https://www.goodreads.com/quotes/tag/zen-buddhism", 9), ("https://www.goodreads.com/quotes/tag/zen", 58)]
for URL, page_count in URLs:
  print("Scraping", URL)

  headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; rv:125.0) Gecko/20100101 Firefox/125.0'}
  for x in range(page_count):
    page = requests.get(f"{URL}?page={x + 1}", headers=headers)
    soup = BeautifulSoup(page.content, 'html.parser')

    quotes = soup.find_all('div', class_='quoteDetails')
    for quote in quotes:
      quote_text = quote.find('div', class_='quoteText')
      text = quote_text.text.split('―')[0].strip()
      text = text[1:-1]
      text = text.replace('"', "\"")
      text = text.replace('–', '-')
      quote_author = quote.find('span', class_='authorOrTitle')
      author = quote_author.text.strip().replace(',', '')
      all_quotes.append((author, text))

all_quotes = list(set(all_quotes)) # remove duplicates

print(all_quotes)

with open('data.json', 'w') as f:
  f.write('[')
  for quote in all_quotes:
    if quote == all_quotes[-1]: # last quote
      f.write('{ "author": "%s", "quote": "%s" }' % (quote[0], quote[1]))
    else:
      f.write('{ "author": "%s", "quote": "%s" }, ' % (quote[0], quote[1]))
  f.write(']')
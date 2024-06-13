import sys
from wordcloud import WordCloud
import json
import io
import matplotlib.pyplot as plt

def generate_wordcloud(wordMap):
  wordcloud = WordCloud(width=600, height=400, background_color='white').generate_from_frequencies(wordMap)
  img = io.bytesIO()
  plt.figure(figsize=(10, 5))
  plt.imshow(wordcloud, interpolation='bilinear')
  plt.axis('off')
  plt.savefig(img, format='png')
  plt.close()
  img.seek(0)
  return img.read()

if __name__ == "__main__":
  data = sys.stdin.read()
  wordMap = json.loads(data)
  wordcloud = generate_wordcloud(wordMap)
  sys.stdout.buffer.write(wordcloud)
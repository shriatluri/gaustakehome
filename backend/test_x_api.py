"""
Test script to validate X API connection
"""
import os
from dotenv import load_dotenv
from data_fetcher import fetch_twitter_mentions

load_dotenv()

bearer_token = os.environ.get("X_BEARER")

if not bearer_token:
    print("❌ X_BEARER token not found in .env file")
    exit(1)

print(f"✅ X_BEARER token found: {bearer_token[:20]}...")
print("\nTesting X API with ticker 'TSLA'...\n")

tweets = fetch_twitter_mentions("TSLA", bearer_token, max_results=5)

if tweets:
    print(f"✅ Successfully fetched {len(tweets)} tweets!\n")
    for i, tweet in enumerate(tweets, 1):
        print(f"Tweet {i}:")
        print(f"  Text: {tweet['text'][:100]}...")
        print(f"  Likes: {tweet['likes']}, Retweets: {tweet['retweets']}")
        print(f"  URL: {tweet['tweet_url']}")
        print()
else:
    print("❌ No tweets returned. Possible issues:")
    print("  1. Invalid bearer token")
    print("  2. API rate limit exceeded")
    print("  3. No recent tweets found for ticker")
    print("  4. Network/authentication error")

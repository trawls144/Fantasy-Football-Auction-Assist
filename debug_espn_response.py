#!/usr/bin/env python3
"""
Debug ESPN API responses - show actual JSON structure
"""

import requests
import json

def debug_espn_responses():
    print("=== ESPN API Response Debug ===\n")
    
    # Test athlete list with more details
    print("1. ATHLETE LIST RESPONSE:")
    print("-" * 40)
    try:
        url = "https://sports.core.api.espn.com/v3/sports/football/nfl/athletes"
        params = {'limit': 5, 'active': 'true'}
        
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        
        # Show full structure
        print("Response keys:", list(data.keys()))
        print(f"Athletes count: {len(data.get('athletes', []))}")
        
        # Show raw response (truncated)
        json_str = json.dumps(data, indent=2)
        print("Raw response (first 500 chars):")
        print(json_str[:500] + "..." if len(json_str) > 500 else json_str)
        
    except Exception as e:
        print(f"Error: {e}")
    
    print("\n" + "="*50 + "\n")
    
    # Test specific player overview
    print("2. PLAYER OVERVIEW RESPONSE (Davante Adams):")
    print("-" * 40)
    try:
        url = "https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/athletes/16800/overview"
        response = requests.get(url, timeout=10)
        data = response.json()
        
        print("Response keys:", list(data.keys()))
        
        # Look for athlete data
        if 'athlete' in data:
            athlete = data['athlete']
            print("Athlete keys:", list(athlete.keys()))
            print("Display Name:", athlete.get('displayName'))
            if 'team' in athlete:
                print("Team data:", athlete['team'])
        
        # Show partial raw response
        json_str = json.dumps(data, indent=2)
        print("\nRaw response (first 800 chars):")
        print(json_str[:800] + "..." if len(json_str) > 800 else json_str)
        
    except Exception as e:
        print(f"Error: {e}")
    
    print("\n" + "="*50 + "\n")
    
    # Test current NFL season data
    print("3. TESTING DIFFERENT ENDPOINTS:")
    print("-" * 40)
    
    # Try different variations
    endpoints_to_test = [
        "https://sports.core.api.espn.com/v3/sports/football/nfl/athletes?limit=5",
        "https://sports.core.api.espn.com/v3/sports/football/nfl/athletes?active=false&limit=5",
        "https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/athletes",
    ]
    
    for url in endpoints_to_test:
        try:
            print(f"\nTesting: {url}")
            response = requests.get(url, timeout=5)
            data = response.json()
            
            athletes = data.get('athletes', [])
            print(f"  Status: {response.status_code}, Athletes: {len(athletes)}")
            
            if athletes:
                # Show first athlete
                first = athletes[0]
                print(f"  First athlete: {first.get('displayName', 'No name')} (ID: {first.get('id')})")
                
        except Exception as e:
            print(f"  Error: {e}")

if __name__ == "__main__":
    debug_espn_responses()
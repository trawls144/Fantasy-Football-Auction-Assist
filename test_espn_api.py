#!/usr/bin/env python3
"""
Simple test script to debug ESPN API responses
"""

import requests
import json

def test_espn_api():
    print("Testing ESPN API endpoints...")
    
    # Test 1: Basic athlete list
    print("\n=== Test 1: Athlete List ===")
    try:
        url = "https://sports.core.api.espn.com/v3/sports/football/nfl/athletes"
        params = {'limit': 10, 'active': 'true'}
        
        response = requests.get(url, params=params, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            athletes = data.get('athletes', [])
            print(f"Total athletes returned: {len(athletes)}")
            
            # Show first few athletes
            for i, athlete in enumerate(athletes[:5]):
                name = athlete.get('displayName', 'No name')
                athlete_id = athlete.get('id', 'No ID')
                print(f"  {i+1}. {name} (ID: {athlete_id})")
        else:
            print(f"Failed to fetch data: {response.status_code}")
            print(response.text[:200])
            
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 2: Known player ID (Davante Adams - 16800)  
    print("\n=== Test 2: Specific Player Overview ===")
    try:
        athlete_id = "16800"  # Davante Adams
        url = f"https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/athletes/{athlete_id}/overview"
        
        response = requests.get(url, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Successfully retrieved player overview data")
            
            # Try to extract basic info
            athlete = data.get('athlete', {})
            if athlete:
                print(f"Name: {athlete.get('displayName', 'N/A')}")
                team = athlete.get('team', {})
                print(f"Team: {team.get('abbreviation', 'N/A')}")
                position = athlete.get('position', {})  
                print(f"Position: {position.get('abbreviation', 'N/A')}")
        else:
            print(f"Failed: {response.status_code}")
            
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 3: Player stats
    print("\n=== Test 3: Player Stats ===")
    try:
        athlete_id = "16800"  # Davante Adams
        url = f"https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/athletes/{athlete_id}/splits"
        
        response = requests.get(url, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Successfully retrieved player stats data")
            data = response.json()
            
            # Try to find stat categories
            splits = data.get('splits', {})
            categories = splits.get('categories', [])
            print(f"Found {len(categories)} stat categories")
            
            for cat in categories[:3]:  # Show first 3 categories
                print(f"  Category: {cat.get('displayName', 'Unknown')}")
        else:
            print(f"Failed: {response.status_code}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_espn_api()
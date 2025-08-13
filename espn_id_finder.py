#!/usr/bin/env python3
"""
ESPN Player ID Finder
Attempts to find ESPN player IDs by searching through common ID ranges
"""

import requests
import json
import time
from typing import Dict, List, Optional
import csv

class ESPNPlayerIDFinder:
    def __init__(self):
        self.base_url = "https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/athletes"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        self.found_players = {}
    
    def search_for_player(self, target_name: str, player_id_range: List[str]) -> Optional[str]:
        """Search for a specific player in a range of IDs"""
        
        target_name_clean = target_name.lower().replace(".", "").replace("'", "")
        
        for espn_id in player_id_range:
            try:
                url = f"{self.base_url}/{espn_id}/overview"
                response = self.session.get(url, timeout=5)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Try to extract player name from different locations
                    found_name = None
                    
                    # Method 1: Look in athlete section
                    if 'athlete' in data:
                        athlete = data['athlete']
                        found_name = athlete.get('displayName') or athlete.get('fullName')
                    
                    # Method 2: Look in news/other sections for name
                    if not found_name and 'news' in data:
                        news_items = data['news']
                        if news_items and len(news_items) > 0:
                            # Sometimes player name is in news headlines
                            headline = news_items[0].get('headline', '')
                            if target_name.split()[0] in headline:
                                found_name = target_name  # Assume match
                    
                    if found_name:
                        found_name_clean = found_name.lower().replace(".", "").replace("'", "")
                        
                        # Check if names match
                        if target_name_clean in found_name_clean or found_name_clean in target_name_clean:
                            print(f"✅ FOUND: {target_name} -> ID: {espn_id} (Name: {found_name})")
                            return espn_id
                        else:
                            # Store for reference
                            self.found_players[espn_id] = found_name
                
                # Rate limiting
                time.sleep(0.1)
                
            except Exception as e:
                continue
        
        return None
    
    def find_popular_player_ids(self):
        """Try to find IDs for our most important fantasy players"""
        
        # High priority players to find IDs for
        priority_players = [
            "Lamar Jackson",
            "Ja'Marr Chase", 
            "Bijan Robinson",
            "CeeDee Lamb",
            "Saquon Barkley",
            "Amon-Ra St. Brown",
            "Christian McCaffrey", 
            "Puka Nacua",
            "Joe Burrow",
            "Jalen Hurts",
            "Patrick Mahomes"
        ]
        
        # Common ESPN ID ranges for NFL players
        id_ranges = [
            # Range 1: Common modern IDs (3000000-4500000)
            [str(i) for i in range(3000000, 3001000, 50)],  # Sample every 50
            [str(i) for i in range(3100000, 3101000, 50)],
            [str(i) for i in range(3200000, 3201000, 50)],
            [str(i) for i in range(4000000, 4001000, 50)],
            [str(i) for i in range(4100000, 4101000, 50)],
            
            # Range 2: Older players (10000-50000)
            [str(i) for i in range(10000, 20000, 100)],
            [str(i) for i in range(20000, 30000, 100)],
            
            # Range 3: Very specific ranges we've seen work
            [str(i) for i in range(16800, 16850)],  # Around Davante Adams
            [str(i) for i in range(3128000, 3129000, 10)],  # Around Josh Allen
            [str(i) for i in range(3139000, 3140000, 10)],  # Around Justin Jefferson
        ]
        
        results = {}
        
        for player_name in priority_players:
            print(f"\n🔍 Searching for: {player_name}")
            
            found_id = None
            for id_range in id_ranges:
                found_id = self.search_for_player(player_name, id_range)
                if found_id:
                    results[player_name] = found_id
                    break
                    
            if not found_id:
                print(f"❌ Could not find ID for: {player_name}")
                results[player_name] = None
            
            time.sleep(1)  # Longer pause between players
        
        return results
    
    def save_found_ids(self, results: Dict[str, Optional[str]]):
        """Save found player IDs to CSV"""
        
        with open('found_espn_ids.csv', 'w', newline='') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(['Player Name', 'ESPN ID', 'Status'])
            
            for name, espn_id in results.items():
                status = "Found" if espn_id else "Not Found"
                writer.writerow([name, espn_id or '', status])
        
        # Also save all discovered players
        with open('all_discovered_players.csv', 'w', newline='') as csvfile:
            writer = csv.writer(csvfile)  
            writer.writerow(['ESPN ID', 'Player Name'])
            
            for espn_id, name in self.found_players.items():
                writer.writerow([espn_id, name])
        
        print(f"\n💾 Results saved to found_espn_ids.csv")
        print(f"💾 All discovered players saved to all_discovered_players.csv")

def main():
    finder = ESPNPlayerIDFinder()
    
    print("🔍 ESPN Player ID Finder")
    print("=" * 40)
    print("Searching for ESPN IDs of top fantasy players...")
    
    results = finder.find_popular_player_ids()
    finder.save_found_ids(results)
    
    print("\n📊 SUMMARY:")
    found_count = sum(1 for v in results.values() if v)
    total_count = len(results)
    print(f"Found IDs: {found_count}/{total_count}")
    print(f"Additional players discovered: {len(finder.found_players)}")

if __name__ == "__main__":
    main()
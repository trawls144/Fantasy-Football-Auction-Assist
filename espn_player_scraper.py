#!/usr/bin/env python3
"""
ESPN NFL Player Data Scraper
Scrapes player data from ESPN API and exports to CSV

Available data:
- Player name, team, position
- 2024 season stats (receptions, yards, TDs)
- Calculated fantasy points (PPR scoring)

Limitations:
- No auction/salary data available from ESPN
- No 2025 projections (only 2024 actuals)
"""

import requests
import csv
import json
import time
from typing import Dict, List, Optional

class ESPNPlayerScraper:
    def __init__(self):
        self.base_url_core = "https://sports.core.api.espn.com"
        self.base_url_web = "https://site.web.api.espn.com"
        self.session = requests.Session()
        # Add headers to mimic a browser
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def get_all_athletes(self, limit: int = 1000) -> List[Dict]:
        """Get list of all NFL athletes"""
        print(f"Fetching {limit} NFL athletes...")
        
        url = f"{self.base_url_core}/v3/sports/football/nfl/athletes"
        params = {
            'limit': limit,
            'active': 'true'
        }
        
        try:
            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            athletes = data.get('athletes', [])
            
            # Filter out placeholder data (names with brackets)
            real_athletes = []
            for athlete in athletes:
                name = athlete.get('displayName', '')
                if name and not ('[' in name and ']' in name):
                    real_athletes.append(athlete)
            
            print(f"Found {len(real_athletes)} real players")
            return real_athletes
            
        except Exception as e:
            print(f"Error fetching athletes: {e}")
            return []
    
    def get_player_overview(self, athlete_id: str) -> Optional[Dict]:
        """Get player overview data including team info"""
        url = f"{self.base_url_web}/apis/common/v3/sports/football/nfl/athletes/{athlete_id}/overview"
        
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error fetching overview for {athlete_id}: {e}")
            return None
    
    def get_player_stats(self, athlete_id: str) -> Optional[Dict]:
        """Get player statistical splits data"""
        url = f"{self.base_url_web}/apis/common/v3/sports/football/nfl/athletes/{athlete_id}/splits"
        
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error fetching stats for {athlete_id}: {e}")
            return None
    
    def calculate_fantasy_points(self, stats: Dict, scoring_system: str = "ppr") -> float:
        """
        Calculate fantasy points from raw stats
        
        Standard PPR Scoring:
        - 1 point per reception
        - 0.1 points per receiving yard
        - 6 points per receiving TD
        - 0.1 points per rushing yard  
        - 6 points per rushing TD
        """
        points = 0.0
        
        # Receiving stats
        receptions = stats.get('receptions', 0)
        rec_yards = stats.get('receivingYards', 0)
        rec_tds = stats.get('receivingTouchdowns', 0)
        
        # Rushing stats  
        rush_yards = stats.get('rushingYards', 0)
        rush_tds = stats.get('rushingTouchdowns', 0)
        
        if scoring_system == "ppr":
            points += receptions * 1.0  # 1 pt per reception
            points += rec_yards * 0.1   # 0.1 pt per rec yard
            points += rec_tds * 6.0     # 6 pts per rec TD
            points += rush_yards * 0.1  # 0.1 pt per rush yard
            points += rush_tds * 6.0    # 6 pts per rush TD
        
        return round(points, 1)
    
    def extract_team_from_overview(self, overview_data: Dict) -> str:
        """Extract team name from overview data"""
        try:
            # Try to find team in athlete data
            athlete = overview_data.get('athlete', {})
            team = athlete.get('team', {})
            return team.get('abbreviation', 'UNK')
        except:
            return 'UNK'
    
    def extract_stats_from_splits(self, splits_data: Dict) -> Dict:
        """Extract relevant stats from splits data"""
        stats = {}
        
        try:
            # Navigate the splits data structure
            splits = splits_data.get('splits', {})
            categories = splits.get('categories', [])
            
            for category in categories:
                if category.get('name') == 'Total':
                    stat_items = category.get('stats', [])
                    for stat in stat_items:
                        name = stat.get('name', '').lower().replace(' ', '')
                        value = stat.get('value', 0)
                        
                        # Map ESPN stat names to our format
                        if 'receptions' in name:
                            stats['receptions'] = float(value)
                        elif 'receivingyards' in name:
                            stats['receivingYards'] = float(value)
                        elif 'receivingtouchdowns' in name:
                            stats['receivingTouchdowns'] = float(value)
                        elif 'rushingyards' in name:
                            stats['rushingYards'] = float(value)
                        elif 'rushingtouchdowns' in name:
                            stats['rushingTouchdowns'] = float(value)
            
        except Exception as e:
            print(f"Error extracting stats: {e}")
        
        return stats
    
    def scrape_players_to_csv(self, max_players: int = 50, output_file: str = "nfl_players.csv"):
        """Main scraping function that exports data to CSV"""
        print("Starting ESPN NFL player data scraping...")
        
        # Get athlete list
        athletes = self.get_all_athletes(limit=1000)
        if not athletes:
            print("No athletes found!")
            return
        
        # Limit to specified number for testing
        athletes = athletes[:max_players]
        
        # Prepare CSV
        fieldnames = [
            'name',
            'position', 
            'team',
            'receptions_2024',
            'receiving_yards_2024',
            'receiving_tds_2024',
            'calculated_fantasy_points_2024',
            'espn_id',
            'notes'
        ]
        
        with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            
            for i, athlete in enumerate(athletes, 1):
                print(f"Processing {i}/{len(athletes)}: {athlete.get('displayName', 'Unknown')}")
                
                # Extract basic info
                player_data = {
                    'name': athlete.get('displayName', ''),
                    'position': athlete.get('position', {}).get('abbreviation', 'UNK'),
                    'team': 'UNK',
                    'espn_id': athlete.get('id', ''),
                    'notes': 'No auction/salary data available from ESPN'
                }
                
                athlete_id = str(athlete.get('id', ''))
                
                # Get team info from overview
                overview = self.get_player_overview(athlete_id)
                if overview:
                    player_data['team'] = self.extract_team_from_overview(overview)
                
                # Get stats
                stats_data = self.get_player_stats(athlete_id) 
                if stats_data:
                    stats = self.extract_stats_from_splits(stats_data)
                    
                    player_data['receptions_2024'] = stats.get('receptions', 0)
                    player_data['receiving_yards_2024'] = stats.get('receivingYards', 0)
                    player_data['receiving_tds_2024'] = stats.get('receivingTouchdowns', 0)
                    player_data['calculated_fantasy_points_2024'] = self.calculate_fantasy_points(stats)
                else:
                    # Set defaults if no stats available
                    player_data['receptions_2024'] = 0
                    player_data['receiving_yards_2024'] = 0
                    player_data['receiving_tds_2024'] = 0
                    player_data['calculated_fantasy_points_2024'] = 0
                
                writer.writerow(player_data)
                
                # Rate limiting to be respectful
                time.sleep(0.5)
        
        print(f"✅ Scraping complete! Data saved to {output_file}")
        print(f"📊 Processed {len(athletes)} players")
        print(f"⚠️  Note: Auction values and 2025 projections are not available from ESPN API")

def main():
    scraper = ESPNPlayerScraper()
    
    # Scrape 20 players as a test
    scraper.scrape_players_to_csv(max_players=20, output_file="nfl_players_sample.csv")

if __name__ == "__main__":
    main()
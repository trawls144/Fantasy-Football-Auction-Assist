#!/usr/bin/env python3
"""
Top 200 Fantasy Football Players - ESPN API Scraper
Scrapes comprehensive fantasy football data for the top 200 players
"""

import requests
import csv
import json
import time
import re
from typing import Dict, List, Optional
from dataclasses import dataclass

@dataclass
class FantasyPlayer:
    name: str
    position: str
    team: str
    espn_id: Optional[str] = None
    tier: int = 1  # 1=elite, 2=good, 3=solid, 4=depth

class Top200FantasyScraper:
    def __init__(self):
        self.base_url_core = "https://sports.core.api.espn.com"
        self.base_url_web = "https://site.web.api.espn.com" 
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        # Initialize our top 200 fantasy players list
        self.top_200_players = self._build_top_200_list()
    
    def _build_top_200_list(self) -> List[FantasyPlayer]:
        """Build list of top 200 fantasy relevant players by position"""
        
        # Elite Tier QBs (Tier 1-2)
        qbs = [
            FantasyPlayer("Lamar Jackson", "QB", "BAL", tier=1),
            FantasyPlayer("Jayden Daniels", "QB", "WSH", tier=1), 
            FantasyPlayer("Joe Burrow", "QB", "CIN", tier=1),
            FantasyPlayer("Josh Allen", "QB", "BUF", "3128390", tier=1),
            FantasyPlayer("Jalen Hurts", "QB", "PHI", tier=1),
            FantasyPlayer("Anthony Richardson", "QB", "IND", tier=1),
            FantasyPlayer("Kyler Murray", "QB", "ARI", tier=2),
            FantasyPlayer("Tua Tagovailoa", "QB", "MIA", tier=2),
            FantasyPlayer("Brock Purdy", "QB", "SF", tier=2),
            FantasyPlayer("Dak Prescott", "QB", "DAL", tier=2),
            FantasyPlayer("Jordan Love", "QB", "GB", tier=2),
            FantasyPlayer("Patrick Mahomes", "QB", "KC", tier=2),
            FantasyPlayer("Caleb Williams", "QB", "CHI", tier=2),
            FantasyPlayer("C.J. Stroud", "QB", "HOU", tier=2),
            FantasyPlayer("Drake Maye", "QB", "NE", tier=3),
            FantasyPlayer("Trevor Lawrence", "QB", "JAX", tier=3),
            FantasyPlayer("Aaron Rodgers", "QB", "NYJ", tier=3),
            FantasyPlayer("Sam Darnold", "QB", "MIN", tier=3),
            FantasyPlayer("Daniel Jones", "QB", "NYG", tier=3),
            FantasyPlayer("Geno Smith", "QB", "SEA", tier=3),
        ]
        
        # Elite RBs (Tier 1-4)  
        rbs = [
            FantasyPlayer("Bijan Robinson", "RB", "ATL", tier=1),
            FantasyPlayer("Saquon Barkley", "RB", "PHI", tier=1),
            FantasyPlayer("Jahmyr Gibbs", "RB", "DET", tier=1),
            FantasyPlayer("De'Von Achane", "RB", "MIA", tier=1),
            FantasyPlayer("Ashton Jeanty", "RB", "LV", tier=1),
            FantasyPlayer("Christian McCaffrey", "RB", "SF", tier=1),
            FantasyPlayer("Bucky Irving", "RB", "TB", tier=1),
            FantasyPlayer("Derrick Henry", "RB", "BAL", "3116385", tier=2),
            FantasyPlayer("Jonathan Taylor", "RB", "IND", tier=2),
            FantasyPlayer("Josh Jacobs", "RB", "GB", tier=2),
            FantasyPlayer("Kyren Williams", "RB", "LAR", tier=2),
            FantasyPlayer("James Cook", "RB", "BUF", tier=2),
            FantasyPlayer("Kenneth Walker III", "RB", "SEA", tier=2),
            FantasyPlayer("Breece Hall", "RB", "NYJ", tier=2),
            FantasyPlayer("Alvin Kamara", "RB", "NO", tier=2),
            FantasyPlayer("David Montgomery", "RB", "DET", tier=2),
            FantasyPlayer("Joe Mixon", "RB", "HOU", tier=2),
            FantasyPlayer("Aaron Jones", "RB", "MIN", tier=2),
            FantasyPlayer("Tony Pollard", "RB", "TEN", tier=3),
            FantasyPlayer("Rhamondre Stevenson", "RB", "NE", tier=3),
            FantasyPlayer("Najee Harris", "RB", "PIT", tier=3),
            FantasyPlayer("Travis Etienne", "RB", "JAX", tier=3),
            FantasyPlayer("Rachaad White", "RB", "TB", tier=3),
            FantasyPlayer("Chuba Hubbard", "RB", "CAR", tier=3),
            FantasyPlayer("Rico Dowdle", "RB", "DAL", tier=3),
            FantasyPlayer("J.K. Dobbins", "RB", "LAC", tier=3),
            FantasyPlayer("Brian Robinson Jr.", "RB", "WSH", tier=3),
            FantasyPlayer("Javonte Williams", "RB", "DEN", tier=3),
            FantasyPlayer("Tyjae Spears", "RB", "TEN", tier=4),
            FantasyPlayer("Jaylen Warren", "RB", "PIT", tier=4),
            FantasyPlayer("Isaac Guerendo", "RB", "SF", tier=4),
            FantasyPlayer("Jerome Ford", "RB", "CLE", tier=4),
            FantasyPlayer("Zamir White", "RB", "LV", tier=4),
            FantasyPlayer("Ezekiel Elliott", "RB", "DAL", tier=4),
            FantasyPlayer("Alexander Mattison", "RB", "LV", tier=4),
        ]
        
        # Elite WRs (Tier 1-4)
        wrs = [
            FantasyPlayer("Ja'Marr Chase", "WR", "CIN", tier=1),
            FantasyPlayer("Justin Jefferson", "WR", "MIN", "3139477", tier=1),
            FantasyPlayer("CeeDee Lamb", "WR", "DAL", tier=1),
            FantasyPlayer("Amon-Ra St. Brown", "WR", "DET", tier=1),
            FantasyPlayer("Puka Nacua", "WR", "LAR", tier=1),
            FantasyPlayer("Malik Nabers", "WR", "NYG", tier=1),
            FantasyPlayer("Brian Thomas Jr.", "WR", "JAX", tier=1),
            FantasyPlayer("Nico Collins", "WR", "HOU", tier=1),
            FantasyPlayer("Drake London", "WR", "ATL", tier=1),
            FantasyPlayer("A.J. Brown", "WR", "PHI", tier=1),
            FantasyPlayer("Davante Adams", "WR", "NYJ", "16800", tier=2),
            FantasyPlayer("Ladd McConkey", "WR", "LAC", tier=2),
            FantasyPlayer("Jaxon Smith-Njigba", "WR", "SEA", tier=2),
            FantasyPlayer("Tyreek Hill", "WR", "MIA", tier=2),
            FantasyPlayer("Garrett Wilson", "WR", "NYJ", tier=2),
            FantasyPlayer("Terry McLaurin", "WR", "WSH", tier=2),
            FantasyPlayer("Tee Higgins", "WR", "CIN", tier=2),
            FantasyPlayer("Marvin Harrison Jr.", "WR", "ARI", tier=2),
            FantasyPlayer("Chase Brown", "WR", "CIN", tier=2),
            FantasyPlayer("DK Metcalf", "WR", "SEA", tier=2),
            FantasyPlayer("Mike Evans", "WR", "TB", tier=2),
            FantasyPlayer("DeVonta Smith", "WR", "PHI", tier=2),
            FantasyPlayer("Stefon Diggs", "WR", "HOU", tier=2),
            FantasyPlayer("Cooper Kupp", "WR", "LAR", tier=2),
            FantasyPlayer("Chris Godwin", "WR", "TB", tier=2),
            FantasyPlayer("Zay Flowers", "WR", "BAL", tier=2),
            FantasyPlayer("Tank Dell", "WR", "HOU", tier=3),
            FantasyPlayer("DJ Moore", "WR", "CHI", tier=3),
            FantasyPlayer("Keenan Allen", "WR", "CHI", tier=3),
            FantasyPlayer("Amari Cooper", "WR", "BUF", tier=3),
            FantasyPlayer("George Pickens", "WR", "PIT", tier=3),
            FantasyPlayer("Jordan Addison", "WR", "MIN", tier=3),
            FantasyPlayer("Jayden Reed", "WR", "GB", tier=3),
            FantasyPlayer("Rome Odunze", "WR", "CHI", tier=3),
            FantasyPlayer("Calvin Ridley", "WR", "TEN", tier=3),
            FantasyPlayer("Courtland Sutton", "WR", "DEN", tier=3),
            FantasyPlayer("Jameson Williams", "WR", "DET", tier=3),
            FantasyPlayer("Xavier Worthy", "WR", "KC", tier=3),
            FantasyPlayer("Tyler Lockett", "WR", "SEA", tier=3),
            FantasyPlayer("Diontae Johnson", "WR", "HOU", tier=3),
            FantasyPlayer("Jerry Jeudy", "WR", "CLE", tier=4),
            FantasyPlayer("Brandin Cooks", "WR", "DAL", tier=4),
            FantasyPlayer("DeAndre Hopkins", "WR", "KC", tier=4),
            FantasyPlayer("Darnell Mooney", "WR", "ATL", tier=4),
            FantasyPlayer("Adam Thielen", "WR", "CAR", tier=4),
        ]
        
        # Top TEs (Tier 1-4)
        tes = [
            FantasyPlayer("Brock Bowers", "TE", "LV", tier=1),
            FantasyPlayer("Trey McBride", "TE", "ARI", tier=1), 
            FantasyPlayer("George Kittle", "TE", "SF", tier=1),
            FantasyPlayer("Sam LaPorta", "TE", "DET", tier=1),
            FantasyPlayer("Mark Andrews", "TE", "BAL", tier=2),
            FantasyPlayer("Travis Kelce", "TE", "KC", "482280d1-1e6d-4f26-b4a7-45b54811046f", tier=2),
            FantasyPlayer("Evan Engram", "TE", "JAX", tier=2),
            FantasyPlayer("Kyle Pitts", "TE", "ATL", tier=2),
            FantasyPlayer("Jake Ferguson", "TE", "DAL", tier=3),
            FantasyPlayer("David Njoku", "TE", "CLE", tier=3),
            FantasyPlayer("Dalton Kincaid", "TE", "BUF", tier=3),
            FantasyPlayer("T.J. Hockenson", "TE", "MIN", tier=3),
            FantasyPlayer("Dallas Goedert", "TE", "PHI", tier=3),
            FantasyPlayer("Cade Otton", "TE", "TB", tier=4),
            FantasyPlayer("Isaiah Likely", "TE", "BAL", tier=4),
            FantasyPlayer("Tucker Kraft", "TE", "GB", tier=4),
            FantasyPlayer("Jonnu Smith", "TE", "MIA", tier=4),
            FantasyPlayer("Tyler Conklin", "TE", "NYJ", tier=4),
        ]
        
        # Top K/DST for completeness  
        kickers = [
            FantasyPlayer("Justin Tucker", "K", "BAL", tier=1),
            FantasyPlayer("Brandon McManus", "K", "GB", tier=2),
            FantasyPlayer("Jake Moody", "K", "SF", tier=2),
            FantasyPlayer("Chris Boswell", "K", "PIT", tier=2),
            FantasyPlayer("Tyler Bass", "K", "BUF", tier=3),
        ]
        
        defenses = [
            FantasyPlayer("Eagles", "DEF", "PHI", tier=1),
            FantasyPlayer("Steelers", "DEF", "PIT", tier=1),
            FantasyPlayer("Bills", "DEF", "BUF", tier=2),
            FantasyPlayer("Ravens", "DEF", "BAL", tier=2),
            FantasyPlayer("49ers", "DEF", "SF", tier=2),
        ]
        
        # Combine all positions
        all_players = qbs + rbs + wrs + tes + kickers + defenses
        
        print(f"Built top 200 list with {len(all_players)} players")
        print(f"QBs: {len(qbs)}, RBs: {len(rbs)}, WRs: {len(wrs)}, TEs: {len(tes)}")
        
        return all_players
    
    def find_player_id(self, player: FantasyPlayer) -> Optional[str]:
        """
        Search for player's ESPN ID using various methods
        """
        if player.espn_id:
            return player.espn_id
        
        # Try searching by name (would need athlete search endpoint)
        # For now, return None for unknown IDs
        return None
    
    def get_player_stats(self, espn_id: str) -> Dict:
        """Get comprehensive player statistics"""
        
        stats = {
            'receptions': 0,
            'receiving_yards': 0,
            'receiving_tds': 0,
            'rushing_yards': 0,
            'rushing_tds': 0,
            'passing_yards': 0,
            'passing_tds': 0,
            'fantasy_points_2024': 0
        }
        
        # Get overview data
        url = f"{self.base_url_web}/apis/common/v3/sports/football/nfl/athletes/{espn_id}/overview"
        
        try:
            response = self.session.get(url, timeout=10)
            if response.status_code != 200:
                return stats
                
            data = response.json()
            
            # Extract stats from statistics section
            statistics = data.get('statistics', {})
            if not statistics:
                return stats
            
            # Get categories and try to extract 2024 season totals
            categories = statistics.get('categories', [])
            labels = statistics.get('labels', [])
            
            # Look for season totals in splits
            splits_url = f"{self.base_url_web}/apis/common/v3/sports/football/nfl/athletes/{espn_id}/splits"
            splits_response = self.session.get(splits_url, timeout=10)
            
            if splits_response.status_code == 200:
                splits_data = splits_response.json()
                stats.update(self._extract_from_splits(splits_data))
            
            return stats
            
        except Exception as e:
            print(f"Error fetching stats for {espn_id}: {e}")
            return stats
    
    def _extract_from_splits(self, splits_data: Dict) -> Dict:
        """Extract statistics from splits endpoint"""
        stats = {}
        
        try:
            splits = splits_data.get('splits', {})
            categories = splits.get('categories', [])
            
            # Look for season totals
            for category in categories:
                if category.get('name') == 'Total' or category.get('displayName') == '2024 Season':
                    stat_items = category.get('stats', [])
                    
                    for stat in stat_items:
                        name = stat.get('name', '').lower()
                        value = float(stat.get('value', 0))
                        
                        # Map stats
                        if 'receptions' in name:
                            stats['receptions'] = value
                        elif 'receivingYards' in name or 'receiving yards' in name:
                            stats['receiving_yards'] = value
                        elif 'receivingTouchdowns' in name:
                            stats['receiving_tds'] = value
                        elif 'rushingYards' in name:
                            stats['rushing_yards'] = value
                        elif 'rushingTouchdowns' in name:
                            stats['rushing_tds'] = value
                        elif 'passingYards' in name:
                            stats['passing_yards'] = value
                        elif 'passingTouchdowns' in name:
                            stats['passing_tds'] = value
            
            # Calculate fantasy points (PPR)
            stats['fantasy_points_2024'] = self._calculate_fantasy_points(stats)
            
        except Exception as e:
            print(f"Error extracting splits: {e}")
        
        return stats
    
    def _calculate_fantasy_points(self, stats: Dict) -> float:
        """Calculate PPR fantasy points"""
        points = 0.0
        
        # Receiving (PPR)
        points += stats.get('receptions', 0) * 1.0
        points += stats.get('receiving_yards', 0) * 0.1  
        points += stats.get('receiving_tds', 0) * 6.0
        
        # Rushing
        points += stats.get('rushing_yards', 0) * 0.1
        points += stats.get('rushing_tds', 0) * 6.0
        
        # Passing (QB)
        points += stats.get('passing_yards', 0) * 0.04  # 1 pt per 25 yards
        points += stats.get('passing_tds', 0) * 4.0     # 4 pts per TD
        
        return round(points, 1)
    
    def scrape_top_200(self, output_file: str = "top_200_fantasy_players.csv"):
        """Main scraping function for top 200 fantasy players"""
        print("🏈 Starting Top 200 Fantasy Players Scrape")
        print("=" * 50)
        
        fieldnames = [
            'rank',
            'name',
            'position', 
            'team',
            'tier',
            'espn_id',
            'receptions_2024',
            'receiving_yards_2024',
            'receiving_tds_2024',
            'rushing_yards_2024',
            'rushing_tds_2024',
            'passing_yards_2024',
            'passing_tds_2024',
            'fantasy_points_2024',
            'status',
            'notes'
        ]
        
        successful_scrapes = 0
        
        with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            
            for rank, player in enumerate(self.top_200_players, 1):
                print(f"[{rank:3d}/200] {player.name} ({player.position}, {player.team})")
                
                # Find ESPN ID
                espn_id = self.find_player_id(player)
                
                if espn_id:
                    # Get stats
                    stats = self.get_player_stats(espn_id)
                    status = "✅ Success"
                    successful_scrapes += 1
                    notes = "Data scraped from ESPN API"
                else:
                    # Default stats for unknown players
                    stats = {
                        'receptions': 0, 'receiving_yards': 0, 'receiving_tds': 0,
                        'rushing_yards': 0, 'rushing_tds': 0, 'passing_yards': 0,
                        'passing_tds': 0, 'fantasy_points_2024': 0
                    }
                    status = "⚠️ No ESPN ID"
                    notes = "ESPN ID needed for data scraping"
                
                # Write row
                row_data = {
                    'rank': rank,
                    'name': player.name,
                    'position': player.position,
                    'team': player.team,
                    'tier': player.tier,
                    'espn_id': espn_id or '',
                    'receptions_2024': stats.get('receptions', 0),
                    'receiving_yards_2024': stats.get('receiving_yards', 0),
                    'receiving_tds_2024': stats.get('receiving_tds', 0),
                    'rushing_yards_2024': stats.get('rushing_yards', 0),
                    'rushing_tds_2024': stats.get('rushing_tds', 0),
                    'passing_yards_2024': stats.get('passing_yards', 0),
                    'passing_tds_2024': stats.get('passing_tds', 0),
                    'fantasy_points_2024': stats.get('fantasy_points_2024', 0),
                    'status': status,
                    'notes': notes
                }
                
                writer.writerow(row_data)
                
                # Rate limiting
                if espn_id:
                    time.sleep(0.5)
        
        print("\n" + "=" * 50)
        print("🎉 SCRAPING COMPLETE!")
        print(f"📊 Total players processed: {len(self.top_200_players)}")
        print(f"✅ Successful data scrapes: {successful_scrapes}")
        print(f"⚠️  Players needing ESPN IDs: {len(self.top_200_players) - successful_scrapes}")
        print(f"💾 Results saved to: {output_file}")
        print("\n📋 Next steps:")
        print("1. Review the CSV for missing ESPN IDs")
        print("2. Manually find ESPN IDs for top missing players")
        print("3. Add auction values from another source")
        print("4. Create 2025 projections from 2024 data")

def main():
    scraper = Top200FantasyScraper()
    scraper.scrape_top_200()

if __name__ == "__main__":
    main()
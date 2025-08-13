-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  position VARCHAR(10) NOT NULL,
  team VARCHAR(10),
  cost_value DECIMAL(5,2) NOT NULL,
  average_auction_value DECIMAL(5,2),
  projected_points DECIMAL(5,1),
  last_week_points DECIMAL(5,1),
  tier INTEGER,
  position_rank INTEGER,
  adp DECIMAL(5,1),
  created_at TIMESTAMP DEFAULT NOW()
);

-- User rosters table
CREATE TABLE user_rosters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  player_id UUID REFERENCES players(id),
  purchase_price DECIMAL(5,2) NOT NULL,
  roster_position VARCHAR(10),
  drafted_at TIMESTAMP DEFAULT NOW()
);

-- Targets table
CREATE TABLE targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  player_id UUID REFERENCES players(id),
  priority INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Draft status table
CREATE TABLE draft_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES players(id),
  is_drafted BOOLEAN DEFAULT FALSE,
  drafted_by_user BOOLEAN DEFAULT FALSE,
  drafted_at TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_players_position ON players(position);
CREATE INDEX idx_players_name ON players(name);
CREATE INDEX idx_user_rosters_user_id ON user_rosters(user_id);
CREATE INDEX idx_targets_user_id ON targets(user_id);
CREATE INDEX idx_draft_status_player_id ON draft_status(player_id);

-- Insert comprehensive sample data
INSERT INTO players (name, position, team, cost_value, average_auction_value, projected_points, tier, position_rank, adp) VALUES
-- QBs
('Patrick Mahomes', 'QB', 'KC', 42.00, 45.00, 285.5, 1, 1, 25.5),
('Josh Allen', 'QB', 'BUF', 38.00, 41.00, 275.2, 1, 2, 28.2),
('Lamar Jackson', 'QB', 'BAL', 35.00, 38.00, 270.8, 2, 3, 32.1),
('Joe Burrow', 'QB', 'CIN', 32.00, 35.00, 265.4, 2, 4, 38.7),
('Jalen Hurts', 'QB', 'PHI', 30.00, 33.00, 260.2, 2, 5, 42.3),
-- RBs  
('Christian McCaffrey', 'RB', 'SF', 58.00, 62.00, 315.8, 1, 1, 4.2),
('Austin Ekeler', 'RB', 'LAC', 52.00, 54.00, 290.4, 2, 2, 18.7),
('Saquon Barkley', 'RB', 'NYG', 48.00, 51.00, 285.2, 2, 3, 12.5),
('Nick Chubb', 'RB', 'CLE', 45.00, 47.00, 275.8, 2, 4, 15.2),
('Derrick Henry', 'RB', 'TEN', 42.00, 45.00, 270.5, 2, 5, 22.8),
('Josh Jacobs', 'RB', 'LV', 38.00, 41.00, 265.3, 3, 6, 28.9),
('Tony Pollard', 'RB', 'DAL', 35.00, 38.00, 255.7, 3, 7, 35.4),
-- WRs
('Cooper Kupp', 'WR', 'LAR', 48.00, 51.00, 280.9, 1, 1, 12.8),
('Davante Adams', 'WR', 'LV', 46.00, 49.00, 275.6, 1, 2, 22.1),
('Tyreek Hill', 'WR', 'MIA', 44.00, 47.00, 270.5, 1, 3, 8.9),
('Stefon Diggs', 'WR', 'BUF', 42.00, 45.00, 265.8, 2, 4, 16.4),
('DeAndre Hopkins', 'WR', 'ARI', 38.00, 41.00, 255.2, 2, 5, 24.7),
('A.J. Brown', 'WR', 'PHI', 36.00, 39.00, 250.6, 2, 6, 31.2),
('DK Metcalf', 'WR', 'SEA', 34.00, 37.00, 245.9, 3, 7, 38.5),
('CeeDee Lamb', 'WR', 'DAL', 32.00, 35.00, 240.8, 3, 8, 45.1),
-- TEs
('Travis Kelce', 'TE', 'KC', 24.00, 27.00, 210.3, 1, 1, 35.6),
('Mark Andrews', 'TE', 'BAL', 18.00, 20.00, 185.7, 2, 2, 55.4),
('George Kittle', 'TE', 'SF', 15.00, 17.00, 175.2, 2, 3, 62.8),
('Darren Waller', 'TE', 'NYG', 12.00, 14.00, 165.5, 3, 4, 78.2),
('T.J. Hockenson', 'TE', 'MIN', 10.00, 12.00, 155.8, 3, 5, 89.7),
-- K & DEF
('Justin Tucker', 'K', 'BAL', 2.00, 3.00, 145.8, 1, 1, 145.2),
('Tyler Bass', 'K', 'BUF', 1.00, 2.00, 140.3, 2, 2, 152.8),
('Bills', 'DEF', 'BUF', 2.00, 3.00, 125.4, 1, 1, 142.7),
('49ers', 'DEF', 'SF', 1.00, 2.00, 120.8, 2, 2, 148.3);

-- Create a trigger to automatically create draft_status for new players
CREATE OR REPLACE FUNCTION create_draft_status_for_player()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO draft_status (player_id, is_drafted, drafted_by_user)
  VALUES (NEW.id, FALSE, FALSE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_draft_status
AFTER INSERT ON players
FOR EACH ROW
EXECUTE FUNCTION create_draft_status_for_player();
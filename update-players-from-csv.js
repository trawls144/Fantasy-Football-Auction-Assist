const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to parse CSV file
function parseCSV(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  const lines = data.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  const players = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',').map(v => v.trim());
    if (values.length >= 3) {
      const tier = parseInt(values[0]);
      const playerName = values[1];
      const positionRank = values[2];
      
      // Extract just the number from position_rank (e.g., "WR1" -> 1)
      const rankNumber = parseInt(positionRank.replace(/\D/g, ''));
      
      players.push({
        name: playerName,
        tier: tier,
        position_rank: rankNumber
      });
    }
  }
  
  return players;
}

// Function to update players in Supabase
async function updatePlayersInSupabase(csvPlayers) {
  console.log(`Processing ${csvPlayers.length} players from CSV...`);
  
  let updated = 0;
  let notFound = 0;
  let errors = 0;
  
  for (const csvPlayer of csvPlayers) {
    try {
      // Find player by name (case-insensitive)
      const { data: existingPlayers, error: fetchError } = await supabase
        .from('players')
        .select('id, name, tier, position_rank')
        .ilike('name', csvPlayer.name);
      
      if (fetchError) {
        console.error(`Error fetching player ${csvPlayer.name}:`, fetchError);
        errors++;
        continue;
      }
      
      if (!existingPlayers || existingPlayers.length === 0) {
        console.log(`Player not found: ${csvPlayer.name}`);
        notFound++;
        continue;
      }
      
      // If multiple matches, use exact match first, otherwise use first result
      let playerToUpdate = existingPlayers.find(p => p.name.toLowerCase() === csvPlayer.name.toLowerCase());
      if (!playerToUpdate) {
        playerToUpdate = existingPlayers[0];
      }
      
      // Update the player
      const { error: updateError } = await supabase
        .from('players')
        .update({
          tier: csvPlayer.tier,
          position_rank: csvPlayer.position_rank
        })
        .eq('id', playerToUpdate.id);
      
      if (updateError) {
        console.error(`Error updating player ${csvPlayer.name}:`, updateError);
        errors++;
        continue;
      }
      
      console.log(`Updated ${csvPlayer.name}: tier=${csvPlayer.tier}, position_rank=${csvPlayer.position_rank}`);
      updated++;
      
    } catch (error) {
      console.error(`Unexpected error processing ${csvPlayer.name}:`, error);
      errors++;
    }
  }
  
  console.log('\n=== Update Summary ===');
  console.log(`Total players in CSV: ${csvPlayers.length}`);
  console.log(`Successfully updated: ${updated}`);
  console.log(`Players not found: ${notFound}`);
  console.log(`Errors: ${errors}`);
}

// Main function
async function main() {
  try {
    const csvFilePath = './Beer Sheet 2025 - Tier_Updates_Aug_12.csv';
    
    console.log('Parsing CSV file...');
    const csvPlayers = parseCSV(csvFilePath);
    console.log(`Found ${csvPlayers.length} players in CSV`);
    
    console.log('Connecting to Supabase...');
    
    // Test connection
    const { data, error } = await supabase.from('players').select('count').limit(1);
    if (error) {
      console.error('Failed to connect to Supabase:', error);
      process.exit(1);
    }
    
    console.log('Connected to Supabase successfully!');
    
    await updatePlayersInSupabase(csvPlayers);
    
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  }
}

// Run the script
main();
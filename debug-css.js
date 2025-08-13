// Simple script to fetch and analyze the HTML from localhost:3000
const http = require('http');

function fetchPage() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3000/', (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    });
    
    req.on('error', (err) => reject(err));
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function analyzePage() {
  try {
    console.log('🔍 Fetching page from localhost:3000...');
    const html = await fetchPage();
    
    console.log('\n📄 HTML length:', html.length);
    
    // Check for CSS imports
    const cssLinks = html.match(/<link[^>]*rel="stylesheet"[^>]*>/g) || [];
    console.log('\n🎨 CSS Links found:', cssLinks.length);
    cssLinks.forEach((link, i) => console.log(`  ${i + 1}. ${link}`));
    
    // Check for Next.js specific CSS
    const nextCssMatches = html.match(/\/_next\/static\/css\/[^"']*/g) || [];
    console.log('\n🔧 Next.js CSS files:', nextCssMatches.length);
    nextCssMatches.forEach((match, i) => console.log(`  ${i + 1}. ${match}`));
    
    // Check for Tailwind classes in body
    const bodyMatch = html.match(/<body[^>]*class="([^"]*)"[^>]*>/);
    console.log('\n👤 Body classes:', bodyMatch ? bodyMatch[1] : 'None found');
    
    // Check for main div classes
    const mainDivMatches = html.match(/<div[^>]*class="[^"]*min-h-screen[^"]*"[^>]*>/g) || [];
    console.log('\n🏗️  Main container divs with min-h-screen:', mainDivMatches.length);
    mainDivMatches.forEach((match, i) => console.log(`  ${i + 1}. ${match}`));
    
    // Check for style tags
    const styleTags = html.match(/<style[^>]*>[^<]*<\/style>/g) || [];
    console.log('\n💅 Inline style tags:', styleTags.length);
    
    // Check for script tags
    const scriptTags = html.match(/<script[^>]*src="[^"]*_next[^"]*"[^>]*>/g) || [];
    console.log('\n📜 Next.js script tags:', scriptTags.length);
    
    // Show a sample of the HTML around the main content
    const titleMatch = html.match(/Fantasy Football Auction Draft Tool/);
    if (titleMatch) {
      const index = titleMatch.index;
      const start = Math.max(0, index - 200);
      const end = Math.min(html.length, index + 400);
      console.log('\n📝 HTML around title:');
      console.log('---');
      console.log(html.substring(start, end));
      console.log('---');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('timeout')) {
      console.log('\n💡 The dev server might not be running. Please start it with:');
      console.log('   npm run dev');
    }
  }
}

analyzePage();
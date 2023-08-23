const natural = require('natural');
const {stem} = natural.PorterStemmer;

const stopwords = new Set(['i', 'a', 'an', 'am', 'and', 'the', /* ... */]);

function splitQueryIntoKeywords(query) {
  // Split the query into keywords, considering phrases enclosed in double quotes
  const keywords = query.match(/"([^"]+)"|\S+/g) || [];

  const stemmedKeywords = keywords.map(token => stem(token.toLowerCase()))
  .filter(token => !stopwords.has(token));

  return stemmedKeywords;
}

function calculateScore(fields, keywords) {
  // Treat undefined fields and keywords as empty strings
  const sanitizedFields = fields.map(field => field || '');
  
  const sanitizedKeywords = keywords.map(keyword => keyword || '');

  // Count the number of keyword occurrences in fields
  const keywordMatches = sanitizedKeywords.filter(keyword =>
    sanitizedFields.some(field => field.toLowerCase().includes(keyword))
  );

  // Calculate the score based on the number of keyword matches
  const score = keywordMatches.length;

  return score;
}

async function getClickedItems(similarSearches, Model) {
  const clickedItems = [];

  for (const search of similarSearches) {
    if (search.visitedProductId) {
      const item = await Model.findById(search.visitedProductId);
      if (item) {
        clickedItems.push(item);
      }
    }
  }

  return clickedItems;
}

// Helper function to sort items based on popularity
function sortByPopularity(items, frequencyMap) {
  return items.sort((a, b) => frequencyMap.get(b._id.toString()) - frequencyMap.get(a._id.toString()));
}

// Helper function to filter items for uniqueness
function filterUniqueItems(items) {
  const uniqueItems = [];

  items.forEach(item => {
    if (!uniqueItems.some(uItem => uItem._id.toString() === item._id.toString())) {
      uniqueItems.push(item);
    }
  });

  return uniqueItems;
}

module.exports = {
  splitQueryIntoKeywords,
  calculateScore,
  getClickedItems,
  sortByPopularity,
  filterUniqueItems
};

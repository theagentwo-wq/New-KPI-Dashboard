// This function runs on Netlify's backend to fetch and parse RSS feeds.
// It acts as a proxy to avoid client-side CORS issues.

interface Article {
  title: string;
  link: string;
  content: string;
  sourceName: string;
  pubDate: string;
}

// Top 10 RSS Feeds from https://www.restaurantnewsresource.com/rss-feeds
const RSS_FEEDS = [
    { name: 'Restaurant Industry News', url: 'https://www.restaurantnewsresource.com/rss_RESTAURANT_INDUSTRY_NEWS.xml' },
    { name: 'Franchise & Chain News', url: 'https://www.restaurantnewsresource.com/rss_FRANCHISE_AND_CHAIN_RESTAURANT_NEWS.xml' },
    { name: 'Marketing & Promotions', url: 'https://www.restaurantnewsresource.com/rss_MARKETING_AND_PROMOTIONS.xml' },
    { name: 'Restaurant Technology', url: 'https://www.restaurantnewsresource.com/rss_RESTAURANT_TECHNOLOGY.xml' },
    { name: 'Operations & Management', url: 'https://www.restaurantnewsresource.com/rss_OPERATIONS_AND_MANAGEMENT.xml' },
    { name: 'Menu & Food Trends', url: 'https://www.restaurantnewsresource.com/rss_MENU_AND_FOOD_TRENDS.xml' },
    { name: 'Economic & Financial', url: 'https://www.restaurantnewsresource.com/rss_ECONOMIC_AND_FINANCIAL_REPORTS.xml' },
    { name: 'Restaurant Real Estate', url: 'https://www.restaurantnewsresource.com/rss_RESTAURANT_REAL_ESTATE.xml' },
    { name: 'Health & Nutrition', url: 'https://www.restaurantnewsresource.com/rss_HEALTH_AND_NUTRITION.xml' },
    { name: 'Green Restaurants', url: 'https://www.restaurantnewsresource.com/rss_GREEN_RESTAURANTS.xml' },
];

/**
 * A simple, dependency-free RSS parser using regex.
 * It's not robust for all RSS formats but works for the target source.
 */
const parseRssFeed = (xml: string, sourceName: string): Article[] => {
    const articles: Article[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
        const itemContent = match[1];
        
        const titleMatch = /<title><!\[CDATA\[(.*?)\]\]><\/title>/s.exec(itemContent);
        const linkMatch = /<link>(.*?)<\/link>/s.exec(itemContent);
        const pubDateMatch = /<pubDate>(.*?)<\/pubDate>/s.exec(itemContent);
        const descriptionMatch = /<description><!\[CDATA\[(.*?)\]\]><\/description>/s.exec(itemContent);

        if (titleMatch && linkMatch && pubDateMatch && descriptionMatch) {
            articles.push({
                title: titleMatch[1].trim(),
                link: linkMatch[1].trim(),
                pubDate: pubDateMatch[1].trim(),
                content: descriptionMatch[1].trim(),
                sourceName: sourceName,
            });
        }
    }
    return articles;
};

export const handler = async () => {
    try {
        const feedPromises = RSS_FEEDS.map(feed =>
            fetch(feed.url)
                .then(response => {
                    if (!response.ok) {
                        console.warn(`Failed to fetch ${feed.url}, status: ${response.status}`);
                        return { xml: '', sourceName: feed.name };
                    }
                    return response.text().then(xml => ({ xml, sourceName: feed.name }));
                })
                .catch(error => {
                    console.error(`Error fetching ${feed.url}:`, error);
                    return { xml: '', sourceName: feed.name }; // Return empty on error to not fail the whole process
                })
        );
        
        const feedResults = await Promise.all(feedPromises);
        
        let allArticles: Article[] = [];
        for (const { xml, sourceName } of feedResults) {
            if (xml) {
                const parsedArticles = parseRssFeed(xml, sourceName);
                allArticles = allArticles.concat(parsedArticles);
            }
        }
        
        // Sort articles by publication date, newest first
        allArticles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
        
        // Limit to a reasonable number of recent articles
        const recentArticles = allArticles.slice(0, 50);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // Or a more specific origin
            },
            body: JSON.stringify(recentArticles),
        };

    } catch (error: any) {
        console.error('Error in rss-proxy function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || 'An internal server error occurred.' }),
        };
    }
};
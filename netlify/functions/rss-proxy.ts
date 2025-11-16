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
 * A more robust, dependency-free RSS parser. It handles common XML variations like tag attributes,
 * decodes HTML entities, and checks for multiple content tags (`description`, `content:encoded`)
 * for better compatibility.
 */
const parseRssFeed = (xml: string, sourceName: string): Article[] => {
    const articles: Article[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let itemMatch;

    const decodeEntities = (encodedString: string): string => {
        const translate_re = /&(nbsp|amp|quot|lt|gt);/g;
        const translate: { [key: string]: string } = {
            "nbsp": " ", "amp": "&", "quot": "\"", "lt": "<", "gt": ">"
        };
        return encodedString
            .replace(translate_re, (_, entity) => translate[entity])
            .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));
    };

    const getTagContent = (itemXml: string, tagName: string): string => {
        // Regex that ignores attributes in the opening tag
        const tagRegex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`);
        const match = itemXml.match(tagRegex);
        
        if (!match || typeof match[1] === 'undefined') return '';
        
        let content = match[1].trim();

        if (content.startsWith('<![CDATA[') && content.endsWith(']]>')) {
            content = content.substring(9, content.length - 3);
        }

        return decodeEntities(content.trim());
    };

    while ((itemMatch = itemRegex.exec(xml)) !== null) {
        const itemXml = itemMatch[1];
        
        const title = getTagContent(itemXml, 'title');
        let link = getTagContent(itemXml, 'link');
        if (!link) {
            link = getTagContent(itemXml, 'guid');
        }

        const pubDate = getTagContent(itemXml, 'pubDate') || new Date().toISOString();
        
        let content = getTagContent(itemXml, 'description');
        if (!content) {
            content = getTagContent(itemXml, 'content:encoded');
        }
        
        // Loosen the validation: only require title, link, and some content.
        if (title && link && content) {
            articles.push({ title, link, pubDate, content, sourceName });
        }
    }
    
    return articles;
};


export const handler = async () => {
    try {
        const feedPromises = RSS_FEEDS.map(feed =>
            fetch(feed.url, {
                headers: {
                    // Add a User-Agent to mimic a browser and avoid being blocked
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            })
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
                try {
                    const parsedArticles = parseRssFeed(xml, sourceName);
                    allArticles = allArticles.concat(parsedArticles);
                } catch (parseError) {
                    console.error(`Error parsing feed for ${sourceName}:`, parseError);
                }
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
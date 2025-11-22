import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// netlify/functions/rss-proxy.ts
var RSS_FEEDS = [
  { name: "Restaurant Business", url: "https://www.restaurantbusinessonline.com/rss/headlines" },
  { name: "Nation's Restaurant News", url: "https://www.nrn.com/rss.xml" },
  { name: "Restaurant Hospitality", url: "https://www.restaurant-hospitality.com/rss.xml" },
  { name: "QSR Magazine", url: "https://www.qsrmagazine.com/rss.xml" },
  { name: "Modern Restaurant Mgmt", url: "https://modernrestaurantmanagement.com/feed/" },
  { name: "Menu & Food Trends", url: "https://www.restaurantnewsresource.com/rss_MENU_AND_FOOD_TRENDS.xml" },
  { name: "Restaurant Technology", url: "https://www.restaurantnewsresource.com/rss_RESTAURANT_TECHNOLOGY.xml" }
];
var parseRssFeed = (xml, sourceName) => {
  const articles = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let itemMatch;
  const decodeEntities = (encodedString) => {
    const translate_re = /&(nbsp|amp|quot|lt|gt);/g;
    const translate = {
      "nbsp": " ",
      "amp": "&",
      "quot": '"',
      "lt": "<",
      "gt": ">"
    };
    return encodedString.replace(translate_re, (_, entity) => translate[entity]).replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));
  };
  const getTagContent = (itemXml, tagName) => {
    const tagRegex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`);
    const match = itemXml.match(tagRegex);
    if (!match || typeof match[1] === "undefined") return "";
    let content = match[1].trim();
    if (content.startsWith("<![CDATA[") && content.endsWith("]]>")) {
      content = content.substring(9, content.length - 3);
    }
    return decodeEntities(content.trim());
  };
  while ((itemMatch = itemRegex.exec(xml)) !== null) {
    const itemXml = itemMatch[1];
    const title = getTagContent(itemXml, "title");
    let link = getTagContent(itemXml, "link");
    if (!link) {
      link = getTagContent(itemXml, "guid");
    }
    const pubDate = getTagContent(itemXml, "pubDate") || (/* @__PURE__ */ new Date()).toISOString();
    let content = getTagContent(itemXml, "description");
    if (!content) {
      content = getTagContent(itemXml, "content:encoded");
    }
    if (title && link && content) {
      articles.push({ title, link, pubDate, content, sourceName });
    }
  }
  return articles;
};
var handler = async () => {
  try {
    const feedPromises = RSS_FEEDS.map(
      (feed) => fetch(feed.url, {
        headers: {
          // Add a User-Agent to mimic a browser and avoid being blocked
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
      }).then((response) => {
        if (!response.ok) {
          console.warn(`Failed to fetch ${feed.url}, status: ${response.status}`);
          return { xml: "", sourceName: feed.name };
        }
        return response.text().then((xml) => ({ xml, sourceName: feed.name }));
      }).catch((error) => {
        console.error(`Error fetching ${feed.url}:`, error);
        return { xml: "", sourceName: feed.name };
      })
    );
    const feedResults = await Promise.all(feedPromises);
    let allArticles = [];
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
    allArticles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    const recentArticles = allArticles.slice(0, 50);
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
        // Or a more specific origin
      },
      body: JSON.stringify(recentArticles)
    };
  } catch (error) {
    console.error("Error in rss-proxy function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "An internal server error occurred." })
    };
  }
};
export {
  handler
};

import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, RefreshCw } from 'lucide-react';

interface NewsArticle {
    title: string;
    source: string;
    date: string;
    summary: string;
    url: string;
    category?: string;
}

export const IndustryNewsPage: React.FC = () => {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        loadNews();
    }, []);

    const loadNews = async () => {
        setIsLoading(true);

        // Simulated news data - In production, this would fetch from RSS feeds or news API
        // Sources: Nation's Restaurant News, Restaurant Business Online, QSR Magazine, etc.
        const mockArticles: NewsArticle[] = [
            {
                title: "2025 Restaurant Industry Trends: Tech Integration and Sustainability",
                source: "Nation's Restaurant News",
                date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                summary: "Industry leaders predict increased focus on AI-powered operations, sustainable sourcing, and ghost kitchen expansion in 2025.",
                url: "https://www.nrn.com",
                category: "Trends"
            },
            {
                title: "Labor Costs Continue to Challenge Restaurant Operators",
                source: "Restaurant Business Online",
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                summary: "Rising minimum wages and competition for talent drive operators to explore automation and efficiency improvements.",
                url: "https://www.restaurantbusinessonline.com",
                category: "Operations"
            },
            {
                title: "Quick Service Restaurants See Digital Sales Surge",
                source: "QSR Magazine",
                date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                summary: "Mobile ordering and delivery platforms now account for over 40% of QSR sales, marking a permanent shift in consumer behavior.",
                url: "https://www.qsrmagazine.com",
                category: "Technology"
            },
            {
                title: "Gen Z Diners Prioritize Authentic Experiences Over Price",
                source: "Modern Restaurant Management",
                date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                summary: "Survey reveals younger consumers willing to pay premium for unique dining experiences and transparent sourcing.",
                url: "https://www.modernrestaurantmanagement.com",
                category: "Consumer Insights"
            },
            {
                title: "Food Cost Inflation Shows Signs of Stabilizing",
                source: "Food & Wine",
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                summary: "After two years of volatility, commodity prices are normalizing, offering relief to restaurant operators.",
                url: "https://www.foodandwine.com",
                category: "Economics"
            },
            {
                title: "Restaurant Energy Efficiency Initiatives Gain Momentum",
                source: "Nation's Restaurant News",
                date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
                summary: "Major chains invest in LED lighting, efficient HVAC systems, and renewable energy to reduce operational costs.",
                url: "https://www.nrn.com",
                category: "Sustainability"
            },
            {
                title: "Menu Engineering: Data-Driven Approaches to Profitability",
                source: "Restaurant Business Online",
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                summary: "Analytics tools help operators optimize menu mix, pricing strategies, and ingredient utilization.",
                url: "https://www.restaurantbusinessonline.com",
                category: "Operations"
            },
            {
                title: "Ghost Kitchens Evolve Beyond Pandemic Origins",
                source: "QSR Magazine",
                date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
                summary: "Virtual brands find lasting success by targeting niche markets and leveraging social media marketing.",
                url: "https://www.qsrmagazine.com",
                category: "Trends"
            },
            {
                title: "Employee Retention Strategies That Actually Work",
                source: "Modern Restaurant Management",
                date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
                summary: "Flexible scheduling, career development programs, and competitive benefits prove key to reducing turnover.",
                url: "https://www.modernrestaurantmanagement.com",
                category: "HR"
            },
            {
                title: "Customer Review Management: Best Practices for 2025",
                source: "Restaurant Business Online",
                date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                summary: "Proactive reputation management and authentic responses to feedback drive customer loyalty and sales.",
                url: "https://www.restaurantbusinessonline.com",
                category: "Marketing"
            }
        ];

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        setArticles(mockArticles);
        setIsLoading(false);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const categories = ['all', ...Array.from(new Set(articles.map(a => a.category).filter(Boolean))) as string[]];

    const filteredArticles = selectedCategory === 'all'
        ? articles
        : articles.filter(a => a.category === selectedCategory);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <Newspaper className="text-cyan-400" size={32} />
                        Industry News
                    </h1>
                    <p className="text-slate-400 mt-1">Stay updated with the latest restaurant industry trends and insights</p>
                </div>
                <button
                    onClick={loadNews}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <RefreshCw size={18} />
                    Refresh
                </button>
            </div>

            {/* Category Filter */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="flex gap-2 flex-wrap">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                selectedCategory === category
                                    ? 'bg-cyan-600 text-white'
                                    : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
                            }`}
                        >
                            {category === 'all' ? 'All News' : category}
                        </button>
                    ))}
                </div>
            </div>

            {/* News Articles */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                        <p className="text-slate-400">Loading latest industry news...</p>
                    </div>
                ) : filteredArticles.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        No articles found for this category.
                    </div>
                ) : (
                    filteredArticles.map((article, index) => (
                        <div
                            key={index}
                            className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors"
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-semibold text-cyan-400 uppercase">
                                            {article.source}
                                        </span>
                                        <span className="text-slate-500">•</span>
                                        <span className="text-xs text-slate-400">
                                            {formatDate(article.date)}
                                        </span>
                                        {article.category && (
                                            <>
                                                <span className="text-slate-500">•</span>
                                                <span className="text-xs px-2 py-1 bg-slate-900 rounded text-slate-300">
                                                    {article.category}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        {article.title}
                                    </h3>
                                    <p className="text-slate-300 mb-4">
                                        {article.summary}
                                    </p>
                                    <a
                                        href={article.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                                    >
                                        Read full article
                                        <ExternalLink size={16} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer Note */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <p className="text-sm text-slate-400 text-center">
                    <strong>Note:</strong> In production, this page would fetch live RSS feeds from Nation's Restaurant News,
                    Restaurant Business Online, QSR Magazine, Modern Restaurant Management, and Food & Wine (restaurant section).
                    Articles would be cached for 24 hours and refreshed daily.
                </p>
            </div>
        </div>
    );
};

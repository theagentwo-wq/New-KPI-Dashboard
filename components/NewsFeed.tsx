import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './Icon';
import { Modal } from './Modal';

interface Article {
  title: string;
  link: string;
  content: string;
  sourceName: string;
  pubDate: string;
}

const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
};

const ArticleCard: React.FC<{ article: Article, onSelect: () => void }> = ({ article, onSelect }) => {
    const snippet = stripHtml(article.content).substring(0, 100) + '...';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={onSelect}
            className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 hover:border-cyan-500 cursor-pointer flex flex-col justify-between h-full group"
        >
            <div>
                <p className="text-xs font-semibold text-cyan-400 mb-1">{article.sourceName}</p>
                <h3 className="text-md font-bold text-slate-200 group-hover:text-white transition-colors">{article.title}</h3>
                <p className="text-xs text-slate-400 mt-2">{snippet}</p>
            </div>
            <p className="text-xs text-slate-500 mt-3">{new Date(article.pubDate).toLocaleDateString()}</p>
        </motion.div>
    );
};

export const NewsFeed: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/.netlify/functions/rss-proxy');
        if (!response.ok) {
          throw new Error('Failed to fetch news feeds. The sources may be temporarily unavailable.');
        }
        const data: Article[] = await response.json();
        setArticles(data);
        setFilteredArticles(data);
        const uniqueCategories = ['All', ...Array.from(new Set(data.map(a => a.sourceName)))];
        setCategories(uniqueCategories);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        setArticles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);
  
  useEffect(() => {
    if (activeCategory === 'All') {
        setFilteredArticles(articles);
    } else {
        setFilteredArticles(articles.filter(a => a.sourceName === activeCategory));
    }
  }, [activeCategory, articles]);

  const handleSelectArticle = (article: Article) => {
    setSelectedArticle(article);
  };

  const handleCloseModal = () => {
    setSelectedArticle(null);
    setIsFullScreen(false);
  };
  
  const headerControls = (
    <div className="flex items-center gap-2">
       {selectedArticle && (
            <a href={selectedArticle.link} target="_blank" rel="noopener noreferrer" className="p-1 text-slate-400 hover:text-white" title="Read Full Article">
                <Icon name="externalLink" className="w-5 h-5" />
            </a>
       )}
        <button onClick={() => setIsFullScreen(!isFullScreen)} className="p-1 text-slate-400 hover:text-white" title={isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
            <Icon name={isFullScreen ? 'compress' : 'expand'} className="w-5 h-5" />
        </button>
    </div>
  );

  return (
    <div className="mt-4">
        <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-slate-700">
            {categories.map(category => (
                <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${
                        activeCategory === category
                        ? 'bg-cyan-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                >
                    {category}
                </button>
            ))}
        </div>

        {isLoading ? (
            <div className="flex items-center justify-center py-10 space-x-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.4s]"></div>
                <p className="text-slate-400">Fetching latest news...</p>
            </div>
        ) : error ? (
            <div className="text-center py-10">
                <p className="text-red-400">{error}</p>
            </div>
        ) : (
            <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
                <AnimatePresence>
                    {filteredArticles.length > 0 ? (
                        filteredArticles.map((article, index) => (
                            <ArticleCard key={`${article.link}-${index}`} article={article} onSelect={() => handleSelectArticle(article)} />
                        ))
                    ) : (
                        <p className="text-slate-500 col-span-full text-center py-10">No articles found for this category.</p>
                    )}
                </AnimatePresence>
            </motion.div>
        )}
      
      {selectedArticle && (
          <Modal 
            isOpen={!!selectedArticle} 
            onClose={handleCloseModal} 
            title={selectedArticle.sourceName}
            size={isFullScreen ? 'fullscreen' : 'large'}
            headerControls={headerControls}
          >
             <div className="prose prose-sm prose-invert max-w-none text-slate-200 h-full overflow-y-auto custom-scrollbar pr-2">
                <h3 className="text-cyan-400 !mb-2">{selectedArticle.title}</h3>
                <p className="text-xs text-slate-400 !mt-0">
                    Published: {new Date(selectedArticle.pubDate).toLocaleString()}
                </p>
                <div dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
                <div className="pt-4 mt-4 border-t border-slate-700 not-prose">
                    <a
                        href={selectedArticle.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md transition-colors no-underline"
                    >
                        <Icon name="externalLink" className="w-5 h-5" />
                        Read Full Article on {selectedArticle.sourceName}
                    </a>
                </div>
            </div>
          </Modal>
      )}
    </div>
  );
};

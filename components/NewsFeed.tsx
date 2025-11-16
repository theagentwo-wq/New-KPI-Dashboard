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

export const NewsFeed: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
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
          throw new Error('Failed to fetch news feeds.');
        }
        const data: Article[] = await response.json();
        setArticles(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        setArticles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

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
    <div className="mt-4 p-4 border border-slate-700 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-sm font-semibold text-slate-400 uppercase"
      >
        <div className="flex items-center gap-2">
             <Icon name="news" className="w-5 h-5" />
             <span>Industry News</span>
        </div>
        <Icon name={isOpen ? 'chevronLeft' : 'chevronRight'} className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-90' : '-rotate-90'}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-4 space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.1s]"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.2s]"></div>
                </div>
              ) : error ? (
                <p className="text-xs text-red-400 p-2">{error}</p>
              ) : articles.length > 0 ? (
                articles.map((article, index) => (
                  <button key={index} onClick={() => handleSelectArticle(article)} className="block w-full text-left p-2 rounded-md hover:bg-slate-700 transition-colors">
                    <p className="text-sm font-semibold text-slate-200 truncate">{article.title}</p>
                    <p className="text-xs text-cyan-400">{article.sourceName}</p>
                  </button>
                ))
              ) : (
                <p className="text-xs text-slate-500 p-2 text-center">No news articles available at this time.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {selectedArticle && (
          <Modal 
            isOpen={!!selectedArticle} 
            onClose={handleCloseModal} 
            title={selectedArticle.sourceName}
            size={isFullScreen ? 'fullscreen' : 'large'}
            headerControls={headerControls}
          >
             <div className="prose prose-sm prose-invert max-w-none text-slate-200 h-full overflow-y-auto custom-scrollbar">
                <h3 className="text-cyan-400 !mb-2">{selectedArticle.title}</h3>
                <p className="text-xs text-slate-400 !mt-0">
                    Published: {new Date(selectedArticle.pubDate).toLocaleString()}
                </p>
                <div dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
            </div>
          </Modal>
      )}
    </div>
  );
};
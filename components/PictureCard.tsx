import React from 'react';
import SkeletonLoader from './SkeletonLoader';

interface PictureCardProps {
    imageUrl?: string | null;
    isLoading?: boolean;
}

const PictureCard: React.FC<PictureCardProps> = ({ imageUrl = null, isLoading = false }) => {
  // Use the default static image only if no dynamic URL is provided.
  const displayUrl = imageUrl || "https://images.unsplash.com/photo-1528740561666-dc2479703592?q=80&w=1470&auto=format&fit=crop";
  const imageAlt = imageUrl ? "A scene for description" : "A busy outdoor market scene";

  return (
    <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700 animate-fade-in">
      <div className="max-w-md mx-auto">
        <div className="aspect-video w-full rounded-lg shadow-md overflow-hidden bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
            {isLoading ? <SkeletonLoader className="w-full h-full" /> : (
                <img 
                  src={displayUrl} 
                  alt={imageAlt}
                  className="w-full h-full object-cover" 
                />
            )}
        </div>
        {!isLoading && (
             <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                {imageUrl && imageUrl.startsWith('data:') 
                    ? 'AI-generated image for your test.' 
                    : 'Photo by Artem Beliaikin on Unsplash'}
            </p>
        )}
      </div>
    </div>
  );
};

export default PictureCard;
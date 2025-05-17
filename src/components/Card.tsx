'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNotification } from './NotificationContext';

interface CardProps {
  id: string;
  imageUrl: string;
  title: string;
  instructor: string;
  rating: number;
  totalRatings: number;
  price: number;
  discountedPrice?: number;
  isWishlisted?: boolean;
  isPurchased?: boolean; // New prop
  onWishlistToggle?: (id: string) => Promise<boolean> | void;
}

export default function Card({
  id,
  imageUrl,
  title,
  instructor,
  rating,
  totalRatings,
  price,
  discountedPrice,
  isWishlisted = false,
  isPurchased = false, // Default to false
  onWishlistToggle,
}: CardProps) {
  const [isClicked, setIsClicked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [localWishlisted, setLocalWishlisted] = useState(isWishlisted);
  const [isProcessing, setIsProcessing] = useState(false);
  const { showNotification } = useNotification(); 

  useEffect(() => {
    setLocalWishlisted(isWishlisted);
  }, [isWishlisted]);

  const handleWishlistClick = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    const previousState = localWishlisted;
    
    // Optimistic update
    setIsClicked(true);
    setLocalWishlisted(!previousState);
    
    try {
      if (onWishlistToggle) {
        const response = await fetch(`/api/user/wishlist/${id}`,{
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          }
        });
      
        const data = await response.json()
        if (!response.ok) {
          setLocalWishlisted(previousState);
          return showNotification(data.msg , "error"); 
        }
        showNotification(data.msg , "success"); 
      }
    } catch {
      showNotification('Wishlist update failed', "error");
      setLocalWishlisted(previousState);
    } finally {
      setIsClicked(false);
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 border border-gray-100 group w-full max-w-[240px]">
      {/* Image Container */}
      <div className="relative h-32 w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Purchased Tag */}
        {isPurchased && (
          <div className="absolute top-2 left-2 bg-gradient-to-br from-green-500 to-green-600 text-white text-[10px] px-1.5 py-0.5 rounded-[4px] flex items-center gap-0.5 shadow-sm backdrop-blur-[1px]">
            <Check size={10} className="text-white/90" />
            <span className="font-medium tracking-tight">Purchased</span>
          </div>
        )}
        
        {/* Enhanced Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          disabled={isProcessing}
          className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-sm transition-all duration-200 ${
            localWishlisted
              ? 'text-red-500 bg-white/90'
              : 'text-gray-600 bg-white/70 hover:bg-white/90'
          } ${
            isClicked ? 'scale-90' : 'scale-100'
          } ${
            (isHovered && !localWishlisted) ? 'text-red-400' : ''
          } ${isProcessing ? 'opacity-80 cursor-not-allowed' : ''}`}
          aria-label={localWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            size={16}
            fill={
              (localWishlisted || isHovered) 
                ? (localWishlisted ? 'currentColor' : 'transparent') 
                : 'none'
            }
            strokeWidth={
              (localWishlisted || isHovered) ? 2 : 1.5
            }
            className={`transition-all duration-200 ${
              isHovered && !localWishlisted ? 'stroke-red-400' : ''
            }`}
          />
        </button>
      </div>

      {/* Rest of the card content */}
      <div className="p-3">
        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">
          <Link href={`/courses/${id}`} className="hover:text-blue-600 transition-colors">
            {title}
          </Link>
        </h3>

        <p className="text-xs text-gray-500 mb-2">By {instructor}</p>

        <div className="flex items-center space-x-1 mb-2">
          <Star size={12} className="text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-medium text-gray-900">
            {rating.toFixed(1)}
          </span>
          <span className="text-xs text-gray-500">({totalRatings.toLocaleString()})</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            {discountedPrice && (discountedPrice - price !== 0 ) ? (
              <>
                <span className="text-sm font-bold text-gray-900">
                  ${discountedPrice?.toFixed(2)}
                </span>
                <span className="text-xs text-gray-500 line-through">
                  ${price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-sm font-bold text-gray-900">
                ${price.toFixed(2)}
              </span>
            )}
          </div>

          <Link
            href={`/course/${id}`}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}
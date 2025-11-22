'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNotification } from './NotificationContext';
import { useUser } from '@/context/userContext';

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
  isPurchased?: boolean;
  showRatings?: boolean;
  showWishlist?: boolean;
  onWishlistToggle?: () => void;
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
  isPurchased = false,
  showRatings = true,
  showWishlist = true,
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
    
    setIsClicked(true);
    setLocalWishlisted(!previousState);
    
    try {
      const response = await fetch(`/api/user/wishlist/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        }
      });
    
      const data = await response.json();
      if (!response.ok) {
        setLocalWishlisted(previousState);
        return showNotification(data.msg, "error"); 
      }
      showNotification(data.msg, "success"); 
      if (onWishlistToggle) onWishlistToggle();
    } catch {
      showNotification('Wishlist update failed', "error");
      setLocalWishlisted(previousState);
    } finally {
      setIsClicked(false);
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-300 border border-pink-100 group w-full max-w-[260px] transform hover:-translate-y-2 animate-fade-in">
      {/* Image Container */}
      <div className="relative h-44 w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-pink-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Purchased Tag */}
        {isPurchased && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur-sm border border-white/20 animate-scale-in">
            <Check size={13} className="text-white" />
            <span className="font-semibold tracking-tight">Purchased</span>
          </div>
        )}
        
        {/* Enhanced Wishlist Button */}
        {showWishlist && (
          <button
            onClick={handleWishlistClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            disabled={isProcessing}
            className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-sm transition-all duration-300 shadow-lg ${
              localWishlisted
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink-glow'
                : 'bg-white/95 text-pink-600 hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-500 hover:text-white'
            } ${
              isClicked ? 'scale-90' : 'scale-100'
            } ${isProcessing ? 'opacity-80 cursor-not-allowed' : 'hover:scale-110 hover:shadow-rose-glow'}`}
            aria-label={localWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              size={18}
              fill={
                (localWishlisted || isHovered) 
                  ? 'currentColor'
                  : 'none'
              }
              strokeWidth={2.5}
              className="transition-all duration-300"
            />
          </button>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5">
        <h3 className="font-bold text-base text-pink-900 line-clamp-2 mb-2 leading-tight">
          <Link href={`/course/${id}`} className="hover:text-rose-600 transition-colors">
            {title}
          </Link>
        </h3>

        <p className="text-sm text-pink-600 mb-3 font-medium">By {instructor}</p>

        {showRatings && (
          <div className="flex items-center space-x-1.5 mb-3">
            <Star size={16} className="text-amber-400 fill-amber-400" />
            <span className="text-sm font-bold text-pink-900">
              {rating.toFixed(1)}
            </span>
            <span className="text-sm text-pink-500">({totalRatings})</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-pink-100">
          <div className="flex flex-col">
                <span className="text-base font-bold text-rose-600">
                  Free
                </span>
          </div>

          <Link
            href={`/course/${id}`}
            className="text-sm font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 transition-all duration-200 px-4 py-2 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}
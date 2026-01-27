import React, { useState } from 'react';

/**
 * Enhanced Avatar component with debugging and fallback handling
 * Supports Supabase Storage URLs with automatic error recovery
 */
export default function Avatar({ 
    src, 
    alt = "Avatar", 
    name = "User",
    className = "w-full h-full object-cover",
    debug = false 
}) {
    const [imageError, setImageError] = useState(false);
    const [loadedSrc, setLoadedSrc] = useState(null);

    // Generate fallback avatar URL
    const getFallbackUrl = () => {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&bold=true`;
    };

    // Determine which source to use
    const getImageSrc = () => {
        if (imageError || !src) {
            return getFallbackUrl();
        }
        return src;
    };

    const handleError = (e) => {
        if (debug) {
            console.error('🖼️ [Avatar] Image load failed:', {
                attempted: src,
                fallback: getFallbackUrl(),
                name
            });
        }
        
        // Only fallback if we're not already showing the fallback
        if (!e.target.src.includes('ui-avatars')) {
            setImageError(true);
        }
    };

    const handleLoad = () => {
        if (debug && src) {
            console.log('✅ [Avatar] Image loaded successfully:', src);
        }
        setLoadedSrc(src);
    };

    const currentSrc = getImageSrc();

    return (
        <img 
            src={currentSrc}
            alt={alt}
            className={className}
            onError={handleError}
            onLoad={handleLoad}
            loading="lazy"
        />
    );
}

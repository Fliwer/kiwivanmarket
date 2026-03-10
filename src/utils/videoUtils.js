/**
 * Video Utilities
 * Handles extraction of IDs from various video platforms for embedding.
 */

export const getEmbedUrl = (url) => {
    if (!url) return null;

    try {
        // YouTube
        const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
        const ytMatch = url.match(ytRegex);
        if (ytMatch && ytMatch[1]) {
            return `https://www.youtube.com/embed/${ytMatch[1]}`;
        }

        // Vimeo
        const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/i;
        const vimeoMatch = url.match(vimeoRegex);
        if (vimeoMatch && vimeoMatch[1]) {
            return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
        }

        // TikTok
        const tiktokRegex = /tiktok\.com\/.*video\/(\d+)/i;
        const tiktokMatch = url.match(tiktokRegex);
        if (tiktokMatch && tiktokMatch[1]) {
            // TikTok embedding is a bit trickier, but we can try the basic embed URL
            return `https://www.tiktok.com/embed/v2/${tiktokMatch[1]}`;
        }

        return null;
    } catch (e) {
        console.error('Error parsing video URL:', e);
        return null;
    }
};

export const getSoundCloudEmbedUrl = (url) => {
    if (!url) return null;
    // SoundCloud doesn't have a simple ID-to-embed URL like YouTube.
    // However, we can use their official embed player URL structure.
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23059669&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`;
};

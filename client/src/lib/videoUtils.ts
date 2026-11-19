/**
 * Helper to build a clean YouTube embed URL that:
 * 1. Autoplays inside the page
 * 2. Mutes initial playback (standard browser policy required for reliable autoplay)
 * 3. Hides related external videos (rel=0)
 * 4. Removes YouTube branding & annotations (modestbranding=1, iv_load_policy=3)
 * 5. Uses youtube-nocookie.com domain
 * 6. Prevents opening external YouTube window / navigation
 */
export function getYouTubeEmbedUrl(url: string, autoplay: boolean = true): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  let videoId = "";

  // Handle standard watch URLs: https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) {
    videoId = watchMatch[1];
  } else {
    // Handle short links: https://youtu.be/VIDEO_ID
    const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch) {
      videoId = shortMatch[1];
    } else {
      // Handle embed / shorts URLs: https://youtube.com/embed/VIDEO_ID or /shorts/VIDEO_ID
      const embedMatch = trimmed.match(/youtube\.com\/(?:embed|shorts)\/([a-zA-Z0-9_-]{11})/);
      if (embedMatch) {
        videoId = embedMatch[1];
      }
    }
  }

  if (!videoId) return null;

  const params = new URLSearchParams({
    autoplay: autoplay ? "1" : "0",
    mute: autoplay ? "1" : "0", // Browsers only allow autoplay when muted
    controls: "1",
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    iv_load_policy: "3",
    fs: "1",
    disablekb: "0",
  });

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

export function isYouTubeUrl(url?: string): boolean {
  if (!url) return false;
  return /youtube\.com|youtu\.be/.test(url);
}

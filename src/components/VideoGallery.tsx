import { Play } from "lucide-react";
import { useState } from "react";
import videoThumb1 from "@/assets/videos/video-thumb-1.jpg";
import videoThumb2 from "@/assets/videos/video-thumb-2.jpg";
import videoThumb3 from "@/assets/videos/video-thumb-3.jpg";
import videoThumb4 from "@/assets/videos/video-thumb-4.jpg";

const videos = [
  {
    title: "সুন্দরবনের বিশাল বড় চাক কেটে মধু সংগ্রহ",
    thumbnail: videoThumb1,
    videoUrl: "https://www.youtube.com/watch?v=Plrux0TMk7I&pp=ygUMbW9kaHUgIHZhbmdh",
  },
  {
    title: "সুন্দরবনের বিশাল বড় চাক কেটে মধু সংগ্রহ",
    thumbnail: videoThumb2,
    videoUrl: "https://www.youtube.com/watch?v=SMh4tRuUv00&pp=ygUMbW9kaHUgIHZhbmdh",
  },
  {
    title: "সৌদি আরব খেজুরের দাম বিস্তারিত জানুন",
    thumbnail: videoThumb3,
    videoUrl: "https://www.youtube.com/watch?v=PGid7mcQqgg&pp=ygUXa2hlanVyIHZhbmdhIHNvdWRpIGFyb2I%3D",
  },
  {
    title: "যে গুড় খেয়ে অভিভূত হয়েছিলেন রানী এলিজাবেথ",
    thumbnail: videoThumb4,
    videoUrl: "https://www.youtube.com/watch?v=F1h_lVbUmHE&pp=ygUPZ3VyIGJhbmdsYWRlc2hp",
  },
];

const getYoutubeId = (url: string) => {
  try {
    const normalized = url.trim();
    if (!normalized) return null;

    const plainIdRegex = /^[A-Za-z0-9_-]{11}$/;
    if (plainIdRegex.test(normalized)) return normalized;

    const youtubeRegex = /(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
    const match = normalized.match(youtubeRegex);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
};

const getVideoEmbedSrc = (video: { videoId?: string; videoUrl?: string }) => {
  const source = video.videoUrl ?? video.videoId;
  if (!source) return "";

  const id = getYoutubeId(source);
  if (id) return `https://www.youtube.com/embed/${id}?autoplay=1`;
  return source;
};

const getThumbnail = (video: { thumbnail?: string; videoId?: string; videoUrl?: string }) => {
  if (video.thumbnail) return video.thumbnail;
  const source = video.videoUrl ?? video.videoId ?? "";
  const id = getYoutubeId(source);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
};

const getVideoThumbnailFromSource = (video: { videoId?: string; videoUrl?: string }) => {
  const source = video.videoUrl ?? video.videoId ?? "";
  const id = getYoutubeId(source);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
};

const VideoGallery = () => {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold text-center mb-2">VIDEO GALLERY</h2>
      <p className="text-center text-muted-foreground mb-6">আমাদের ভিডিও গ্যালারি</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {videos.map((video, i) => {
          const src = getVideoEmbedSrc(video);
          const fallbackThumbnail = getVideoThumbnailFromSource(video);
          const thumbnail = video.thumbnail ?? fallbackThumbnail;

          return (
            <div key={i} className="relative aspect-video bg-muted rounded-xl overflow-hidden border hover:shadow-md transition-shadow">
              {playingIndex === i ? (
                <iframe
                  src={src}
                  title={video.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="cursor-pointer group w-full h-full" onClick={() => setPlayingIndex(i)}>
                  <img
                    src={thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(event) => {
                      const target = event.currentTarget as HTMLImageElement;
                      if (fallbackThumbnail && target.src !== fallbackThumbnail) {
                        target.src = fallbackThumbnail;
                      } else if (!fallbackThumbnail) {
                        target.style.display = "none";
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-destructive text-white rounded-full p-3">
                      <Play className="h-8 w-8 fill-current" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <p className="text-white text-sm font-medium line-clamp-1">{video.title}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default VideoGallery;

import { PlayCircle } from "lucide-react";
import { facultyVideo } from "@/lib/site";

/**
 * The "how it works" walkthrough on /become-a-faculty.
 *
 * Plays a YouTube video (privacy-enhanced embed) or a self-hosted file,
 * whichever is configured in `facultyVideo` (lib/site.ts). Until one is set,
 * a branded placeholder keeps the layout intact.
 */
export default function FacultyVideo() {
  const { youtubeId, src, poster } = facultyVideo;

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-navy-900/8 bg-navy-950 shadow-lift">
      <div className="relative aspect-video w-full">
        {youtubeId ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}?rel=0&modestbranding=1`}
            title="How to become a Wellthyfy faculty"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="absolute inset-0 size-full"
          />
        ) : src ? (
          <video
            controls
            preload="metadata"
            playsInline
            poster={poster || undefined}
            className="absolute inset-0 size-full bg-navy-950 object-cover"
          >
            <source src={src} />
            Your browser cannot play this video.
          </video>
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(135deg,#14402a_0%,#2e8b57_30%,#0a4d9d_70%,#083c79_100%)] p-6 text-center grain">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(101,183,65,0.45),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(244,197,66,0.35),transparent_50%)]" />
            <div className="relative">
              <span className="mx-auto grid size-20 place-items-center rounded-full bg-white/15 ring-1 ring-white/30 backdrop-blur-sm sm:size-24">
                <PlayCircle className="size-10 text-white sm:size-12" strokeWidth={1.5} />
              </span>
              <p className="mt-5 text-lg font-semibold text-white sm:text-xl">
                Walkthrough video coming soon
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-white/80">
                Until then, the steps below show exactly how it works.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
  Play, Download, Trash2, X, Loader2, Film,
  Calendar, User, HardDrive, Upload, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { type VideoMetadata } from '../backend';
import { useGetAllVideos, useDeleteVideo } from '../hooks/useQueries';
import { downloadVideo } from '../utils/videoDownload';

function formatFileSize(bytes: bigint): string {
  const n = Number(bytes);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatDate(time: bigint): string {
  const ms = Number(time / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

function VideoCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <Skeleton className="w-full aspect-video bg-secondary" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4 bg-secondary" />
        <Skeleton className="h-4 w-1/2 bg-secondary" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-9 flex-1 bg-secondary" />
          <Skeleton className="h-9 flex-1 bg-secondary" />
        </div>
      </div>
    </div>
  );
}

interface VideoCardProps {
  video: VideoMetadata;
  onPlay: (video: VideoMetadata) => void;
}

function VideoCard({ video, onPlay }: VideoCardProps) {
  const deleteVideo = useDeleteVideo();
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const isDownloading = downloadProgress !== null;

  const handleDownload = async () => {
    setDownloadProgress(0);
    try {
      const filename = `${video.title.replace(/[^a-z0-9]/gi, '_')}.mp4`;
      await downloadVideo(video.blob, filename, (pct) => setDownloadProgress(pct));
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloadProgress(null);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden card-hover group">
      {/* Thumbnail */}
      <div
        className="relative aspect-video bg-secondary cursor-pointer overflow-hidden"
        onClick={() => onPlay(video)}
      >
        <img
          src="/assets/generated/video-placeholder.dim_400x225.png"
          alt={video.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-teal/90 flex items-center justify-center shadow-teal">
            <Play className="w-6 h-6 text-background ml-1" fill="currentColor" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3
          className="font-display font-semibold text-foreground text-base leading-tight mb-2 line-clamp-2 cursor-pointer hover:text-teal transition-colors"
          onClick={() => onPlay(video)}
        >
          {video.title}
        </h3>

        {video.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{video.description}</p>
        )}

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {video.uploader || 'Anonymous'}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(video.uploadTime)}
          </span>
          <span className="flex items-center gap-1">
            <HardDrive className="w-3 h-3" />
            {formatFileSize(video.fileSize)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => onPlay(video)}
            className="flex-1 bg-teal text-background hover:bg-teal-light font-medium h-9"
          >
            <Play className="w-3.5 h-3.5 mr-1.5" fill="currentColor" />
            Play
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 border-border text-foreground hover:bg-secondary hover:border-teal h-9 font-medium"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-teal" />
                {downloadProgress}%
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Download
              </>
            )}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="w-9 h-9 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">Delete Video</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  Are you sure you want to delete <span className="text-foreground font-medium">"{video.title}"</span>? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-border text-foreground hover:bg-secondary">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteVideo.mutate(video.videoId)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleteVideo.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}

interface VideoPlayerModalProps {
  video: VideoMetadata | null;
  onClose: () => void;
}

function VideoPlayerModal({ video, onClose }: VideoPlayerModalProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVideo = async (v: VideoMetadata) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = v.blob.getDirectURL();
      setVideoUrl(url);
    } catch (err) {
      setError('Failed to load video. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load video when modal opens
  if (video && !videoUrl && !isLoading && !error) {
    loadVideo(video);
  }

  const handleClose = () => {
    setVideoUrl(null);
    setIsLoading(false);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={!!video} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-card border-border max-w-4xl w-full p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-3">
          <DialogTitle className="font-display font-bold text-foreground text-lg pr-8">
            {video?.title}
          </DialogTitle>
          {video?.description && (
            <DialogDescription className="text-muted-foreground text-sm">
              {video.description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="relative bg-black aspect-video w-full">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-teal" />
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center text-destructive text-sm px-4 text-center">
              {error}
            </div>
          )}
          {videoUrl && !isLoading && (
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full h-full"
            />
          )}
        </div>

        {video && (
          <div className="px-6 py-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground border-t border-border">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              {video.uploader || 'Anonymous'}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(video.uploadTime)}
            </span>
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5" />
              {formatFileSize(video.fileSize)}
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function LibraryPage() {
  const { data: videos, isLoading, isError, refetch } = useGetAllVideos();
  const [playingVideo, setPlayingVideo] = useState<VideoMetadata | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVideos = videos?.filter((v) =>
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.uploader.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? [];

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display font-bold text-2xl text-foreground">Video Library</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {videos ? `${videos.length} video${videos.length !== 1 ? 's' : ''} stored` : 'Loading...'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos..."
              className="pl-9 bg-input border-border text-foreground placeholder:text-muted-foreground w-48 sm:w-64"
            />
          </div>

          <Link to="/upload">
            <Button className="bg-teal text-background hover:bg-teal-light font-semibold shadow-teal-sm whitespace-nowrap">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </Link>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Film className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="font-display font-semibold text-foreground text-lg mb-2">Failed to load videos</h3>
          <p className="text-muted-foreground mb-4">Something went wrong while fetching your videos.</p>
          <Button onClick={() => refetch()} variant="outline" className="border-border text-foreground hover:bg-secondary">
            Try Again
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredVideos.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-5">
            <Film className="w-10 h-10 text-teal" />
          </div>
          {searchQuery ? (
            <>
              <h3 className="font-display font-semibold text-foreground text-xl mb-2">No results found</h3>
              <p className="text-muted-foreground mb-5">No videos match "{searchQuery}".</p>
              <Button onClick={() => setSearchQuery('')} variant="outline" className="border-border text-foreground hover:bg-secondary">
                Clear Search
              </Button>
            </>
          ) : (
            <>
              <h3 className="font-display font-semibold text-foreground text-xl mb-2">Your vault is empty</h3>
              <p className="text-muted-foreground mb-5">Upload your first video to get started.</p>
              <Link to="/upload">
                <Button className="bg-teal text-background hover:bg-teal-light font-semibold shadow-teal-sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload First Video
                </Button>
              </Link>
            </>
          )}
        </div>
      )}

      {/* Video Grid */}
      {!isLoading && !isError && filteredVideos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredVideos.map((video) => (
            <VideoCard
              key={video.videoId}
              video={video}
              onPlay={setPlayingVideo}
            />
          ))}
        </div>
      )}

      {/* Video Player Modal */}
      <VideoPlayerModal
        video={playingVideo}
        onClose={() => setPlayingVideo(null)}
      />
    </div>
  );
}

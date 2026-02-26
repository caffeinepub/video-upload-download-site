import { useState, useRef, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Upload, FileVideo, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ExternalBlob } from '../backend';
import { useAddVideo } from '../hooks/useQueries';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function generateVideoId(): string {
  return `vid_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export default function UploadPage() {
  const navigate = useNavigate();
  const addVideo = useAddVideo();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploader, setUploader] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const acceptedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/ogg'];

  const handleFileSelect = (file: File) => {
    if (!acceptedTypes.includes(file.type) && !file.name.match(/\.(mp4|webm|mov|avi|mkv|ogv)$/i)) {
      setErrorMessage('Please select a valid video file (MP4, WebM, MOV, AVI, MKV).');
      return;
    }
    setSelectedFile(file);
    setErrorMessage('');
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }, [title]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setStatus('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    if (!title.trim()) {
      setErrorMessage('Title is required.');
      return;
    }

    setStatus('uploading');
    setUploadProgress(0);
    setErrorMessage('');

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((pct) => {
        setUploadProgress(pct);
      });

      const videoId = generateVideoId();

      await addVideo.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        uploader: uploader.trim() || 'Anonymous',
        fileSize: BigInt(selectedFile.size),
        videoId,
        blob,
      });

      setStatus('success');
      setUploadProgress(100);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    }
  };

  const handleUploadAnother = () => {
    setSelectedFile(null);
    setTitle('');
    setDescription('');
    setUploader('');
    setUploadProgress(0);
    setStatus('idle');
    setErrorMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (status === 'success') {
    return (
      <div className="max-w-lg mx-auto animate-fade-in">
        <Card className="bg-card border-border text-center">
          <CardContent className="pt-10 pb-8 px-8">
            <div className="w-16 h-16 rounded-full bg-teal-muted flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-teal" />
            </div>
            <h2 className="font-display font-bold text-2xl text-foreground mb-2">Upload Complete!</h2>
            <p className="text-muted-foreground mb-6">
              <span className="text-foreground font-medium">"{title}"</span> has been uploaded successfully.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => navigate({ to: '/' })}
                className="bg-teal text-background hover:bg-teal-light font-semibold"
              >
                View Library
              </Button>
              <Button
                variant="outline"
                onClick={handleUploadAnother}
                className="border-border text-foreground hover:bg-secondary"
              >
                Upload Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h2 className="font-display font-bold text-2xl text-foreground">Upload Video</h2>
        <p className="text-muted-foreground mt-1">Share your video with the vault. Supports MP4, WebM, MOV, AVI, MKV.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !selectedFile && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            isDragging
              ? 'border-teal bg-teal-muted cursor-copy'
              : selectedFile
              ? 'border-teal bg-teal-muted cursor-default'
              : 'border-border hover:border-teal hover:bg-secondary/50 cursor-pointer'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,.mp4,.webm,.mov,.avi,.mkv,.ogv"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {selectedFile ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-teal flex items-center justify-center flex-shrink-0">
                <FileVideo className="w-6 h-6 text-background" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-medium text-foreground truncate">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleRemoveFile(); }}
                className="w-8 h-8 rounded-full bg-secondary hover:bg-destructive/20 flex items-center justify-center transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          ) : (
            <div>
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3">
                <Upload className="w-7 h-7 text-teal" />
              </div>
              <p className="font-medium text-foreground mb-1">Drop your video here</p>
              <p className="text-sm text-muted-foreground">or click to browse files</p>
              <p className="text-xs text-muted-foreground mt-2">MP4, WebM, MOV, AVI, MKV supported</p>
            </div>
          )}
        </div>

        {/* Metadata Fields */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-foreground">Video Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-sm font-medium text-foreground">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter video title..."
                className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-teal focus:border-teal"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="uploader" className="text-sm font-medium text-foreground">
                Your Name
              </Label>
              <Input
                id="uploader"
                value={uploader}
                onChange={(e) => setUploader(e.target.value)}
                placeholder="Anonymous"
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-sm font-medium text-foreground">
                Description <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your video..."
                rows={3}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Upload Progress */}
        {status === 'uploading' && (
          <div className="space-y-2 animate-fade-in">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-teal" />
                Uploading...
              </span>
              <span className="text-teal font-medium">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2 bg-secondary [&>div]:bg-teal" />
          </div>
        )}

        {/* Error Message */}
        {(errorMessage || status === 'error') && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{errorMessage || 'Upload failed. Please try again.'}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!selectedFile || !title.trim() || status === 'uploading'}
          className="w-full bg-teal text-background hover:bg-teal-light font-semibold h-11 text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-teal-sm"
        >
          {status === 'uploading' ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading {uploadProgress}%...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload Video
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

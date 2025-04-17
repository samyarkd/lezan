export default function VideoDemo() {
  return (
    <div className="pb-1">
      <div className="border-primary overflow-hidden rounded-lg border">
        <iframe
          className="min-h-40 w-full"
          src="https://www.youtube-nocookie.com/embed/0peGuCt7UvA?si=YXQiOCW2wRU57yYH"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        ></iframe>
      </div>
      <p className="text-muted-foreground text-center text-xs">Guide Video</p>
    </div>
  );
}

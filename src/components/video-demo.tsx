export default function VideoDemo() {
  return (
    <div className="pb-1">
      <div className="border-primary overflow-hidden rounded-lg border">
        <iframe
          className="min-h-42 w-full"
          src="https://youtube.com/embed/0peGuCt7UvA"
          allowFullScreen
        />
      </div>
      <p className="text-muted-foreground text-center text-xs">Guide Video</p>
    </div>
  );
}

import AnimatedSticker from "~/components/animated-stickers";

export default function Loading() {
  return (
    <AnimatedSticker
      title="Authentication"
      desc="Loading, please wait..."
      data={{
        src: "/ass/running_dog.json",
      }}
    />
  );
}

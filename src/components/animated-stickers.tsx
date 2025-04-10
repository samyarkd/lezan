"use client";

import { useEffect, useRef } from "react";
import { DotLottie, type Data } from "@lottiefiles/dotlottie-web";

import { cn } from "~/lib/utils";
import Typography from "./typography";

const AnimatedSticker: React.FC<{
  title?: string;
  desc?: string;
  data: { raw: Data; src?: undefined } | { src: string; raw?: undefined };
  flipH?: boolean;
  responsive?: boolean;
}> = (props) => {
  const canvasEl = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    new DotLottie({
      autoplay: true,
      loop: true,
      canvas: canvasEl.current!,
      src: props.data.src, // Dynamic source
      data: props.data.raw,
    });
  }, []);

  return (
    <div className="my-auto flex flex-col items-center gap-4 p-4">
      <canvas
        ref={canvasEl}
        id="dotlottie-canvas"
        className={cn("h-56 w-56 backdrop-blur-xs", {
          "-scale-x-100": props.flipH,
          "h-28 w-28 lg:h-56 lg:w-56": props.responsive,
        })}
      />

      {props.desc && props.title && (
        <div className="flex max-w-80 flex-col gap-2 text-center">
          {props.title && <Typography variant="h1">{props.title}</Typography>}
          {props.desc && <Typography variant="p">{props.desc}</Typography>}
        </div>
      )}
    </div>
  );
};

export default AnimatedSticker;

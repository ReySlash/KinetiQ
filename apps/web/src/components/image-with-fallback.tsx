"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type ImageWithFallbackProps = Omit<ImageProps, "onError" | "src"> & {
  src: string;
  fallbackSrc: string;
  alt: string;
};

export default function ImageWithFallback({
  src,
  fallbackSrc,
  alt,
  ...props
}: ImageWithFallbackProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const imageSrc = failedSrc === src ? fallbackSrc : src;

  return (
    <Image
      {...props}
      src={imageSrc}
      alt={alt}
      onError={() => {
        setFailedSrc(src);
      }}
    />
  );
}

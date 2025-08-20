"use client";

import Image from "next/image";
import { useState } from "react";

interface Props {
  src: string;
  alt: string;
  className?: string;
}

export default function AnimeImage({ src, alt, className }: Props) {
  const [error, setError] = useState(false);

  return (
    <div className="relative w-full aspect-[2/3]">
      {!error ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="150px"
          className={className}
          onError={() => setError(true)}
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-500">
          <span>No Image</span>
        </div>
      )}
    </div>
  );
}

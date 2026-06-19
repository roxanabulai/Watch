"use client";

import Image from "next/image";
import { useState } from "react";

export function ImageGallery({ images }: { images: { url: string; alt: string }[] }) {
  const [active, setActive] = useState(0);
  const selected = images[active] ?? images[0];
  return (
    <div className="space-y-3">
      <div className="relative aspect-[5/4] overflow-hidden rounded-lg bg-secondary">
        <Image src={selected.url} alt={selected.alt} fill className="object-cover" priority sizes="(min-width:1024px) 58vw, 100vw" />
      </div>
      <div className="grid grid-cols-4 gap-3">
        {images.map((image, index) => (
          <button key={image.url} onClick={() => setActive(index)} className="relative aspect-square overflow-hidden rounded-md border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Image src={image.url} alt={image.alt} fill className="object-cover" sizes="100px" />
          </button>
        ))}
      </div>
    </div>
  );
}

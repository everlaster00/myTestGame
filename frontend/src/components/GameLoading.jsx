// src/components/GameLoading.jsx
'use client'

import Image from "next/image";
import { useEffect, useState } from "react"

export default function GameLoading() {
  const [semiCount, setSemiCount ] = useState(1);
  const loadingImageSrc = '/assets/loadingImage.webp';
  const blurUrl = 'data:image/webp;base64,UklGRqIAAABXRUJQVlA4IKIqAAAQAgCdASoQABAAAwAAtJgAAP4S+gAA/v7/yAA='

  useEffect (()=> {
    const loadInterval = setInterval(() => {
      setSemiCount(prevCount => {
        return prevCount >= 5 ? 1 : prevCount + 1;
      });
    }, 500);

    return () => clearInterval(loadInterval)
  }, 
  []
  );

  const loadMSG = '로딩 중' + '.'.repeat(semiCount);

  return (
    <div className="LoadingScreenContainer w-screen h-screen flex flex-col justify-start items-center relative">
      <div className="absolute inset-0 bg-black backdrop-blur-3xl" >
        <Image 
          src={loadingImageSrc}
          alt="LoadingImage"
          placeholder='blur'
          blurDataURL={blurUrl}
          width={2048}
          height={2048}
          className="object-contain object-top w-full h-full" 
        />
      </div>
      <div className="LSSpacer h-[15%]" />
      <div className="GuideBox mx-auto p-2 border rounded-2xl bg-amber-300/90 
        ring-3 ring-amber-700/20 inset-shadow-sm/90 inset-shadow-amber-900 z-5">
        <p className="font-Dongle font-black text-white text-outline
          text-3xl ml-6 min-w-23 z-5">
            {loadMSG}
        </p>          
      </div>
    </div>
  )
}
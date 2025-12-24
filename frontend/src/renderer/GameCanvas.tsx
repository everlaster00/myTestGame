// src/renderer/GameCanvas.tsx
'use client';
import { Application, extend } from '@pixi/react' 
import { AnimatedSprite, BitmapText, Container, Graphics, HTMLText, Sprite, Text } from 'pixi.js'
import { useEffect, useRef, useState } from 'react'
import WorldContainer from './main/WorldContainer'
import { assetsLoader } from '@/lib/assets/assetsManager';
import GameLoading from '@@/GameLoading';
import { Bundles } from '@/lib/assets/assetsDefinitions';

extend({
  Container,
  Sprite,
  AnimatedSprite,
  Text,
  HTMLText,
  BitmapText,
  Graphics
});

const GameCanvas = () => {
  const parentRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // 에러 상태 추가!

  useEffect(() => {
    const loadAssets = async () => {
      try {
        // 1. 에셋 로딩 시작!
        const state = await assetsLoader([Bundles.hero, Bundles.worldmap]);
        
        if (state === 'ready') {
          setLoading(false);
        } else {
          console.warn("⚠️ 예상치 못한 상태라예:", state);
        }
      } catch (err) {
        // 2. 실패하면 콘솔에 찍고 에러 상태 업데이트!
        console.error("🔥 에셋 로드 실패했다 안카나:", err);
        setError("에셋을 불러오지 못했다 안카나! 경로 함 확인해봐래이.");
      }
    };

    loadAssets();
  }, []);

  // 에러 발생 시 처리
  if (error) return <div style={{color: 'white'}}>{error}</div>;

  return (
    loading ? 
      <GameLoading />
    :
      <Application autoDensity={true} resizeTo={window} ref={parentRef} backgroundColor={0x000000}>
        <WorldContainer /> 
      </Application>
  );
}

export default GameCanvas;
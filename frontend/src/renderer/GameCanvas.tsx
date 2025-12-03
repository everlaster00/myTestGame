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
  // const app = useApplication(); 
  const parentRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    assetsLoader(Bundles.mainAssets).then( state => {
      if(state === 'ready') { return setLoading(false)};
      console.warn("로딩 완료가 아닌 결과가 들어왔으니까 확인해 봐! [state값]",state);
    },()=>{console.warn("프로미스가 실패했다고?!");})
  },[]);


  return (
    loading? 
      <GameLoading />
    :
      <Application autoDensity={true} resizeTo={window} ref={parentRef} backgroundColor={0x241542}>
        <WorldContainer /> 
      </Application>
  )
}

export default GameCanvas;
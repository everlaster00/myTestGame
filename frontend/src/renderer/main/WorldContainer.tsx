// src/renderer/main/WorldContainer.tsx

import { WORLD } from "@/consts/setting";
import { Alias } from "@/lib/assets/assetsDefinitions";
import { AssetMain } from "@/lib/assets/assetsManager";
import { useApplication } from "@pixi/react";
import { useCallback, useEffect, useState, useMemo } from "react"; 

const WorldContainer= () => {
  const { app } = useApplication();
  
  const [screenSize, setScreenSize ] = useState({
    width: app.screen.width,
    height: app.screen.height
  });

  const handleResize = useCallback(() => {
    setScreenSize({
      width: app.screen.width,
      height: app.screen.height
    })
  }, [app.screen.width, app.screen.height, setScreenSize]); 
  
  const { currentScale, offsetX, offsetY } = useMemo(() => {
    const appWidth = screenSize.width;
    const appHeight = screenSize.height;

    const scaleX = appWidth / WORLD.WIDTH;
    const scaleY = appHeight / WORLD.HEIGHT;

    const currentScale = Math.min(scaleX, scaleY);

    const scaledWorldWidth = WORLD.WIDTH * currentScale;
    const scaledWorldHeight = WORLD.HEIGHT * currentScale;

    const offsetX = (appWidth - scaledWorldWidth) / 2;
    const offsetY = (appHeight - scaledWorldHeight) / 2;
    
    return { currentScale, offsetX, offsetY };
    
  }, [screenSize]); 

  useEffect(()=> {
    app.renderer.on('resize',handleResize);
    return () => {
      app.renderer.off('resize', handleResize);
    }
  },[app.renderer, handleResize]); 
  
  const oceanTxtr = AssetMain.get(Alias.worldOcean)
  const adventurerTxtr = AssetMain.get(Alias.hero);

  if (!oceanTxtr || !adventurerTxtr) return null;

  return (
    <pixiContainer 
      isRenderGroup={true} 
      width={WORLD.WIDTH} 
      height={WORLD.HEIGHT} 
      scale={currentScale} 
      x={offsetX} 
      y={offsetY}
    >
      <pixiSprite 
        texture={oceanTxtr}
        width={WORLD.WIDTH}
        height={WORLD.HEIGHT}
      />
      
      <pixiSprite
        texture={adventurerTxtr}
        anchor={0.5} 
        x={WORLD.WIDTH / 2} 
        y={WORLD.HEIGHT / 2}
        roundPixels={true}
      />
    </pixiContainer>
  )
}

export default WorldContainer;
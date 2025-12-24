// src/renderer/main/WorldContainer.tsx
'use client';

import { WORLD, RENDERER_SETTINGS } from "@/consts/setting";
import { Alias } from "@/lib/assets/assetsDefinitions";
import { AssetMain } from "@/lib/assets/assetsManager";
import { MAPDATA } from "@/assets/map/MAPDATA";
import { useApplication } from "@pixi/react";
import { useCallback, useEffect, useState, useMemo, useRef } from "react"; 
import { Rectangle, Texture, Graphics, Container as PixiContainer } from "pixi.js";
import { useCamera } from "@/hooks/useCamera";
import { useHeroMovement } from "@/hooks/useHeroMovement";

const WorldContainer = () => {
  const { app, isInitialised } = useApplication();
  const [screenSize, setScreenSize] = useState({ width: app.screen.width, height: app.screen.height });
  
  // 💙 리액트 컴포넌트 에러를 피하기 위해 순수 픽시 인스턴스를 담을 ref
  const overlayRef = useRef<PixiContainer>(null);

  const spawnObj = MAPDATA.worldmap.layers[0].objects[0];
  const { pos: heroPos, lastHorizontal } = useHeroMovement(spawnObj.x, spawnObj.y); 
  const { getCameraTransform } = useCamera(7.5);

  const handleResize = useCallback(() => {
    setScreenSize({ width: app.screen.width, height: app.screen.height });
  }, [app.screen.width, app.screen.height]); 

  useEffect(() => {
    if (!isInitialised) return;
    app.renderer.on('resize', handleResize);
    return () => { app.renderer.off('resize', handleResize); };
  }, [app.renderer, handleResize, isInitialised]); 

  // 💙 픽시 엔진 레벨에서 직접 드로잉 (리액트 태그 에러 방지)
  useEffect(() => {
    if (!isInitialised || !overlayRef.current) return;

    const container = overlayRef.current;
    container.removeChildren(); // 기존에 그려진 거 싹 지움

    const g = new Graphics();
    const w = WORLD.WIDTH;
    const h = WORLD.HEIGHT;
    const steps = 90; // 테두리 블러 두께임

    // 맵 테두리에 그라데이션 노가다 작업
    for (let i = 0; i < steps; i++) {
      const alpha = (1 - i / steps) * 0.5;
      g.rect(i, i, w - i * 2, h - i * 2)
        .stroke({ color: 0x010101, width: 5, alpha: alpha });
    }

    container.addChild(g);
    
    return () => {
      g.destroy();
    };
  }, [isInitialised]);

  const { cameraScale, cameraX, cameraY } = useMemo(() => {
    const transform = getCameraTransform(heroPos.x, heroPos.y, screenSize.width, screenSize.height, WORLD.WIDTH, WORLD.HEIGHT);
    return { cameraScale: transform.scale, cameraX: transform.x, cameraY: transform.y };
  }, [heroPos, screenSize, getCameraTransform]);

  const currentMap = MAPDATA.worldmap;

  // 1. 지형 레이어
  const groundLayers = useMemo(() => {
    const elements: React.ReactNode[] = [];
    const { tilesets, layers, tilewidth, tileheight, width: mapWidth } = currentMap;
    layers.forEach((layer, lIdx) => {
      if (layer.type === 'tilelayer' && 'data' in layer && layer.data && lIdx < 4) {
        layer.data.forEach((gid, dIdx) => {
          if (gid === 0) return;
          const tileset = [...tilesets].sort((a, b) => b.firstgid - a.firstgid).find(ts => gid >= ts.firstgid);
          if (!tileset) return;
          const textureAlias = Alias[tileset.name as keyof typeof Alias];
          const texture = AssetMain.get(textureAlias);
          if (!texture) return;
          const localGid = gid - tileset.firstgid;
          const columns = Math.floor(texture.width / tileset.tilewidth);
          elements.push(
            <pixiSprite 
              key={`tile-${lIdx}-${dIdx}`} 
              texture={new Texture({ 
                source: texture.source, 
                frame: new Rectangle((localGid % columns) * tileset.tilewidth, Math.floor(localGid / columns) * tileset.tileheight, tileset.tilewidth, tileset.tileheight) 
              })}
              x={(dIdx % mapWidth) * tilewidth}
              y={Math.floor(dIdx / mapWidth) * tileheight}
              zIndex={0}
            />
          );
        });
      }
    });
    return elements;
  }, [currentMap]);

  // 2. 오브젝트 레이어
  const objectLayerElements = useMemo(() => {
    const objectLayer = currentMap.layers[4];
    if (!objectLayer || !('objects' in objectLayer)) return null;

    const heroAsset = AssetMain.get(Alias.hero);
    const heroHeight = (heroAsset?.height || 0) * WORLD.HERO_SCALE;
    const heroHeadY = heroPos.y - (heroHeight * 0.85);

    return objectLayer.objects.map((obj, oIdx) => {
      if (!obj.gid) return null;
      const tileset = [...currentMap.tilesets].sort((a, b) => b.firstgid - a.firstgid).find(ts => obj.gid! >= ts.firstgid);
      if (!tileset) return null;

      const textureAlias = Alias[tileset.name as keyof typeof Alias];
      const atlasTexture = AssetMain.get(textureAlias);
      if (!atlasTexture) return null;

      const tilesetName = (tileset.name as string).toLowerCase();
      const isBonfire = tilesetName.includes('bonfire');
      const isLake = tilesetName.includes('lake');

      if (isBonfire && tileset.tiles) {
        const frames = tileset.tiles.map(t => new Texture({
          source: atlasTexture.source,
          frame: new Rectangle(t.x, t.y, t.width, t.height)
        }));

        return (
          <pixiAnimatedSprite 
            key={`ani-obj-${oIdx}`}
            textures={frames}
            autoPlay={true}
            loop={true}
            animationSpeed={0.1}
            x={obj.x}
            y={obj.y - (obj.height || 0)}
            zIndex={0}
          />
        );
      }

      const localGid = obj.gid - tileset.firstgid;
      const tileInfo = tileset.tiles?.find(t => t.id === localGid);
      if (tileInfo) {
        const isHiding = !isLake && !isBonfire && 
                        heroPos.x > obj.x && heroPos.x < obj.x + (obj.width || 0) && 
                        heroHeadY > (obj.y - (obj.height || 0)) && heroHeadY < obj.y && 
                        heroPos.y < obj.y;

        return (
          <pixiSprite 
            key={`obj-l4-${oIdx}`} 
            texture={new Texture({ source: atlasTexture.source, frame: new Rectangle(tileInfo.x, tileInfo.y, tileInfo.width, tileInfo.height) })}
            x={obj.x} 
            y={obj.y - (obj.height || 0)} 
            width={obj.width || tileInfo.width}
            height={obj.height || tileInfo.height}
            zIndex={isLake || isBonfire ? 0 : obj.y}
            alpha={isHiding ? 0.4 : 1.0} 
          />
        );
      }
      return null;
    });
  }, [currentMap, heroPos]);

  return (
    <pixiContainer 
      isRenderGroup={RENDERER_SETTINGS.AUTO_DENSITY} 
      scale={cameraScale} 
      x={cameraX} 
      y={cameraY} 
      roundPixels={true}
      sortableChildren={true} 
    >
      {groundLayers}
      {objectLayerElements}
      
      <pixiSprite 
        texture={AssetMain.get(Alias.hero)} 
        anchor={{ x: 0.5, y: 1 }} 
        x={heroPos.x} 
        y={heroPos.y}
        zIndex={heroPos.y} 
        scale={{ 
          x: lastHorizontal === 'left' ? -WORLD.HERO_SCALE : WORLD.HERO_SCALE, 
          y: WORLD.HERO_SCALE 
        }} 
      />

      {/* 💙 리액트 태그 대신 ref를 활용한 픽시 컨테이너 배치 */}
      {/* 여기에 직접 Graphics를 박아서 에러를 원천 차단함 */}
      <pixiContainer ref={overlayRef} zIndex={1000000} />
    </pixiContainer>
  );
};

export default WorldContainer;
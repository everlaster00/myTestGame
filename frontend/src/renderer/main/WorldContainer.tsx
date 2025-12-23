// src/renderer/main/WorldContainer.tsx
'use client';

import { WORLD, RENDERER_SETTINGS } from "@/consts/setting";
import { Alias } from "@/lib/assets/assetsDefinitions";
import { AssetMain } from "@/lib/assets/assetsManager";
import { MAPDATA } from "@/assets/map/MAPDATA";
import { useApplication } from "@pixi/react";
import { useCallback, useEffect, useState, useMemo } from "react"; 
import { Rectangle, Texture } from "pixi.js";
import { useCamera } from "@/hooks/useCamera";
import { useHeroMovement } from "@/hooks/useHeroMovement";

const WorldContainer = () => {
  const { app, isInitialised } = useApplication();
  const [screenSize, setScreenSize] = useState({ width: app.screen.width, height: app.screen.height });

  const spawnObj = MAPDATA.worldmap.layers[0].objects[0];
  const { pos: heroPos } = useHeroMovement(spawnObj.x, spawnObj.y);
  const { getCameraTransform } = useCamera(7.5);

  const handleResize = useCallback(() => {
    setScreenSize({ width: app.screen.width, height: app.screen.height });
  }, [app.screen.width, app.screen.height]); 

  useEffect(() => {
    if (!isInitialised) return;
    app.renderer.on('resize', handleResize);
    return () => { app.renderer.off('resize', handleResize); };
  }, [app.renderer, handleResize, isInitialised]); 

  const { cameraScale, cameraX, cameraY } = useMemo(() => {
    const transform = getCameraTransform(heroPos.x, heroPos.y, screenSize.width, screenSize.height, WORLD.WIDTH, WORLD.HEIGHT);
    return { cameraScale: transform.scale, cameraX: transform.x, cameraY: transform.y };
  }, [heroPos, screenSize, getCameraTransform]);

  const currentMap = MAPDATA.worldmap;

  // 1. 지형 레이어 (zIndex: 0)
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

  // 2. 오브젝트 레이어 (모닥불 애니메이션 + 시스루 로직)
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

      // 💙 모닥불 애니메이션 (레퍼런스 속성 적용: textures, autoPlay, loop)
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
            zIndex={0} // 💙 모닥불은 캐릭터가 밟아야 하니까 바닥에 깔기!
          />
        );
      }

      // 일반 오브젝트 (나무 등) & 호수
      const localGid = obj.gid - tileset.firstgid;
      const tileInfo = tileset.tiles?.find(t => t.id === localGid);
      if (tileInfo) {
        // 💙 모닥불과 호수는 가려짐 판정에서 제외!
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
            zIndex={isLake || isBonfire ? 0 : obj.y} // 💙 바닥 고정 오브젝트
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
        scale={WORLD.HERO_SCALE} 
      />
    </pixiContainer>
  );
};

export default WorldContainer;
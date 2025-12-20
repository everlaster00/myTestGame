// 주석은 음슴체로 적음
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

  // 1. 초기 스폰 위치 데이터
  const spawnObj = MAPDATA.worldmap.layers[0].objects[0];
  
  // 2. 훅 연결 (영웅 위치와 카메라 계산기)
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

  // 3. 카메라 실시간 변환값 (heroPos가 바뀔 때마다 재계산되어야 따라감!) 💙
  const { cameraScale, cameraX, cameraY } = useMemo(() => {
    const transform = getCameraTransform(
      heroPos.x, 
      heroPos.y, 
      screenSize.width, 
      screenSize.height, 
      WORLD.WIDTH, 
      WORLD.HEIGHT
    );
    return { cameraScale: transform.scale, cameraX: transform.x, cameraY: transform.y };
  }, [heroPos, screenSize, getCameraTransform]);

  const currentMap = MAPDATA.worldmap;

  // 4. 렌더링 로직 (오빠야가 검수한 원본 그대로!)
  const renderLayers = useMemo(() => {
    const allElements: React.ReactNode[] = [];
    const { tilesets, layers, tilewidth, tileheight, width: mapWidth } = currentMap;

    layers.forEach((layer, lIdx) => {
      if (layer.type === 'tilelayer' && 'data' in layer && layer.data) {
        layer.data.forEach((gid, dIdx) => {
          if (gid === 0) return;
          const tileset = [...tilesets].sort((a, b) => b.firstgid - a.firstgid).find(ts => gid >= ts.firstgid);
          if (!tileset) return;
          const texture = AssetMain.get(Alias[tileset.name as keyof typeof Alias]);
          if (!texture) return;
          const localGid = gid - tileset.firstgid;
          const columns = Math.floor(texture.width / tileset.tilewidth);
          allElements.push(
            <pixiSprite 
              key={`tile-${lIdx}-${dIdx}`} 
              texture={new Texture({ 
                source: texture.source, 
                frame: new Rectangle((localGid % columns) * tileset.tilewidth, Math.floor(localGid / columns) * tileset.tileheight, tileset.tilewidth, tileset.tileheight) 
              })}
              x={(dIdx % mapWidth) * tilewidth}
              y={Math.floor(dIdx / mapWidth) * tileheight}
            />
          );
        });
      }
    });

    const objectLayer = currentMap.layers[4];
    const objectTileset = currentMap.tilesets[3];
    if (objectLayer && 'objects' in objectLayer && objectLayer.objects && objectTileset.tiles) {
      const atlasTexture = AssetMain.get(Alias[objectTileset.name as keyof typeof Alias]);
      if (atlasTexture) {
        objectLayer.objects.forEach((obj, oIdx) => {
          if (obj.gid && obj.gid > 0) {
            const localGid = obj.gid - objectTileset.firstgid;
            const tileInfo = objectTileset.tiles?.find(t => t.id === localGid);
            if (tileInfo) {
              allElements.push(
                <pixiSprite 
                  key={`obj-layer4-${oIdx}`} 
                  texture={new Texture({ 
                    source: atlasTexture.source, 
                    frame: new Rectangle(tileInfo.x, tileInfo.y, tileInfo.width, tileInfo.height) 
                  })}
                  x={obj.x} 
                  y={obj.y - (obj.height || tileInfo.height)} 
                  width={obj.width || tileInfo.width}
                  height={obj.height || tileInfo.height}
                />
              );
            }
          }
        });
      }
    }
    return allElements;
  }, [currentMap]);

  return (
    // 5. 최종 렌더링
    <pixiContainer 
      isRenderGroup={RENDERER_SETTINGS.AUTO_DENSITY} 
      scale={cameraScale} 
      x={cameraX} 
      y={cameraY} 
      roundPixels={true}
    >
      {renderLayers}
      <pixiSprite 
        texture={AssetMain.get(Alias.hero)} 
        anchor={0.5}
        x={heroPos.x} 
        y={heroPos.y}
        scale={WORLD.HERO_SCALE} 
      />
    </pixiContainer>
  );
};

export default WorldContainer;
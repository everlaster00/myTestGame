// src/lib/assets/assetsDefinitions.ts

import { MAPDATA } from "@/assets/map/MAPDATA";
import type { AssetsManifest } from "pixi.js";

// 1. MAPDATA의 구조를 이용해서 맵 이름과 타일셋 이름을 타입으로 추출!
export type MapNames = keyof typeof MAPDATA;
export type TileAlias = typeof MAPDATA[MapNames]['tilesets'][number]['name'];

// 2. Bundles와 Alias 정의 (기존 코드와 동일)
export const Bundles = {
  hero: 'hero',
  ...Object.fromEntries(Object.keys(MAPDATA).map(key => [key, key]))
} as const as Record<string, string> & { [K in MapNames | 'hero']: K };

export const Alias = {
  hero: 'hero',
  ...Object.fromEntries(
    Object.values(MAPDATA).flatMap(map => 
      map.tilesets.map(ts => [ts.name, ts.name])
    )
  )
} as const as Record<string, string> & { [K in TileAlias | 'hero']: K };

// 3. Manifest 수정: assets에 data 필드 추가해서 맵 정보 심어두기!
export const manifest: AssetsManifest = {
  bundles: [
    {
      name: Bundles.hero,
      assets: [{ alias: Alias.hero, src: "/assets/hero/HeroDefaultImg.png" }]
    },
    ...Object.entries(MAPDATA).map(([mapName, data]) => ({
      name: mapName,
      assets: data.tilesets.map(ts => ({
        alias: ts.name,
        src: ts.image,
        // ✨ Pixi 에셋 로드 시점에 이 데이터를 같이 넘겨준대예!
        data: {
          isMap: true,
          mapName: mapName // MAPDATA의 어떤 키인지 알려주는 역할이디 💙
        }
      }))
    }))
  ]
};
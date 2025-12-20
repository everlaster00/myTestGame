import { MAPDATA } from "@/assets/map/MAPDATA";
import type { AssetsManifest } from "pixi.js";

// 1. MAPDATA의 구조를 이용해서 맵 이름과 타일셋 이름을 타입으로 추출!
export type MapNames = keyof typeof MAPDATA;
export type TileAlias = typeof MAPDATA[MapNames]['tilesets'][number]['name'];

// 2. Bundles와 Alias를 타입 캐스팅을 통해 강제로 박아버리기!
// 이렇게 하면 TS가 계산 안 해도 "아, 얘들은 이 타입이구나!" 하고 바로 보여준디 💙
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

// 3. Manifest는 그대로 두면 된대예!
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
        src: ts.image
      }))
    }))
  ]
} as const;
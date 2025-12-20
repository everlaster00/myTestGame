import { MAPDATA } from "@/assets/map/MAPDATA";

const map = MAPDATA.worldmap;

export const WORLD = {
  // 1. 맵의 실제 픽셀 크기를 정확하게 계산한대예!
  WIDTH: map.width * map.tilewidth, 
  HEIGHT: map.height * map.tileheight,
  // 2. 오빠야가 말한 캐릭터 스케일 반영!
  HERO_SCALE: 0.18,
  // 3. 월드가 다 보이게 기본 줌을 설정하거나 카메라 로직에 활용한대예.
  INITIAL_ZOOM: 1.0,
  ROUND_PIXELS: true, 
} as const;

export const RENDERER_SETTINGS = {
  AUTO_DENSITY: true, 
  BACKGROUND_ALPHA: 0, 
  RESOLUTION: typeof window !== 'undefined' ? window.devicePixelRatio : 1, 
  PREFERENCE: 'webgpu' as const,
  ANTIALIAS: false, // 픽셀 아트니까 선명하게! [cite: 9]
} as const;

export const OBJECT_SETTINGS = {
  ADVENTURER_SPEED: 200,
  CAMERA_TRIGGER_DISTANCE: 150,
  TILE: {
    WIDTH: map.tilewidth,
    HEIGHT: map.tileheight
  }
} as const;
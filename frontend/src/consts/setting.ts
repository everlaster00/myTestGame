//src/consts/setting.ts

export const WORLD = {
  WIDTH: 8192,
  HEIGHT: 6144,
  INITIAL_ZOOM:1.0,
} as const;

export const RENDERER_SETTINGS = {
  // 고해상도 디스플레이(Retina) 지원 여부
  AUTO_DENSITY: true,
  // 캔버스 배경 투명도 (0.0 ~ 1.0)
  BACKGROUND_ALPHA: 0,
  // 렌더링 프레임 레이트 (FPS)
  MAX_FPS: 60,
} as const;

export const OBJECT_SETTINGS = {
  ADVENTURER_SPEED: 200,
  // 플레이어가 화면 중앙으로부터 떨어진 최대 거리 (카메라 움직임 트리거)
  CAMERA_TRIGGER_DISTANCE: 150,
} as const;

export type WorldConstants = typeof WORLD;
export type RendererSettings = typeof RENDERER_SETTINGS;
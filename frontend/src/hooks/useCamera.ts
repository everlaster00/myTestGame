// 주석은 음슴체
import { useState, useCallback, useEffect } from 'react';

export const useCamera = (initialZoom = 7.5) => {
  const [zoom, setZoom] = useState(initialZoom);

  // 휠 이벤트 핸들러
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // 델타값에 따라 줌 수치 조정 (0.1씩 가감)
      // e.deltaY가 양수면 아래로 굴린 거(줌아웃), 음수면 위로 굴린 거(줌인) 💙
      setZoom(prev => {
        const newZoom = e.deltaY > 0 ? prev - 0.5 : prev + 0.5;
        // 너무 작아지거나 커지지 않게 범위 제한 (최소 1배 ~ 최대 15배)
        return Math.max(1, Math.min(newZoom, 15));
      });
    };

    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  const getCameraTransform = useCallback((
    targetX: number, 
    targetY: number, 
    screenW: number, 
    screenH: number, 
    worldW: number, 
    worldH: number
  ) => {
    const baseScale = Math.min(screenW / worldW, screenH / worldH);
    const scale = baseScale * zoom;

    const x = screenW / 2 - (targetX * scale);
    const y = screenH / 2 - (targetY * scale);

    return { scale, x, y };
  }, [zoom]);

  // 월드 컨테이너에서 줌 수치를 알 수 있게 zoom도 같이 반환함 💙
  return { zoom, getCameraTransform };
};
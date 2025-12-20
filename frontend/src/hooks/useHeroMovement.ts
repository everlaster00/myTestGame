// 주석은 음슴체로 적음
import { useState, useEffect, useRef } from 'react';
import { useTick } from '@pixi/react';
import { OBJECT_SETTINGS } from '@/consts/setting';
import { Ticker } from 'pixi.js';

export const useHeroMovement = (initialX: number, initialY: number) => {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [direction, setDirection] = useState<'up' | 'down' | 'left' | 'right'>('down');
  const [isMoving, setIsMoving] = useState(false);
  const keys = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const down = (e: KeyboardEvent) => { keys.current[e.code] = true; };
    const up = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  useTick((ticker: Ticker) => {
    // ticker.deltaTime에 아주 작은 보정치를 곱해서 속도 조절함 💙
    // 보통 0.1~0.2 정도가 적당한데 오빠야 취향껏 speed 설정값 봐가며 조절하면 됨!
    const dt = ticker.deltaTime;
    
    let vx = 0;
    let vy = 0;
    
    // 너무 빠르지 않게 미세 조정 루틴 추가함
    const speed = OBJECT_SETTINGS.ADVENTURER_SPEED * dt * 0.05; 

    if (keys.current['ArrowUp'] || keys.current['KeyW']) vy -= 1;
    if (keys.current['ArrowDown'] || keys.current['KeyS']) vy += 1;
    if (keys.current['ArrowLeft'] || keys.current['KeyA']) vx -= 1;
    if (keys.current['ArrowRight'] || keys.current['KeyD']) vx += 1;

    // 대각선 정규화 (이건 속도 밸런스에 필수!)
    if (vx !== 0 && vy !== 0) {
      const length = Math.sqrt(vx * vx + vy * vy);
      vx /= length;
      vy /= length;
    }

    if (vx !== 0 || vy !== 0) {
      if (Math.abs(vx) > Math.abs(vy)) {
        setDirection(vx > 0 ? 'right' : 'left');
      } else {
        setDirection(vy > 0 ? 'down' : 'up');
      }
      setIsMoving(true);
      
      setPos(prev => ({
        x: prev.x + vx * speed,
        y: prev.y + vy * speed
      }));
    } else {
      setIsMoving(false);
    }
  });

  return { pos, direction, isMoving };
};
// src/hooks/useHeroMovement.ts
import { useState, useEffect, useRef } from 'react';
import { useTick } from '@pixi/react';
import { OBJECT_SETTINGS } from '@/consts/setting';
import { Ticker } from 'pixi.js';

export const useHeroMovement = (initialX: number, initialY: number) => {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [direction, setDirection] = useState<'up' | 'down' | 'left' | 'right'>('down');
  // 💙 좌우 어디 보고 있었는지 기억하는 상태 추가함
  const [lastHorizontal, setLastHorizontal] = useState<'left' | 'right'>('right'); 
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
    const dt = ticker.deltaTime;
    let vx = 0;
    let vy = 0;
    const speed = OBJECT_SETTINGS.ADVENTURER_SPEED * dt * 0.05; 

    if (keys.current['ArrowUp'] || keys.current['KeyW']) vy -= 1;
    if (keys.current['ArrowDown'] || keys.current['KeyS']) vy += 1;
    if (keys.current['ArrowLeft'] || keys.current['KeyA']) vx -= 1;
    if (keys.current['ArrowRight'] || keys.current['KeyD']) vx += 1;

    if (vx !== 0 && vy !== 0) {
      const length = Math.sqrt(vx * vx + vy * vy);
      vx /= length;
      vy /= length;
    }

    if (vx !== 0 || vy !== 0) {
      // 💙 방향 결정 로직
      if (vx > 0) {
        setDirection('right');
        setLastHorizontal('right'); // 오른쪽 기억
      } else if (vx < 0) {
        setDirection('left');
        setLastHorizontal('left');  // 왼쪽 기억
      } else if (vy > 0) {
        setDirection('down');
      } else if (vy < 0) {
        setDirection('up');
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

  // 💙 lastHorizontal도 같이 뱉어줘야 함!
  return { pos, direction, isMoving, lastHorizontal }; 
};
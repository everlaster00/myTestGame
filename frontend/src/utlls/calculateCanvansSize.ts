//frontend/src/utlls/calculateCanvansSize.js
'use client';

  export const calculateCanvasSize = ():{width:number , height: number} => {
    const width = window? window.innerWidth : 256;
    const height = window? window.innerWidth : 256;
    return { width, height };
  }
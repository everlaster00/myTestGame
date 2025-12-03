//src/lib/assets/assetsManager.ts
'use client'

import { Assets } from "pixi.js";
import { manifest , Bundles } from "./assetsDefinitions";

export const AssetMain = Assets;

const result = {
  waiting:'waiting',
  loading:'loading',
  ready:'ready'
}

let state = result.waiting;
export { state as assetStateMain } ;


async function initAsset(targetBundle:Bundles | Bundles[]) {
  try{
    await AssetMain.init({
      basePath: '/assets/',
      manifest: manifest
    });
    
    await AssetMain.loadBundle(targetBundle);

    console.log("메인 에셋 초기화 완료");
    return true;
  } catch {
    throw('메인 에셋 초기화 중 오류 발생');
  }
}

export async function assetsLoader(targetBundle: Bundles | Bundles[]) {
  if( state === result.ready ) return state;
  if ( state === result.loading ) return state;

  state = result.loading;
  await initAsset(targetBundle).then(()=>state=result.ready,(error)=> { state=result.waiting; throw(error) })

  if (process.env.NODE_ENV === 'development') {
      // 만약 'ready'나 'waiting'으로 업데이트되지 않고 'loading'이 찍힌다면,
      // 마이크로태스크가 아직 실행되지 않은 상태에서 함수가 리턴된다는 증거입니다!
      console.log(`[DEBUG:메인 에셋 초기화]isLoading? : ${state}`);
  }

  return state
}

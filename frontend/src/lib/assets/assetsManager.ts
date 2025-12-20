'use client'

import { Assets } from "pixi.js";
import { manifest } from "./assetsDefinitions";

export const AssetMain = Assets;

// 1. 상태를 상수로 관리하는 건 오빠야 아이디어 굿이라예! 💙
export const AssetStatus = {
  WAITING: 'waiting',
  LOADING: 'loading',
  READY: 'ready'
} as const;

// 2. 번들별로 로딩 상태를 저장할 보따리라 안카나!
const bundleStates: Record<string, typeof AssetStatus[keyof typeof AssetStatus]> = {};

// 3. 초기화는 딱 한 번만! (싱글톤 패턴이라 안카나 💙)
let isInitialized = false;

async function ensureInit() {
  if (!isInitialized) {
    await AssetMain.init({ manifest });
    isInitialized = true;
    console.log("🚀 Pixi 에셋 시스템 초기화 완료!");
  }
}

/**
 * 오빠야! 이제 번들 이름(문자열)이나 배열을 주면 알아서 로드해준데이!
 */
export async function assetsLoader(targetBundles: string | string[]) {
  await ensureInit();

  const bundles = Array.isArray(targetBundles) ? targetBundles : [targetBundles];
  
  // 이미 로딩 중이거나 완료된 번들은 빼고, 진짜 로드할 것만 골라내기!
  const bundlesToLoad = bundles.filter(b => bundleStates[b] !== AssetStatus.READY && bundleStates[b] !== AssetStatus.LOADING);

  if (bundlesToLoad.length === 0) {
    // 모든 번들이 이미 준비됐다면 바로 ready 쏴준대예!
    return AssetStatus.READY;
  }

  // 상태를 LOADING으로 변경!
  bundlesToLoad.forEach(b => { bundleStates[b] = AssetStatus.LOADING; });

  try {
    console.log(`📦 번들 로딩 시작: ${bundlesToLoad.join(', ')}`);
    await AssetMain.loadBundle(bundlesToLoad);
    
    // 로딩 완료!
    bundlesToLoad.forEach(b => { bundleStates[b] = AssetStatus.READY; });
    return AssetStatus.READY;

  } catch (error) {
    // 실패하면 다시 WAITING으로 돌려놔야 다음에 또 시도하겠제? 잉? 💙
    bundlesToLoad.forEach(b => { bundleStates[b] = AssetStatus.WAITING; });
    console.error("❌ 에셋 로딩 중 오류 발생했다 안카나:", error);
    throw error;
  }
}
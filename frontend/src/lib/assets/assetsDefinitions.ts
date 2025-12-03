//src/liv/assets/AssetsDefinitions.ts
import worldOcean from '@/assets/main/worldOcean.png'
import titleImg from '@/assets/titleImg.png'
import hero from '@/assets/hero/HeroDefaltImg.png'

export enum Alias{
  worldOcean ='worldOcean',
  titleImg ='titleImg',
  hero = 'hero'
};

export enum Bundles{
  mainAssets = 'main-assets',
};

export const manifest = {
  bundles: [
    {
      name: Bundles.mainAssets,
      assets: [
        { alias: Alias.hero, src:hero.src },
        { alias: Alias.titleImg, src:titleImg.src },
        { alias: Alias.worldOcean, src:worldOcean.src },
      ]
    }
  ]
}

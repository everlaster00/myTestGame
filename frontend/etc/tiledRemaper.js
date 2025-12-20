// etc/tiledRemaper.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. 설정: 특정 파일이 아니라 디렉토리 전체를 바라본다 안카나!
const ASSET_DIR = path.resolve(__dirname, '../src/assets/map/data');
const OUTPUT_PATH = path.resolve(ASSET_DIR, '../MAPDATA.ts');
const ATLAS_JSON_PATH = path.join(ASSET_DIR, 'MainObjects.json');

async function build() {
  try {
    console.log('🏗️ 오빠야! 모든 맵 파일을 다 뒤져서 리매핑 시작한데이!');

    // [준비] 디렉토리 내 모든 .tmj 파일 찾기 & 아틀라스 데이터 로드
    const allFiles = await fs.readdir(ASSET_DIR);
    const mapFiles = allFiles.filter(f => f.endsWith('.tmj'));
    
    const atlasRaw = await fs.readFile(ATLAS_JSON_PATH, 'utf-8');
    const atlasData = JSON.parse(atlasRaw);

    const ALL_MAP_DATA = {}; // 모든 맵을 담을 보따리 💙

    // [순회] 찾아낸 모든 맵 파일을 하나씩 가공한다 안카나
    for (const mapFile of mapFiles) {
      const mapName = path.basename(mapFile, '.tmj');
      const mapPath = path.join(ASSET_DIR, mapFile);
      
      console.log(`🗺️ [${mapName}] 리매핑 중...`);

      const rawContent = await fs.readFile(mapPath, 'utf-8');
      const mapData = JSON.parse(rawContent);

      // [타일셋 가공] 각 맵에 포함된 타일셋들을 순회하며 좌표 매핑
      const processedTilesets = await Promise.all(mapData.tilesets.map(async (ts) => {
        // .tsx 확장자를 .tsj로 변경해서 파일 찾기
        const tsjFileName = path.basename(ts.source).replace('.tsx', '.tsj');
        const tsjPath = path.join(ASSET_DIR, tsjFileName);

        try {
          const tsjContent = await fs.readFile(tsjPath, 'utf-8');
          let tsjData = JSON.parse(tsjContent);

          if (!tsjData.tiles) tsjData.tiles = [];

          // CASE 1: 격자형 타일셋 (지형 등)
          if (tsjData.columns > 0) {
            if (tsjData.image) {
              tsjData.image = `/assets/main/${path.basename(tsjData.image)}`;
            }

            for (let i = 0; i < tsjData.tilecount; i++) {
              const tx = (i % tsjData.columns) * tsjData.tilewidth;
              const ty = Math.floor(i / tsjData.columns) * tsjData.tileheight;
              
              const existingTile = tsjData.tiles.find(t => t.id === i) || { id: i };
              
              tsjData.tiles[i] = {
                ...existingTile,
                x: tx,
                y: ty,
                width: tsjData.tilewidth,
                height: tsjData.tileheight
              };
            }
          } 
          // CASE 2: 오브젝트형 타일셋 (아틀라스 사용)
          else {
            tsjData.image = `/assets/main/objects.webp`;
            
            tsjData.tiles = tsjData.tiles.map(tile => {
              const fileName = path.basename(tile.image);
              const frameInfo = atlasData.frames[fileName];

              if (frameInfo) {
                return {
                  ...tile,
                  image: undefined,
                  x: frameInfo.frame.x,
                  y: frameInfo.frame.y,
                  width: frameInfo.sourceSize.w,
                  height: frameInfo.sourceSize.h
                };
              }
              return tile;
            });

            tsjData.imagewidth = atlasData.meta.size.w;
            tsjData.imageheight = atlasData.meta.size.h;
          }

          return { firstgid: ts.firstgid, ...tsjData };

        } catch (err) {
          console.warn(`⚠️ ${tsjFileName} 처리 중 패스함:`, err.message);
          return ts;
        }
      }));

      mapData.tilesets = processedTilesets;
      
      // 가공 완료된 맵 데이터를 보따리에 쏙!
      ALL_MAP_DATA[mapName] = mapData;
    }

    // [최종 저장] ALL_MAP_DATA를 통째로 굽기
    const fileTemplate = `// 자동 생성된 데이터임. 직접 수정 금지!\nexport const MAPDATA = ${JSON.stringify(ALL_MAP_DATA, null, 2)} as const;`;
    
    await fs.writeFile(OUTPUT_PATH, fileTemplate, 'utf-8');
    console.log('\n🎉 오빠야! 모든 맵 데이터가 MAPDATA.ts에 예쁘게 담겼디! 💙');

  } catch (err) {
    console.error('❌ 에러 났다 안카나:', err.message);
  }
}

build();
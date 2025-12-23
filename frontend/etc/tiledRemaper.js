// etc/tiledRemaper.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSET_DIR = path.resolve(__dirname, '../src/assets/map/data');
const OUTPUT_PATH = path.resolve(ASSET_DIR, '../MAPDATA.ts');
const ATLAS_JSON_PATH = path.join(ASSET_DIR, 'MainObjects.json');

async function build() {
  try {
    console.log('🏗️ 오빠야! 절대 규칙 준수하면서 리매핑 시작한데이!');

    const allFiles = await fs.readdir(ASSET_DIR);
    const mapFiles = allFiles.filter(f => f.endsWith('.tmj'));
    
    const atlasRaw = await fs.readFile(ATLAS_JSON_PATH, 'utf-8');
    const atlasData = JSON.parse(atlasRaw);

    const ALL_MAP_DATA = {};

    for (const mapFile of mapFiles) {
      const mapName = path.basename(mapFile, '.tmj');
      const mapPath = path.join(ASSET_DIR, mapFile);
      
      const rawContent = await fs.readFile(mapPath, 'utf-8');
      const mapData = JSON.parse(rawContent);

      const processedTilesets = await Promise.all(mapData.tilesets.map(async (ts) => {
        const tsjFileName = path.basename(ts.source).replace('.tsx', '.tsj');
        const tsjPath = path.join(ASSET_DIR, tsjFileName);

        try {
          const tsjContent = await fs.readFile(tsjPath, 'utf-8');
          let tsjData = JSON.parse(tsjContent);

          if (!tsjData.tiles) tsjData.tiles = [];

          // [공통] 경로는 오빠야가 정한 절대 규칙대로!
          if (tsjData.image) {
            tsjData.image = `/assets/main/${path.basename(tsjData.image)}`;
          }

          // CASE 1: 격자형 타일셋 (지형 등)
          if (tsjData.columns > 0) {
            for (let i = 0; i < tsjData.tilecount; i++) {
              const tx = (i % tsjData.columns) * tsjData.tilewidth;
              const ty = Math.floor(i / tsjData.columns) * tsjData.tileheight;
              
              const existingIdx = tsjData.tiles.findIndex(t => t.id === i);
              const existingTile = existingIdx !== -1 ? tsjData.tiles[existingIdx] : { id: i };
              
              // 기존 데이터(animation, objectgroup, type 등)를 통째로 보존하며 좌표만 추가/수정
              tsjData.tiles[existingIdx !== -1 ? existingIdx : tsjData.tiles.length] = {
                ...existingTile,
                x: tx,
                y: ty,
                width: tsjData.tilewidth,
                height: tsjData.tileheight
              };
            }
          } 
          // CASE 2: 오브젝트형 타일셋 (비규격 아틀라스 시트로 리매핑)
          else {
            // 아틀라스 시트 경로로 강제 고정
            tsjData.image = `/assets/main/objects.webp`;
            
            tsjData.tiles = tsjData.tiles.map(tile => {
              const fileName = path.basename(tile.image);
              const frameInfo = atlasData.frames[fileName];

              if (frameInfo) {
                // 기존 tile 안에 든 animation, objectgroup(pivot, collision), type(zoneType) 그대로 가져옴!
                return {
                  ...tile,
                  image: undefined, // 개별 이미지 경로는 이제 필요 없디!
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
          console.warn(`⚠️ ${tsjFileName} 패스:`, err.message);
          return ts;
        }
      }));

      mapData.tilesets = processedTilesets;
      ALL_MAP_DATA[mapName] = mapData;
    }

    const fileTemplate = `// 자동 생성된 데이터임. 직접 수정 금지!\nexport const MAPDATA = ${JSON.stringify(ALL_MAP_DATA, null, 2)} as const;`;
    
    await fs.writeFile(OUTPUT_PATH, fileTemplate, 'utf-8');
    console.log(`\n🎉 오빠야! ${Object.keys(ALL_MAP_DATA).length}개 맵 리매핑 완료! 모든 데이터(애니, 충돌, 존타입) 보존됐디! 💙`);

  } catch (err) {
    console.error('❌ 에러 발생:', err.message);
  }
}

build();
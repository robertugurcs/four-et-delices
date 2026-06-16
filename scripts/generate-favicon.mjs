import sharp from 'sharp';

const src = 'C:/Users/ugura/.cursor/projects/c-dev-CAKE-WEBSITE/assets/c__Users_ugura_AppData_Roaming_Cursor_User_workspaceStorage_accc69fca53b71d04a33ffe65c471a5b_images_rename4-e5d43e0f-584c-4010-99f8-2dd75840ea35.png';

async function makeCircle(inputPath, outputPath, size) {
  const r = size / 2;
  const circle = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${r}" cy="${r}" r="${r}" /></svg>`
  );
  await sharp(inputPath)
    .resize(size, size, { fit: 'cover', position: 'centre' })
    .composite([{ input: circle, blend: 'dest-in' }])
    .png()
    .toFile(outputPath);
  console.log('Created:', outputPath);
}

await makeCircle(src, 'src/app/icon.png', 512);
await makeCircle(src, 'src/app/apple-icon.png', 512);
console.log('Done!');

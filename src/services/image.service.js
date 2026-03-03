import sharp from 'sharp';

// ── Generate thumbnail ─────────────────────────────────────
export const generateThumbnail = async (inputPath, outputPath) => {
  await sharp(inputPath)
    .resize(200, 200, {
      fit: 'cover',
      position: 'centre',
    })
    .jpeg({ quality: 80 })
    .toFile(outputPath);

  return outputPath;
};

// ── Generic resize ─────────────────────────────────────────
export const resizeImage = async (inputPath, outputPath, width, height) => {
  await sharp(inputPath)
    .resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toFile(outputPath);

  return outputPath;
};

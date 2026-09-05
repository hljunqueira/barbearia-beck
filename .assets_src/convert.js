const sharp = require('sharp');
const path = require('path');
const out = '/app/public/images';

(async () => {
  const meta = await sharp(path.join('/app/.assets_src', 'logo.png')).metadata();
  console.log('logo', meta.width, meta.height);
  await sharp(path.join('/app/.assets_src', 'logo.png'))
    .extract({
      left: Math.round(meta.width * 0.03),
      top: Math.round(meta.height * 0.11),
      width: Math.round(meta.width * 0.94),
      height: Math.round(meta.height * 0.82),
    })
    .resize(1000)
    .webp({ quality: 90 })
    .toFile(`${out}/logo.webp`);

  await sharp(path.join('/app/.assets_src', 'hero1.jpg')).resize(1920).webp({ quality: 78 }).toFile(`${out}/hero-bg.webp`);
  await sharp(path.join('/app/.assets_src', 'hero2.jpg')).resize(1600).webp({ quality: 78 }).toFile(`${out}/hero-bg-2.webp`);

  const products = {
    'prod-pomade': 'pomada-classica',
    'prod-pomade2': 'pomada-matte',
    'prod-oil': 'oleo-barba',
    'prod-oil2': 'balm-barba',
    'prod-kit': 'kit-barbear',
    'prod-set': 'kit-completo',
  };
  for (const [src, name] of Object.entries(products)) {
    await sharp(path.join('/app/.assets_src', `${src}.jpg`))
      .resize(800, 800, { fit: 'cover', position: 'attention' })
      .webp({ quality: 80 })
      .toFile(`${out}/${name}.webp`);
  }
  console.log('done');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

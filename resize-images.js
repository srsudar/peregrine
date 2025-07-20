import sharp from "sharp";

const sizes = [16, 19, 32, 38, 128, 256];
const input = "app/images/logo-full-size.png"; // replace with your image path

sizes.forEach((size) => {
  sharp(input)
    .resize(size, size)
    .toFile(`app/images/icon-${size}.png`, (err) => {
      if (err) {
        console.error(`Error resizing to ${size}px:`, err);
      } else {
        console.log(`Saved icon-${size}.png`);
      }
    });
});

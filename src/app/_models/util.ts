import * as THREE from "three";

export const invertNormalMap = (material: THREE.MeshStandardMaterial) => {
  const image = material.normalMap?.image;
  if (!image) {
    throw new Error("Material does not have a normal map");
  }

  const width = image.width;
  const height = image.height;
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get 2d context");
  }

  // Flip the image vertically
  ctx.save(); // Save the current state of the context
  ctx.translate(0, canvas.height); // Move the origin to the bottom-left corner
  ctx.scale(1, -1); // Scale vertically by -1 (flip vertically)
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height); // Draw the image
  ctx.restore(); // Restore the context to its original state

  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;

  const bytesPerPixel = pixels.length / (width * height);
  if (bytesPerPixel !== 4) {
    throw new Error("Unexpected number of bytes per pixel");
  }

  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i + 1] = 255 - pixels[i + 1];
  }

  ctx.putImageData(imageData, 0, 0);

  const normalMap = new THREE.CanvasTexture(canvas);
  normalMap.wrapS = THREE.RepeatWrapping;
  normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(1, 1);

  return normalMap;
};

export const applyColor = (
  material: THREE.MeshStandardMaterial,
  color: THREE.Color,
) => {
  const image = material.map?.image;
  if (!image) {
    throw new Error("Material does not have a map");
  }

  const width = image.width;
  const height = image.height;
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get 2d context");
  }

  ctx.fillStyle = color.getStyle();
  ctx.fillRect(0, 0, width, height);

  // Flip the image vertically
  ctx.save(); // Save the current state of the context
  ctx.translate(0, canvas.height); // Move the origin to the bottom-left corner
  ctx.scale(1, -1); // Scale vertically by -1 (flip vertically)
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height); // Draw the image
  ctx.restore(); // Restore the context to its original state

  // Debugging
  // canvas.convertToBlob().then((blob) => {
  //   const url = URL.createObjectURL(blob);
  //   const img = new Image();
  //   img.src = url;
  //   document.body.appendChild(img);
  // });

  // material.map = new THREE.CanvasTexture(canvas);
  // material.emissiveMap = null;
  // material.emissiveIntensity = 0;
  // material.roughnessMap = null;
  // material.metalnessMap = null;
  // material.normalMap = null;
  // material.color = color;

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(1, 1);

  return new THREE.MeshStandardMaterial({
    map: map,
    normalMap: material.normalMap,
    normalMapType: THREE.TangentSpaceNormalMap,
    name: `${material.name} (colored)`,
    userData: {
      hasColorBeenApplied: true,
    },
  });
};

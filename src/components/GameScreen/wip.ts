import * as PIXI from 'pixi.js';
import { perfect, startHere } from '../../assets';
import { loadMarker } from './utils';

export function wipStartMarker(pixi: PIXI.Application) {
  const sprite = PIXI.Sprite.from(startHere);

  sprite.width = 100;
  sprite.height = 100;
  pixi.stage.addChild(sprite);
}

export async function wipMarker(pixi: PIXI.Application) {
  const sheet = await loadMarker(perfect);

  const animTextures = sheet.animations.animated;
  const animFrames = animTextures.map((texture) => ({
    texture,
    time: 1000 / animTextures.length,
  }));

  const markerSprite = new PIXI.AnimatedSprite(animFrames);
  markerSprite.animationSpeed = 1;
  markerSprite.play();
  markerSprite.width = 100;
  markerSprite.height = 100;

  pixi.stage.addChild(markerSprite);
}

import * as PIXI from 'pixi.js';
import * as assets from '../../assets';
import { Assets } from '../types';
import { loadMarkers } from './marker';

export async function loadAssets(): Promise<Assets> {
  const startHere = await PIXI.Texture.fromURL(assets.startHere);

  const [marker, bad, good, perfect] = await loadMarkers([
    assets.marker,
    assets.bad,
    assets.good,
    assets.perfect,
  ]);

  return {
    startHere,
    marker: marker.animations.animated,
    bad: bad.animations.animated,
    good: good.animations.animated,
    great: good.animations.animated,
    perfect: perfect.animations.animated,
  };
}

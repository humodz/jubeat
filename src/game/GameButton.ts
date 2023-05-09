import * as PIXI from 'pixi.js';
import {
  BUTTON_OUTLINE_COLOR,
  BUTTON_OUTLINE_THICKNESS,
  MARKER_DURATION_MS,
  MARKER_JUDGEMENT_DURATION_MS,
} from './constants';
import { Assets } from './types';

export interface GameButtonProps {
  size: number;
  x: number;
  y: number;
  assets: Assets;
  onMiss: () => void;
}

export class GameButton {
  node = new PIXI.Container();
  outline = new PIXI.Graphics();

  startHere: PIXI.Sprite;
  marker: PIXI.AnimatedSprite;
  bad: PIXI.AnimatedSprite;
  good: PIXI.AnimatedSprite;
  great: PIXI.AnimatedSprite;
  perfect: PIXI.AnimatedSprite;

  constructor(public props: GameButtonProps) {
    this.node.x = props.x;
    this.node.y = props.y;

    this.outline
      .lineStyle(BUTTON_OUTLINE_THICKNESS, BUTTON_OUTLINE_COLOR, 1, 0)
      .beginFill(0, 0)
      .drawRect(0, 0, props.size, props.size)
      .endFill();

    const markerMs = MARKER_DURATION_MS;
    const judgeMs = MARKER_JUDGEMENT_DURATION_MS;

    this.startHere = PIXI.Sprite.from(this.props.assets.startHere);
    this.startHere.width = this.props.size;
    this.startHere.height = this.props.size;
    this.startHere.visible = false;

    this.marker = this.createAnimatedMarker(
      props.assets.marker,
      markerMs,
      true,
    );
    this.bad = this.createAnimatedMarker(props.assets.bad, judgeMs);
    this.good = this.createAnimatedMarker(props.assets.good, judgeMs);
    this.great = this.createAnimatedMarker(props.assets.great, judgeMs);
    this.perfect = this.createAnimatedMarker(props.assets.perfect, judgeMs);

    this.node.addChild(
      this.startHere,
      this.marker,
      this.bad,
      this.good,
      this.great,
      this.perfect,
      this.outline,
    );
  }

  showStartHere(visible: boolean) {
    this.startHere.visible = visible;
  }

  showOutline(visible: boolean) {
    this.outline.visible = visible;
  }

  play() {
    this.startHere.visible = false;
    this.marker.gotoAndPlay(0);
    this.marker.visible = true;
  }

  resume() {
    this.marker.play();
  }

  pause() {
    this.marker.stop();
  }

  press() {
    if (!this.marker.playing) {
      return null;
    } else {
      const judgement = judge(this.marker.currentFrame);
      this[judgement].gotoAndPlay(0);
      this[judgement].visible = true;
      this.marker.gotoAndStop(0);
      this.marker.visible = false;
      return judgement;
    }
  }

  private createAnimatedMarker(
    textures: PIXI.Texture[],
    durationMs: number,
    canMiss = false,
  ) {
    const frames = textures.map((texture) => ({
      texture,
      time: durationMs / textures.length,
    }));

    const sprite = new PIXI.AnimatedSprite(frames);
    sprite.onComplete = () => {
      if (canMiss) {
        this.props.onMiss();
      }
      sprite.visible = false;
    };
    sprite.loop = false;
    sprite.visible = false;
    sprite.width = this.props.size;
    sprite.height = this.props.size;
    return sprite;
  }
}

function judge(frame: number): 'bad' | 'good' | 'great' | 'perfect' {
  if (frame <= 6) {
    return 'bad';
  } else if (frame <= 10) {
    return 'good';
  } else if (frame <= 13) {
    return 'great';
  } else if (frame <= 16) {
    return 'perfect';
  } else if (frame <= 18) {
    return 'great';
  } else if (frame <= 19) {
    return 'good';
  } else {
    return 'bad';
  }
}

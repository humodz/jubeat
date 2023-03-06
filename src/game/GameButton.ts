import * as PIXI from 'pixi.js';

export interface GameButtonProps {
  size: number;
  x: number;
  y: number;

  assets: {
    marker: PIXI.Texture[];
    bad: PIXI.Texture[];
    good: PIXI.Texture[];
    great: PIXI.Texture[];
    perfect: PIXI.Texture[];
  };
}

export class GameButton {
  node = new PIXI.Container();
  outline = new PIXI.Graphics();

  marker: PIXI.AnimatedSprite;
  bad: PIXI.AnimatedSprite;
  good: PIXI.AnimatedSprite;
  great: PIXI.AnimatedSprite;
  perfect: PIXI.AnimatedSprite;

  constructor(public props: GameButtonProps) {
    this.node.x = props.x;
    this.node.y = props.y;

    this.outline
      .lineStyle(5, 0x3399ff, 1, 0)
      .beginFill(0, 0)
      .drawRect(0, 0, props.size, props.size)
      .endFill();

    this.marker = this.createAnimatedMarker(props.assets.marker, 800);
    this.bad = this.createAnimatedMarker(props.assets.bad, 500);
    this.good = this.createAnimatedMarker(props.assets.good, 500);
    this.great = this.createAnimatedMarker(props.assets.great, 500);
    this.perfect = this.createAnimatedMarker(props.assets.perfect, 500);

    this.node.addChild(
      this.marker,
      this.bad,
      this.good,
      this.great,
      this.perfect,
      this.outline,
    );
  }

  showOutline(visible: boolean) {
    this.outline.visible = visible;
  }

  play() {
    this.marker.gotoAndPlay(0);
    this.marker.visible = true;
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

  private createAnimatedMarker(textures: PIXI.Texture[], durationMs: number) {
    const frames = textures.map((texture) => ({
      texture,
      time: durationMs / textures.length,
    }));

    const sprite = new PIXI.AnimatedSprite(frames);
    sprite.onComplete = () => {
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

import * as PIXI from 'pixi.js';

export interface GameButtonProps {
  size: number;
  x: number;
  y: number;

  assets: {
    marker: PIXI.Texture[];
    bad: PIXI.Texture[];
    good: PIXI.Texture[];
    perfect: PIXI.Texture[];
  };
}

export class GameButton {
  node = new PIXI.Container();
  outline = new PIXI.Graphics();

  marker: PIXI.AnimatedSprite;
  bad: PIXI.AnimatedSprite;
  good: PIXI.AnimatedSprite;
  perfect: PIXI.AnimatedSprite;

  constructor(public props: GameButtonProps) {
    this.node.x = props.x;
    this.node.y = props.y;

    this.outline
      .lineStyle(5, 0x3399ff, 1, 0)
      .beginFill(0, 0)
      .drawRect(0, 0, props.size, props.size)
      .endFill();

    this.marker = this.createAnimatedMarker(props.assets.marker);
    this.bad = this.createAnimatedMarker(props.assets.bad);
    this.good = this.createAnimatedMarker(props.assets.good);
    this.perfect = this.createAnimatedMarker(props.assets.perfect);

    this.node.addChild(
      this.marker,
      this.bad,
      this.good,
      this.perfect,
      this.outline,
    );
  }

  showOutline(visible: boolean) {
    this.outline.visible = visible;
  }

  play() {
    this.marker.play();
    this.marker.visible = true;
  }

  press() {
    if (this.marker.playing) {
      const judgement = judge(this.marker.currentFrame);
      console.log('!!!', judgement, this.marker.currentFrame);
      this[judgement].play();
      this[judgement].visible = true;
      this.marker.gotoAndStop(0);
      this.marker.visible = false;
    }
  }

  private createAnimatedMarker(textures: PIXI.Texture[], durationMs = 800) {
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

function judge(frame: number): 'bad' | 'good' | 'perfect' {
  if (frame <= 9) {
    return 'bad';
  } else if (frame <= 13) {
    return 'good';
  } else if (frame <= 15) {
    return 'perfect';
  } else if (frame <= 17) {
    return 'good';
  } else {
    return 'bad';
  }
}

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

  createAnimatedMarker(textures: PIXI.Texture[], durationMs = 1000) {
    const frames = textures.map((texture) => ({
      texture,
      time: durationMs / textures.length,
    }));

    const sprite = new PIXI.AnimatedSprite(frames);
    sprite.visible = false;
    sprite.width = this.props.size;
    sprite.height = this.props.size;
    return sprite;
  }
}

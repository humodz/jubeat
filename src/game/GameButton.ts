import * as PIXI from 'pixi.js';

export interface GameButtonProps {
  size: number;
  x: number;
  y: number;
}

export class GameButton {
  node = new PIXI.Container();
  outline = new PIXI.Graphics();

  constructor(public props: GameButtonProps) {
    this.node.x = props.x;
    this.node.y = props.y;

    this.outline
      .lineStyle(5, 0x3399ff, 1, 0)
      .beginFill(0, 0)
      .drawRect(0, 0, props.size, props.size)
      .endFill();

    this.node.addChild(this.outline);
  }

  showOutline(visible: boolean) {
    this.outline.visible = visible;
  }
}

export interface MediaStylePaletteOption {
  maxDimension?: number;
  direction?: number;
}

export class Color {
  get hex(): string;
  get rgb(): Array<number>;
  get hsl(): Array<number>;
  static fromRgb(r: number, g: number, b: number): Color;
  static fromHex(hex: string): Color;
  static fromHsl(h: number, s: number, l: number): Color;
}

export interface Palette {
  primaryColor: Color,
  secondaryColor: Color,
  backgroundColor: Color,
}

export class MediaStylePalette {
  constructor(option?: MediaStylePaletteOption);
  use(option: MediaStylePaletteOption): MediaStylePalette;
  from(ref: HTMLImageElement): MediaStylePalette;
  getPalette(): Promise<Palette>;
}

export default MediaStylePalette

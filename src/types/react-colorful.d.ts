declare module 'react-colorful' {
  import { FC } from 'react';

  export interface HexColorPickerProps {
    color: string;
    onChange: (color: string) => void;
    style?: React.CSSProperties;
  }

  export const HexColorPicker: FC<HexColorPickerProps>;
} 
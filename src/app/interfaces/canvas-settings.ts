type zoomSensitivity = 'low' | 'medium' | 'high';
type panSensitivity = 'low' | 'medium' | 'high';

type backgroundStyle = 'grid' | 'dots' | 'solid';
type backgroundColor = 'white' | 'lightgray' | 'darkgray';

type patternColor = 'gray' | 'white' | 'black';
type patternSize = 'small' | 'medium' | 'large';

type CanvasSettings = {
    zoomSensitivity: zoomSensitivity;
    panSensitivity: panSensitivity;
    backgroundStyle: backgroundStyle;
    backgroundColor: backgroundColor;
    patternColor: patternColor;
    patternSize: patternSize;
};

export {
    CanvasSettings,
    backgroundColor,
    backgroundStyle,
    panSensitivity,
    patternColor,
    patternSize,
    zoomSensitivity,
};

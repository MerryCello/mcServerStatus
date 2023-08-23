// TODO: refactor code to put this in use
let color: { GRAYSCALE: string[]; HUE: string[] } = {
  GRAYSCALE: [],
  HUE: [],
};
color.GRAYSCALE[0] = "#000000";
color.GRAYSCALE[100] = "#282c34";
color.GRAYSCALE[150] = "#3e3e3e";
color.GRAYSCALE[200] = "#565656";
color.GRAYSCALE[300] = "#7e7e7e";
color.GRAYSCALE[350] = "#808080";
color.GRAYSCALE[400] = "#9e9e9e";
color.GRAYSCALE[450] = "#a0a0a0";
color.GRAYSCALE[500] = "#aaaaaa";
color.GRAYSCALE[600] = "#c0c0c0";
color.GRAYSCALE[700] = "#e0e0e0";
color.GRAYSCALE[800] = "#fcfcfc";
color.GRAYSCALE[999] = "#ffffff";

Object.freeze(color);

export { color };

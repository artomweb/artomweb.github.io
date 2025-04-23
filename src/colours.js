import { hexToRgba } from "./usefullFunc.js";
const element = document.querySelector(":root");
const blue = getComputedStyle(element).getPropertyValue("--color-blue1").trim();
const red = getComputedStyle(element).getPropertyValue("--color-red1").trim();
const green = getComputedStyle(element)
  .getPropertyValue("--color-green1")
  .trim();

export const blue1 = hexToRgba(blue, 1);
export const blue2 = hexToRgba(blue, 0.8);
export const blue3 = hexToRgba(blue, 0.4);

export const red1 = hexToRgba(red, 1);
export const red2 = hexToRgba(red, 0.8);
export const red3 = hexToRgba(red, 0.4);

export const green1 = hexToRgba(green, 1);
export const green2 = hexToRgba(green, 0.9);
export const green3 = hexToRgba(green, 0.4);
export const green4 = hexToRgba(green, 0.5);

export const solarColors = [
  "#FFF9C4", // very light yellow
  "#FFF176", // light yellow
  "#FFD54F", // yellow-orange
  "#FFB74D", // orange
  "#FF8A65", // deep orange
  "#F44336", // bright red
  "#D32F2F", // dark red
];

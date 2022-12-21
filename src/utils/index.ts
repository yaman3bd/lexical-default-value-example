export { toClassName, toCssVar, classNames } from "./css";
export * from "./assertion";
export * from "./warn";
export * from "./helpers";
export * from "./guard";
export * from "./rect";
export * from "./point";
export * from "./getSelectedNode";
export * from "./sanitizeUrl";
export * from "./setFloatingElemPosition";
export * from "./getDOMRangeRect";
export * from "./isRTL";
export const CAN_USE_DOM: boolean =
  typeof window !== "undefined" &&
  typeof window.document !== "undefined" &&
  typeof window.document.createElement !== "undefined";

export const getSelection = (): Selection | null =>
  CAN_USE_DOM ? window.getSelection() : null;

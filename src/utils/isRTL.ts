export const isRTL = (): boolean => {
  return document.documentElement.getAttribute("dir")?.toLowerCase() === "rtl";
};

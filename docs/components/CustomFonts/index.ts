import type { RspressPlugin } from "@rspress/core";

export interface CustomFontPluginOptions {
  fontName: string;
  fontCssPath?: string;
}

export const customFontPlugin = (
  options: CustomFontPluginOptions
): RspressPlugin => {
  const { fontName, fontCssPath = `/docs/public/fonts/${fontName}.css` } = options;

  return {
    name: `plugin-font-${fontName}`,
    builderConfig: {
      source: {
        preEntry: [fontCssPath],
      },
      performance: {
        // Preload fonts to avoid flickering caused by fonts swap
        preload: {
          type: "all-chunks",
          include: [new RegExp(`${fontName}\\.\w+\\.ttf`)],
        },
      },
    },
  };
};

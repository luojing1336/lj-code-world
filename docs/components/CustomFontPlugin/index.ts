import type { RspressPlugin } from "@rspress/core";

export interface CustomFontPluginOptions {
  fontName: string;
  fontCssPath?: string;
}

export const CustomFontPlugin = (
  options: CustomFontPluginOptions
): RspressPlugin => {
  const { fontName, fontCssPath = `/docs/public/fonts/${fontName}/${fontName}.css` } = options;

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

// Add a default export to prevent Rspress from treating this as a route component
export default () => null;
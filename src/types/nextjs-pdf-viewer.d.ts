// Tell TypeScript how to handle this web component import
declare module "nextjs-pdf-viewer/dist/web-component/index.js";

// Let JSX know <pdf-viewer> is a valid tag
declare namespace JSX {
  interface IntrinsicElements {
    "pdf-viewer": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        src: string;
        "worker-src"?: string;
        scale?: number;
        "document-scroll"?: boolean;
        "render-all"?: boolean;
      },
      HTMLElement
    >;
  }
}

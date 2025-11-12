// Declare the web component module
declare module "nextjs-pdf-viewer/dist/web-component/index.js";

// Extend React's JSX namespace to include the pdf-viewer element
declare namespace React {
  namespace JSX {
    interface IntrinsicElements {
      "pdf-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        src: string;
        "worker-src"?: string;
        scale?: number;
        "document-scroll"?: boolean;
        "render-all"?: boolean;
      };
    }
  }
}

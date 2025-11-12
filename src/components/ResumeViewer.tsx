// "use client";
// import { useState, useEffect } from "react";
// import dynamic from "next/dynamic";
// import { X, ZoomIn, ZoomOut, Download } from "lucide-react";
// import "react-pdf/dist/Page/AnnotationLayer.css";
// import "react-pdf/dist/Page/TextLayer.css";

// // Dynamically import the entire react-pdf module with SSR disabled
// const PDFViewer = dynamic(
//   () =>
//     import("react-pdf").then((mod) => {
//       // Set up the worker
//       if (typeof window !== "undefined") {
//         mod.pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${mod.pdfjs.version}/build/pdf.worker.min.mjs`;
//       }
//       return {
//         default: ({
//           file,
//           onLoadSuccess,
//           pageNumber,
//           scale,
//         }: {
//           file: string;
//           onLoadSuccess: (data: { numPages: number }) => void;
//           pageNumber: number;
//           scale: number;
//         }) => (
//           <mod.Document file={file} onLoadSuccess={onLoadSuccess}>
//             <mod.Page pageNumber={pageNumber} scale={scale} />
//           </mod.Document>
//         ),
//       };
//     }),
//   {
//     ssr: false,
//     loading: () => <div className="text-center py-8">Loading PDF...</div>,
//   }
// );

// export const ResumeViewer = ({
//   resumeUrl,
//   resumeName,
// }: {
//   resumeUrl: string;
//   resumeName: string;
// }) => {
//   const [show, setShow] = useState(false);
//   const [numPages, setNumPages] = useState<number | null>(null);
//   const [pageNumber, setPageNumber] = useState(1);
//   const [scale, setScale] = useState(1.0);

//   const onLoadSuccess = ({ numPages }: { numPages: number }) => {
//     setNumPages(numPages);
//   };

//   return (
//     <>
//       <button
//         onClick={() => setShow(true)}
//         className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//       >
//         View Resume
//       </button>
//       {show && (
//         <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
//           <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
//             {/* Header */}
//             <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-700">
//               <h2 className="font-semibold truncate text-gray-900 dark:text-white">
//                 {resumeName}
//               </h2>
//               <div className="flex items-center gap-2">
//                 <a
//                   href={resumeUrl}
//                   download={resumeName}
//                   className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
//                   title="Download"
//                 >
//                   <Download className="w-5 h-5" />
//                 </a>
//                 <button
//                   onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
//                   className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
//                   title="Zoom Out"
//                 >
//                   <ZoomOut className="w-5 h-5" />
//                 </button>
//                 <button
//                   onClick={() => setScale((s) => Math.min(2.0, s + 0.1))}
//                   className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
//                   title="Zoom In"
//                 >
//                   <ZoomIn className="w-5 h-5" />
//                 </button>
//                 <button
//                   onClick={() => setShow(false)}
//                   className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
//                   title="Close"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>
//             </div>
//             {/* PDF Viewer */}
//             <div className="flex-1 overflow-auto p-4 bg-gray-100 dark:bg-gray-800">
//               <PDFViewer
//                 file={resumeUrl}
//                 onLoadSuccess={onLoadSuccess}
//                 pageNumber={pageNumber}
//                 scale={scale}
//               />
//               {numPages && (
//                 <div className="text-center mt-4 text-gray-700 dark:text-gray-300">
//                   Page {pageNumber} of {numPages}
//                   <div className="flex justify-center gap-2 mt-2">
//                     <button
//                       onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
//                       disabled={pageNumber <= 1}
//                       className="px-3 py-1 bg-white dark:bg-gray-700 rounded disabled:opacity-50"
//                     >
//                       Previous
//                     </button>
//                     <button
//                       onClick={() =>
//                         setPageNumber((p) => Math.min(numPages, p + 1))
//                       }
//                       disabled={pageNumber >= numPages}
//                       className="px-3 py-1 bg-white dark:bg-gray-700 rounded disabled:opacity-50"
//                     >
//                       Next
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

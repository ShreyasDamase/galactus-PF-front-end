"use client";
import { useState } from "react";
import { X, Download, ExternalLink } from "lucide-react";

export const ResumeViewer = ({
  resumeUrl,
  resumeName,
}: {
  resumeUrl: string;
  resumeName: string;
}) => {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    setError(true);
    setLoading(false);
  };

  return (
    <>
      {/* Button */}
      <button
        onClick={() => {
          setShow(true);
          setLoading(true);
          setError(false);
        }}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        View Resume
      </button>

      {/* Modal */}
      {show && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300 dark:border-gray-700">
              <h2 className="truncate font-semibold text-gray-900 dark:text-white">
                {resumeName}
              </h2>
              <div className="flex items-center gap-3">
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
                <a
                  href={resumeUrl}
                  download={resumeName}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  title="Download PDF"
                >
                  <Download className="w-5 h-5" />
                </a>
                <button
                  onClick={() => setShow(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-gray-600 dark:text-gray-400">
                    Loading PDF...
                  </div>
                </div>
              )}

              {error ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
                  <div className="text-gray-600 dark:text-gray-400">
                    <p className="text-lg font-semibold mb-2">
                      Unable to preview PDF
                    </p>
                    <p className="text-sm">
                      This PDF cannot be displayed in the browser.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open in New Tab
                    </a>
                    <a
                      href={resumeUrl}
                      download={resumeName}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors inline-flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                </div>
              ) : (
                <iframe
                  src={`${resumeUrl}#view=FitH`}
                  className="w-full h-full border-0"
                  title={resumeName}
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

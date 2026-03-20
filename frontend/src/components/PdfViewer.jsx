import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  ChevronLeft, 
  ChevronRight, 
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react';

// Use unpkg CDN to load the PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export function PdfViewer({ file }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [manualScale, setManualScale] = useState(0.75);
  const [isManualScale, setIsManualScale] = useState(true);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [contentBounds, setContentBounds] = useState({ left: 0, top: 0, right: 1, bottom: 1 });

  const canvasAreaRef = useRef(null);
  const pageWrapperRef = useRef(null);
  const docRef = useRef(null);

  const onLoadSuccess = useCallback((pdf) => {
    setNumPages(pdf.numPages);
    setPageNumber(1);
    setIsManualScale(true);
    setManualScale(0.75);
    docRef.current = pdf;
  }, []);

  useEffect(() => {
    const container = canvasAreaRef.current;
    if (!container) return;

    const updateSize = () => {
      setViewportSize({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadPageSize = async () => {
      if (!docRef.current || !pageNumber) return;
      try {
        const page = await docRef.current.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1 });
        if (!isCancelled) {
          setPageSize({ width: viewport.width, height: viewport.height });
        }
      } catch {
        if (!isCancelled) {
          setPageSize({ width: 0, height: 0 });
        }
      }
    };

    loadPageSize();
    return () => {
      isCancelled = true;
    };
  }, [pageNumber, numPages]);

  const detectContentBounds = useCallback(() => {
    const wrapper = pageWrapperRef.current;
    const canvas = wrapper?.querySelector('canvas');
    if (!canvas) {
      setContentBounds({ left: 0, top: 0, right: 1, bottom: 1 });
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      setContentBounds({ left: 0, top: 0, right: 1, bottom: 1 });
      return;
    }

    const width = canvas.width;
    const height = canvas.height;
    if (!width || !height) {
      setContentBounds({ left: 0, top: 0, right: 1, bottom: 1 });
      return;
    }

    const imageData = ctx.getImageData(0, 0, width, height).data;
    const rowStep = Math.max(2, Math.floor(height / 800));
    const colStep = Math.max(2, Math.floor(width / 800));

    const isInkPixel = (r, g, b, a) => {
      if (a < 12) return false;
      return !(r > 245 && g > 245 && b > 245);
    };

    let top = 0;
    let bottom = height - 1;
    let left = 0;
    let right = width - 1;

    let found = false;

    for (let y = 0; y < height; y += rowStep) {
      let rowHasInk = false;
      for (let x = 0; x < width; x += colStep) {
        const idx = (y * width + x) * 4;
        if (isInkPixel(imageData[idx], imageData[idx + 1], imageData[idx + 2], imageData[idx + 3])) {
          rowHasInk = true;
          found = true;
          break;
        }
      }
      if (rowHasInk) {
        top = y;
        break;
      }
    }

    for (let y = height - 1; y >= 0; y -= rowStep) {
      let rowHasInk = false;
      for (let x = 0; x < width; x += colStep) {
        const idx = (y * width + x) * 4;
        if (isInkPixel(imageData[idx], imageData[idx + 1], imageData[idx + 2], imageData[idx + 3])) {
          rowHasInk = true;
          break;
        }
      }
      if (rowHasInk) {
        bottom = y;
        break;
      }
    }

    for (let x = 0; x < width; x += colStep) {
      let colHasInk = false;
      for (let y = 0; y < height; y += rowStep) {
        const idx = (y * width + x) * 4;
        if (isInkPixel(imageData[idx], imageData[idx + 1], imageData[idx + 2], imageData[idx + 3])) {
          colHasInk = true;
          break;
        }
      }
      if (colHasInk) {
        left = x;
        break;
      }
    }

    for (let x = width - 1; x >= 0; x -= colStep) {
      let colHasInk = false;
      for (let y = 0; y < height; y += rowStep) {
        const idx = (y * width + x) * 4;
        if (isInkPixel(imageData[idx], imageData[idx + 1], imageData[idx + 2], imageData[idx + 3])) {
          colHasInk = true;
          break;
        }
      }
      if (colHasInk) {
        right = x;
        break;
      }
    }

    if (!found || bottom <= top || right <= left) {
      setContentBounds({ left: 0, top: 0, right: 1, bottom: 1 });
      return;
    }

    const pad = 0.02;
    setContentBounds({
      left: Math.max(0, left / width - pad),
      top: Math.max(0, top / height - pad),
      right: Math.min(1, right / width + pad),
      bottom: Math.min(1, bottom / height + pad),
    });
  }, []);

  const effectiveScale = useMemo(() => {
    if (isManualScale) {
      return manualScale;
    }

    if (!pageSize.width || !pageSize.height || !viewportSize.width || !viewportSize.height) {
      return manualScale;
    }

    const contentPadding = 24; // account for viewer padding around the canvas
    const availableWidth = Math.max(240, viewportSize.width - contentPadding);
    const availableHeight = Math.max(240, viewportSize.height - contentPadding);

    const contentWidthRatio = Math.max(0.1, contentBounds.right - contentBounds.left);
    const contentHeightRatio = Math.max(0.1, contentBounds.bottom - contentBounds.top);
    const contentHeight = pageSize.height * contentHeightRatio;
    const contentWidth = pageSize.width * contentWidthRatio;

    const fitHeightScale = availableHeight / contentHeight;
    const fitWidthScale = availableWidth / contentWidth;

    // automatic fit-content: keep full drawing content visible inside the viewport
    const fitContentScale = Math.min(fitWidthScale, fitHeightScale);
    return Math.min(Math.max(fitContentScale, 0.4), 3.0);
  }, [isManualScale, manualScale, pageSize, viewportSize, contentBounds]);

  const zoomIn = () => {
    setIsManualScale(true);
    setManualScale((s) => Math.min(+(s + 0.25).toFixed(2), 3.0));
  };
  const zoomOut = () => {
    setIsManualScale(true);
    setManualScale((s) => Math.max(+(s - 0.25).toFixed(2), 0.5));
  };
  const resetZoom = () => {
    setIsManualScale(true);
    setManualScale(0.75);
  };
  const prevPage = () => setPageNumber((p) => Math.max(p - 1, 1));
  const nextPage = () => setPageNumber((p) => Math.min(p + 1, numPages ?? 1));

  if (!file) {
    return (
      <div className="h-full min-h-125 flex flex-col items-center justify-center panel-industrial transition-all">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 border border-slate-200">
          <FileText className="w-8 h-8 text-primary" />
        </div>
        <p className="text-slate-700 font-medium">Drawing preview will appear here</p>
        <p className="text-slate-500 text-sm mt-1">Upload a PDF to start</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col panel-industrial overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 panel-header backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-slate-300 rounded-lg p-1 shadow-sm">
            <button 
              onClick={prevPage} 
              disabled={pageNumber <= 1}
              className="p-1 hover:bg-slate-100 rounded disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold px-2 min-w-15 text-center text-slate-700">
              {pageNumber} / {numPages ?? '—'}
            </span>
            <button 
              onClick={nextPage} 
              disabled={pageNumber >= (numPages ?? 1)}
              className="p-1 hover:bg-slate-100 rounded disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="hidden sm:block text-xs text-slate-600 font-medium truncate max-w-50">
            {file.name}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-slate-300 rounded-lg p-1 shadow-sm">
            <button 
              onClick={zoomOut} 
              disabled={effectiveScale <= 0.5}
              className="p-1 hover:bg-slate-100 rounded disabled:opacity-30 transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button 
              onClick={resetZoom}
              className="text-xs font-semibold px-2 min-w-11.25 text-center text-slate-700 hover:text-primary transition-colors"
            >
              {Math.round(effectiveScale * 100)}%
            </button>
            <button 
              onClick={zoomIn} 
              disabled={effectiveScale >= 3.0}
              className="p-1 hover:bg-slate-100 rounded disabled:opacity-30 transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
          <button className="p-2 hover:bg-slate-100 border border-transparent hover:border-slate-300 rounded-lg transition-all">
            <Maximize className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* PDF Canvas Area */}
      <div ref={canvasAreaRef} className="flex-1 overflow-auto bg-slate-200/50 flex justify-center p-6 custom-scrollbar">
        <div ref={pageWrapperRef} className="shadow-2xl shadow-black/5 bg-white rounded-sm origin-top transition-transform duration-200">
          <Document
            file={file}
            onLoadSuccess={onLoadSuccess}
            loading={
              <div className="flex flex-col items-center justify-center p-20 gap-3">
                <Loader2 className="w-8 h-8 text-slate-800 animate-spin" />
                <span className="text-sm text-slate-600 font-medium">Loading document...</span>
              </div>
            }
            error={
              <div className="flex flex-col items-center justify-center p-20 gap-3 text-red-500">
                <AlertCircle className="w-8 h-8" />
                <span className="text-sm font-medium">Failed to load PDF</span>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={effectiveScale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="max-w-full"
              onRenderSuccess={detectContentBounds}
            />
          </Document>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
          Engineering Drawing Viewer
        </span>
        {file.size && (
          <span className="text-[10px] font-medium text-slate-500">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </span>
        )}
      </div>
    </div>
  );
}

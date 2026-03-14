import React, { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import {
  Box,
  Card,
  IconButton,
  Typography,
  Stack,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import NavigateBeforeRoundedIcon from '@mui/icons-material/NavigateBeforeRounded';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

// Use unpkg CDN to load the PDF.js worker — avoids Vite worker bundling config.
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

/**
 * PdfViewer — renders a PDF document with page navigation and zoom controls.
 *
 * Props:
 *   file  {File|null}  The PDF file object to display.
 */
function PdfViewer({ file }) {
  const [numPages, setNumPages]   = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale]         = useState(1.0);

  const onLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  }, []);

  const zoomIn    = () => setScale((s) => Math.min(+(s + 0.25).toFixed(2), 3.0));
  const zoomOut   = () => setScale((s) => Math.max(+(s - 0.25).toFixed(2), 0.5));
  const resetZoom = () => setScale(1.0);
  const prevPage  = () => setPageNumber((p) => Math.max(p - 1, 1));
  const nextPage  = () => setPageNumber((p) => Math.min(p + 1, numPages ?? 1));

  // ── Empty placeholder ──────────────────────────────────────────────────────
  if (!file) {
    return (
      <Card
        elevation={0}
        sx={{
          height: '100%',
          minHeight: 480,
          border: '2px dashed rgba(0,0,0,0.10)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.01)',
          borderRadius: 3,
        }}
      >
        <PictureAsPdfIcon sx={{ fontSize: 56, color: 'rgba(0,0,0,0.10)', mb: 1.5 }} />
        <Typography variant="body2" color="text.disabled">
          Drawing preview will appear here
        </Typography>
      </Card>
    );
  }

  // ── Full viewer ────────────────────────────────────────────────────────────
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        minHeight: 480,
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      {/* ── Toolbar ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 0.75,
          background: '#FAFBFD',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          flexShrink: 0,
        }}
      >
        {/* Page navigation */}
        <Stack direction="row" alignItems="center" spacing={0.25}>
          <Tooltip title="Previous page">
            <span>
              <IconButton size="small" onClick={prevPage} disabled={pageNumber <= 1}>
                <NavigateBeforeRoundedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Typography variant="caption" fontWeight={600} sx={{ minWidth: 72, textAlign: 'center' }}>
            {pageNumber} / {numPages ?? '—'}
          </Typography>

          <Tooltip title="Next page">
            <span>
              <IconButton size="small" onClick={nextPage} disabled={pageNumber >= (numPages ?? 1)}>
                <NavigateNextRoundedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        {/* Zoom controls */}
        <Stack direction="row" alignItems="center" spacing={0.25}>
          <Tooltip title="Zoom out">
            <span>
              <IconButton size="small" onClick={zoomOut} disabled={scale <= 0.5}>
                <ZoomOutRoundedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Reset zoom">
            <Typography
              variant="caption"
              fontWeight={700}
              onClick={resetZoom}
              sx={{ minWidth: 46, textAlign: 'center', cursor: 'pointer', color: 'text.secondary' }}
            >
              {Math.round(scale * 100)}%
            </Typography>
          </Tooltip>

          <Tooltip title="Zoom in">
            <span>
              <IconButton size="small" onClick={zoomIn} disabled={scale >= 3.0}>
                <ZoomInRoundedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Box>

      {/* ── PDF canvas ── */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          background: '#D8DADF',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          p: 2,
        }}
      >
        <Document
          file={file}
          onLoadSuccess={onLoadSuccess}
          loading={
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
              <CircularProgress size={36} />
            </Box>
          }
          error={
            <Box sx={{ pt: 6, textAlign: 'center' }}>
              <Typography color="error" variant="body2">
                Failed to load PDF. The file may be corrupted.
              </Typography>
            </Box>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer
            renderAnnotationLayer
            loading={
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress size={28} />
              </Box>
            }
          />
        </Document>
      </Box>
    </Card>
  );
}

export default PdfViewer;

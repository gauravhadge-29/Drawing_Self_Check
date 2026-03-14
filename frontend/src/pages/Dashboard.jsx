import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Fade,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Header from '../components/Header';
import UploadPanel from '../components/UploadPanel';
import PdfViewer from '../components/PdfViewer';
import SummaryCards from '../components/SummaryCards';
import ValidationTable from '../components/ValidationTable';
import { uploadDrawing } from '../api/api';

/**
 * Dashboard — primary page of the Drawing Validation System.
 *
 * Two views:
 *   1. Landing  — shown when no file has been chosen yet.
 *   2. Analysis — shown once a PDF is selected; contains the upload control
 *                 bar, the PDF viewer and the validation results panel.
 *
 * State:
 *   file     {File|null}     The currently selected PDF.
 *   results  {Object|null}   API response: { summary, items }.
 *   loading  {boolean}       True while the API call is in flight.
 *   error    {string|null}   Error message or null.
 */
function Dashboard() {
  const [file,    setFile]    = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleFileSelect = useCallback((f) => {
    setFile(f);
    setResults(null);
    setError(null);
  }, []);

  const handleValidate = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const data = await uploadDrawing(file);
      setResults(data);
    } catch (err) {
      // Surface the most descriptive message available
      const msg =
        err.message ??
        'Validation failed. Make sure the backend is running on http://localhost:8000.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [file]);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#F0F2F5',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Header />

      {/* Spacer pushes content below the fixed 64px AppBar */}
      <Box sx={{ mt: '64px', flexGrow: 1 }}>
        {!file ? (
          // ── LANDING VIEW ─────────────────────────────────────────────────────
          <Fade in timeout={400}>
            <Box
              sx={{
                minHeight: 'calc(100vh - 64px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3,
              }}
            >
              <Box sx={{ textAlign: 'center', maxWidth: 540, width: '100%' }}>
                {/* Hero icon */}
                <Box
                  sx={{
                    width: 96,
                    height: 96,
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    boxShadow: '0 10px 36px rgba(13, 71, 161, 0.32)',
                  }}
                >
                  <CloudUploadIcon sx={{ fontSize: 48, color: '#fff' }} />
                </Box>

                <Typography variant="h4" gutterBottom>
                  Drawing Validation System
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 4, lineHeight: 1.75 }}
                >
                  Upload an engineering drawing PDF to automatically validate all
                  BOM items against callout references in the drawing.
                </Typography>

                {/* Drag-and-drop zone */}
                <LandingDropZone onFileSelect={handleFileSelect} />

                <Typography variant="caption" color="text.disabled" sx={{ mt: 2, display: 'block' }}>
                  Supported format: PDF · Vector engineering drawings
                </Typography>
              </Box>
            </Box>
          </Fade>
        ) : (
          // ── ANALYSIS VIEW ─────────────────────────────────────────────────────
          <Fade in timeout={300}>
            <Container
              maxWidth={false}
              disableGutters
              sx={{ px: { xs: 2, md: 3 }, py: 2 }}
            >
              {/* Upload control bar */}
              <UploadPanel
                file={file}
                loading={loading}
                error={error}
                onFileSelect={handleFileSelect}
                onValidate={handleValidate}
              />

              {/* Main two-column layout */}
              <Grid container spacing={2} sx={{ minHeight: 'calc(100vh - 185px)' }}>
                {/* ── Left column: PDF Viewer ── */}
                <Grid
                  item
                  xs={12}
                  md={6}
                  lg={5}
                  sx={{ display: 'flex', flexDirection: 'column' }}
                >
                  <PdfViewer file={file} />
                </Grid>

                {/* ── Right column: Summary + Table ── */}
                <Grid
                  item
                  xs={12}
                  md={6}
                  lg={7}
                  sx={{ display: 'flex', flexDirection: 'column' }}
                >
                  <SummaryCards summary={results?.summary ?? null} loading={loading} />

                  <Box sx={{ flexGrow: 1 }}>
                    <ValidationTable items={results?.items ?? null} loading={loading} />
                  </Box>
                </Grid>
              </Grid>
            </Container>
          </Fade>
        )}
      </Box>
    </Box>
  );
}

// ── Landing drag-and-drop upload zone ─────────────────────────────────────────

/**
 * LandingDropZone — interactive upload area shown on the welcome screen.
 * Clicking opens a file picker; dragging a PDF onto it also works.
 */
function LandingDropZone({ onFileSelect }) {
  const inputRef = React.useRef(null);
  const [dragOver, setDragOver] = React.useState(false);

  const pick = (f) => {
    if (f && f.type === 'application/pdf') onFileSelect(f);
  };

  return (
    <Paper
      elevation={0}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); pick(e.dataTransfer.files?.[0]); }}
      sx={{
        border: '2px dashed',
        borderColor: dragOver ? 'primary.main' : 'rgba(0,0,0,0.14)',
        borderRadius: 4,
        py: 5,
        px: 3,
        cursor: 'pointer',
        background: dragOver ? 'rgba(13,71,161,0.04)' : 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(8px)',
        transition: 'border-color 0.2s, background 0.2s',
        '&:hover': {
          borderColor: 'primary.main',
          background: 'rgba(13,71,161,0.03)',
        },
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        style={{ display: 'none' }}
        onChange={(e) => pick(e.target.files?.[0])}
      />
      <CloudUploadIcon
        sx={{ fontSize: 36, color: dragOver ? 'primary.main' : 'text.disabled', mb: 1 }}
      />
      <Typography
        variant="body1"
        fontWeight={600}
        color={dragOver ? 'primary.main' : 'text.secondary'}
      >
        {dragOver ? 'Drop the PDF here' : 'Click to upload  ·  or drag & drop'}
      </Typography>
    </Paper>
  );
}

export default Dashboard;

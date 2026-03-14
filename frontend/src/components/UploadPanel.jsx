import React, { useRef, useState } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  Stack,
  LinearProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import SyncAltIcon from '@mui/icons-material/SyncAlt';

/**
 * UploadPanel — compact horizontal bar shown above the main analysis layout.
 *
 * Props:
 *   file          {File|null}   Currently selected PDF file.
 *   loading       {boolean}     True while the validation API call is running.
 *   error         {string|null} Error message to display, or null.
 *   onFileSelect  {fn(File)}    Called when the user picks a new PDF.
 *   onValidate    {fn()}        Called when "Run Validation" is clicked.
 */
function UploadPanel({ file, loading, error, onFileSelect, onValidate }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f && f.type === 'application/pdf') {
      onFileSelect(f);
    } else if (f) {
      alert('Please select a PDF file.');
    }
    // Reset so the same file can be re-selected after a change
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type === 'application/pdf') onFileSelect(f);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Card
      elevation={0}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      sx={{
        mb: 2,
        border: '1px solid',
        borderColor: dragOver ? 'primary.main' : 'rgba(0,0,0,0.08)',
        background: dragOver ? 'rgba(13,71,161,0.03)' : '#fff',
        transition: 'border-color 0.2s, background 0.2s',
      }}
    >
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ sm: 'center' }}
          spacing={2}
        >
          {/* ── File info ── */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1, minWidth: 0 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: file ? 'rgba(13,71,161,0.08)' : 'rgba(0,0,0,0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <InsertDriveFileOutlinedIcon
                sx={{ fontSize: 20, color: file ? 'primary.main' : 'text.disabled' }}
              />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              {file ? (
                <>
                  <Tooltip title={file.name} placement="top-start">
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      noWrap
                      sx={{ maxWidth: { xs: 220, sm: 400, md: 600 } }}
                    >
                      {file.name}
                    </Typography>
                  </Tooltip>
                  <Typography variant="caption" color="text.secondary">
                    {(file.size / 1024).toFixed(1)} KB · PDF Drawing
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="body2" fontWeight={600} color="text.secondary">
                    No drawing selected
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    Drag &amp; drop a PDF, or click Upload
                  </Typography>
                </>
              )}
            </Box>
          </Box>

          {/* ── Action buttons ── */}
          <Stack direction="row" spacing={1.5} sx={{ flexShrink: 0 }}>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            <Button
              variant={file ? 'outlined' : 'contained'}
              startIcon={file ? <SyncAltIcon /> : <CloudUploadIcon />}
              onClick={() => inputRef.current?.click()}
              disabled={loading}
              size="medium"
            >
              {file ? 'Change' : 'Upload Drawing'}
            </Button>

            {file && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<PlayArrowRoundedIcon />}
                onClick={onValidate}
                disabled={loading}
                size="medium"
                sx={{ minWidth: 160 }}
              >
                {loading ? 'Validating…' : 'Run Validation'}
              </Button>
            )}
          </Stack>
        </Stack>

        {/* Progress bar — rendered below the row during loading */}
        {loading && (
          <LinearProgress sx={{ mt: 1.5, borderRadius: 4 }} color="primary" />
        )}

        {/* Error message */}
        {error && !loading && (
          <Alert severity="error" sx={{ mt: 1.5, py: 0.5, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export default UploadPanel;

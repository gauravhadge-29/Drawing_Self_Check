import React from 'react';
import { AppBar, Toolbar, Typography, Box, Chip } from '@mui/material';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import VerifiedIcon from '@mui/icons-material/Verified';

/**
 * Header — fixed top navigation bar.
 *
 * Contains:
 *   - Application icon + system name + sub-label (left side)
 *   - "Automated QA" badge chip (right side)
 */
function Header() {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: 'linear-gradient(105deg, #08163A 0%, #0D47A1 60%, #1565C0 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ px: { xs: 2, sm: 3 }, minHeight: '64px !important' }}>
        {/* ── Left: logo icon + text ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '11px',
              background: 'rgba(255,255,255,0.13)',
              border: '1px solid rgba(255,255,255,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <PrecisionManufacturingIcon sx={{ color: '#fff', fontSize: 24 }} />
          </Box>

          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '-0.3px',
                lineHeight: 1.25,
                fontSize: { xs: '1rem', sm: '1.1rem' },
              }}
            >
              Drawing Validation System
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255,255,255,0.55)',
                letterSpacing: '0.07em',
                fontSize: '0.68rem',
                textTransform: 'uppercase',
              }}
            >
              BOM &amp; Callout Analysis
            </Typography>
          </Box>
        </Box>

        {/* ── Right: badge ── */}
        <Chip
          icon={<VerifiedIcon sx={{ fontSize: '14px !important', color: '#7DD3FC !important' }} />}
          label="Automated QA"
          size="small"
          sx={{
            background: 'rgba(255,255,255,0.10)',
            color: 'rgba(255,255,255,0.85)',
            border: '1px solid rgba(255,255,255,0.18)',
            fontWeight: 600,
            fontSize: '0.72rem',
            letterSpacing: '0.03em',
          }}
        />
      </Toolbar>
    </AppBar>
  );
}

export default Header;

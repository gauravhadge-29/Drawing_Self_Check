import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Divider,
  Typography,
  Box,
  Chip,
  Stack,
} from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

/**
 * MaterialValidationCard
 * Shows extracted material + finish and compliance result.
 */
function MaterialValidationCard({ materialValidation, loading }) {
  const material = materialValidation?.material || 'NOT FOUND';
  const surfaceFinish = materialValidation?.surface_finish || 'NOT FOUND';
  const status = materialValidation?.status || 'UNKNOWN';
  const allowedFinishes = materialValidation?.allowed_finishes || [];
  const message = materialValidation?.message || null;

  const statusStyle = getStatusStyle(status);

  return (
    <Card elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 3 }}>
      <CardHeader
        avatar={
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '9px',
              background: 'rgba(13,71,161,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ScienceIcon sx={{ color: 'primary.main', fontSize: 18 }} />
          </Box>
        }
        title={<Typography variant="subtitle1" fontWeight={700}>Material Compliance</Typography>}
        subheader={
          <Typography variant="caption" color="text.secondary">
            {loading ? 'Running…' : 'Material and surface finish policy check'}
          </Typography>
        }
        sx={{ pb: 0 }}
      />

      <Divider sx={{ mx: 2, mt: 1 }} />

      <CardContent sx={{ pt: 2 }}>
        <Stack spacing={1.2}>
          <InfoRow label="Material" value={material} />
          <InfoRow label="Surface Finish" value={surfaceFinish} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 110 }}>
              Status
            </Typography>
            <Chip
              size="small"
              label={status}
              icon={statusStyle.icon}
              sx={{
                fontWeight: 700,
                color: statusStyle.color,
                background: statusStyle.bg,
                '& .MuiChip-icon': { color: statusStyle.color },
              }}
            />
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Allowed Finishes
            </Typography>
            {allowedFinishes.length > 0 ? (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {allowedFinishes.map((finish) => (
                  <Chip
                    key={finish}
                    size="small"
                    label={finish}
                    sx={{
                      background: 'rgba(0,0,0,0.06)',
                      color: 'text.primary',
                      fontWeight: 600,
                    }}
                  />
                ))}
              </Stack>
            ) : (
              <Typography variant="caption" color="text.disabled">
                No rule entry available.
              </Typography>
            )}
          </Box>

          {message && (
            <Typography variant="caption" color="text.secondary">
              Note: {message}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 110 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {value}
      </Typography>
    </Box>
  );
}

function getStatusStyle(status) {
  if (status === 'PASS') {
    return {
      color: '#2E7D32',
      bg: '#E8F5E9',
      icon: <CheckCircleOutlineIcon style={{ fontSize: 14 }} />,
    };
  }
  if (status === 'FAIL') {
    return {
      color: '#C62828',
      bg: '#FFEBEE',
      icon: <HighlightOffIcon style={{ fontSize: 14 }} />,
    };
  }
  return {
    color: '#ED6C02',
    bg: '#FFF3E0',
    icon: <HelpOutlineIcon style={{ fontSize: 14 }} />,
  };
}

export default MaterialValidationCard;

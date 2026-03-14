import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import LayersIcon from '@mui/icons-material/Layers';

/**
 * SummaryCards — three metric cards showing Total / PASS / FAIL counts.
 *
 * Props:
 *   summary  {{ pass: number, fail: number } | null}
 *   loading  {boolean}
 */
function SummaryCards({ summary, loading }) {
  if (loading) {
    return (
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[0, 1, 2].map((i) => (
          <Grid item xs={4} key={i}>
            <Skeleton variant="rounded" height={90} sx={{ borderRadius: 3 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  const pass  = summary?.pass  ?? null;
  const fail  = summary?.fail  ?? null;
  const total = pass !== null && fail !== null ? pass + fail : null;

  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      {/* Total */}
      <Grid item xs={4}>
        <MetricCard
          label="Total Items"
          value={total}
          icon={<LayersIcon sx={{ fontSize: 26 }} />}
          bg="#F0F4FF"
          colour="#0D47A1"
        />
      </Grid>

      {/* PASS */}
      <Grid item xs={4}>
        <MetricCard
          label="Pass"
          value={pass}
          icon={<CheckCircleRoundedIcon sx={{ fontSize: 26 }} />}
          bg="#E8F5E9"
          colour="#2E7D32"
        />
      </Grid>

      {/* FAIL */}
      <Grid item xs={4}>
        <MetricCard
          label="Fail"
          value={fail}
          icon={<ErrorRoundedIcon sx={{ fontSize: 26 }} />}
          bg="#FFEBEE"
          colour="#C62828"
        />
      </Grid>
    </Grid>
  );
}

/**
 * MetricCard — single coloured metric tile.
 */
function MetricCard({ label, value, icon, bg, colour }) {
  const isEmpty = value === null;

  return (
    <Card
      elevation={0}
      sx={{
        background: bg,
        border: `1px solid ${colour}1A`,
        borderRadius: 3,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 6px 20px ${colour}22`,
        },
      }}
    >
      <CardContent sx={{ p: '14px 16px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                color: colour,
                fontWeight: 700,
                fontSize: '0.68rem',
                letterSpacing: '0.09em',
                textTransform: 'uppercase',
                mb: 0.4,
              }}
            >
              {label}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                color: colour,
                fontWeight: 800,
                lineHeight: 1,
                opacity: isEmpty ? 0.25 : 1,
                fontSize: { xs: '1.6rem', sm: '2rem' },
              }}
            >
              {isEmpty ? '—' : value}
            </Typography>
          </Box>

          <Box sx={{ color: colour, opacity: 0.22 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default SummaryCards;

import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Typography,
  Box,
  Skeleton,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

/**
 * ValidationTable — tabular view of all BOM validation results.
 *
 * Columns: Item · Description · Expected Qty · Callout Found · Status
 *
 * Props:
 *   items    {Array|null}  Array of validation result objects from the API.
 *   loading  {boolean}
 *
 * Item shape:
 *   { item, description, expected_qty, callout_found, status }
 */
function ValidationTable({ items, loading }) {
  const itemCount = items?.length ?? 0;

  return (
    <Card
      elevation={0}
      sx={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 3, height: '100%' }}
    >
      {/* ── Card header ── */}
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
            <AssignmentTurnedInIcon sx={{ color: 'primary.main', fontSize: 18 }} />
          </Box>
        }
        title={
          <Typography variant="subtitle1" fontWeight={700}>
            Validation Results
          </Typography>
        }
        subheader={
          <Typography variant="caption" color="text.secondary">
            {loading
              ? 'Running…'
              : items
              ? `${itemCount} BOM item${itemCount !== 1 ? 's' : ''} checked`
              : 'Run validation to see results'}
          </Typography>
        }
        sx={{ pb: 0 }}
      />

      <Divider sx={{ mx: 2, mt: 1 }} />

      {/* ── Card body ── */}
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>

        {/* Loading skeletons */}
        {loading && (
          <Box sx={{ p: 2 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rounded"
                height={42}
                sx={{ mb: 1, borderRadius: 2 }}
              />
            ))}
          </Box>
        )}

        {/* Empty state */}
        {!loading && (!items || items.length === 0) && (
          <Box
            sx={{
              py: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: 'text.disabled',
            }}
          >
            <AssignmentTurnedInIcon sx={{ fontSize: 52, opacity: 0.12, mb: 1.5 }} />
            <Typography variant="body2">No results yet.</Typography>
            <Typography variant="caption">Upload a drawing and run validation.</Typography>
          </Box>
        )}

        {/* Results table */}
        {!loading && items && items.length > 0 && (
          <TableContainer sx={{ maxHeight: 420 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {[
                    { label: 'Item',         width: 60  },
                    { label: 'Description',  width: null },
                    { label: 'Exp. Qty',     width: 80  },
                    { label: 'Callout',      width: 90  },
                    { label: 'Status',       width: 90, align: 'center' },
                  ].map(({ label, width, align }) => (
                    <TableCell key={label} align={align ?? 'left'} sx={{ width }}>
                      {label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {items.map((row) => {
                  const isPassed = row.status === 'PASS';
                  return (
                    <TableRow
                      key={row.item}
                      sx={{
                        '&:nth-of-type(even)': { background: 'rgba(0,0,0,0.015)' },
                        '&:hover': { background: 'rgba(13,71,161,0.03)' },
                        transition: 'background 0.1s',
                      }}
                    >
                      {/* Item number */}
                      <TableCell>
                        <Typography variant="body2" fontWeight={700} color="primary.main">
                          #{row.item}
                        </Typography>
                      </TableCell>

                      {/* Description */}
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight={500}
                          sx={{
                            maxWidth: 260,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {row.description}
                        </Typography>
                      </TableCell>

                      {/* Expected qty — shown as a neutral badge */}
                      <TableCell>
                        <Chip
                          label={row.expected_qty}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            background: 'rgba(0,0,0,0.06)',
                            color: 'text.primary',
                            height: 22,
                          }}
                        />
                      </TableCell>

                      {/* Callout found indicator */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {row.callout_found ? (
                            <>
                              <CheckCircleOutlineIcon sx={{ fontSize: 15, color: '#2E7D32' }} />
                              <Typography variant="caption" fontWeight={700} sx={{ color: '#2E7D32' }}>
                                YES
                              </Typography>
                            </>
                          ) : (
                            <>
                              <HighlightOffIcon sx={{ fontSize: 15, color: '#C62828' }} />
                              <Typography variant="caption" fontWeight={700} sx={{ color: '#C62828' }}>
                                NO
                              </Typography>
                            </>
                          )}
                        </Box>
                      </TableCell>

                      {/* Status chip — green PASS / red FAIL */}
                      <TableCell align="center">
                        <Chip
                          label={row.status}
                          size="small"
                          icon={
                            isPassed
                              ? <CheckCircleOutlineIcon style={{ fontSize: 12 }} />
                              : <HighlightOffIcon style={{ fontSize: 12 }} />
                          }
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.70rem',
                            height: 22,
                            ...(isPassed
                              ? {
                                  background: '#E8F5E9',
                                  color: '#2E7D32',
                                  '& .MuiChip-icon': { color: '#2E7D32' },
                                }
                              : {
                                  background: '#FFEBEE',
                                  color: '#C62828',
                                  '& .MuiChip-icon': { color: '#C62828' },
                                }),
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default ValidationTable;

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  FormControlLabel,
  Switch,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  Scanner as ScannerIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  Visibility as ViewIcon,
  RotateRight as RotateIcon,
  AddPhotoAlternate as AddMoreIcon,
  CheckCircle as CheckIcon,
  AutoFixHigh as OCRIcon,
  Refresh as RefreshIcon,
  DeviceHub as DeviceIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { PDFDocument, degrees } from 'pdf-lib';
import { AppDispatch, RootState } from '../store';
import { uploadDocument, fetchFolders } from '../store/documentsSlice';
import apiService from '../services/api';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';

interface ScannedPage {
  id: string;
  file: File;
  preview: string;
  rotation: number;
  ocrText?: string;
  ocrProcessing?: boolean;
  ocrConfidence?: number; // 0–100
}

const steps = ['Scan Documents', 'Review & Edit', 'OCR & Metadata', 'Upload'];

const Scanner: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { folders, loading: uploadLoading } = useSelector((state: RootState) => state.documents);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Workflow state
  const [activeStep, setActiveStep] = useState(0);
  const [scannedPages, setScannedPages] = useState<ScannedPage[]>([]);

  // Document metadata
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [folderId, setFolderId] = useState<number | ''>('');

  // OCR state
  const [enableOCR, setEnableOCR] = useState(true);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);

  // WIA scanner device state
  const [wiaDevices, setWiaDevices] = useState<{ id: string; name: string }[]>([]);
  const [wiaLoading, setWiaLoading] = useState(false);
  const [wiaScanning, setWiaScanning] = useState(false);
  const [wiaError, setWiaError] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [colorMode, setColorMode] = useState<4 | 2 | 1>(4); // 4=Color, 2=Grayscale, 1=B&W
  const [scanDpi, setScanDpi] = useState<150 | 300 | 600>(300);

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchFolders());
  }, [dispatch]);

  const detectScanners = async () => {
    setWiaLoading(true);
    setWiaError(null);
    try {
      const devices = await apiService.listScannerDevices();
      setWiaDevices(devices);
      if (devices.length > 0 && !selectedDevice) {
        setSelectedDevice(devices[0].id);
      }
    } catch {
      setWiaError('Could not reach scanner service. Is the backend running on Windows?');
    } finally {
      setWiaLoading(false);
    }
  };

  const handleWiaScan = async () => {
    if (!selectedDevice) return;
    setWiaScanning(true);
    setWiaError(null);
    try {
      const file = await apiService.scanFromDevice(selectedDevice, colorMode, scanDpi);
      const preview = URL.createObjectURL(file);
      setScannedPages(prev => [...prev, { id: `${Date.now()}`, file, preview, rotation: 0 }]);
      if (!title) setTitle(generateTitle());
      setActiveStep(1);
    } catch (err: any) {
      setWiaError(err.response?.data?.error || err.message || 'Scan failed.');
    } finally {
      setWiaScanning(false);
    }
  };

  // Generate suggested title based on date/time
  const generateTitle = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return `Scan ${dateStr} ${timeStr}`;
  };

  // Handle file selection from scanner/camera
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError(null);
    const newPages: ScannedPage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        setError(`Invalid file type: ${file.name}. Please upload images or PDFs.`);
        continue;
      }

      // Create preview
      const preview = URL.createObjectURL(file);

      newPages.push({
        id: `${Date.now()}-${i}`,
        file,
        preview,
        rotation: 0,
      });
    }

    setScannedPages([...scannedPages, ...newPages]);

    // Auto-generate title if first scan
    if (scannedPages.length === 0 && !title) {
      setTitle(generateTitle());
    }

    // Move to review step if this is the first scan
    if (activeStep === 0 && newPages.length > 0) {
      setActiveStep(1);
    }
  };

  // Delete a scanned page
  const handleDeletePage = (pageId: string) => {
    setScannedPages(scannedPages.filter(p => p.id !== pageId));
  };

  // Rotate a page
  const handleRotatePage = (pageId: string) => {
    setScannedPages(scannedPages.map(p =>
      p.id === pageId ? { ...p, rotation: (p.rotation + 90) % 360 } : p
    ));
  };

  // Process OCR for all pages
  const handleProcessOCR = async () => {
    if (!enableOCR) return;

    setOcrLoading(true);
    setOcrError(null);

    try {
      for (let i = 0; i < scannedPages.length; i++) {
        const page = scannedPages[i];

        // Update processing status
        setScannedPages(prev => prev.map(p =>
          p.id === page.id ? { ...p, ocrProcessing: true } : p
        ));

        // Call OCR API
        try {
          const formData = new FormData();
          formData.append('file', page.file);

          const response = await apiService.processOCR(formData);
          const ocrText = response.data?.text || '';
          const ocrConfidence = response.data?.confidence ?? undefined;

          // Update with OCR result
          setScannedPages(prev => prev.map(p =>
            p.id === page.id ? { ...p, ocrText, ocrConfidence, ocrProcessing: false } : p
          ));
        } catch (err: any) {
          console.error('OCR failed for page:', page.file.name, err);
          setScannedPages(prev => prev.map(p =>
            p.id === page.id ? { ...p, ocrText: '', ocrProcessing: false } : p
          ));
        }
      }
    } catch (err: any) {
      setOcrError(err.message || 'OCR processing failed');
    } finally {
      setOcrLoading(false);
    }
  };

  // Combine all pages into a single PDF (with invisible OCR text layer for searchability)
  const combinePagesToPDF = async (): Promise<File> => {
    const pdfDoc = await PDFDocument.create();

    for (const page of scannedPages) {
      const arrayBuf = await page.file.arrayBuffer();

      if (page.file.type === 'application/pdf') {
        const loadedPdf = await PDFDocument.load(arrayBuf);
        const copiedPages = await pdfDoc.copyPages(loadedPdf, loadedPdf.getPageIndices());
        copiedPages.forEach(p => pdfDoc.addPage(p));
      } else {
        // Image file
        const isJpeg = page.file.type.includes('jpeg') || page.file.type.includes('jpg');
        const embedded = isJpeg
          ? await pdfDoc.embedJpg(arrayBuf)
          : await pdfDoc.embedPng(arrayBuf);

        const pdfPage = pdfDoc.addPage([embedded.width, embedded.height]);
        pdfPage.drawImage(embedded, {
          x: 0,
          y: 0,
          width: embedded.width,
          height: embedded.height,
          rotate: degrees(page.rotation),
        });

        // Embed invisible OCR text layer for searchability
        if (page.ocrText) {
          const words = page.ocrText.split(/\s+/).filter(Boolean);
          const cols = 10;
          const cellW = embedded.width / cols;
          const rows = Math.ceil(words.length / cols);
          const cellH = Math.min(20, embedded.height / Math.max(rows, 1));

          words.forEach((word, idx) => {
            const col = idx % cols;
            const row = Math.floor(idx / cols);
            try {
              pdfPage.drawText(word, {
                x: col * cellW,
                y: embedded.height - (row + 1) * cellH,
                size: cellH * 0.8,
                opacity: 0.001, // invisible but selectable
              });
            } catch {
              // Skip words with unsupported characters
            }
          });
        }
      }
    }

    // Embed all OCR text in PDF keywords metadata for full-text search
    const allOcrText = scannedPages.map(p => p.ocrText).filter(Boolean).join(' ');
    if (allOcrText) {
      pdfDoc.setKeywords([allOcrText.slice(0, 32767)]);
    }

    const pdfBytes = await pdfDoc.save();
    return new File([pdfBytes], `${title || 'scan'}.pdf`, { type: 'application/pdf' });
  };

  // Upload the final document
  const handleUpload = async () => {
    if (scannedPages.length === 0) {
      setError('No pages to upload');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a document title');
      return;
    }

    try {
      setError(null);

      // Combine all pages into PDF
      const pdfFile = await combinePagesToPDF();

      // Prepare form data
      const formData = new FormData();
      formData.append('file', pdfFile);
      formData.append('title', title);
      if (description) formData.append('description', description);
      if (folderId) formData.append('folderId', folderId.toString());

      // Add OCR text as metadata if available
      if (enableOCR) {
        const allOcrText = scannedPages
          .map(p => p.ocrText)
          .filter(Boolean)
          .join('\n\n');

        if (allOcrText) {
          formData.append('metadata', JSON.stringify({
            ocrText: allOcrText,
            scannedPages: scannedPages.length,
            scannedAt: new Date().toISOString(),
          }));
        }
      }

      await dispatch(uploadDocument(formData)).unwrap();

      // Success - navigate to documents
      navigate('/documents');
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    }
  };

  // Step navigation — async so OCR finishes before advancing to Upload step
  const handleNext = async () => {
    if (activeStep === 2 && enableOCR) {
      await handleProcessOCR();
    }
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setScannedPages([]);
    setTitle('');
    setDescription('');
    setFolderId('');
    setEnableOCR(true);
    setError(null);
  };

  // OCR confidence badge helper
  const confidenceBadge = (confidence?: number) => {
    if (confidence === undefined) return null;
    const pct = Math.round(confidence);
    const color = pct >= 80 ? 'success' : pct >= 50 ? 'warning' : 'error';
    return { label: `${pct}%`, color } as const;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Layout>
      <PageHeader
        title="Document Scanner"
        subtitle="Scan, process with OCR, and upload documents"
        breadcrumbs={[
          { label: 'Home', path: '/dashboard' },
          { label: 'Documents', path: '/documents' },
          { label: 'Scanner' },
        ]}
      />

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel={isMobile}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Step Content */}
      <Paper sx={{ p: 4, minHeight: 400 }}>
        {/* Step 0: Scan Documents */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Start Scanning
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Use a connected scanner, camera, or upload files directly.
            </Typography>

            <Stack spacing={2} sx={{ mt: 3 }}>

              {/* ── WIA Hardware Scanner ── */}
              <Card
                sx={{
                  border: '2px solid',
                  borderColor: wiaDevices.length > 0 ? 'success.main' : 'divider',
                  borderRadius: 2,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                    <DeviceIcon color={wiaDevices.length > 0 ? 'success' : 'action'} />
                    <Typography variant="subtitle1" fontWeight={700}>
                      Hardware Scanner (WIA)
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Button
                      size="small"
                      startIcon={<RefreshIcon />}
                      onClick={detectScanners}
                      disabled={wiaLoading}
                      variant="outlined"
                    >
                      {wiaLoading ? 'Detecting…' : 'Detect'}
                    </Button>
                  </Stack>

                  {wiaError && (
                    <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setWiaError(null)}>
                      {wiaError}
                    </Alert>
                  )}

                  {wiaDevices.length === 0 && !wiaLoading && (
                    <Typography variant="body2" color="text.secondary">
                      Click <strong>Detect</strong> to find connected scanners (Windows WIA required).
                    </Typography>
                  )}

                  {wiaDevices.length > 0 && (
                    <Stack spacing={2}>
                      {/* Device picker */}
                      <FormControl size="small" fullWidth>
                        <InputLabel>Scanner Device</InputLabel>
                        <Select
                          label="Scanner Device"
                          value={selectedDevice}
                          onChange={(e) => setSelectedDevice(e.target.value)}
                        >
                          {wiaDevices.map((d) => (
                            <MenuItem key={d.id} value={d.id}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <ScannerIcon fontSize="small" color="action" />
                                <span>{d.name || d.id}</span>
                              </Stack>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {/* Scan settings */}
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                        <FormControl size="small" sx={{ minWidth: 130 }}>
                          <InputLabel>Color</InputLabel>
                          <Select
                            label="Color"
                            value={colorMode}
                            onChange={(e) => setColorMode(e.target.value as 4 | 2 | 1)}
                          >
                            <MenuItem value={4}>Color</MenuItem>
                            <MenuItem value={2}>Grayscale</MenuItem>
                            <MenuItem value={1}>Black & White</MenuItem>
                          </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 110 }}>
                          <InputLabel>DPI</InputLabel>
                          <Select
                            label="DPI"
                            value={scanDpi}
                            onChange={(e) => setScanDpi(e.target.value as 150 | 300 | 600)}
                          >
                            <MenuItem value={150}>150 DPI</MenuItem>
                            <MenuItem value={300}>300 DPI</MenuItem>
                            <MenuItem value={600}>600 DPI</MenuItem>
                          </Select>
                        </FormControl>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={wiaScanning ? <CircularProgress size={16} color="inherit" /> : <ScannerIcon />}
                          disabled={!selectedDevice || wiaScanning}
                          onClick={handleWiaScan}
                          sx={{ flexShrink: 0 }}
                        >
                          {wiaScanning ? 'Scanning…' : 'Scan Now'}
                        </Button>
                      </Stack>
                    </Stack>
                  )}
                </CardContent>
              </Card>

              {/* ── File / Scanner driver upload ── */}
              <Card
                sx={{
                  p: 4,
                  textAlign: 'center',
                  border: '2px dashed',
                  borderColor: 'primary.main',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <ScannerIcon sx={{ fontSize: 56, color: 'primary.main', mb: 1.5 }} />
                <Typography variant="h6" gutterBottom>
                  Upload Files
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Choose images or PDFs from your computer or scanner software
                </Typography>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  onChange={(e) => handleFileSelect(e.target.files)}
                  style={{ display: 'none' }}
                />
              </Card>

              {/* ── Camera ── */}
              <Card
                sx={{
                  p: 4,
                  textAlign: 'center',
                  border: '2px dashed',
                  borderColor: 'secondary.main',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
                onClick={() => cameraInputRef.current?.click()}
              >
                <CameraIcon sx={{ fontSize: 56, color: 'secondary.main', mb: 1.5 }} />
                <Typography variant="h6" gutterBottom>
                  Use Camera
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Take photos with your device camera
                </Typography>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  aria-label="Capture photo with camera"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  style={{ display: 'none' }}
                />
              </Card>
            </Stack>

            {scannedPages.length > 0 && (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Chip
                  icon={<CheckIcon />}
                  label={`${scannedPages.length} page(s) ready`}
                  color="success"
                  sx={{ mb: 2 }}
                />
                <Box>
                  <Button variant="contained" onClick={() => setActiveStep(1)} size="large">
                    Continue to Review
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* Step 1: Review & Edit */}
        {activeStep === 1 && (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight={600}>
                Review Scanned Pages ({scannedPages.length})
              </Typography>
              <Button
                startIcon={<AddMoreIcon />}
                variant="outlined"
                onClick={() => setActiveStep(0)}
              >
                Add More Pages
              </Button>
            </Stack>

            <Grid container spacing={2}>
              {scannedPages.map((page, index) => (
                <Grid size={{ xs: 6, sm: 4, md: 3 }} key={page.id}>
                  <Card>
                    <Box
                      sx={{
                        position: 'relative',
                        paddingTop: '141.4%', // A4 aspect ratio
                        bgcolor: 'grey.100',
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        component="img"
                        src={page.preview}
                        alt={`Page ${index + 1}`}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transform: `rotate(${page.rotation}deg)`,
                        }}
                      />
                      <Chip
                        label={`Page ${index + 1}`}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          bgcolor: 'rgba(0,0,0,0.7)',
                          color: 'white',
                        }}
                      />
                      {/* OCR confidence badge */}
                      {(() => {
                        const badge = confidenceBadge(page.ocrConfidence);
                        return badge ? (
                          <Chip
                            label={`OCR ${badge.label}`}
                            size="small"
                            color={badge.color}
                            sx={{ position: 'absolute', bottom: 8, right: 8, height: 20, fontSize: '0.65rem' }}
                          />
                        ) : page.ocrProcessing ? (
                          <Chip
                            label="OCR…"
                            size="small"
                            sx={{
                              position: 'absolute', bottom: 8, right: 8, height: 20, fontSize: '0.65rem',
                              bgcolor: 'rgba(0,0,0,0.5)', color: 'white',
                            }}
                          />
                        ) : null;
                      })()}
                    </Box>
                    <CardContent sx={{ p: 1 }}>
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <IconButton
                          size="small"
                          onClick={() => setSelectedPreview(page.preview)}
                          title="Preview"
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleRotatePage(page.id)}
                          title="Rotate"
                        >
                          <RotateIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeletePage(page.id)}
                          title="Delete"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                      <Typography variant="caption" display="block" textAlign="center" color="text.secondary">
                        {formatFileSize(page.file.size)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {scannedPages.length === 0 && (
              <Alert severity="info">
                No pages scanned yet. Go back to add pages.
              </Alert>
            )}
          </Box>
        )}

        {/* Step 2: OCR & Metadata */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Document Information & OCR
            </Typography>

            <Stack spacing={3} sx={{ mt: 3 }}>
              <TextField
                fullWidth
                label="Document Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                helperText="Give your document a descriptive title"
              />

              <TextField
                fullWidth
                label="Description (Optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={3}
                helperText="Add any relevant notes or description"
              />

              <FormControl fullWidth>
                <InputLabel>Folder (Optional)</InputLabel>
                <Select
                  value={folderId}
                  label="Folder (Optional)"
                  onChange={(e) => setFolderId(e.target.value as number | '')}
                >
                  <MenuItem value="">
                    <em>No Folder (Root)</em>
                  </MenuItem>
                  {folders.map((folder) => (
                    <MenuItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Divider />

              <FormControlLabel
                control={
                  <Switch
                    checked={enableOCR}
                    onChange={(e) => setEnableOCR(e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      Enable OCR (Optical Character Recognition)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Extract text from scanned images for search and indexing
                    </Typography>
                  </Box>
                }
              />

              {enableOCR && (
                <Alert severity="info" icon={<OCRIcon />}>
                  OCR will process all {scannedPages.length} page(s) when you continue.
                  This may take a few moments.
                </Alert>
              )}

              {ocrError && (
                <Alert severity="error">
                  {ocrError}
                </Alert>
              )}

              {ocrLoading && (
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Processing OCR...
                  </Typography>
                  <LinearProgress />
                </Box>
              )}

              {/* Per-page OCR confidence results */}
              {!ocrLoading && scannedPages.some(p => p.ocrConfidence !== undefined) && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    OCR Results
                  </Typography>
                  <Stack spacing={1}>
                    {scannedPages.map((page, idx) => {
                      const badge = confidenceBadge(page.ocrConfidence);
                      return (
                        <Box
                          key={page.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            p: 1.5,
                            borderRadius: 1.5,
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 60 }}>
                            Page {idx + 1}
                          </Typography>
                          {badge && (
                            <Chip label={`${badge.label} confidence`} size="small" color={badge.color} />
                          )}
                          {page.ocrText ? (
                            <Typography variant="caption" color="text.secondary" noWrap sx={{ flex: 1 }}>
                              {page.ocrText.slice(0, 80)}{page.ocrText.length > 80 ? '…' : ''}
                            </Typography>
                          ) : (
                            <Typography variant="caption" color="text.disabled">No text detected</Typography>
                          )}
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              )}
            </Stack>
          </Box>
        )}

        {/* Step 3: Upload */}
        {activeStep === 3 && (
          <Box>
            <Stack alignItems="center" spacing={3}>
              {uploadLoading ? (
                <>
                  <CircularProgress size={64} />
                  <Typography variant="h6">Uploading document...</Typography>
                  <LinearProgress sx={{ width: '100%' }} />
                </>
              ) : (
                <>
                  <CheckIcon sx={{ fontSize: 80, color: 'success.main' }} />
                  <Typography variant="h5" fontWeight={600}>
                    Ready to Upload
                  </Typography>

                  <Card sx={{ width: '100%', maxWidth: 600 }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Document Summary
                      </Typography>
                      <Stack spacing={1.5} sx={{ mt: 2 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Title
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {title}
                          </Typography>
                        </Box>
                        {description && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Description
                            </Typography>
                            <Typography variant="body2">
                              {description}
                            </Typography>
                          </Box>
                        )}
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Pages
                          </Typography>
                          <Typography variant="body1">
                            {scannedPages.length} page(s)
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Folder
                          </Typography>
                          <Typography variant="body1">
                            {folderId
                              ? folders.find(f => f.id === folderId)?.name
                              : 'Root (No folder)'}
                          </Typography>
                        </Box>
                        {enableOCR && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              OCR Status
                            </Typography>
                            <Typography variant="body1">
                              {scannedPages.filter(p => p.ocrText).length} / {scannedPages.length} pages processed
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>

                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<UploadIcon />}
                    onClick={handleUpload}
                    sx={{ minWidth: 200 }}
                  >
                    Upload Document
                  </Button>
                </>
              )}
            </Stack>
          </Box>
        )}
      </Paper>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          disabled={activeStep === 0 || uploadLoading}
          onClick={handleBack}
        >
          Back
        </Button>
        <Stack direction="row" spacing={2}>
          <Button onClick={handleReset} disabled={uploadLoading}>
            Reset
          </Button>
          {activeStep < steps.length - 1 && (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={scannedPages.length === 0 || uploadLoading}
            >
              {activeStep === 2 ? 'Process & Continue' : 'Next'}
            </Button>
          )}
        </Stack>
      </Box>

      {/* Preview Dialog */}
      <Dialog
        open={!!selectedPreview}
        onClose={() => setSelectedPreview(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Page Preview</DialogTitle>
        <DialogContent>
          {selectedPreview && (
            <Box
              component="img"
              src={selectedPreview}
              alt="Preview"
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: '70vh',
                objectFit: 'contain',
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedPreview(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Scanner;

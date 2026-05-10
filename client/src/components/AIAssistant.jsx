import {
    Box,
    Button,
    Typography,
    Alert,
    IconButton,
    Fade,
    Paper
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useState, useRef } from 'react';
import axios from 'axios';
import { keyframes } from '@mui/system';

const scanAnimation = keyframes`
  0% { top: 0%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; top: 100%; box-shadow: 0 0 15px 2px rgba(0, 255, 128, 0.6); }
  100% { top: 100%; opacity: 0; }
`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
  70% { transform: scale(1.02); box-shadow: 0 0 0 15px rgba(76, 175, 80, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
`;

function AIAssistant({ onDetect }) {
    const [loading, setLoading] = useState(false);
    const [scanned, setScanned] = useState(false);
    const [error, setError] = useState(null);
    const [detectedCount, setDetectedCount] = useState(0);
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        processFile(file);
    };

    const processFile = (file) => {
        if (file && file.type.startsWith('image/')) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setScanned(false);
            setError(null);
        } else if (file) {
            setError("Please select a valid image file.");
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        if (!isDragging) setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        processFile(file);
    };

    const clearImage = () => {
        setSelectedImage(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setScanned(false);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleUpload = async () => {
        if (!selectedImage) return;

        setLoading(true);
        setError(null);
        setScanned(false);

        const formData = new FormData();
        formData.append('image', selectedImage);

        try {
            const response = await axios.post('http://localhost:5000/api/vision/scan', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data && response.data.ingredients && response.data.ingredients.length > 0) {
                onDetect(response.data.ingredients);
                setDetectedCount(response.data.ingredients.length);
                setScanned(true);
                // Clear the image after a slightly longer delay so user sees the success state
                setTimeout(() => {
                    clearImage();
                }, 2500);
            } else {
                setError("No ingredients could be detected. Try a clearer picture.");
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.msg || "Failed to analyze image. Ensure the server is running and the API key is valid.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper 
            elevation={0}
            sx={{
                textAlign: 'center',
                p: { xs: 3, md: 5 },
                mb: 4,
                position: 'relative',
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(12px)',
                border: isDragging ? '2px dashed #4caf50' : '1px solid rgba(255, 255, 255, 0.5)',
                borderRadius: 4,
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
                transition: 'all 0.3s ease-in-out',
                transform: isDragging ? 'scale(1.02)' : 'none',
                backgroundColor: isDragging ? 'rgba(232, 245, 233, 0.5)' : 'rgba(255, 255, 255, 0.7)',
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Box sx={{ 
                    bgcolor: 'primary.light', 
                    color: 'primary.dark', 
                    p: 1.5, 
                    borderRadius: '50%',
                    boxShadow: '0 4px 15px rgba(46, 125, 50, 0.2)'
                }}>
                    <AutoFixHighIcon sx={{ fontSize: 32 }} />
                </Box>
            </Box>
            
            <Typography variant="h5" fontWeight="800" color="text.primary" gutterBottom>
                AI Fridge Scanner
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 450, mx: 'auto', lineHeight: 1.6 }}>
                Snap a photo or drag it here. Our vision AI will identify your ingredients instantly so you can start cooking.
            </Typography>

            {error && (
                <Fade in={!!error}>
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2, textAlign: 'left', boxShadow: '0 2px 10px rgba(211, 47, 47, 0.1)' }}>
                        {error}
                    </Alert>
                </Fade>
            )}

            {!selectedImage ? (
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: 2,
                    p: 4,
                    border: '2px dashed',
                    borderColor: isDragging ? 'primary.main' : 'grey.300',
                    borderRadius: 3,
                    bgcolor: isDragging ? 'rgba(76, 175, 80, 0.05)' : 'transparent',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'rgba(76, 175, 80, 0.02)'
                    }
                }}
                onClick={() => fileInputRef.current?.click()}
                >
                    <CloudUploadIcon sx={{ fontSize: 48, color: isDragging ? 'primary.main' : 'text.disabled' }} />
                    <Typography variant="body1" color={isDragging ? 'primary.main' : 'text.secondary'} fontWeight="500">
                        {isDragging ? 'Drop your image here!' : 'Click to browse or drag and drop'}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                        Supports standard image formats
                    </Typography>
                    
                    <Box component="div" onClick={(e) => e.stopPropagation()} sx={{ mt: 1 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<PhotoCameraIcon />}
                            onClick={() => fileInputRef.current?.click()}
                            sx={{ 
                                borderRadius: 8, 
                                px: 4, 
                                py: 1.2, 
                                fontWeight: 'bold', 
                                textTransform: 'none',
                                boxShadow: '0 4px 14px rgba(76, 175, 80, 0.3)',
                                '&:hover': {
                                    boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)'
                                }
                            }}
                        >
                            Select Image
                        </Button>
                    </Box>
                    <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                    />
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <Box sx={{ 
                        position: 'relative', 
                        display: 'inline-block',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                        border: '3px solid white',
                        animation: loading ? `${pulseAnimation} 2s infinite` : 'none'
                    }}>
                        <img
                            src={previewUrl}
                            alt="Preview"
                            style={{ 
                                maxWidth: '100%', 
                                maxHeight: '300px', 
                                display: 'block',
                                objectFit: 'cover',
                                filter: loading ? 'brightness(0.7) blur(1px)' : 'none',
                                transition: 'all 0.3s'
                            }}
                        />
                        
                        {/* Laser Scanner Effect */}
                        {loading && (
                            <Box sx={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                height: '4px',
                                background: '#00ff80',
                                boxShadow: '0 0 15px 4px rgba(0, 255, 128, 0.7)',
                                animation: `${scanAnimation} 2s cubic-bezier(0.4, 0.0, 0.2, 1) infinite`,
                                zIndex: 10
                            }} />
                        )}

                        {!loading && !scanned && (
                            <IconButton
                                size="small"
                                onClick={clearImage}
                                sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    backdropFilter: 'blur(4px)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                    '&:hover': { backgroundColor: 'error.main', color: 'white' }
                                }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        )}
                    </Box>

                    {!scanned ? (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AutoFixHighIcon />}
                            onClick={handleUpload}
                            disabled={loading}
                            sx={{ 
                                borderRadius: 8, 
                                px: 5, 
                                py: 1.5, 
                                fontSize: '1.05rem',
                                fontWeight: 'bold', 
                                textTransform: 'none',
                                background: 'linear-gradient(45deg, #2e7d32 30%, #4caf50 90%)',
                                boxShadow: '0 4px 20px rgba(76, 175, 80, 0.4)',
                                '&:hover': {
                                    boxShadow: '0 6px 25px rgba(76, 175, 80, 0.6)'
                                }
                            }}
                        >
                            {loading ? 'Analyzing your fridge...' : 'Scan Ingredients'}
                        </Button>
                    ) : (
                        <Fade in={scanned}>
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1, 
                                color: 'success.main', 
                                bgcolor: 'success.50',
                                px: 3,
                                py: 1.5,
                                borderRadius: 4,
                                border: '1px solid',
                                borderColor: 'success.200'
                            }}>
                                <CheckCircleOutlineIcon sx={{ fontSize: 24 }} />
                                <Typography variant="subtitle1" fontWeight="bold">
                                    {detectedCount} Ingredients detected and added to your pantry!
                                </Typography>
                            </Box>
                        </Fade>
                    )}
                </Box>
            )}
        </Paper>
    );
}

export default AIAssistant;

import {
    Box,
    Button,
    Typography,
    CircularProgress,
    Alert,
    IconButton
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';
import { useState, useRef } from 'react';
import axios from 'axios';

import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

function AIAssistant({ onDetect }) {
    const [loading, setLoading] = useState(false);
    const [scanned, setScanned] = useState(false);
    const [error, setError] = useState(null);
    const [detectedCount, setDetectedCount] = useState(0);
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setScanned(false);
            setError(null);
        }
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
                // Clear the image after a short delay so user sees the success state
                setTimeout(() => {
                    clearImage();
                }, 2000);
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
        <Box sx={{
            textAlign: 'center',
            p: 3,
            mb: 4,
            background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)',
            border: '2px dashed',
            borderColor: 'primary.light',
            borderRadius: 6,
            boxShadow: '0 4px 20px rgba(46, 125, 50, 0.1)'
        }}>
            {loading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 2 }}>
                    <CircularProgress size={40} thickness={4} />
                    <Typography variant="body1" fontWeight="bold" color="primary.dark">Scanning your fridge with AI...</Typography>
                </Box>
            ) : (
                <>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                        <AutoFixHighIcon color="primary" sx={{ fontSize: 40 }} />
                    </Box>
                    <Typography variant="h6" fontWeight="800" color="primary.dark" gutterBottom>
                        AI Fridge Scanner
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                        Snap a photo and our vision AI will identify ingredients for you instantly.
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
                            {error}
                        </Alert>
                    )}

                    {!selectedImage ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                            <Button
                                variant="contained"
                                component="label"
                                startIcon={<PhotoCameraIcon />}
                                sx={{ borderRadius: 8, px: 4, py: 1, fontWeight: 'bold', textTransform: 'none' }}
                            >
                                Select Image
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    ref={fileInputRef}
                                />
                            </Button>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ position: 'relative', display: 'inline-block' }}>
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                                />
                                <IconButton
                                    size="small"
                                    onClick={clearImage}
                                    sx={{
                                        position: 'absolute',
                                        top: -10,
                                        right: -10,
                                        backgroundColor: 'background.paper',
                                        boxShadow: 1,
                                        '&:hover': { backgroundColor: 'error.light', color: 'white' }
                                    }}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Box>
                            <Button
                                variant="contained"
                                color="secondary"
                                startIcon={<AutoFixHighIcon />}
                                onClick={handleUpload}
                                sx={{ borderRadius: 8, px: 4, py: 1, fontWeight: 'bold', textTransform: 'none' }}
                            >
                                Analyze Image
                            </Button>
                        </Box>
                    )}

                    {scanned && (
                        <Typography variant="caption" display="block" sx={{ mt: 2, color: 'success.main', fontWeight: 'bold' }}>
                            ✨ {detectedCount} Ingredients detected and added!
                        </Typography>
                    )}
                </>
            )}
        </Box>
    );
}

export default AIAssistant;

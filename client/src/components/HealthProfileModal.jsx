import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Typography,
    Box,
    IconButton,
    CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function HealthProfileModal({ open, onClose }) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // Form state
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [conditions, setConditions] = useState('');
    const [goals, setGoals] = useState('');

    useEffect(() => {
        if (open) {
            fetchProfile();
        }
    }, [open]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/profile`);
            if (res.data) {
                setWeight(res.data.weight || '');
                setHeight(res.data.height || '');
                setConditions(res.data.conditions ? res.data.conditions.join(', ') : '');
                setGoals(res.data.goals || '');
            }
        } catch (err) {
            console.error("Error fetching health profile", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.post(`${API_BASE_URL}/profile`, {
                weight: Number(weight),
                height: Number(height),
                conditions: conditions.split(',').map(c => c.trim()).filter(c => c),
                goals
            });
            onClose();
        } catch (err) {
            console.error("Error saving health profile", err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                    <MonitorHeartIcon />
                    <Typography variant="h6" fontWeight="bold">My Health Profile</Typography>
                </Box>
                <IconButton onClick={onClose} disabled={saving}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                {loading ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Your profile helps our AI Dietitian craft recipes perfectly tailored to your body and medical needs.
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Weight (kg)"
                                type="number"
                                fullWidth
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                            />
                            <TextField
                                label="Height (cm)"
                                type="number"
                                fullWidth
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                            />
                        </Box>

                        <TextField
                            label="Medical Conditions & Allergies"
                            placeholder="e.g. Type 2 Diabetes, Peanut Allergy, Celiac"
                            fullWidth
                            value={conditions}
                            onChange={(e) => setConditions(e.target.value)}
                            helperText="Crucial: The AI will specifically avoid these."
                        />

                        <TextField
                            label="Core Health Goal"
                            placeholder="e.g. Lose 5 pounds, Build Muscle, Reduce Sodium"
                            fullWidth
                            multiline
                            rows={3}
                            value={goals}
                            onChange={(e) => setGoals(e.target.value)}
                        />
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: '#f8fafc' }}>
                <Button onClick={onClose} color="inherit" disabled={saving}>Cancel</Button>
                <Button onClick={handleSave} variant="contained" disabled={saving || loading} sx={{bgcolor: 'primary.main', color: 'white', fontWeight: 'bold'}}>
                    {saving ? 'Saving...' : 'Save Profile'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

import {
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    Box,
    IconButton,
    CircularProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Fade
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function AIChefModal({ open, onClose, ingredients }) {
    const [loading, setLoading] = useState(false);
    const [recipe, setRecipe] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (open && ingredients && ingredients.length > 0) {
            generateRecipe();
        } else {
            setRecipe(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const generateRecipe = async () => {
        setLoading(true);
        setError(null);
        setRecipe(null);

        try {
            const res = await axios.post(`${API_BASE_URL}/vision/chef`, { ingredients });
            setRecipe(res.data);
        } catch (err) {
            console.error("AI Chef Error:", err);
            setError("The AI Chef burned the dish! Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{
            sx: { borderRadius: 4, background: 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)', color: 'white' }
        }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#00e676' }}>
                    <AutoAwesomeIcon />
                    <Typography variant="h6" fontWeight="bold">AI Chef</Typography>
                </Box>
                <IconButton onClick={onClose} sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                {loading && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <CircularProgress size={60} sx={{ color: '#00e676', mb: 3 }} thickness={5} />
                        <Typography variant="h6" sx={{ color: '#00e676' }}>
                            Brainstorming recipes...
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mt: 1 }}>
                            Mixing {ingredients.join(', ')} ...
                        </Typography>
                    </Box>
                )}

                {error && (
                    <Box sx={{ textAlign: 'center', py: 4, color: '#ff5252' }}>
                        <Typography variant="h6">{error}</Typography>
                    </Box>
                )}

                {recipe && (
                    <Fade in>
                        <Box>
                            <Typography variant="h4" fontWeight="800" sx={{ mb: 2, color: '#fff' }}>
                                {recipe.title}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                                <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', px: 2, py: 1, borderRadius: 2 }}>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Time</Typography>
                                    <Typography fontWeight="bold">{recipe.readyInMinutes} mins</Typography>
                                </Box>
                                <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', px: 2, py: 1, borderRadius: 2 }}>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Serves</Typography>
                                    <Typography fontWeight="bold">{recipe.servings}</Typography>
                                </Box>
                            </Box>

                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#00e676' }}>
                                Ingredients
                            </Typography>
                            <List dense sx={{ mb: 2 }}>
                                {recipe.ingredients.map((ing, i) => (
                                    <ListItem key={i} sx={{ px: 0 }}>
                                        <ListItemIcon sx={{ minWidth: 32, color: '#00e676' }}>
                                            <CheckCircleIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary={ing} sx={{ color: 'rgba(255,255,255,0.9)' }} />
                                    </ListItem>
                                ))}
                            </List>

                            <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#00e676' }}>
                                Instructions
                            </Typography>
                            <List>
                                {recipe.instructions.map((step, i) => (
                                    <ListItem key={i} sx={{ alignItems: 'flex-start', px: 0, mb: 2 }}>
                                        <ListItemIcon sx={{ minWidth: 40, mt: 0.5, color: '#00e676' }}>
                                            <RestaurantMenuIcon />
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary={`Step ${i + 1}`} 
                                            secondary={step} 
                                            primaryTypographyProps={{ fontWeight: 'bold', color: '#fff', mb: 0.5 }}
                                            secondaryTypographyProps={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </Fade>
                )}
            </DialogContent>
        </Dialog>
    );
}

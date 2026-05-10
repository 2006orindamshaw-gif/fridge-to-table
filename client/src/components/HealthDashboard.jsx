import {
    Box,
    Typography,
    Button,
    CircularProgress,
    Fade,
    Paper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Card,
    CardContent
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function HealthDashboard({ ingredients }) {
    const [loading, setLoading] = useState(false);
    const [recipe, setRecipe] = useState(null);
    const [error, setError] = useState(null);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        setRecipe(null);
        try {
            const res = await axios.post(`${API_BASE_URL}/health-chef`, { ingredients });
            setRecipe(res.data);
        } catch (err) {
            console.error(err);
            setError("The Dietitian is currently busy consulting. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ mt: 4 }}>
            {!recipe && !loading && (
                <Paper sx={{ p: 6, borderRadius: 4, textAlign: 'center', background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' }}>
                    <FavoriteIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h4" fontWeight="bold" gutterBottom color="primary.dark">
                        Your Personal AI Dietitian
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
                        We will analyze the time of day, your specific medical conditions, body stats, and the exact ingredients you currently have to craft the perfect healthy meal.
                    </Typography>
                    
                    <Button 
                        variant="contained" 
                        color="primary" 
                        size="large"
                        startIcon={<AutoFixHighIcon />}
                        onClick={handleGenerate}
                        sx={{ borderRadius: 8, px: 6, py: 2, fontSize: '1.1rem', fontWeight: 'bold', boxShadow: '0 8px 20px rgba(25, 118, 210, 0.3)' }}
                    >
                        Generate Optimal Meal Plan
                    </Button>
                </Paper>
            )}

            {loading && (
                <Box sx={{ textAlign: 'center', py: 10 }}>
                    <CircularProgress size={80} thickness={4} sx={{ color: 'primary.main', mb: 4 }} />
                    <Typography variant="h5" color="primary.main" fontWeight="bold">
                        Analyzing your health profile...
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                        Crafting a medically-optimized recipe based on what's in your fridge.
                    </Typography>
                </Box>
            )}

            {error && (
                <Typography color="error" variant="h6" align="center">{error}</Typography>
            )}

            {recipe && (
                <Fade in>
                    <Box>
                        <Button variant="outlined" onClick={() => setRecipe(null)} sx={{ mb: 4, borderRadius: 6 }}>
                            &larr; Discard & Generate New
                        </Button>
                        
                        <Card sx={{ borderRadius: 4, mb: 4, border: '2px solid', borderColor: 'success.main' }}>
                            <CardContent sx={{ p: 4 }}>
                                <Typography variant="overline" color="success.main" fontWeight="bold" sx={{ letterSpacing: 2 }}>
                                    OPTIMIZED FOR {recipe.mealType?.toUpperCase() || "YOUR MEAL"}
                                </Typography>
                                <Typography variant="h3" fontWeight="900" gutterBottom sx={{ color: 'primary.dark' }}>
                                    {recipe.title}
                                </Typography>
                                
                                <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
                                    <Box sx={{ bgcolor: 'grey.100', px: 3, py: 1.5, borderRadius: 2 }}>
                                        <Typography variant="caption" color="text.secondary">Prep Time</Typography>
                                        <Typography variant="h6" fontWeight="bold">{recipe.readyInMinutes}m</Typography>
                                    </Box>
                                    <Box sx={{ bgcolor: 'grey.100', px: 3, py: 1.5, borderRadius: 2 }}>
                                        <Typography variant="caption" color="text.secondary">Calories</Typography>
                                        <Typography variant="h6" fontWeight="bold">{recipe.macros?.calories}</Typography>
                                    </Box>
                                    <Box sx={{ bgcolor: 'grey.100', px: 3, py: 1.5, borderRadius: 2 }}>
                                        <Typography variant="caption" color="text.secondary">Protein</Typography>
                                        <Typography variant="h6" fontWeight="bold" color="success.main">{recipe.macros?.protein}</Typography>
                                    </Box>
                                    <Box sx={{ bgcolor: 'grey.100', px: 3, py: 1.5, borderRadius: 2 }}>
                                        <Typography variant="caption" color="text.secondary">Carbs</Typography>
                                        <Typography variant="h6" fontWeight="bold">{recipe.macros?.carbs}</Typography>
                                    </Box>
                                    <Box sx={{ bgcolor: 'grey.100', px: 3, py: 1.5, borderRadius: 2 }}>
                                        <Typography variant="caption" color="text.secondary">Fats</Typography>
                                        <Typography variant="h6" fontWeight="bold">{recipe.macros?.fats}</Typography>
                                    </Box>
                                </Box>

                                <Paper elevation={0} sx={{ p: 3, bgcolor: 'success.light', color:'white', borderRadius: 3, mb: 4 }}>
                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                        👨‍⚕️ Dietitian's Note:
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontStyle: 'italic', lineHeight: 1.6 }}>
                                        "{recipe.reasoning}"
                                    </Typography>
                                </Paper>

                                <Typography variant="h5" fontWeight="bold" gutterBottom>Ingredients</Typography>
                                <List dense sx={{ mb: 4 }}>
                                    {recipe.ingredients?.map((ing, i) => (
                                        <ListItem key={i} sx={{ px: 0 }}>
                                            <ListItemIcon sx={{ minWidth: 40, color: 'success.main' }}>
                                                <CheckCircleIcon />
                                            </ListItemIcon>
                                            <ListItemText primary={ing} primaryTypographyProps={{ fontSize: '1.1rem' }} />
                                        </ListItem>
                                    ))}
                                </List>

                                <Divider sx={{ mb: 4 }} />

                                <Typography variant="h5" fontWeight="bold" gutterBottom>Preparation</Typography>
                                <List>
                                    {recipe.instructions?.map((step, i) => (
                                        <ListItem key={i} sx={{ px: 0, alignItems: 'flex-start', mb: 2 }}>
                                            <ListItemIcon sx={{ minWidth: 40, mt: 0.5, color: 'primary.main' }}>
                                                <LocalDiningIcon />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary={`Step ${i + 1}`} 
                                                secondary={step} 
                                                primaryTypographyProps={{ fontWeight: 'bold', mb: 0.5 }}
                                                secondaryTypographyProps={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'text.primary' }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>
                    </Box>
                </Fade>
            )}
        </Box>
    );
}

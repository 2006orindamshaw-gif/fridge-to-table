import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Typography,
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    CircularProgress,
    Button,
    Fade
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import NutritionIcon from '@mui/icons-material/Assessment';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StopIcon from '@mui/icons-material/Stop';
import { useState, useEffect } from 'react';

function RecipeModal({ open, onClose, recipeInfo, loading, onAddToList, onAddToPantry }) {
    const [isCookMode, setIsCookMode] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (!open) {
            setIsCookMode(false);
            setCurrentStep(0);
        }
    }, [open]);

    if (!recipeInfo && !loading) return null;

    const steps = recipeInfo?.analyzedInstructions?.[0]?.steps || [];
    const hasCookMode = steps.length > 0;

    return (
        <Dialog open={open} onClose={onClose} maxWidth={isCookMode ? "lg" : "md"} fullWidth scroll="body" PaperProps={{
            sx: { minHeight: isCookMode ? '80vh' : 'auto', transition: 'all 0.3s ease-in-out' }
        }}>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: isCookMode ? '#1e1e1e' : 'transparent', color: isCookMode ? 'white' : 'inherit' }}>
                        <Typography variant="h5" fontWeight="bold">{recipeInfo.title}</Typography>
                        <Box>
                            {isCookMode ? (
                                <Button 
                                    startIcon={<StopIcon />} 
                                    color="error" 
                                    variant="contained" 
                                    onClick={() => setIsCookMode(false)}
                                    sx={{ mr: 2, borderRadius: 6 }}
                                >
                                    Exit Cook Mode
                                </Button>
                            ) : null}
                            <IconButton onClick={onClose} sx={{ color: isCookMode ? 'white' : 'inherit' }}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </DialogTitle>

                    <DialogContent dividers={!isCookMode} sx={{ bgcolor: isCookMode ? '#121212' : 'transparent', color: isCookMode ? 'white' : 'inherit', display: isCookMode ? 'flex' : 'block', flexDirection: 'column' }}>
                        
                        {!isCookMode ? (
                            <>
                                <Box component="img" src={recipeInfo.image} sx={{ width: '100%', borderRadius: 2, mb: 3 }} />

                                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'primary.light', color: 'white', borderRadius: 2, minWidth: 80 }}>
                                        <Typography variant="caption">Ready in</Typography>
                                        <Typography variant="body1" fontWeight="bold">{recipeInfo.readyInMinutes}m</Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'secondary.light', color: 'white', borderRadius: 2, minWidth: 80 }}>
                                        <Typography variant="caption">Servings</Typography>
                                        <Typography variant="body1" fontWeight="bold">{recipeInfo.servings}</Typography>
                                    </Box>
                                    {recipeInfo.healthScore && (
                                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'success.light', color: 'white', borderRadius: 2, minWidth: 80 }}>
                                            <Typography variant="caption">Health</Typography>
                                            <Typography variant="body1" fontWeight="bold">{recipeInfo.healthScore}%</Typography>
                                        </Box>
                                    )}

                                    {hasCookMode && (
                                        <Button 
                                            variant="contained" 
                                            color="primary" 
                                            size="large"
                                            startIcon={<PlayArrowIcon />}
                                            onClick={() => {
                                                setIsCookMode(true);
                                                setCurrentStep(0);
                                            }}
                                            sx={{ ml: 'auto', borderRadius: 8, fontWeight: 'bold', px: 4, py: 1.5, boxShadow: '0 4px 15px rgba(46, 125, 50, 0.4)' }}
                                        >
                                            Start Cook Mode
                                        </Button>
                                    )}
                                </Box>

                                <Typography variant="h6" gutterBottom fontWeight="bold">Ingredients</Typography>
                                <List dense>
                                    {recipeInfo?.extendedIngredients?.map((ing, idx) => (
                                        <ListItem key={idx}>
                                            <ListItemIcon sx={{ minWidth: 36 }}>
                                                <CheckCircleOutlineIcon color="success" fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText primary={ing.original} />
                                            <Button
                                                size="small"
                                                startIcon={<AddShoppingCartIcon />}
                                                onClick={() => onAddToList(ing)}
                                                sx={{ ml: 1, color: 'secondary.main' }}
                                            >
                                                List
                                            </Button>
                                            <Button
                                                size="small"
                                                startIcon={<InventoryIcon />}
                                                onClick={() => onAddToPantry(ing.name)}
                                                sx={{ ml: 1, color: 'primary.main' }}
                                            >
                                                Pantry
                                            </Button>
                                        </ListItem>
                                    ))}
                                </List>

                                <Divider sx={{ my: 3 }} />

                                <Typography variant="h6" gutterBottom fontWeight="bold">Instructions</Typography>
                                <Typography
                                    variant="body1"
                                    sx={{ lineHeight: 1.8 }}
                                    dangerouslySetInnerHTML={{ __html: recipeInfo.instructions }}
                                />

                                {recipeInfo.nutrition && (
                                    <>
                                        <Divider sx={{ my: 3 }} />
                                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <NutritionIcon /> Nutrition (per serving)
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                            {recipeInfo.nutrition.nutrients.filter(n => ['Calories', 'Fat', 'Carbohydrates', 'Protein'].includes(n.name)).map((n, idx) => (
                                                <Box key={idx} sx={{ border: '1px solid #eee', px: 2, py: 1, borderRadius: 2 }}>
                                                    <Typography variant="caption" color="text.secondary">{n.name}</Typography>
                                                    <Typography variant="body2" fontWeight="bold">{n.amount}{n.unit}</Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    </>
                                )}
                            </>
                        ) : (
                            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 4 }}>
                                <Fade in key={currentStep}>
                                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                                        <Typography variant="h6" sx={{ color: '#00e676', mb: 2, textTransform: 'uppercase', letterSpacing: 2 }}>
                                            Step {currentStep + 1} of {steps.length}
                                        </Typography>
                                        <Typography variant="h3" sx={{ fontWeight: '500', lineHeight: 1.4, maxWidth: '800px' }}>
                                            {steps[currentStep].step}
                                        </Typography>
                                        
                                        {steps[currentStep].ingredients?.length > 0 && (
                                            <Box sx={{ mt: 6, p: 3, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 4 }}>
                                                <Typography variant="subtitle1" color="text.secondary" gutterBottom>Ingredients needed here:</Typography>
                                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                                                    {steps[currentStep].ingredients.map((ing, i) => (
                                                        <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                            <Box component="img" src={`https://spoonacular.com/cdn/ingredients_100x100/${ing.image}`} sx={{ width: 50, height: 50, borderRadius: '50%', bgcolor: 'white', p: 0.5, mb: 1 }} />
                                                            <Typography variant="caption">{ing.name}</Typography>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </Box>
                                        )}
                                    </Box>
                                </Fade>
                                
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                                    <Button 
                                        variant="outlined" 
                                        color="inherit" 
                                        size="large"
                                        startIcon={<ArrowBackIcon />}
                                        disabled={currentStep === 0}
                                        onClick={() => setCurrentStep(prev => prev - 1)}
                                        sx={{ borderRadius: 8, px: 4, borderColor: 'rgba(255,255,255,0.3)' }}
                                    >
                                        Previous
                                    </Button>
                                    
                                    {currentStep < steps.length - 1 ? (
                                        <Button 
                                            variant="contained" 
                                            color="success" 
                                            size="large"
                                            endIcon={<ArrowForwardIcon />}
                                            onClick={() => setCurrentStep(prev => prev + 1)}
                                            sx={{ borderRadius: 8, px: 6, fontWeight: 'bold' }}
                                        >
                                            Next Step
                                        </Button>
                                    ) : (
                                        <Button 
                                            variant="contained" 
                                            color="primary" 
                                            size="large"
                                            startIcon={<CheckCircleOutlineIcon />}
                                            onClick={() => setIsCookMode(false)}
                                            sx={{ borderRadius: 8, px: 6, fontWeight: 'bold' }}
                                        >
                                            Finish Cooking
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        )}
                    </DialogContent>
                </>
            )}
        </Dialog>
    );
}

export default RecipeModal;

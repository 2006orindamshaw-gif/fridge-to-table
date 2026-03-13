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
    Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import NutritionIcon from '@mui/icons-material/Assessment';

function RecipeModal({ open, onClose, recipeInfo, loading, onAddToList, onAddToPantry }) {
    if (!recipeInfo && !loading) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="body">
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h5" fontWeight="bold">{recipeInfo.title}</Typography>
                        <IconButton onClick={onClose}>
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent dividers>
                        <Box component="img" src={recipeInfo.image} sx={{ width: '100%', borderRadius: 2, mb: 3 }} />

                        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
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
                    </DialogContent>
                </>
            )}
        </Dialog>
    );
}

export default RecipeModal;

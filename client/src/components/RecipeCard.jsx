import {
    Card,
    CardMedia,
    CardContent,
    Typography,
    Box,
    IconButton,
    Chip,
    CardActionArea
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export default function RecipeCard({ recipe, onFavorite, isFavorite, onClick }) {
    return (
        <Card sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
            }
        }}>
            <Box sx={{ position: 'relative' }}>
                <CardActionArea onClick={onClick}>
                    <CardMedia
                        component="img"
                        height="200"
                        image={recipe.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                        alt={recipe.title}
                        sx={{ objectFit: 'cover' }}
                    />
                </CardActionArea>
                <IconButton
                    onClick={(e) => {
                        e.stopPropagation();
                        onFavorite(recipe);
                    }}
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': { bgcolor: 'white' },
                        zIndex: 2
                    }}
                >
                    {isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                </IconButton>
            </Box>

            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <CardActionArea onClick={onClick} sx={{ mb: 1 }}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                        {recipe.title}
                    </Typography>
                </CardActionArea>

                <Box sx={{ mt: 1, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleOutlineIcon color="success" fontSize="small" />
                    <Typography variant="body2" color="text.secondary" fontWeight="500">
                        {recipe.usedIngredientCount} ingredients you have
                    </Typography>
                </Box>

                {recipe.missedIngredientCount > 0 ? (
                    <Box sx={{
                        mt: 'auto',
                        p: 1.5,
                        bgcolor: '#fff5f5',
                        borderRadius: 2,
                        border: '1px solid #ffe3e3'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <ErrorOutlineIcon color="error" fontSize="small" />
                            <Typography variant="body2" color="error.dark" fontWeight="bold">
                                Missing {recipe.missedIngredientCount} items
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {recipe.missedIngredients?.slice(0, 3).map((item, idx) => (
                                <Chip
                                    key={idx}
                                    label={item.name}
                                    size="small"
                                    color="error"
                                    variant="outlined"
                                    sx={{ bgcolor: 'white' }}
                                />
                            ))}
                            {recipe.missedIngredientCount > 3 && (
                                <Chip label={`+${recipe.missedIngredientCount - 3} more`} size="small" variant="outlined" />
                            )}
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{
                        mt: 'auto',
                        p: 1.5,
                        bgcolor: '#f0fff4',
                        borderRadius: 2,
                        textAlign: 'center'
                    }}>
                        <Typography variant="body2" color="success.dark" fontWeight="bold">
                            You have all ingredients!
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}

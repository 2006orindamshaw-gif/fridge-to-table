import { Grid, Typography, Box } from '@mui/material';
import RecipeCard from './RecipeCard';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

export default function RecipeList({ recipes, onFavorite, favorites, onRecipeClick }) {
    if (!recipes || recipes.length === 0) {
        return (
            <Box sx={{ mt: 8, textAlign: 'center', color: 'text.secondary' }}>
                <SentimentDissatisfiedIcon sx={{ fontSize: 60, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6">
                    No recipes found. Add some ingredients above to get started!
                </Typography>
            </Box>
        );
    }

    return (
        <Grid container spacing={3}>
            {recipes.map((recipe) => {
                const recipeId = recipe.id || recipe.spoonacularId;
                const isFavorite = favorites.some((fav) => fav.spoonacularId === recipeId);
                return (
                    <Grid item xs={12} sm={6} md={4} key={recipeId}>
                        <RecipeCard
                            recipe={recipe}
                            onFavorite={onFavorite}
                            isFavorite={isFavorite}
                            onClick={() => onRecipeClick(recipeId)}
                        />
                    </Grid>
                );
            })}
        </Grid>
    );
}

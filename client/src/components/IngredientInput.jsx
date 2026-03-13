import { useState } from 'react';
import { Box, TextField, Chip, Typography, Paper } from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';

export default function IngredientInput({ ingredients, setIngredients }) {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newIngredient = inputValue.trim().toLowerCase();
            if (newIngredient && !ingredients.includes(newIngredient)) {
                setIngredients([...ingredients, newIngredient]);
            }
            setInputValue('');
        }
    };

    const handleDelete = (ingredientToDelete) => {
        setIngredients(ingredients.filter((i) => i !== ingredientToDelete));
    };

    return (
        <Paper elevation={0} sx={{
            p: 4,
            borderRadius: 4,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            mb: 4
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <RestaurantMenuIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="bold">
                    What's in your fridge?
                </Typography>
            </Box>

            <TextField
                fullWidth
                variant="outlined"
                placeholder="Type an ingredient and press Enter (e.g., chicken, rice, tomatoes)..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        backgroundColor: 'background.default',
                    }
                }}
            />

            {ingredients.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 3 }}>
                    {ingredients.map((item, index) => (
                        <Chip
                            key={index}
                            label={item}
                            onDelete={() => handleDelete(item)}
                            color="primary"
                            variant="filled"
                            sx={{
                                fontSize: '0.9rem',
                                py: 2,
                                px: 1,
                                borderRadius: 2,
                                fontWeight: 500,
                            }}
                        />
                    ))}
                </Box>
            )}
        </Paper>
    );
}

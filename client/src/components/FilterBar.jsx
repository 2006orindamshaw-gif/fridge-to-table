import {
    Box,
    Chip,
    Typography,
    Paper
} from '@mui/material';

const diets = [
    'Vegan', 'Vegetarian', 'Gluten Free', 'Keto', 'Paleo', 'Pescetarian'
];

const cuisines = [
    'Asian', 'Indian', 'Italian', 'Mexican', 'Mediterranean', 'Middle Eastern'
];

function FilterBar({ selectedDiet, onDietChange, selectedCuisine, onCuisineChange }) {
    return (
        <Paper sx={{ p: 2, mb: 4, borderRadius: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ minWidth: 80 }}>Diet:</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {diets.map((diet) => (
                        <Chip
                            key={diet}
                            label={diet}
                            onClick={() => onDietChange(selectedDiet === diet ? '' : diet)}
                            color={selectedDiet === diet ? "primary" : "default"}
                            variant={selectedDiet === diet ? "filled" : "outlined"}
                            sx={{ fontWeight: 'bold' }}
                        />
                    ))}
                </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ minWidth: 80 }}>Cuisine:</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {cuisines.map((cuisine) => (
                        <Chip
                            key={cuisine}
                            label={cuisine}
                            onClick={() => onCuisineChange(selectedCuisine === cuisine ? '' : cuisine)}
                            color={selectedCuisine === cuisine ? "secondary" : "default"}
                            variant={selectedCuisine === cuisine ? "filled" : "outlined"}
                            sx={{ fontWeight: 'bold' }}
                        />
                    ))}
                </Box>
            </Box>
        </Paper>
    );
}

export default FilterBar;

import {
    Box,
    Chip,
    Typography,
    Paper
} from '@mui/material';

const diets = [
    'Vegan', 'Vegetarian', 'Gluten Free', 'Keto', 'Paleo', 'Pescetarian'
];

function FilterBar({ selectedDiet, onDietChange }) {
    return (
        <Paper sx={{ p: 2, mb: 4, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="subtitle1" fontWeight="bold">Filters:</Typography>
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
        </Paper>
    );
}

export default FilterBar;

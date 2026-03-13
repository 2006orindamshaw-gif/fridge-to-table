import {
    Box,
    Typography,
    TextField,
    IconButton,
    Paper,
    Grid,
    Chip,
    InputAdornment,
    Button
} from '@mui/material';
import AddBoxIcon from '@mui/icons-material/AddBox';
import KitchenIcon from '@mui/icons-material/Kitchen';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { useState } from 'react';

function PantryView({ items = [], onAdd, onDelete, onClear }) {
    const [newItem, setNewItem] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newItem.trim()) return;
        onAdd(newItem.trim());
        setNewItem('');
    };

    return (
        <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <KitchenIcon color="primary" sx={{ fontSize: 32 }} />
                    <Typography variant="h5" fontWeight="bold">Virtual Pantry</Typography>
                </Box>
                <Button
                    startIcon={<ClearAllIcon />}
                    color="error"
                    onClick={onClear}
                    disabled={items.length === 0}
                    size="small"
                >
                    Clear All
                </Button>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Add staples you always have (Salt, Oil, Pepper). These won't show up as "missing" in your recipes!
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
                <TextField
                    fullWidth
                    placeholder="Add a pantry staple..."
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    sx={{ borderRadius: 2 }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton color="primary" type="submit">
                                    <AddBoxIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>My Staples</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {items.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        No staples added yet.
                    </Typography>
                ) : (
                    items.map((item) => (
                        <Chip
                            key={item._id}
                            label={item.name}
                            onDelete={() => onDelete(item._id)}
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 'bold' }}
                        />
                    ))
                )}
            </Box>
        </Paper>
    );
}

export default PantryView;

import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Checkbox,
    IconButton,
    Paper,
    Divider,
    Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

function ShoppingListView({ items, onToggle, onDelete, onClear }) {
    const handleCopy = () => {
        const text = items
            .map(item => `${item.completed ? '[x]' : '[ ]'} ${item.name} (${item.amount || ''} ${item.unit || ''})`)
            .join('\n');
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };
    if (!items || items.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                <ShoppingCartIcon sx={{ fontSize: 60, mb: 2, opacity: 0.3 }} />
                <Typography variant="h6">Your shopping list is empty</Typography>
                <Typography variant="body2">Add ingredients from recipes to get started!</Typography>
            </Box>
        );
    }

    return (
        <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" fontWeight="bold">Shopping List</Typography>
                <Button
                    startIcon={<ClearAllIcon />}
                    color="error"
                    onClick={onClear}
                    disabled={items.length === 0}
                >
                    Clear
                </Button>
                <Button
                    startIcon={<ContentCopyIcon />}
                    onClick={handleCopy}
                    disabled={items.length === 0}
                >
                    Copy
                </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <List>
                {items.map((item) => (
                    <ListItem
                        key={item._id}
                        secondaryAction={
                            <IconButton edge="end" onClick={() => onDelete(item._id)}>
                                <DeleteIcon color="error" />
                            </IconButton>
                        }
                        disablePadding
                    >
                        <ListItemIcon>
                            <Checkbox
                                edge="start"
                                checked={item.completed}
                                onChange={() => onToggle(item._id)}
                            />
                        </ListItemIcon>
                        <ListItemText
                            primary={item.name}
                            secondary={`${item.amount || ''} ${item.unit || ''}`}
                            sx={{
                                textDecoration: item.completed ? 'line-through' : 'none',
                                opacity: item.completed ? 0.6 : 1
                            }}
                        />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
}

export default ShoppingListView;

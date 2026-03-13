import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Box, CircularProgress, Alert, Chip } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import IngredientInput from './components/IngredientInput';
import RecipeList from './components/RecipeList';
import RecipeModal from './components/RecipeModal';
import ShoppingListView from './components/ShoppingListView';
import PantryView from './components/PantryView';
import FilterBar from './components/FilterBar';
import AIAssistant from './components/AIAssistant';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2e7d32',
    },
    secondary: {
      main: '#ff6f00',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 800,
      letterSpacing: '-0.5px'
    }
  },
  shape: {
    borderRadius: 12,
  },
});

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [view, setView] = useState('search');
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // New state for upgrades
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecipeInfo, setSelectedRecipeInfo] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [shoppingList, setShoppingList] = useState([]);
  const [pantry, setPantry] = useState([]);
  const [selectedDiet, setSelectedDiet] = useState('');
  const [dbStatus, setDbStatus] = useState({ state: 'checking', error: null });

  const checkStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/status`);
      setDbStatus({ state: res.data.status, error: res.data.error });
    } catch (err) {
      setDbStatus({ state: 'error', error: 'Backend unreachable' });
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/recipes/favorites`);
      setFavorites(res.data || []);
    } catch (err) {
      console.error("Error fetching favorites", err);
    }
  };

  const fetchShoppingList = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/shopping-list`);
      setShoppingList(res.data || []);
    } catch (err) {
      console.error("Error fetching shopping list", err);
    }
  };

  const fetchPantry = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/pantry`);
      setPantry(res.data || []);
    } catch (err) {
      console.error("Error fetching pantry", err);
    }
  };

  useEffect(() => {
    checkStatus();
    fetchFavorites();
    fetchShoppingList();
    fetchPantry();
  }, [view]);

  useEffect(() => {
    const fetchRecipes = async () => {
      if (view === 'favorites') {
        const mappedFavorites = favorites.map(f => ({
          id: f.spoonacularId,
          title: f.title,
          image: f.image,
          usedIngredientCount: f.usedIngredients?.length || 0,
          missedIngredientCount: f.missedIngredientCount || 0,
          missedIngredients: f.missedIngredients || []
        }));
        setRecipes(mappedFavorites);
        return;
      }

      if (ingredients.length === 0 && !selectedDiet) {
        setRecipes([]);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const ingredientsString = ingredients.join(',');
        const res = await axios.get(`${API_BASE_URL}/recipes/findByIngredients`, {
          params: {
            ingredients: ingredientsString,
            diet: selectedDiet
          }
        });
        setRecipes(res.data || []);
      } catch (err) {
        console.error("Error fetching recipes", err);
        if (err.response?.status === 402) {
          setError('Spoonacular API Limit Reached (Free Tier). Please try again tomorrow or upgrade your API key.');
        } else {
          setError('Failed to fetch recipes. Make sure the backend is running.');
        }
      } finally {
        setLoading(false);
      }
    };

    const timerId = setTimeout(() => {
      fetchRecipes();
    }, 500);

    return () => clearTimeout(timerId);
  }, [ingredients, view, favorites, selectedDiet]);

  const handleFavoriteToggle = async (recipe) => {
    const recipeId = recipe.id || recipe.spoonacularId;
    const isFavorite = favorites.some((fav) => fav.spoonacularId === recipeId);

    if (isFavorite) {
      try {
        await axios.delete(`${API_BASE_URL}/recipes/favorite/${recipeId}`);
        fetchFavorites();
      } catch (err) {
        console.error("Error removing favorite", err);
        // Fallback: just update local state if backend delete fails for some reason
        setFavorites(favorites.filter(fav => fav.spoonacularId !== recipeId));
      }
      return;
    }

    try {
      const payload = {
        spoonacularId: recipe.id,
        title: recipe.title,
        image: recipe.image,
        missedIngredientCount: recipe.missedIngredientCount,
        missedIngredients: recipe.missedIngredients,
        usedIngredients: recipe.usedIngredients
      };
      await axios.post(`${API_BASE_URL}/recipes/favorite`, payload);
      fetchFavorites();
    } catch (err) {
      console.error("Error saving favorite", err);
      setError('Failed to save recipe.');
    }
  };

  const handleRecipeClick = async (id) => {
    setModalOpen(true);
    setModalLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/recipes/${id}/information`);
      setSelectedRecipeInfo(res.data);
    } catch (err) {
      console.error("Error fetching recipe details", err);
      setError("Failed to load recipe details.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleAddToList = async (ingredient) => {
    try {
      await axios.post(`${API_BASE_URL}/shopping-list`, {
        name: ingredient.name,
        aisle: ingredient.aisle,
        image: `https://spoonacular.com/cdn/ingredients_100x100/${ingredient.image}`,
        amount: ingredient.amount,
        unit: ingredient.unit
      });
      fetchShoppingList();
    } catch (err) {
      console.error("Error adding to shopping list", err);
      setError('Database error: Could not add item to list. Please check your connection.');
    }
  };

  const handleToggleShoppingItem = async (id) => {
    try {
      await axios.patch(`${API_BASE_URL}/shopping-list/${id}`);
      fetchShoppingList();
    } catch (err) {
      console.error("Error toggling item", err);
    }
  };

  const handleDeleteShoppingItem = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/shopping-list/${id}`);
      fetchShoppingList();
    } catch (err) {
      console.error("Error deleting item", err);
    }
  };

  const handleAddPantryItem = async (name) => {
    try {
      await axios.post(`${API_BASE_URL}/pantry`, { name });
      fetchPantry();
    } catch (err) {
      console.error("Error adding pantry item", err);
      setError('Database error: Could not add item to pantry. Please check your connection.');
    }
  };

  const handleClearShoppingList = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/shopping-list`);
      fetchShoppingList();
    } catch (err) {
      console.error("Error clearing shopping list", err);
    }
  };

  const handleClearPantry = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/pantry`);
      fetchPantry();
    } catch (err) {
      console.error("Error clearing pantry", err);
    }
  };

  const handleDeletePantryItem = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/pantry/${id}`);
      fetchPantry();
    } catch (err) {
      console.error("Error deleting pantry item", err);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', py: 6 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h3" color="primary.dark" gutterBottom sx={{ fontWeight: 800 }}>
              Fridge to Table 🥗
            </Typography>

            {dbStatus.state !== 'connected' && dbStatus.state !== 'checking' && (
              <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                ⚠️ Database connection issue: <strong>{dbStatus.error || 'Connection failed'}</strong>.
                Persistent features (Pantry, List, Saved) are currently offline.
              </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 4, flexWrap: 'wrap' }}>
              {[
                { label: 'Find Recipes', value: 'search' },
                { label: `Saved (${favorites.length})`, value: 'favorites' },
                { label: 'Shopping List', value: 'shopping-list' },
                { label: 'Pantry', value: 'pantry' }
              ].map((tab) => (
                <Chip
                  key={tab.value}
                  label={tab.label}
                  onClick={() => setView(tab.value)}
                  color={view === tab.value ? "primary" : "default"}
                  sx={{ fontWeight: 'bold', px: 2, cursor: 'pointer' }}
                />
              ))}
            </Box>
          </Box>

          {view === 'search' && (
            <>
              <AIAssistant onDetect={(detected) => setIngredients([...new Set([...ingredients, ...detected])])} />
              <IngredientInput
                ingredients={ingredients}
                setIngredients={setIngredients}
              />
              <FilterBar selectedDiet={selectedDiet} onDietChange={setSelectedDiet} />
              {pantry.length > 0 && (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="body2" color="text.secondary">Use from Pantry:</Typography>
                  {pantry.slice(0, 5).map(item => (
                    <Chip
                      key={item._id}
                      label={item.name}
                      size="small"
                      onClick={() => !ingredients.includes(item.name) && setIngredients([...ingredients, item.name])}
                      sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'primary.light', color: 'white' } }}
                    />
                  ))}
                </Box>
              )}
            </>
          )}

          {view === 'shopping-list' && (
            <ShoppingListView
              items={shoppingList}
              onToggle={handleToggleShoppingItem}
              onDelete={handleDeleteShoppingItem}
              onClear={handleClearShoppingList}
            />
          )}

          {view === 'pantry' && (
            <PantryView
              items={pantry}
              onAdd={handleAddPantryItem}
              onDelete={handleDeletePantryItem}
              onClear={handleClearPantry}
            />
          )}

          {(view === 'search' || view === 'favorites') && (
            <>
              {error && (
                <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>
              )}

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                  <CircularProgress size={60} thickness={4} />
                </Box>
              ) : (
                <Box>
                  {view === 'favorites' && recipes.length === 0 ? (
                    <Box sx={{ textAlign: 'center', mt: 8, color: 'text.secondary' }}>
                      <Typography variant="h6">You haven't saved any recipes yet!</Typography>
                    </Box>
                  ) : (
                    <RecipeList
                      recipes={recipes}
                      onFavorite={handleFavoriteToggle}
                      favorites={favorites}
                      onRecipeClick={handleRecipeClick}
                    />
                  )}
                </Box>
              )}
            </>
          )}

          <RecipeModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            recipeInfo={selectedRecipeInfo}
            loading={modalLoading}
            onAddToList={handleAddToList}
            onAddToPantry={handleAddPantryItem}
          />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;


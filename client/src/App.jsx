import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Box, CircularProgress, Alert, Chip, Button } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import IngredientInput from './components/IngredientInput';
import RecipeList from './components/RecipeList';
import RecipeModal from './components/RecipeModal';
import ShoppingListView from './components/ShoppingListView';
import PantryView from './components/PantryView';
import FilterBar from './components/FilterBar';
import AIAssistant from './components/AIAssistant';
import AIChefModal from './components/AIChefModal';
import HealthProfileModal from './components/HealthProfileModal';
import HealthDashboard from './components/HealthDashboard';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import SettingsIcon from '@mui/icons-material/Settings';

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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

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
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [aiChefOpen, setAiChefOpen] = useState(false);
  const [healthProfileOpen, setHealthProfileOpen] = useState(false);
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

      if (ingredients.length === 0 && !selectedDiet && !selectedCuisine) {
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
            diet: selectedDiet,
            cuisine: selectedCuisine
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
  }, [ingredients, view, favorites, selectedDiet, selectedCuisine]);

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
                { label: 'Pantry', value: 'pantry' },
                { label: 'Health Mode 🩺', value: 'health' }
              ].map((tab) => (
                <Chip
                  key={tab.value}
                  label={tab.label}
                  onClick={() => setView(tab.value)}
                  color={view === tab.value ? "primary" : tab.value === 'health' ? "success" : "default"}
                  variant={view === tab.value ? "filled" : "outlined"}
                  sx={{ fontWeight: 'bold', px: 2, cursor: 'pointer', borderWidth: 2 }}
                />
              ))}
            </Box>
          </Box>

          {view === 'search' && (
            <>
              <AIAssistant onDetect={(detected) => {
                const normalized = detected.map(i => i.toLowerCase());
                setIngredients([...new Set([...ingredients, ...normalized])]);
              }} />
              <IngredientInput
                ingredients={ingredients}
                setIngredients={setIngredients}
              />
              <FilterBar 
                selectedDiet={selectedDiet} 
                onDietChange={setSelectedDiet} 
                selectedCuisine={selectedCuisine}
                onCuisineChange={setSelectedCuisine}
              />
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

          {view === 'health' && (
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                        <MonitorHeartIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                        Health Mode
                    </Typography>
                    <Button 
                        startIcon={<SettingsIcon />} 
                        variant="outlined" 
                        color="success"
                        onClick={() => setHealthProfileOpen(true)}
                        sx={{ borderRadius: 6, fontWeight: 'bold' }}
                    >
                        Medical Profile
                    </Button>
                </Box>
                <AIAssistant onDetect={(detected) => {
                  const normalized = detected.map(i => i.toLowerCase());
                  setIngredients([...new Set([...ingredients, ...normalized])]);
                }} />
                <IngredientInput
                  ingredients={ingredients}
                  setIngredients={setIngredients}
                />
                {pantry.length > 0 && (
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="body2" color="text.secondary">Use from Pantry:</Typography>
                    {pantry.slice(0, 5).map(item => (
                      <Chip
                        key={item._id}
                        label={item.name}
                        size="small"
                        color="success"
                        variant="outlined"
                        onClick={() => !ingredients.includes(item.name) && setIngredients([...ingredients, item.name])}
                        sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'success.light', color: 'white' } }}
                      />
                    ))}
                  </Box>
                )}
                {ingredients.length > 0 ? (
                    <HealthDashboard ingredients={ingredients} />
                ) : (
                    <Alert severity="info" sx={{ mt: 4, borderRadius: 2 }}>
                        Scan your fridge or select ingredients to generate your custom healthy meal!
                    </Alert>
                )}
            </Box>
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
                    <Box>
                      <RecipeList
                        recipes={recipes}
                        onFavorite={handleFavoriteToggle}
                        favorites={favorites}
                        onRecipeClick={handleRecipeClick}
                      />
                      {view === 'search' && ingredients.length > 0 && (
                        <Box sx={{ mt: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, p: 4, borderRadius: 4, background: 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)', color: 'white' }}>
                          <AutoAwesomeIcon sx={{ fontSize: 40, color: '#00e676' }} />
                          <Typography variant="h5" fontWeight="bold">Nothing looks good?</Typography>
                          <Typography variant="body1" sx={{ opacity: 0.8, maxWidth: 400, textAlign: 'center' }}>
                            Let our AI Chef perfectly craft a unique recipe tailored to exactly what's in your fridge.
                          </Typography>
                          <Button 
                            variant="contained" 
                            color="success" 
                            onClick={() => setAiChefOpen(true)}
                            sx={{ mt: 1, borderRadius: 8, px: 4, py: 1.5, fontWeight: 'bold' }}
                          >
                            Create Custom Recipe
                          </Button>
                        </Box>
                      )}
                    </Box>
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

          <AIChefModal 
            open={aiChefOpen} 
            onClose={() => setAiChefOpen(false)} 
            ingredients={ingredients} 
          />

          <HealthProfileModal
            open={healthProfileOpen}
            onClose={() => setHealthProfileOpen(false)}
          />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;


const EMOJIS = ['🥗','🥘','🍛','🍝','🍲','🍚','🍳','🍜','🥪','🥩','🍔','🍕','🍇','🍎','🥑','🥕','🥒','🥦','🌾','🍞'];

let recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
let mealPlan = JSON.parse(localStorage.getItem('mealPlan') || '{}');
let currentTab = 'recipes';
let selectedEmoji = '🥗';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

if (recipes.length === 0) {
  recipes = [
    { id: 1, name: 'Greek Yogurt Bowl', emoji: '🥣', prepTime: 10, servings: 1, ingredients: 'Greek yogurt\nHoney\nBerries\nGranola', instructions: 'Add yogurt\nDrizzle honey\nTop with berries and granola' },
    { id: 2, name: 'Chicken & Rice', emoji: '🍚', prepTime: 45, servings: 4, ingredients: 'Chicken breast\nBrown rice\nBroccoli\nSoy sauce', instructions: 'Cook rice\nGrill chicken\nSteam broccoli\nCombine' },
    { id: 3, name: 'Overnight Oats', emoji: '🌾', prepTime: 5, servings: 1, ingredients: 'Oats\nMilk\nChia seeds\nBanana', instructions: 'Mix oats and milk\nRefrigerate overnight\nTop with banana' }
  ];
  localStorage.setItem('recipes', JSON.stringify(recipes));
}

function saveRecipes() { localStorage.setItem('recipes', JSON.stringify(recipes)); }
function saveMealPlan() { localStorage.setItem('mealPlan', JSON.stringify(mealPlan)); }

function showToast(msg) {
  let toast = $('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

function getWeekDays() {
  const days = [];
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push({
      key: d.toISOString().split('T')[0],
      name: d.toLocaleDateString('en-US', { weekday: 'long' }),
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    });
  }
  return days;
}

function renderRecipes(filter = '') {
  const filtered = recipes.filter(r => r.name.toLowerCase().includes(filter.toLowerCase()));
  if (filtered.length === 0) {
    return `<div class="empty-state"><div class="emoji">📝</div><h3>No recipes</h3><p>Tap + to add one</p></div>`;
  }
  return `<div class="recipe-list">${filtered.map(r => `
    <div class="recipe-card" data-id="${r.id}">
      <div class="recipe-emoji">${r.emoji || '🍽️'}</div>
      <div class="recipe-info">
        <div class="recipe-name">${r.name}</div>
        <div class="recipe-meta">
          <span>${r.prepTime || '—'} min</span>
          <span>${r.servings || 1} servings</span>
        </div>
      </div>
    </div>
  `).join('')}</div>`;
}

function renderMealPrep() {
  const days = getWeekDays();
  const meals = ['Breakfast', 'Lunch', 'Dinner'];
  return `<div class="week-grid">${days.map(day => {
    const plan = mealPlan[day.key] || {};
    return `
      <div class="day-card">
        <div class="day-header">
          <div class="day-name">${day.name}</div>
          <div class="day-date">${day.date}</div>
        </div>
        ${meals.map(meal => {
          const entry = plan[meal.toLowerCase()];
          const recipe = entry ? recipes.find(r => r.id === entry.recipeId) : null;
          const done = entry?.prepared || false;
          return `
            <div class="meal-slot">
              <div class="meal-type">${meal}</div>
              <div class="meal-content ${!recipe ? 'meal-empty' : ''}" data-day="${day.key}" data-meal="${meal.toLowerCase()}">
                ${recipe ? `${recipe.emoji} ${recipe.name}` : 'Tap to assign'}
              </div>
              ${recipe ? `<div class="prep-badge ${done ? 'done' : ''}" data-day="${day.key}" data-meal="${meal.toLowerCase()}">${done ? '✓' : ''}</div>` : '<div style="width:22px"></div>'}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }).join('')}</div>`;
}

function renderProgress() {
  const totalRecipes = recipes.length;
  let prepared = 0, totalSlots = 0;
  Object.values(mealPlan).forEach(day => {
    Object.values(day).forEach(slot => {
      if (slot?.recipeId) {
        totalSlots++;
        if (slot.prepared) prepared++;
      }
    });
  });
  const percent = totalSlots ? Math.round((prepared / totalSlots) * 100) : 0;
  return `
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-value">${totalRecipes}</div><div class="stat-label">Recipes</div></div>
      <div class="stat-card"><div class="stat-value">${prepared}</div><div class="stat-label">Prepped</div></div>
    </div>
    <div class="progress-bar-container">
      <div class="progress-header"><span>This Week</span><span>${percent}%</span></div>
      <div class="progress-bar"><div class="progress-fill" style="width:${percent}%"></div></div>
    </div>
  `;
}

function renderRecipeDetail(recipe) {
  const ingredients = (recipe.ingredients || '').split('\n').filter(Boolean);
  const steps = (recipe.instructions || '').split('\n').filter(Boolean);
  return `
    <div style="text-align:center; padding:20px 0 8px;">
      <div style="font-size:64px; margin-bottom:8px;">${recipe.emoji || '🍽️'}</div>
      <h2 style="font-size:28px; font-weight:700; letter-spacing:-0.5px;">${recipe.name}</h2>
      <div style="color:var(--secondary); margin-top:4px;">${recipe.prepTime || '—'} min · ${recipe.servings || 1} servings</div>
    </div>
    <div class="detail-section"><h3>Ingredients</h3>${ingredients.map(i => `<div class="ingredient-item">• ${i}</div>`).join('') || '<p style="color:var(--tertiary)">None</p>'}</div>
    <div class="detail-section"><h3>Steps</h3>${steps.map((s, i) => `<div class="step-item"><div class="step-number">${i+1}</div><div>${s}</div></div>`).join('') || '<p style="color:var(--tertiary)">None</p>'}</div>
    <button class="delete-btn" id="delete-recipe">Delete Recipe</button>
  `;
}

function openModal(title, content, onSave) {
  $('#modal-title').textContent = title;
  $('#modal-body').innerHTML = content;
  $('#modal-overlay').classList.add('open');
  $('#modal-save').onclick = () => { if (onSave()) { closeModal(); render(); } };
  $('#modal-cancel').onclick = closeModal;
}

function closeModal() {
  $('#modal-overlay').classList.remove('open');
}

function openRecipeForm(recipe = null) {
  selectedEmoji = recipe?.emoji || '🥗';
  const content = `
    <div class="form-group"><label class="form-label">Icon</label><div class="emoji-picker">${EMOJIS.map(e => `<div class="emoji-option ${e === selectedEmoji ? 'selected' : ''}" data-emoji="${e}">${e}</div>`).join('')}</div></div>
    <div class="form-group"><label class="form-label">Name</label><input class="form-input" id="f-name" value="${recipe?.name || ''}" placeholder="Recipe name"></div>
    <div class="form-group" style="display:flex; gap:12px;">
      <div style="flex:1"><label class="form-label">Time (min)</label><input class="form-input" id="f-time" type="number" value="${recipe?.prepTime || ''}" placeholder="30"></div>
      <div style="flex:1"><label class="form-label">Servings</label><input class="form-input" id="f-servings" type="number" value="${recipe?.servings || 1}" placeholder="2"></div>
    </div>
    <div class="form-group"><label class="form-label">Ingredients</label><textarea class="form-textarea" id="f-ingredients" placeholder="One per line">${recipe?.ingredients || ''}</textarea></div>
    <div class="form-group"><label class="form-label">Steps</label><textarea class="form-textarea" id="f-instructions" placeholder="One step per line">${recipe?.instructions || ''}</textarea></div>
  `;
  openModal(recipe ? 'Edit Recipe' : 'New Recipe', content, () => {
    const name = $('#f-name').value.trim();
    if (!name) { showToast('Enter a name'); return false; }
    const data = {
      id: recipe?.id || Date.now(),
      name,
      emoji: selectedEmoji,
      prepTime: parseInt($('#f-time').value) || 0,
      servings: parseInt($('#f-servings').value) || 1,
      ingredients: $('#f-ingredients').value.trim(),
      instructions: $('#f-instructions').value.trim()
    };
    if (recipe) {
      const idx = recipes.findIndex(r => r.id === recipe.id);
      recipes[idx] = data;
    } else {
      recipes.unshift(data);
    }
    saveRecipes();
    showToast(recipe ? 'Updated' : 'Added');
    return true;
  });
  setTimeout(() => {
    $$('.emoji-option').forEach(el => {
      el.onclick = () => {
        $$('.emoji-option').forEach(e => e.classList.remove('selected'));
        el.classList.add('selected');
        selectedEmoji = el.dataset.emoji;
      };
    });
  }, 50);
}

function openAssignRecipe(dayKey, meal) {
  const content = `<div class="form-group"><label class="form-label">Select Recipe</label><div class="recipe-list">${recipes.map(r => `<div class="recipe-card" data-assign="${r.id}" style="margin-bottom:8px;"><div class="recipe-emoji">${r.emoji}</div><div class="recipe-info"><div class="recipe-name">${r.name}</div></div></div>`).join('') || '<p style="color:var(--secondary);text-align:center;padding:20px;">Add recipes first</p>'}</div></div>`;
  openModal(`Assign ${meal}`, content, () => false);
  setTimeout(() => {
    $$('[data-assign]').forEach(el => {
      el.onclick = () => {
        const recipeId = parseInt(el.dataset.assign);
        if (!mealPlan[dayKey]) mealPlan[dayKey] = {};
        mealPlan[dayKey][meal] = { recipeId, prepared: false };
        saveMealPlan();
        closeModal();
        render();
        showToast('Assigned');
      };
    });
  }, 50);
}

function render() {
  const search = $('#search-input').value || '';
  const title = $('#page-title');
  const content = $('#main-content');
  const addBtn = $('#add-btn');
  const searchContainer = $('#search-container');

  if (currentTab === 'recipes') {
    title.textContent = 'Recipes';
    addBtn.style.display = 'flex';
    searchContainer.style.display = 'flex';
    content.innerHTML = renderRecipes(search);
  } else if (currentTab === 'prep') {
    title.textContent = 'Meal Prep';
    addBtn.style.display = 'none';
    searchContainer.style.display = 'none';
    content.innerHTML = renderMealPrep();
  } else if (currentTab === 'progress') {
    title.textContent = 'Progress';
    addBtn.style.display = 'none';
    searchContainer.style.display = 'none';
    content.innerHTML = renderProgress();
  }
}

$$('.tab').forEach(tab => {
  tab.onclick = () => {
    $$('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentTab = tab.dataset.tab;
    $('#search-input').value = '';
    render();
  };
});

$('#add-btn').onclick = () => openRecipeForm();
$('#search-input').oninput = () => { if (currentTab === 'recipes') render(); };

$('#main-content').onclick = (e) => {
  const card = e.target.closest('.recipe-card[data-id]');
  if (card && currentTab === 'recipes') {
    const recipe = recipes.find(r => r.id == card.dataset.id);
    if (recipe) {
      $('#page-title').textContent = '';
      $('#add-btn').style.display = 'none';
      $('#search-container').style.display = 'none';
      $('#main-content').innerHTML = renderRecipeDetail(recipe);
      $('#delete-recipe').onclick = () => {
        if (confirm('Delete this recipe?')) {
          recipes = recipes.filter(r => r.id !== recipe.id);
          saveRecipes();
          showToast('Deleted');
          currentTab = 'recipes';
          $$('.tab')[0].classList.add('active');
          render();
        }
      };
      return;
    }
  }
  const mealSlot = e.target.closest('.meal-content');
  if (mealSlot && currentTab === 'prep') {
    openAssignRecipe(mealSlot.dataset.day, mealSlot.dataset.meal);
    return;
  }
  const badge = e.target.closest('.prep-badge');
  if (badge) {
    const { day, meal } = badge.dataset;
    if (mealPlan[day]?.[meal]) {
      mealPlan[day][meal].prepared = !mealPlan[day][meal].prepared;
      saveMealPlan();
      render();
    }
  }
};

render();

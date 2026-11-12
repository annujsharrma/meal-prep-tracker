const RECIPES = [
  { id: 1, name: 'Dal Tadka', emoji: '🥘', category: 'Lunch', time: 30, servings: 4, calories: 280, protein: 14, carbs: 42, fat: 6, cost: 40, diet: 'Vegetarian', ingredients: 'Toor dal 1 cup\nOnion 1\nTomato 2\nGarlic 4 cloves\nCumin\nTurmeric\nGhee 1 tbsp', instructions: 'Pressure cook dal\nMake tadka with cumin, garlic, onion, tomato\nMix and simmer' },
  { id: 2, name: 'Paneer Bhurji', emoji: '🥟', category: 'Dinner', time: 20, servings: 2, calories: 320, protein: 18, carbs: 8, fat: 24, cost: 80, diet: 'Vegetarian', ingredients: 'Paneer 200g\nOnion 1\nTomato 1\nCapsicum\nSpices', instructions: 'Sauté onion and tomato\nAdd crumbled paneer\nCook 5 minutes' },
  { id: 3, name: 'Oats Chilla', emoji: '🌾', category: 'Breakfast', time: 15, servings: 2, calories: 220, protein: 10, carbs: 32, fat: 6, cost: 25, diet: 'Vegetarian', ingredients: 'Oats 1 cup\nBesan 2 tbsp\nVegetables\nSpices', instructions: 'Grind oats\nMix with besan and veggies\nMake chilla on tawa' },
  { id: 4, name: 'Chicken Curry', emoji: '🍚', category: 'Dinner', time: 40, servings: 4, calories: 350, protein: 28, carbs: 10, fat: 20, cost: 120, diet: 'Non-Vegetarian', ingredients: 'Chicken 500g\nOnion 2\nTomato 2\nYogurt\nSpices\nOil', instructions: 'Marinate chicken\nCook onion-tomato gravy\nAdd chicken and simmer' },
  { id: 5, name: 'Greek Yogurt Bowl', emoji: '🥣', category: 'Breakfast', time: 5, servings: 1, calories: 240, protein: 18, carbs: 28, fat: 6, cost: 50, diet: 'Vegetarian', ingredients: 'Greek yogurt 200g\nBerries\nHoney\nNuts', instructions: 'Add yogurt\nTop with berries, honey and nuts' },
  { id: 6, name: 'Vegetable Khichdi', emoji: '🍛', category: 'Lunch', time: 25, servings: 3, calories: 260, protein: 9, carbs: 45, fat: 5, cost: 30, diet: 'Vegetarian', ingredients: 'Rice\nMoong dal\nMixed vegetables\nSpices\nGhee', instructions: 'Wash rice and dal\nPressure cook with veggies and spices' }
];

let profile = JSON.parse(localStorage.getItem('profile') || 'null') || {
  name: 'Anuj', goal: 'General Health', diet: 'Vegetarian', activity: 'Moderate', calories: 2200, protein: 120, carbs: 250, fat: 70
};
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
let mealPlan = JSON.parse(localStorage.getItem('mealPlan') || '{}');
let foodLog = JSON.parse(localStorage.getItem('foodLog') || '{}');
let grocery = JSON.parse(localStorage.getItem('grocery') || '[]');

let currentTab = 'home';
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

function save() {
  localStorage.setItem('profile', JSON.stringify(profile));
  localStorage.setItem('favorites', JSON.stringify(favorites));
  localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
  localStorage.setItem('foodLog', JSON.stringify(foodLog));
  localStorage.setItem('grocery', JSON.stringify(grocery));
}

function showToast(msg) {
  let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 1800);
}

function getTodayKey() { return new Date().toISOString().split('T')[0]; }

function getTodayNutrition() {
  const key = getTodayKey();
  const entries = foodLog[key] || [];
  return entries.reduce((acc, e) => {
    const r = RECIPES.find(x => x.id === e.recipeId);
    if (r) {
      const mult = e.servings || 1;
      acc.calories += r.calories * mult;
      acc.protein += r.protein * mult;
      acc.carbs += r.carbs * mult;
      acc.fat += r.fat * mult;
    }
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
}

function renderHome() {
  const nut = getTodayNutrition();
  const calPct = Math.min(100, Math.round((nut.calories / profile.calories) * 100));
  const protPct = Math.min(100, Math.round((nut.protein / profile.protein) * 100));
  return `
    <div class="card">
      <div style="font-size:15px; color:var(--secondary); margin-bottom:4px;">Today</div>
      <div style="font-size:28px; font-weight:700;">${Math.round(nut.calories)} <span style="font-size:16px; font-weight:400; color:var(--secondary);">/ ${profile.calories} kcal</span></div>
      <div class="macro-bar" style="margin:8px 0 12px;"><div class="macro-fill" style="width:${calPct}%; background:var(--accent);"></div></div>
      <div style="display:flex; gap:16px; font-size:14px;">
        <div><strong>${Math.round(nut.protein)}g</strong> Protein<div class="macro-bar"><div class="macro-fill" style="width:${protPct}%; background:#007AFF;"></div></div></div>
        <div><strong>${Math.round(nut.carbs)}g</strong> Carbs</div>
        <div><strong>${Math.round(nut.fat)}g</strong> Fat</div>
      </div>
    </div>
    <div class="card">
      <h3 style="margin-bottom:8px;">Recommended for you</h3>
      <div class="recipe-grid">
        ${RECIPES.filter(r => r.diet === profile.diet || profile.diet === 'Non-Vegetarian').slice(0, 3).map(r => recipeCard(r)).join('')}
      </div>
    </div>
    <div class="card">
      <div style="font-size:15px; color:var(--secondary);">Goal: ${profile.goal}</div>
      <div style="font-size:17px; font-weight:600; margin-top:4px;">${profile.diet} · ${profile.activity} activity</div>
    </div>
  `;
}

function recipeCard(r) {
  return `<div class="recipe-card" data-id="${r.id}">
    <div class="recipe-emoji">${r.emoji}</div>
    <div class="recipe-info">
      <div class="recipe-name">${r.name}</div>
      <div class="recipe-meta">${r.time} min · ₹${r.cost}</div>
      <div class="macro-pills"><span class="macro-pill">${r.calories} kcal</span><span class="macro-pill">${r.protein}g P</span></div>
    </div>
  </div>`;
}

function renderRecipes() {
  return `<div style="margin-bottom:12px;"><input class="form-input" id="search" placeholder="Search recipes" style="margin-bottom:8px;"></div>
    <div class="recipe-grid" id="recipe-list">${RECIPES.map(recipeCard).join('')}</div>`;
}

function renderPlanner() {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  return days.map(d => `
    <div class="day-card">
      <div style="font-weight:600; margin-bottom:8px;">${d}</div>
      ${['Breakfast','Lunch','Dinner'].map(m => {
        const entry = mealPlan[d]?.[m];
        const r = entry ? RECIPES.find(x => x.id === entry) : null;
        return `<div class="meal-slot">
          <div class="meal-type">${m}</div>
          <div style="flex:1;" class="meal-assign" data-day="${d}" data-meal="${m}">${r ? r.emoji + ' ' + r.name : '<span style="color:var(--tertiary)">Tap to add</span>'}</div>
        </div>`;
      }).join('')}
    </div>
  `).join('');
}

function renderTrack() {
  const nut = getTodayNutrition();
  const key = getTodayKey();
  const entries = foodLog[key] || [];
  return `
    <div class="card">
      <div style="font-size:28px; font-weight:700;">${Math.round(nut.calories)} kcal</div>
      <div style="color:var(--secondary); margin-bottom:12px;">of ${profile.calories} target</div>
      <div>Protein: ${Math.round(nut.protein)}g / ${profile.protein}g</div>
      <div>Carbs: ${Math.round(nut.carbs)}g / ${profile.carbs}g</div>
      <div>Fat: ${Math.round(nut.fat)}g / ${profile.fat}g</div>
    </div>
    <div class="card">
      <h3 style="margin-bottom:8px;">Today's Log</h3>
      ${entries.length ? entries.map((e, i) => {
        const r = RECIPES.find(x => x.id === e.recipeId);
        return `<div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:0.5px solid var(--separator);">
          <div>${r ? r.emoji + ' ' + r.name : 'Food'} (${e.servings})</div>
          <button class="text-btn" data-remove="${i}" style="color:var(--red);">Remove</button>
        </div>`;
      }).join('') : '<div class="empty-state"><div class="emoji">📝</div><p>No meals logged today</p></div>'}
      <button class="icon-btn" id="add-food" style="margin-top:12px; width:100%;">Add Meal</button>
    </div>
  `;
}

function renderProfile() {
  return `
    <div class="card">
      <div style="font-size:22px; font-weight:700;">${profile.name}</div>
      <div style="color:var(--secondary); margin-top:4px;">${profile.goal}</div>
    </div>
    <div class="card">
      <div class="form-group"><label class="form-label">Daily Calories</label><input class="form-input" id="p-cal" type="number" value="${profile.calories}"></div>
      <div class="form-group"><label class="form-label">Protein (g)</label><input class="form-input" id="p-prot" type="number" value="${profile.protein}"></div>
      <div class="form-group"><label class="form-label">Diet</label>
        <select class="form-select" id="p-diet"><option ${profile.diet==='Vegetarian'?'selected':''}>Vegetarian</option><option ${profile.diet==='Non-Vegetarian'?'selected':''}>Non-Vegetarian</option><option ${profile.diet==='Vegan'?'selected':''}>Vegan</option></select>
      </div>
      <button class="icon-btn" id="save-profile" style="width:100%;">Save Goals</button>
    </div>
    <div class="card">
      <button class="text-btn" id="generate-grocery" style="width:100%; text-align:left;">Generate Grocery List</button>
    </div>
  `;
}

function openRecipeDetail(id) {
  const r = RECIPES.find(x => x.id === id);
  if (!r) return;
  const content = `
    <div style="text-align:center; margin-bottom:16px;">
      <div style="font-size:64px;">${r.emoji}</div>
      <h2 style="font-size:28px; font-weight:700;">${r.name}</h2>
      <div style="color:var(--secondary);">${r.time} min · ${r.servings} servings · ₹${r.cost}</div>
    </div>
    <div class="card">
      <div style="display:flex; justify-content:space-around; text-align:center;">
        <div><div style="font-size:22px; font-weight:700;">${r.calories}</div><div style="font-size:13px; color:var(--secondary);">kcal</div></div>
        <div><div style="font-size:22px; font-weight:700;">${r.protein}g</div><div style="font-size:13px; color:var(--secondary);">Protein</div></div>
        <div><div style="font-size:22px; font-weight:700;">${r.carbs}g</div><div style="font-size:13px; color:var(--secondary);">Carbs</div></div>
        <div><div style="font-size:22px; font-weight:700;">${r.fat}g</div><div style="font-size:13px; color:var(--secondary);">Fat</div></div>
      </div>
    </div>
    <div class="card"><h3 style="margin-bottom:8px;">Ingredients</h3><div style="white-space:pre-line;">${r.ingredients}</div></div>
    <div class="card"><h3 style="margin-bottom:8px;">Instructions</h3><div style="white-space:pre-line;">${r.instructions}</div></div>
    <button class="icon-btn" id="log-meal" style="width:100%; margin-bottom:8px;">Log This Meal</button>
    <button class="text-btn" id="add-grocery" style="width:100%;">Add Ingredients to Grocery</button>
  `;
  openModal(r.name, content, () => true);
  setTimeout(() => {
    $('#log-meal').onclick = () => {
      const key = getTodayKey();
      if (!foodLog[key]) foodLog[key] = [];
      foodLog[key].push({ recipeId: r.id, servings: 1 });
      save(); showToast('Meal logged'); closeModal(); render();
    };
    $('#add-grocery').onclick = () => {
      const items = r.ingredients.split('\n').map(i => i.trim()).filter(Boolean);
      items.forEach(item => { if (!grocery.includes(item)) grocery.push(item); });
      save(); showToast('Added to grocery list');
    };
  }, 50);
}

function openModal(title, content, onDone) {
  $('#modal-title').textContent = title;
  $('#modal-body').innerHTML = content;
  $('#modal-overlay').classList.add('open');
  $('#modal-save').onclick = () => { if (onDone()) closeModal(); };
  $('#modal-cancel').onclick = closeModal;
}
function closeModal() { $('#modal-overlay').classList.remove('open'); }

function render() {
  const title = $('#page-title');
  const content = $('#main-content');
  if (currentTab === 'home') { title.textContent = 'Home'; content.innerHTML = renderHome(); }
  else if (currentTab === 'recipes') { title.textContent = 'Recipes'; content.innerHTML = renderRecipes();
    const search = $('#search'); if (search) search.oninput = () => {
      const q = search.value.toLowerCase();
      $('#recipe-list').innerHTML = RECIPES.filter(r => r.name.toLowerCase().includes(q)).map(recipeCard).join('');
    };
  }
  else if (currentTab === 'planner') { title.textContent = 'Planner'; content.innerHTML = renderPlanner(); }
  else if (currentTab === 'track') { title.textContent = 'Track'; content.innerHTML = renderTrack();
    const add = $('#add-food'); if (add) add.onclick = () => {
      const list = RECIPES.map(r => `<div class="recipe-card" data-log="${r.id}" style="margin-bottom:8px;">${recipeCard(r)}</div>`).join('');
      openModal('Log Meal', `<div class="recipe-grid">${list}</div>`, () => false);
      setTimeout(() => $$('[data-log]').forEach(el => el.onclick = () => {
        const id = parseInt(el.dataset.log);
        const key = getTodayKey();
        if (!foodLog[key]) foodLog[key] = [];
        foodLog[key].push({ recipeId: id, servings: 1 });
        save(); showToast('Logged'); closeModal(); render();
      }), 50);
    };
    $$('[data-remove]').forEach(btn => btn.onclick = () => {
      const key = getTodayKey();
      foodLog[key].splice(parseInt(btn.dataset.remove), 1);
      save(); render();
    });
  }
  else if (currentTab === 'profile') { title.textContent = 'Profile'; content.innerHTML = renderProfile();
    const saveBtn = $('#save-profile'); if (saveBtn) saveBtn.onclick = () => {
      profile.calories = parseInt($('#p-cal').value) || profile.calories;
      profile.protein = parseInt($('#p-prot').value) || profile.protein;
      profile.diet = $('#p-diet').value;
      save(); showToast('Goals saved');
    };
    const gen = $('#generate-grocery'); if (gen) gen.onclick = () => {
      openModal('Grocery List', `<div style="white-space:pre-line;">${grocery.length ? grocery.join('\n') : 'No items yet. Add from recipes.'}</div>`, () => true);
    };
  }
}

$$('.tab').forEach(tab => {
  tab.onclick = () => {
    $$('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentTab = tab.dataset.tab;
    render();
  };
});

$('#ai-btn').onclick = () => {
  const recs = RECIPES.filter(r => r.protein >= 12 && (r.diet === profile.diet || profile.diet === 'Non-Vegetarian')).slice(0, 3);
  openModal('AI Suggestions', `<p style="margin-bottom:12px; color:var(--secondary);">Based on your ${profile.diet} preference and goals:</p>${recs.map(recipeCard).join('')}`, () => true);
};

$('#main-content').onclick = e => {
  const card = e.target.closest('.recipe-card[data-id]');
  if (card) openRecipeDetail(parseInt(card.dataset.id));
  const assign = e.target.closest('.meal-assign');
  if (assign) {
    const { day, meal } = assign.dataset;
    const list = RECIPES.map(r => `<div class="recipe-card" data-assign="${r.id}" style="margin-bottom:8px;">${recipeCard(r)}</div>`).join('');
    openModal(`Assign ${meal}`, `<div class="recipe-grid">${list}</div>`, () => false);
    setTimeout(() => $$('[data-assign]').forEach(el => el.onclick = () => {
      if (!mealPlan[day]) mealPlan[day] = {};
      mealPlan[day][meal] = parseInt(el.dataset.assign);
      save(); showToast('Added to plan'); closeModal(); render();
    }), 50);
  }
};

render();

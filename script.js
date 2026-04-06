// =============================================
// TO-DO APP — Search & Edit Feature
// Author: Jai (Team 4)
// Feature Branch: feature/search-and-edit
// =============================================

// ---------- STATE ----------
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let editingIndex = null;

// ---------- DOM REFS ----------
const todoInput   = document.getElementById('todoInput');
const addBtn      = document.getElementById('addBtn');
const searchInput = document.getElementById('searchInput');
const clearSearch = document.getElementById('clearSearch');
const todoList    = document.getElementById('todoList');
const emptyState  = document.getElementById('emptyState');
const noResults   = document.getElementById('noResults');
const taskCount   = document.getElementById('taskCount');
const searchStatus = document.getElementById('searchStatus');

// Modal
const editModal   = document.getElementById('editModal');
const editInput   = document.getElementById('editInput');
const closeModal  = document.getElementById('closeModal');
const cancelEdit  = document.getElementById('cancelEdit');
const saveEdit    = document.getElementById('saveEdit');

// =============================================
// SAVE & LOAD
// =============================================
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// =============================================
// ADD TASK
// =============================================
function addTask() {
  const text = todoInput.value.trim();
  if (!text) {
    todoInput.focus();
    todoInput.style.animation = 'shake 0.3s ease';
    setTimeout(() => todoInput.style.animation = '', 300);
    return;
  }
  tasks.push({ text, completed: false });
  saveTasks();
  todoInput.value = '';
  todoInput.focus();
  renderTasks();
}

addBtn.addEventListener('click', addTask);
todoInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTask();
});

// =============================================
// DELETE TASK
// =============================================
function deleteTask(index) {
  const item = todoList.children[getVisibleIndex(index)];
  if (item) {
    item.style.animation = 'fadeOut 0.2s ease forwards';
    setTimeout(() => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    }, 180);
  } else {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
  }
}

// =============================================
// TOGGLE COMPLETE
// =============================================
function toggleComplete(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

// =============================================
// EDIT TASK — Open Modal
// =============================================
function openEditModal(index) {
  editingIndex = index;
  editInput.value = tasks[index].text;
  editModal.classList.add('active');
  setTimeout(() => editInput.focus(), 80);
}

function closeEditModal() {
  editModal.classList.remove('active');
  editingIndex = null;
}

function saveEditedTask() {
  const newText = editInput.value.trim();
  if (!newText) return;
  if (editingIndex !== null) {
    tasks[editingIndex].text = newText;
    saveTasks();
    closeEditModal();
    renderTasks();
  }
}

closeModal.addEventListener('click', closeEditModal);
cancelEdit.addEventListener('click', closeEditModal);
saveEdit.addEventListener('click', saveEditedTask);

editInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') saveEditedTask();
  if (e.key === 'Escape') closeEditModal();
});

// Close modal when clicking outside
editModal.addEventListener('click', (e) => {
  if (e.target === editModal) closeEditModal();
});

// =============================================
// SEARCH
// =============================================
searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim();
  clearSearch.classList.toggle('visible', query.length > 0);
  renderTasks();
});

clearSearch.addEventListener('click', () => {
  searchInput.value = '';
  clearSearch.classList.remove('visible');
  searchInput.focus();
  renderTasks();
});

// =============================================
// HIGHLIGHT matching text
// =============================================
function highlightText(text, query) {
  if (!query) return escapeHTML(text);
  const escaped = escapeHTML(text);
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  return escaped.replace(regex, '<mark class="highlight">$1</mark>');
}

function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// =============================================
// RENDER
// =============================================
function renderTasks() {
  const query = searchInput.value.trim().toLowerCase();
  todoList.innerHTML = '';

  const filtered = tasks
    .map((task, index) => ({ task, index }))
    .filter(({ task }) => task.text.toLowerCase().includes(query));

  // Update stats
  const total = tasks.length;
  taskCount.textContent = `${total} task${total !== 1 ? 's' : ''}`;

  if (query) {
    searchStatus.textContent = `${filtered.length} result${filtered.length !== 1 ? 's' : ''} found`;
  } else {
    searchStatus.textContent = '';
  }

  // Empty state
  emptyState.style.display = (total === 0) ? 'block' : 'none';
  noResults.style.display  = (total > 0 && filtered.length === 0) ? 'block' : 'none';

  // Render filtered tasks
  filtered.forEach(({ task, index }) => {
    const li = document.createElement('li');
    li.className = `todo-item${task.completed ? ' completed' : ''}`;

    const checkbox = document.createElement('div');
    checkbox.className = `todo-checkbox${task.completed ? ' checked' : ''}`;
    checkbox.title = task.completed ? 'Mark incomplete' : 'Mark complete';
    checkbox.addEventListener('click', () => toggleComplete(index));

    const span = document.createElement('span');
    span.className = 'todo-text';
    span.innerHTML = highlightText(task.text, query);

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn-action btn-edit';
    editBtn.title = 'Edit task';
    editBtn.innerHTML = '<span class="material-icons-round">edit</span>';
    editBtn.addEventListener('click', () => openEditModal(index));

    const delBtn = document.createElement('button');
    delBtn.className = 'btn-action btn-delete';
    delBtn.title = 'Delete task';
    delBtn.innerHTML = '<span class="material-icons-round">delete_outline</span>';
    delBtn.addEventListener('click', () => deleteTask(index));

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(actions);
    todoList.appendChild(li);
  });

  renderProgress(tasks);
}

// Helper: get rendered position (used for fade-out animation)
function getVisibleIndex(taskIndex) {
  const query = searchInput.value.trim().toLowerCase();
  const visible = tasks
    .map((t, i) => ({ t, i }))
    .filter(({ t }) => t.text.toLowerCase().includes(query));
  return visible.findIndex(({ i }) => i === taskIndex);
}

// Shake animation for empty input
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%       { transform: translateX(-6px); }
    60%       { transform: translateX(6px); }
  }
  @keyframes fadeOut {
    to { opacity: 0; transform: translateX(10px); }
  }
`;
document.head.appendChild(style);

// =============================================
// INIT
// =============================================
renderTasks();

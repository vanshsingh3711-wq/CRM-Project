// ui.js
// ============================================================
//  IMPORTS
// ============================================================
import * as api from './api.js';

// ============================================================
//  MODULE STATE
// ============================================================
let selectedId = null;           // currently viewed client (for notes / tasks)
let currentTaskClientId = null;  // client being edited for tasks

// ============================================================
//  DOM REFERENCES
// ============================================================
const sidebar        = document.querySelector('.sidebar');
const menuBtn        = document.querySelector('.menuBtn');
const navItems       = document.querySelectorAll('.nav-item');
const searchBox      = document.getElementById('searchBox');
const greetingEl     = document.querySelector('.greeting');
const dateboxEl      = document.querySelector('.datebox');

// Quick add modal
const clientBox      = document.getElementById('clientBox');
const closeBtn       = clientBox?.querySelector('.closeBtn');
const clientPaper    = document.getElementById('clientPaper');

// Edit modal
const editBox        = document.getElementById('editBox');
const editForm       = document.getElementById('editform');
const existBtn       = document.querySelector('.existbtn');
const editClientBtn  = document.querySelector('.edit-client-btn');
const dealBtn        = document.querySelector('.deal');

// Client detail view
const detailView     = document.getElementById('clients-detail');
const backLink       = document.querySelector('.back-link');

// Note modal
const noteModal      = document.getElementById('noteModal');
const noteClose      = document.getElementById('noteModalClose');
const noteCancel     = document.getElementById('noteCancelBtn');
const noteForm       = document.getElementById('noteForm');
const noteTitle      = document.getElementById('noteTitle');
const noteText       = document.getElementById('noteText');
const noteCategory   = document.getElementById('noteCategory');
const notePriority   = document.getElementById('notePriority');
const addNoteBtn     = document.getElementById('addNoteBtn');

// Task modal
const taskModal      = document.getElementById('taskModal');
const taskClose      = document.querySelector('.close-task');
const taskForm       = document.getElementById('taskForm');
const taskTitle      = document.getElementById('taskTitle');
const taskDesc       = document.getElementById('taskDescription');
const taskDate       = document.getElementById('taskDate');
const taskPriority   = document.getElementById('taskPriority');
const addTaskBtn     = document.getElementById('addTaskBtn');

// Containers
const clientTableBody = document.getElementById('clientTableBody');
const notesList      = document.getElementById('notesList');
const taskList       = document.getElementById('taskList');

// ============================================================
//  SIDEBAR TOGGLE
// ============================================================
menuBtn?.addEventListener('click', () => {
  sidebar.classList.toggle('close');
});

// ============================================================
//  NAVIGATION
// ============================================================
navItems.forEach(item => {
  item.addEventListener('click', e => {
    const targetId = item.getAttribute('data-target');
    if (!targetId) return;
    e.preventDefault();

    navItems.forEach(x => x.classList.remove('active'));
    item.classList.add('active');

    document.querySelectorAll('.view-section').forEach(view => {
      view.style.display = 'none';
    });
    const targetView = document.getElementById(targetId);
    if (targetView) targetView.style.display = 'block';
  });
});

// ============================================================
//  LOGOUT (placeholder)
// ============================================================
document.getElementById('logoutBtn')?.addEventListener('click', e => {
  e.preventDefault();
  alert('Logout clicked');
});

// ============================================================
//  SEARCH
// ============================================================
searchBox?.addEventListener('input', () => {
  const text = searchBox.value.toLowerCase().trim();
  const all = api.getClients();
  const filtered = all.filter(c =>
    c.name.toLowerCase().includes(text) ||
    (c.business || '').toLowerCase().includes(text) ||
    c.email.toLowerCase().includes(text)
  );
  renderClientTable(filtered);
});

// ============================================================
//  GREETING & DATE DISPLAY
// ============================================================
function updateGreeting() {
  const info = api.getCurrentDateInfo();
  greetingEl.innerHTML = `Good ${info.greetingWord}, Alex`;
  dateboxEl.textContent = `📅 ${info.dayName}, ${info.monthName} ${info.date}, ${info.year}`;
}

updateGreeting();
setInterval(updateGreeting, 30000);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) updateGreeting();
});

// ============================================================
//  QUICK ADD CLIENT MODAL
// ============================================================
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', () => {
    clientBox.style.display = 'block';
  });
});

closeBtn?.addEventListener('click', () => {
  clientBox.style.display = 'none';
});

window.addEventListener('click', e => {
  if (e.target === clientBox) clientBox.style.display = 'none';
});

clientPaper?.addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;
  api.addClient({
    name: form.name.value,
    email: form.email.value,
    number: form.number.value,
    business: form.business.value,
  });
  clientBox.style.display = 'none';
  form.reset();
  renderAll();
});

// ============================================================
//  EDIT CLIENT MODAL
// ============================================================
existBtn?.addEventListener('click', () => {
  editBox.style.display = 'none';
});

window.addEventListener('click', e => {
  if (e.target === editBox) editBox.style.display = 'none';
});

editForm?.addEventListener('submit', e => {
  e.preventDefault();
  const id = editForm.dataset.clientId;
  const updated = {
    name: editForm.name.value,
    email: editForm.email.value,
    number: editForm.number.value,
    business: editForm.business.value,
  };
  api.updateClient(id, updated);
  editBox.style.display = 'none';
  renderAll();
});

editClientBtn?.addEventListener('click', () => {
  const client = api.getClientById(selectedId);
  if (!client) {
    alert('No client selected');
    return;
  }
  editForm.dataset.clientId = client.id;
  editForm.name.value = client.name;
  editForm.email.value = client.email;
  editForm.number.value = client.number || '';
  editForm.business.value = client.business || '';
  editBox.style.display = 'block';
});

dealBtn?.addEventListener('click', () => {
  const id = editForm.dataset.clientId;
  api.updateClient(id, { status: 'closed' });
  editBox.style.display = 'none';
  renderAll();
});

// ============================================================
//  BACK LINK (client detail → client list)
// ============================================================
backLink?.addEventListener('click', e => {
  e.preventDefault();
  detailView.style.display = 'none';
  document.getElementById('clients-view').style.display = 'block';
  // re-highlight nav
  navItems.forEach(x => x.classList.remove('active'));
  document.querySelector('.nav-item[data-target="clients-view"]')?.classList.add('active');
});

// ============================================================
//  RENDER CLIENT TABLE
// ============================================================
function renderClientTable(data = null) {
  const clients = data || api.getClients();
  if (!clientTableBody) return;
  clientTableBody.innerHTML = '';

  if (clients.length === 0) {
    clientTableBody.innerHTML = `<tr><td colspan="6">No clients found</td></tr>`;
    return;
  }

  clients.forEach(client => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${client.name}</td>
      <td>${client.business || 'N/A'}</td>
      <td>${client.number || 'N/A'}</td>
      <td>${client.email}</td>
      <td><span class="status ${client.status}">${client.status}</span></td>
      <td class="actions">
        <button class="view">View</button>
        <button class="edit">Edit</button>
        <button class="delete" title="Delete Client">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </td>
    `;
    clientTableBody.appendChild(tr);

    // View
    tr.querySelector('.view').addEventListener('click', () => {
      selectedId = client.id;
      renderClientDetail(client);
      renderNotes();
      renderTasks();
      // Reset tabs
      document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
      document.querySelector('.tabs button[data-target="overview"]')?.classList.add('active');
      // Show detail view
      document.querySelectorAll('.view-section').forEach(v => v.style.display = 'none');
      detailView.style.display = 'block';
    });

    // Edit
    tr.querySelector('.edit').addEventListener('click', () => {
      editForm.dataset.clientId = client.id;
      editForm.name.value = client.name;
      editForm.email.value = client.email;
      editForm.number.value = client.number || '';
      editForm.business.value = client.business || '';
      editBox.style.display = 'block';
    });

    // Delete
    tr.querySelector('.delete').addEventListener('click', () => {
      if (confirm(`Delete client "${client.name}"?`)) {
        api.deleteClient(client.id);
        renderAll();
        searchBox.value = '';
      }
    });
  });
}

// ============================================================
//  RENDER CLIENT DETAIL (overview)
// ============================================================
function renderClientDetail(client) {
  if (!client) return;
  document.querySelector('.client-name').textContent = client.name;
  document.querySelector('.client-email').textContent = client.email;
  document.querySelector('.client-number').textContent = client.number;
  document.querySelector('.client-company').textContent = client.business || 'NA';
  document.querySelector('.over-business').textContent = client.business || 'NA';
  document.querySelector('.over-email').textContent = client.email;
  document.querySelector('.over-number').textContent = client.number;
}

// ============================================================
//  TABS (client detail)
// ============================================================
document.querySelectorAll('.tabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;
    document.querySelectorAll('.content-page').forEach(page => {
      page.style.display = 'none';
    });
    document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const targetPage = document.getElementById(target);
    if (targetPage) targetPage.style.display = 'block';
  });
});

// ============================================================
//  NOTES
// ============================================================
addNoteBtn?.addEventListener('click', () => {
  if (!selectedId) {
    alert('Please select a client first');
    return;
  }
  noteModal.style.display = 'block';
});

noteClose?.addEventListener('click', () => { noteModal.style.display = 'none'; });
noteCancel?.addEventListener('click', () => { noteModal.style.display = 'none'; });
window.addEventListener('click', e => {
  if (e.target === noteModal) noteModal.style.display = 'none';
});

noteForm?.addEventListener('submit', e => {
  e.preventDefault();
  const client = api.getClientById(selectedId);
  if (!client) {
    alert('Client not found');
    return;
  }
  if (!noteText.value.trim()) {
    alert('Please write some content');
    return;
  }
  const newNote = {
    id: api.generateId(),
    title: noteTitle.value || 'Untitled',
    content: noteText.value,
    category: noteCategory.value,
    impt: notePriority.value,
    createdAt: new Date().toISOString(),
  };
  if (!client.notes) client.notes = [];
  client.notes.push(newNote);
  api.saveClients();
  renderNotes();
  noteForm.reset();
  noteModal.style.display = 'none';
});

function renderNotes() {
  const client = api.getClientById(selectedId);
  if (!notesList) return;
  notesList.innerHTML = '';

  if (!client || !client.notes || client.notes.length === 0) {
    notesList.innerHTML = `<p style="color:#888;">No notes yet. Click "Add Note" to get started.</p>`;
    return;
  }

  client.notes.forEach(note => {
    const div = document.createElement('div');
    div.style.cssText = 'padding:12px 0; border-bottom:1px solid #eee;';
    const date = new Date(note.createdAt).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:start;">
        <div>
          <strong>${note.title}</strong>
          <p style="margin:4px 0; color:#555;">${note.content}</p>
          <small style="color:#999;">
            📂 ${note.category || 'General'} • ⚡ ${note.impt || 'Medium'} • 📅 ${date}
          </small>
        </div>
        <button class="delete-note-btn" data-note-id="${note.id}" style="background:none; border:none; color:#f74a6c; cursor:pointer; font-size:24px;">🗑</button>
      </div>
    `;
    notesList.appendChild(div);
    div.querySelector('.delete-note-btn').addEventListener('click', () => {
      deleteNote(note.id);
    });
  });
}

function deleteNote(noteId) {
  const client = api.getClientById(selectedId);
  if (!client) return;
  client.notes = client.notes.filter(n => n.id !== noteId);
  api.saveClients();
  renderNotes();
}

// ============================================================
//  TASKS
// ============================================================
addTaskBtn?.addEventListener('click', () => {
  if (!selectedId) {
    alert('Please select a client first');
    return;
  }
  currentTaskClientId = selectedId;
  taskModal.style.display = 'block';
});

taskClose?.addEventListener('click', () => { taskModal.style.display = 'none'; });
window.addEventListener('click', e => {
  if (e.target === taskModal) taskModal.style.display = 'none';
});

taskForm?.addEventListener('submit', e => {
  e.preventDefault();
  const client = api.getClientById(currentTaskClientId);
  if (!client) {
    alert('Client not found');
    return;
  }
  if (!taskDesc.value.trim()) {
    alert('Please write a description');
    return;
  }
  const newTask = {
    id: api.generateId(),
    title: taskTitle.value || 'Untitled',
    description: taskDesc.value,
    date: taskDate.value,
    Priority: taskPriority.value,
  };
  if (!client.tasks) client.tasks = [];
  client.tasks.push(newTask);
  api.saveClients();
  renderTasks();
  taskForm.reset();
  taskModal.style.display = 'none';
});

function renderTasks() {
  const client = api.getClientById(selectedId);
  if (!taskList) return;
  taskList.innerHTML = '';

  if (!client || !client.tasks || client.tasks.length === 0) {
    taskList.innerHTML = `<p style="color:#888;">No tasks yet.</p>`;
    return;
  }

  client.tasks.forEach(task => {
    const dateStr = task.date ? new Date(task.date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    }) : 'No due date';
    const priorityClass = (task.Priority || 'medium').toLowerCase();

    const card = document.createElement('div');
    card.className = 'task-card';
    card.innerHTML = `
      <div class="task-top">
        <div>
          <h4>${task.title}</h4>
          <p>${task.description}</p>
        </div>
        <span class="priority ${priorityClass}">${task.Priority || 'Medium'}</span>
      </div>
      <div class="task-bottom">
        <span>📅 ${dateStr}</span>
        <div class="task-actions">
          <button class="delete-task" data-task-id="${task.id}">🗑</button>
        </div>
      </div>
    `;
    taskList.appendChild(card);
    card.querySelector('.delete-task').addEventListener('click', () => {
      deleteTask(task.id);
    });
  });
}

function deleteTask(taskId) {
  const client = api.getClientById(selectedId);
  if (!client) return;
  client.tasks = client.tasks.filter(t => t.id !== taskId);
  api.saveClients();
  renderTasks();
}

// ============================================================
//  RENDER ALL (refresh everything)
// ============================================================
function renderAll() {
  renderClientTable();
  if (selectedId) {
    const client = api.getClientById(selectedId);
    if (client) {
      renderClientDetail(client);
      renderNotes();
      renderTasks();
    } else {
      // selected client was deleted – go back to list
      detailView.style.display = 'none';
      document.getElementById('clients-view').style.display = 'block';
      selectedId = null;
    }
  }
}

// ============================================================
//  INITIALISE
// ============================================================
export function init() {
  api.loadClients();
  renderAll();
  // Default view: dashboard
  document.querySelectorAll('.view-section').forEach(v => v.style.display = 'none');
  document.getElementById('dashboard-view').style.display = 'block';
  // Set active nav item
  navItems.forEach(x => x.classList.remove('active'));
  document.querySelector('.nav-item[data-target="dashboard-view"]')?.classList.add('active');
}
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
let currentSort = 'newest';  // default: newest first
// ============================================================
//  DOM REFERENCES
// ============================================================
const sidebar = document.querySelector('.sidebar');
const menuBtn = document.querySelector('.menuBtn');
const navItems = document.querySelectorAll('.nav-item');
const searchBox = document.getElementById('searchBox');
const greetingEl = document.querySelector('.greeting');
const dateboxEl = document.querySelector('.datebox');

// Quick add modal
const clientBox = document.getElementById('clientBox');
const closeBtn = clientBox?.querySelector('.closeBtn');
const clientPaper = document.getElementById('clientPaper');

// Edit modal
const editBox = document.getElementById('editBox');
const editForm = document.getElementById('editform');
const existBtn = document.querySelector('.existbtn');
const editClientBtn = document.querySelector('.edit-client-btn');
const dealBtn = document.querySelector('.deal');

// Client detail view
const detailView = document.getElementById('clients-detail');
const backLink = document.querySelector('.back-link');

// Note modal
const noteModal = document.getElementById('noteModal');
const noteClose = document.getElementById('noteModalClose');
const noteCancel = document.getElementById('noteCancelBtn');
const noteForm = document.getElementById('noteForm');
const noteTitle = document.getElementById('noteTitle');
const noteText = document.getElementById('noteText');
const noteCategory = document.getElementById('noteCategory');
const notePriority = document.getElementById('notePriority');
const addNoteBtn = document.getElementById('addNoteBtn');

// Task modal
const taskModal = document.getElementById('taskModal');
const taskClose = document.querySelector('.close-task');
const taskForm = document.getElementById('taskForm');
const taskTitle = document.getElementById('taskTitle');
const taskDesc = document.getElementById('taskDescription');
const taskDate = document.getElementById('taskDate');
const taskPriority = document.getElementById('taskPriority');
const addTaskBtn = document.getElementById('addTaskBtn');

// Containers
const clientTableBody = document.getElementById('clientTableBody');
const notesList = document.getElementById('notesList');
const taskList = document.getElementById('taskList');

// FOLLOW-UP ADD BUTTON
const addfollow = document.getElementById('quickFollowBtn');
// let currentfollowfilter = 'all';


// FOLLOW-UP MODAL 
const followupModal = document.getElementById('followupModal');
const addFollowBtn = document.querySelector('#addFollowupBtn'); // your "Add Follow‑up" button
const closeFollowBtn = document.getElementById('closeFollowupBtn');
const cancelFollowBtn = document.getElementById('cancelFollowupBtn');

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
    if (targetId === 'satatistic-view') {
      renderstatics();
    }
    if (targetId === 'follow-view') {
      renderglobalfollow();
    }
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

// Sort dropdown
document.getElementById('sortOptions')?.addEventListener('change', function (e) {
  currentSort = e.target.value;
  renderClientTable(); // Re-render with the new sort
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
  renderstatics();
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
let currentclientfil = 'all';
// ============================================================
//  RENDER CLIENT TABLE
// ============================================================
function renderClientTable(data = null) {
  let clients = data || api.getClients();

  // SORT BY SELECTED VALUE // 
  switch (currentSort) {
    case 'newest': clients = [...clients].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case 'oldest': clients = [...clients].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
    case 'az': clients = [...clients].sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'za': clients = [...clients].sort((a, b) => b.name.localeCompare(a.name));
      break;
    default:
      break;
  }
  let filterC = clients;
  if (currentclientfil !== 'all') { filterC = clients.filter(c => c.status === currentclientfil) };
  if (!clientTableBody) return;
  clientTableBody.innerHTML = '';

  if (filterC.length === 0) {
    clientTableBody.innerHTML = `<tr><td colspan="6">No clients found</td></tr>`;
    return;
  }

  filterC.forEach(client => {

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
      rendetailfollowup();
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

const selectStatus = document.querySelector('.select-status')
if (selectStatus) {
  selectStatus.addEventListener('change', function (e) {

    const client = api.getClientById(selectedId);
    client.status = e.target.value;
    api.saveClients();
    renderClientDetail(client);
    renderClientTable();

  })
}

function clientfilter() {
  const allfilter = document.querySelectorAll('.filter');
  allfilter.forEach(btn => {
    btn.addEventListener('click', (e) => {
      currentclientfil = e.currentTarget.dataset.filter
      document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'))
      e.currentTarget.classList.add('active');
      renderClientTable();

    })
  }

  )
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

  // Inside renderClientDetail(client)
  const statusSelect = document.querySelector('.select-status');
  if (statusSelect) {
    statusSelect.value = client.status || 'lead';
  }
}

// ============================================================
//  TABS (client detail)
// ============================================================
document.querySelectorAll('.tabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;

    if (target === 'follow-up') {
      rendetailfollowup();   // ✅ Add this line
    } else if (target === 'notes') {
      renderNotes();
    } else if (target === 'tasks') {
      renderTasks();
    }

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

document.querySelector('.view-all-followups')?.addEventListener('click', function () {
  const followTab = document.querySelector('.tabs button[data-target="follow-up"]');
  if (followTab) followTab.click();
  rendetailfollowup();
});

document.querySelector('.view-all-tasks')?.addEventListener('click', function () {
  const taskTab = document.querySelector('.tabs button[data-target="tasks"]');
  if (taskTab) taskTab.click();
  rendetailfollowup();
});


noteClose?.addEventListener('click', () => { noteModal.style.display = 'none'; });
noteCancel?.addEventListener('click', () => { noteModal.style.display = 'none'; });
window.addEventListener('click', e => {
  if (e.target === noteModal) noteModal.style.display = 'none';
});

noteForm?.addEventListener('submit', e => {
  e.preventDefault();
  const noteedit = document.getElementById('noteEditId').value;

  const client = api.getClientById(selectedId);
  if (!client) {
    alert('Client not found');
    return;
  }
  if (!noteText.value.trim()) {
    alert('Please write some content');
    return;
  }

  if (noteedit) {
    const note = client.notes.find(n => n.id === noteedit)
    if (!note) { alert('no note found') }

    note.title = noteTitle.value;
    note.content = noteText.value;
    note.category = noteCategory.value;
    note.impt = notePriority.value;

  }

  else {
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
  }
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
        <div>
        <button class="edit-note" data-id="${note.id}" title="Edit">✎</button>
        <button class="delete-note-btn" data-note-id="${note.id}" style="background:none; border:none; color:#f74a6c; cursor:pointer; font-size:24px;">🗑</button></div>
      </div>
    `;
    notesList.appendChild(div);
    div.querySelector('.delete-note-btn').addEventListener('click', () => {
      deleteNote(note.id);
    });
    const editnote = div.querySelector('.edit-note')
    editnote.addEventListener('click', () => {
      const noteId = editnote.dataset.id;
      const client = api.getClientById(selectedId)
      if (!client) return;
      const note = client.notes.find(n => n.id === noteId);
      if (!note) return;
      document.getElementById('noteEditId').value = noteId;

      document.getElementById('noteTitle').value = note.title || '';
      document.getElementById('noteText').value = note.content || '';
      document.getElementById('noteCategory').value = note.category || 'general';
      document.getElementById('notePriority').value = note.impt || 'medium';
      noteModal.style.display = 'block';
    })
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
  const taskedit = document.querySelector('#taskEditId').value;
  const client = api.getClientById(selectedId)

  if (taskedit) {
    const task = client.tasks.find(t => t.id === taskedit);

    if (!task) { alert('task not found'); return; }
    task.title = taskTitle.value;
    task.description = taskDesc.value;
    task.date = taskDate.value;
    task.Priority = taskPriority.value;
  } else {

    const newTask = {
      id: api.generateId(),
      title: taskTitle.value || 'Untitled',
      description: taskDesc.value,
      date: taskDate.value,
      Priority: taskPriority.value,
    };
    if (!client.tasks) client.tasks = [];
    client.tasks.push(newTask);
  }

  api.saveClients();
  renderTasks();
  document.getElementById('taskEditId').value = '';
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
        <button class="edit-task" data-id="${task.id}" title="Edit">✎</button>
          <button class="delete-task" data-task-id="${task.id}">🗑</button>
        </div>
      </div>
    `;
    taskList.appendChild(card);
    card.querySelector('.delete-task').addEventListener('click', () => {
      deleteTask(task.id);
    });

    const taskedit = card.querySelector('.edit-task')
    taskedit.addEventListener('click', () => {

      const client = api.getClientById(selectedId)
      if (!client) return;
      const taskId = taskedit.dataset.id;
      const task = client.tasks.find(t => t.id === taskId)
      if (!task) return;
      document.querySelector('#taskEditId').value = taskId;

      document.getElementById('taskTitle').value = task.title || '';
      document.getElementById('taskDate').value = task.date || '';
      document.getElementById('taskDescription').value = task.description || 'general';
      document.getElementById('taskPriority').value = task.Priority || 'medium';

      taskModal.style.display = 'block';

    })
  });
};

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

function updateDashboard() {
  updateDashboardKPIs();
  updateDashboardBars();
  updateDashboardDonut();
  updateRecentClients();
  updateUpcomingFollowups();
}
// ============================================================
//  INITIALISE
// ============================================================
export function init() {
  api.loadClients();
  updatefollowcard();
  updateDashboard();
  renderstatics();
  todaylistandcircle();
  clientfilter();
  // followfilter();
  renderAll();
  console.log('updateDashboard called');
  // Default view: dashboard
  // document.getElementById('refreshFollowBtn')?.addEventListener('click', refreshFollowPage);
  document.querySelectorAll('.view-section').forEach(v => v.style.display = 'none');
  document.getElementById('dashboard-view').style.display = 'block';
  // Set active nav item
  navItems.forEach(x => x.classList.remove('active'));
  document.querySelector('.nav-item[data-target="dashboard-view"]')?.classList.add('active');

  // ----- Quick Add Button -----
  const quickBtns = document.querySelectorAll('.btn');
  const clientBox = document.getElementById('clientBox');
  const closeBtn = clientBox?.querySelector('.closeBtn');
  const clientPaper = document.getElementById('clientPaper');

  quickBtns.forEach(button => {
    button.addEventListener('click', () => {
      clientBox.style.display = 'block';
    });
  });

  closeBtn?.addEventListener('click', () => {
    clientBox.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === clientBox) {
      clientBox.style.display = 'none';
    }
  });

  clientPaper?.addEventListener('submit', (e) => {
    e.preventDefault();
    // Create new client object (use your API)
    const newClient = {
      id: crypto.randomUUID(),
      name: clientPaper.name.value,
      email: clientPaper.email.value,
      number: clientPaper.number.value,
      business: clientPaper.business.value,
      status: 'lead',
      createdAt: new Date().toISOString(),
      notes: [],
      tasks: [],
      documents: [],
    };
    // Add via API (if you have addClient) or push to array
    // Then close modal, reset form, save & re-render
    // ... your existing logic from crm.js
  });


};

// ADD FOLLOW-UP BUTTON 
addfollow.addEventListener("click", () => {
  followupModal.style.display = 'block';
})
closeFollowBtn.addEventListener("click", () => {
  followupModal.style.display = 'none'
});
// ============================================================
//  FOLLOW-UP MODAL FUNCTIONS
// ============================================================

// OPEN FROM GLOBAL PAGE (no client selected)
export function openGlobalFollowup() {
  const input = document.getElementById('followupClientInput');
  const display = document.getElementById('selectedClientDisplay');
  const datalist = document.getElementById('clientOptions');
  const hiddenId = document.getElementById('followupClientId');

  // Show search input, hide static display
  input.style.display = 'block';
  display.style.display = 'none';
  hiddenId.value = '';
  input.value = '';

  // Populate datalist with ALL clients
  const clients = api.getClients();
  datalist.innerHTML = clients.map(client =>
    `<option value="${client.name}">`
  ).join('');

  // Show modal
  followupModal.style.display = 'block';
  renderglobalfollow();
}

// OPEN FROM CLIENT DETAIL VIEW (has selectedId)
export function openClientFollowup(clientId) {
  const client = api.getClientById(clientId);
  if (!client) {
    alert('Client not found');
    return;
  }

  const input = document.getElementById('followupClientInput');
  const display = document.getElementById('selectedClientDisplay');
  const nameSpan = document.getElementById('selectedClientName');
  const hiddenId = document.getElementById('followupClientId');

  // Hide search input, show static display
  input.style.display = 'none';
  display.style.display = 'block';
  nameSpan.textContent = client.name;
  hiddenId.value = client.id;

  // Show modal
  followupModal.style.display = 'block';
}

// RESET FUNCTION (clears form and closes modal)
function resetfollow() {
  const form = document.getElementById('followupForm');
  const input = document.getElementById('followupClientInput');
  const display = document.getElementById('selectedClientDisplay');
  const hiddenId = document.getElementById('followupClientId');

  form.reset();
  input.style.display = 'block';
  display.style.display = 'none';
  hiddenId.value = '';
  input.value = '';
  followupModal.style.display = 'none';
}

// ============================================================
//  EVENT LISTENERS
// ============================================================

// "New" button on Follow-ups page (global)
addfollow?.addEventListener('click', openGlobalFollowup);

// "Add Follow-up" button inside client detail tab
addFollowBtn?.addEventListener('click', () => {
  if (!selectedId) {
    alert('Please open a client profile first.');
    return;
  }
  openClientFollowup(selectedId);
})

// Close buttons (using the reset function WITHOUT duplicating listeners)
closeFollowBtn?.addEventListener('click', resetfollow);
cancelFollowBtn?.addEventListener('click', resetfollow);

// Click outside modal
window.addEventListener('click', (e) => {
  if (e.target === followupModal) resetfollow();
});

// ============================================================
//  SUBMIT HANDLER
// ============================================================
document.getElementById('followupForm')?.addEventListener('submit', function (e) {
  // ✅ CRITICAL: Prevent page refresh
  e.preventDefault();

  // 1️⃣ Read the hidden edit ID
  const editId = document.getElementById('followupEditId').value;

  // 2️⃣ Get the client and form values
  const clientId = document.getElementById('followupClientId').value;
  const client = api.getClientById(clientId);
  if (!client) return;

  const title = document.getElementById('followupTitle').value.trim();
  const desc = document.getElementById('followupDesc').value.trim();
  const date = document.getElementById('followupDate').value;
  const time = document.getElementById('followupTime').value;
  const priority = document.getElementById('followupPriority').value;

  // 3️⃣ Validate required fields
  if (!title || !date) {
    alert('Please fill in title and date.');
    return;
  }

  if (editId) {
    const followup = client.followups.find(f => f.id === editId)
    if (!followup) {
      alert('follow-up not found')

    }
    followup.title = title;
    followup.description = desc;
    followup.date = date;
    followup.time = time;
    followup.priority = priority;
  } else {
    const newfollow = {
      id: api.generateId(),
      title: title,
      description: desc || '',
      date: date,
      time: time || '',
      priority: priority || 'medium',
      status: 'scheduled',
      createdAt: new Date().toISOString()
    }
    if (!client.followups) client.followups = [];
    client.followups.push(newfollow);
  };




  api.saveClients();
  // 6. Close, reset, re-render
  resetfollow();
  renderglobalfollow();
  renderAll();
  if (selectedId) rendetailfollowup();
  updatefollowcard();
  todaylistandcircle();
});
// DISPLAY FOLLOW-UP ON CLINT DETAIL PAGE 
function rendetailfollowup() {
  const followlist = document.getElementById('clientFollowupList')
  if (!followlist) return;

  const Clients = api.getClientById(selectedId);
  if (!Clients) return;
  const Followups = Clients.followups || [];

  followlist.innerHTML = '';
  if (Followups.length === 0) {
    followlist.innerHTML = `<div style="text-align:center; color:#888; padding:30px;">No follow‑ups scheduled for this client.</div>`; return;

  }
  Followups.forEach(follow => {
    const card = document.createElement('div');
    card.className = 'followup-card';

    card.innerHTML = `
      <div class="followup-card-left">
        <div class="followup-card-title">${follow.title}</div>
        <div class="followup-card-desc">${follow.description || ''}</div>
        <div class="followup-card-meta">
          <span>📅 ${follow.date ? new Date(follow.date).toLocaleDateString() : 'No date'}</span>
          <span>⏰ ${follow.time || 'No time'}</span>
          <span><span class="priority-dot ${follow.priority || 'medium'}"></span> ${follow.priority || 'medium'}</span>
        </div>
        <span class="followup-card-status ${follow.status}">${follow.status}</span>
      </div>
      <div class="followup-card-actions">
        ${follow.status !== 'completed' ? `<button class="complete-btn" data-id="${follow.id}" title="Mark as completed">✅</button>` : ''}
        <button class="delete-btn" data-id="${follow.id}" title="Delete">🗑</button>
        <button class="edit-btn" data-id="${follow.id}" title="Edit">✎</button>
      </div>
    `;
    followlist.appendChild(card);
    const edit = card.querySelector('.edit-btn')
    edit.addEventListener('click', () => {
      editfollow(Clients.id, follow.id);
    });
    const dbtn = card.querySelector('.delete-btn');
    dbtn.addEventListener('click', () => {
      dtnfollow(follow.id)
      api.saveClients();
      rendetailfollowup();
    });

    const completd = card.querySelector('.complete-btn');
    if (completd) {
      completd.addEventListener('click', () => {
        const client = Clients;   // Use the existing client object
        if (!client) return;
        const fup = client.followups.find(f => f.id === follow.id);
        if (fup) {
          fup.status = 'completed';
          api.saveClients();
          rendetailfollowup();
          updatefollowcard();
          todaylistandcircle();
        }
      });
    }
  }
  )
};


function dtnfollow(deleteFollow) {
  const clients = api.getClientById(selectedId)
  if (!clients) return;
  // const followups = clients.followups.find(f=>f.id === deleteFollow)
  clients.followups = clients.followups.filter(f => f.id !== deleteFollow)

}

function editfollow(cliendId, followupId) {
  const client = api.getClientById(cliendId);
  if (!client) return;
  const followup = client.followups.find(f => f.id === followupId)
  if (!followup) return;
  // give the hidden div follow up id that we got now 
  document.getElementById('followupEditId').value = followupId;

  const input = document.getElementById('followupClientInput');
  const display = document.getElementById('selectedClientDisplay');
  const nameSpan = document.getElementById('selectedClientName');
  const hiddenId = document.getElementById('followupClientId');

  input.style.display = 'none';
  display.style.display = 'block';
  nameSpan.textContent = client.name;
  hiddenId.value = client.id;

  document.getElementById('followupTitle').value = followup.title || '';
  document.getElementById('followupDesc').value = followup.description || '';
  document.getElementById('followupDate').value = followup.date || '';
  document.getElementById('followupTime').value = followup.time || '';
  document.getElementById('followupPriority').value = followup.priority || 'medium';
  followupModal.style.display = 'block'
};





let currentFilter = 'all';
function renderglobalfollow(arraylist = null) {
  const tablebody = document.getElementById('followTableBody');
  if (!tablebody) return;

  // 1. Flatten all follow‑ups from all clients
  const allClients = arraylist || api.getClients();

  const allFollowups = allClients.flatMap(client =>
    (client.followups || []).map(f => ({
      ...f,
      clientName: client.name,
      clientId: client.id
    }))
  );
  let filtered = allFollowups;
  if (currentFilter !== 'all') {
    filtered = allFollowups.filter(f => f.status === currentFilter);
  }
  // 2. Sort by date (soonest first)
  filtered.sort((a, b) => new Date(a.date) - new Date(b.date));

  // 3. Clear table
  tablebody.innerHTML = '';

  // 4. Empty state
  if (filtered.length === 0) {
    tablebody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#888; padding: 30px;">No follow‑ups scheduled yet.</td></tr>`;
    return;
  }

  // 5. Build rows
  filtered.forEach(follow => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
  <td>${follow.clientName}</td>
  <td>${follow.title}</td>
  <td>${follow.date ? new Date(follow.date).toLocaleDateString() : ''} ${follow.time || ''}</td>
  <td><span class="status ${follow.status}">${follow.status}</span></td>
  <td class="followactions">
    <button class="followview" data-client-id="${follow.clientId}" data-follow-id="${follow.id}">👁</button>
    <button class="followdelete" data-client-id="${follow.clientId}" data-follow-id="${follow.id}">🗑</button>
  </td>
`;
    tablebody.appendChild(tr);

    const viewfollow = tr.querySelector('.followview').addEventListener('click', () => {
      const client = api.getClientById(follow.clientId);
      if (!client) return;
      selectedId = client.id;
      renderClientDetail(client);
      renderNotes();
      renderTasks();

      document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
      document.querySelector('.tabs button[data-target="overview"]')?.classList.add('active');
      document.querySelectorAll('.view-section').forEach(v => v.style.display = 'none');
      detailView.style.display = 'block';

    });

    tr.querySelector('.followdelete').addEventListener('click', () => {
      const client = api.getClientById(follow.clientId);

      if (!client) return;

      client.followups = client.followups.filter(f => f.id !== follow.id,);
      api.saveClients();
      renderglobalfollow();
      updatefollowcard();
    })

  });

  // Optionally attach event listeners for the buttons here
}


const filterButtons = document.querySelectorAll('.follow-filter');
filterButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    currentFilter = e.currentTarget.dataset.filter;
    console.log(currentFilter);
    document.querySelectorAll('.follow-filter').forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');
    renderglobalfollow();

  })
})


// search button follow 
const searchfollow = document.getElementById('followSearchBox');
searchfollow?.addEventListener('input', () => {
  const text = searchfollow.value.toLowerCase().trim();
  const allClients = api.getClients();
  console.log(allClients)

  if (!text) {
    // Show all follow-ups
    renderglobalfollow(allClients);
    return;
  }

  // Filter clients whose name contains the search text
  // OR who have any follow-up whose title contains the text
  const filteredClients = allClients.filter(client => {
    const nameMatch = client.name.toLowerCase().includes(text);
    const followupMatch = (client.followups || []).some(f =>
      f.title.toLowerCase().includes(text)
    );
    return nameMatch || followupMatch;
  });

  renderglobalfollow(filteredClients);
});

// ============================================================
// FOLLOW-UP  CARD INFO UPDATE 
// ============================================================

const due = document.getElementById('followTotalDue')
const overdue = document.querySelector('#followOverdue')
const today = document.getElementById('followToday')
const completed = document.getElementById('followCompleted')



function updatefollowcard() {

  const allclient = api.getClients();
  const allFollowups = allclient.flatMap(client => client.followups || []);
  const totaldue = allFollowups.filter(f => f.status === 'scheduled').length;
  const overdueCount = allFollowups.filter(f => f.status === 'scheduled' && new Date(f.date) < new Date()).length;
  const todayCount = allFollowups.filter(f => f.status === 'scheduled' && new Date(f.date).toDateString() === new Date().toDateString()).length;
  const completedCount = allFollowups.filter(f => f.status === 'completed').length;
  due.textContent = totaldue;
  document.getElementById('followOverdue').textContent = overdueCount;
  document.getElementById('followToday').textContent = todayCount;
  document.getElementById('followCompleted').textContent = completedCount;

  console.log(due.textContent)

}
updatefollowcard();
function renderstatics() {
  console.log('✅ renderstatics() called');

  // ---- 1. KPI Cards ----
  const clientpagetotal = document.getElementById('clientCountDisplay');
  if (clientpagetotal) clientpagetotal.textContent = api.gettotalclient();
  document.getElementById('statTotalClients').textContent = api.gettotalclient();
  document.getElementById('statActiveLeads').textContent = api.getactiveclients();
  document.getElementById('statClosedDeals').textContent = api.getclosedclient();
  document.getElementById('statConversionRate').textContent = api.totalpercent() + '%';

  const clients = api.getClients();

  // ---- 2. Weekly Bar Chart (statistics page) ----
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  const today = new Date();
  const currentDay = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
  monday.setHours(0, 0, 0, 0);

  clients.forEach(client => {
    const createdAt = new Date(client.createdAt);
    if (createdAt >= monday && createdAt <= today) {
      const dayIndex = createdAt.getDay();
      const arrayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
      dayCounts[arrayIndex]++;
    }
  });

  const maxCount = Math.max(...dayCounts, 1);
  // ✅ UNIQUE IDs for statistics page bars
  const barIds = ['statBarMon', 'statBarTue', 'statBarWed', 'statBarThu', 'statBarFri', 'statBarSat', 'statBarSun'];
  barIds.forEach((id, index) => {
    const bar = document.getElementById(id);
    if (bar) {
      const barheight = (dayCounts[index] / maxCount) * 100;
      bar.style.height = Math.max(15, barheight) + '%';
    }
  });

  // ---- 3. Donut Chart (statistics page) ----
  const total = clients.length;
  const statuses = ['lead', 'contacted', 'proposal', 'closed'];
  // ✅ UNIQUE IDs for statistics page donut
  const donutIds = ['statDonutLead', 'statDonutContacted', 'statDonutProposal', 'statDonutClosed'];
  const legendIds = [
    "statLegendLead",
    "statLegendContacted",
    "statLegendProposal",
    "statLegendClosed"
];
  const colors = ['#4A6CF7', '#f7a84a', '#22c55e', '#6b7a8f'];
  let offset = 0;

  statuses.forEach((status, index) => {
    const count = clients.filter(c => c.status === status).length;
    const percentage = total > 0 ? (count / total) * 100 : 0;
    const circumference = 314.16;
    const dash = (percentage / 100) * circumference;

    const donutEl = document.getElementById(donutIds[index]);
    if (donutEl) {
      donutEl.setAttribute('stroke-dasharray', `${dash} ${circumference}`);
      donutEl.setAttribute('stroke-dashoffset', `-${offset}`);
      donutEl.setAttribute('stroke', colors[index]);
      donutEl.setAttribute('stroke-width', '16');
      donutEl.setAttribute('fill', 'none');
      offset += dash;
    }

    document.getElementById(legendIds[index]).textContent = count;
  });

  // ✅ Update center number with unique ID
  const centerEl = document.getElementById('statDonutCenter');
  if (centerEl) centerEl.textContent = total;

  // ---- 4. Top Clients Table ----
  const topClients = clients.map(c => ({
    ...c,
    followCount: (c.followups || []).length
  }))
  .sort((a, b) => b.followCount - a.followCount)
  .slice(0, 5);

  const topBody = document.getElementById('statTopClientsBody');
  const emptyState = document.getElementById('statTopEmpty');

  if (topBody) {
    if (topClients.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      topBody.innerHTML = '';
    } else {
      if (emptyState) emptyState.style.display = 'none';
      topBody.innerHTML = topClients.map((client, index) => `
        <tr>
          <td style="padding: 12px 16px; font-weight: 600; color: #1a2639;">${index + 1}. ${client.name}</td>
          <td style="padding: 12px 16px;">
            <span class="status ${client.status}" style="display: inline-block; padding: 2px 12px; border-radius: 30px; font-size: 12px; font-weight: 500;">${client.status}</span>
          </td>
          <td style="padding: 12px 16px; text-align: right; font-weight: 600; color: #4A6CF7;">${client.followCount}</td>
        </tr>
      `).join('');
    }
  }

  // ---- 5. Recent Activity Feed ----
  const activityFeed = document.getElementById('statRecentActivity');
  if (activityFeed) {
    const recentClients = clients
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    if (recentClients.length === 0) {
      activityFeed.innerHTML = `<div style="color: #6b7a8f; text-align: center; padding: 20px 0;">No recent activity</div>`;
    } else {
      activityFeed.innerHTML = recentClients.map(client => `
        <div style="display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f4f6fb;">
          <div style="width: 36px; height: 36px; border-radius: 50%; background: #eef3ff; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0;">👤</div>
          <div style="flex: 1;">
            <div style="font-weight: 500; color: #1a2639;">${client.name}</div>
            <div style="font-size: 13px; color: #6b7a8f;">Added: ${new Date(client.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
          </div>
          <span class="status ${client.status}" style="display: inline-block; padding: 2px 12px; border-radius: 30px; font-size: 11px; font-weight: 500;">${client.status}</span>
        </div>
      `).join('');
    }
  }

  console.log('✅ Statistics page rendered');
};


document.getElementById('up-view-all').addEventListener('click',()=>{
  document.getElementById('dashboard-view').style.display = 'none'
  document.getElementById('clients-view').style.display = 'block'
   navItems.forEach(x => x.classList.remove('active'));
  document.querySelector('.nav-item[data-target="clients-view"]')?.classList.add('active');

})
document.getElementById('view-follow').addEventListener('click',()=>{
  document.getElementById('dashboard-view').style.display = 'none'
  document.getElementById('follow-view').style.display = 'block'
   navItems.forEach(x => x.classList.remove('active'));
  document.querySelector('.nav-item[data-target="follow-view"]')?.classList.add('active');
renderglobalfollow();
})

                                                                  //DASHBOARD PAGE //

                                          // KPI CARDS 
  function updateDashboardKPIs() {
    const clients = api.getClients();
    const total = clients.length;
    const active = clients.filter(c => c.status === 'lead' || c.status === 'contacted' || c.status === 'proposal').length;
    const totalfollow = clients.flatMap(c => c.followups || []);
    const closed = clients.filter(c => c.status === 'closed').length;
    const due = totalfollow.filter(f => f.status === 'scheduled').length;

    document.getElementById('dashTotalClients').textContent = total;
    document.getElementById('dashActiveLeads').textContent = active;
    document.getElementById('dashFollowupsDue').textContent = due;
    document.getElementById('dashClosedDeals').textContent = closed;
  };

                                        // WEEKLY BAR CHART//

function updateDashboardBars() {
  const clients = api.getClients();
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  const today = new Date();
  const currentDay = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
  monday.setHours(0, 0, 0, 0);

  clients.forEach(client => {
    const createdAt = new Date(client.createdAt);
    if (createdAt >= monday && createdAt <= today) {
      const dayIndex = createdAt.getDay();
      const arrayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
      dayCounts[arrayIndex]++;
    }
  });

  const maxCount = Math.max(...dayCounts, 1);
  const barIds = ['barMon', 'barTue', 'barWed', 'barThu', 'barFri', 'barSat', 'barSun'];
  barIds.forEach((id, index) => {
    const bar = document.getElementById(id);
    if (bar) {
      const barheight = (dayCounts[index] / maxCount) * 100;
      bar.style.height = Math.max(15, barheight) + '%';
    }
  });
}

function updateDashboardDonut() {
  const clients = api.getClients();
  const total = clients.length;
  const statuses = ['lead', 'contacted', 'proposal', 'closed'];
  const colors = ['#4A6CF7', '#f7a84a', '#22c55e', '#6b7a8f'];
  const donutIds = ['donutLead', 'donutContacted', 'donutProposal', 'donutClosed'];
  const legendIds = ['legendLead', 'legendContacted', 'legendProposal', 'legendClosed'];
 let offset = 0;
 statuses.forEach((status ,index)=>{
  const count = clients.filter(c=> c.status === status).length;
  const percentage = total> 0? (count/total)*100 :0;
  const circumference = 314.16;
   const dash = (percentage / 100) * circumference;

   const donutEl = document.getElementById(donutIds[index])
   if(donutEl){
     donutEl.setAttribute('stroke-dasharray', `${dash} ${circumference}`);
      donutEl.setAttribute('stroke-dashoffset', `-${offset}`);
      donutEl.setAttribute('stroke', colors[index]);
      offset += dash;
   }
   document.getElementById(legendIds[index]).textContent = count;
 });
  const centerEl = document.querySelector('#dashboard-view svg + div');
  if (centerEl) centerEl.textContent = total;
};

                                                                      //RECENT ACTIVITY //
function updateRecentClients() {
  const clients = api.getClients();
  const recent = clients
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const tbody = document.getElementById('recentClientsBody');
  if (tbody) {
    tbody.innerHTML = recent.map(client => `
      <tr>
        <td style="padding: 10px 16px; font-weight: 600; color: #1a2639;">${client.name}</td>
        <td style="padding: 10px 16px; color: #4a5a6e;">${client.business || 'N/A'}</td>
        <td style="padding: 10px 16px; text-align: right;">
          <span style="display: inline-block; padding: 2px 12px; border-radius: 30px; font-size: 12px; font-weight: 500; background: ${client.status === 'closed' ? '#e3f5e9' : client.status === 'proposal' ? '#fef3d7' : '#eef3ff'}; color: ${client.status === 'closed' ? '#1f8b4c' : client.status === 'proposal' ? '#b7791f' : '#4A6CF7'};">${client.status}</span>
        </td>
      </tr>
    `).join('');
  }
};

                                                                  // UPCOMING FOLLOW-UPS
function updateUpcomingFollowups() {
  const clients = api.getClients();
  const allFollowups = clients.flatMap(c => 
    (c.followups || []).map(f => ({ ...f, clientName: c.name }))
  );
  const upcoming = allFollowups
    .filter(f => f.status === 'scheduled')
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);
console.log(upcoming);
  const container = document.getElementById('upcomingFollowups');
  if (container) {
    if (upcoming.length === 0) {
      container.innerHTML = `<div style="color: #6b7a8f; text-align: center; padding: 12px 0; font-size: 14px;">No upcoming follow-ups</div>`;
    } else {
      container.innerHTML = upcoming.map(f => {
        const isToday = new Date(f.date).toDateString() === new Date().toDateString();
        const isOverdue = new Date(f.date) < new Date();
        const borderColor = isOverdue ? '#f74a6c' : isToday ? '#f7a84a' : '#4A6CF7';
        const statusText = isOverdue ? 'Overdue' : isToday ? 'Today' : 'Scheduled';
        const statusColor = isOverdue ? '#f74a6c' : isToday ? '#f7a84a' : '#4A6CF7';
        const dayLabel = isToday ? 'Today' : isOverdue ? 'Overdue' : new Date(f.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        return `
          <div style="display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: #f9fbfd; border-radius: 10px; border-left: 3px solid ${borderColor};">
            <span style="font-size: 13px; font-weight: 600; color: #1a2639; min-width: 48px;">${dayLabel}</span>
            <div style="flex: 1; font-size: 14px; color: #1a2639;">
              ${f.clientName}
              <small style="display: block; font-size: 12px; color: #6b7a8f;">${f.title}</small>
            </div>
            <span style="font-size: 12px; color: ${statusColor}; font-weight: 500;">${statusText}</span>
          </div>
        `;
      }).join('');
    }
  }
}




function todaylistandcircle() {
  const allClients = api.getClients();

  // 1. Flatten all follow‑ups, adding clientName
  const allFollowups = allClients.flatMap(c =>
    (c.followups || []).map(f => ({
      ...f,
      clientName: c.name,
      clientId: c.id
    }))
  );

  // ---- Completion Rate ----
  const total = allFollowups.length;
  const done = allFollowups.filter(f => f.status === 'completed').length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  const circumference = 314.16;
  const dash = (percent / 100) * circumference;

  document.getElementById('followCompletionPercent').textContent = percent + '%';
  document.getElementById('followDoneCount').textContent = done;
  document.getElementById('followTotalCount').textContent = total;
  document.getElementById('followCompletionRing').setAttribute('stroke-dasharray', `${dash} ${circumference}`);

  // ---- Today's Queue ----
  const todayStr = new Date().toDateString();
  const todafollow = allFollowups
    .filter(f => f.status === 'scheduled' && new Date(f.date).toDateString() === todayStr)
    .sort((a, b) => (a.time || '00:00') > (b.time || '00:00') ? 1 : -1);

  const queueCount = document.getElementById('followQueueCount');
  const queueList = document.getElementById('followQueueList');

  queueCount.textContent = todafollow.length + ' items';

  if (todafollow.length === 0) {
    queueList.innerHTML = `<div style="color: #6b7a8f; text-align: center; padding: 12px 0; font-size: 14px;">No follow‑ups for today</div>`;
  } else {
    queueList.innerHTML = todafollow.map(f => `
      <div class="queue-item">
        <span class="time">${f.time || 'All day'}</span>
        <div class="info">
          ${f.clientName}
          <small>${f.title}</small>
        </div>
        <span class="priority-dot ${f.priority || 'medium'}"></span>
      </div>
    `).join('');
  }
}


// ----- Document Upload -----
const uploadBtn = document.getElementById('uploadDocBtn');
const fileInput = document.getElementById('documentInput');

uploadBtn?.addEventListener('click', () => {
  if (!selectedId) {
    alert('Please open a client profile first.');
    return;
  }
  fileInput.click();
});

fileInput?.addEventListener('change', function (e) {
  const files = this.files;
  if (!files.length) return;

  const client = api.getClientById(selectedId);
  if (!client) {
    alert('Client not found.');
    this.value = ''; // reset
    return;
  }

  // Process each file
  Array.from(files).forEach(file => {
    // Skip files larger than 2MB to avoid localStorage issues
    if (file.size > 2 * 1024 * 1024) {
      alert(`File "${file.name}" is too large (>2MB). Please upload a smaller file.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = function (loadEvent) {
      const dataUrl = loadEvent.target.result; // base64 data URL

      const newDoc = {
        id: api.generateId(),
        name: file.name,
        size: file.size,
        type: file.type,
        data: dataUrl,
        uploadedAt: new Date().toISOString()
      };

      if (!client.documents) client.documents = [];
      client.documents.push(newDoc);
      api.saveClients();
      renderDocuments(); // refresh the list
    };
    reader.readAsDataURL(file);
  });

  // Reset the input so the same file can be uploaded again
  this.value = '';
});


function renderDocuments() {
  const container = document.getElementById('documentList');
  const emptyState = document.getElementById('documentsEmpty');
  if (!container) return;

  const client = api.getClientById(selectedId);
  if (!client) {
    container.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  const docs = client.documents || [];
  container.innerHTML = '';

  if (docs.length === 0) {
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  docs.forEach(doc => {
    const card = document.createElement('div');
    card.className = 'document-card';

    // Format the file size
    const sizeStr = doc.size < 1024 ? doc.size + ' B' :
      doc.size < 1048576 ? (doc.size / 1024).toFixed(1) + ' KB' :
        (doc.size / 1048576).toFixed(1) + ' MB';

    const date = new Date(doc.uploadedAt).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });

    // Determine file icon based on type
    let icon = '📄';
    if (doc.type.startsWith('image/')) icon = '🖼️';
    else if (doc.type === 'application/pdf') icon = '📕';
    else if (doc.type.includes('word')) icon = '📘';
    else if (doc.type.includes('excel') || doc.type.includes('sheet')) icon = '📗';

    card.innerHTML = `
      <div class="document-card-left">
        <div class="document-card-title">
          <span class="file-icon">${icon}</span>
          ${doc.name}
        </div>
        <div class="document-card-meta">
          ${sizeStr} • Uploaded: ${date}
        </div>
      </div>
      <div class="document-card-actions">
        <button class="view-btn" data-id="${doc.id}">View</button>
        <button class="delete-btn" data-id="${doc.id}">Delete</button>
      </div>
    `;

    container.appendChild(card);

    // ---- View button ----
    card.querySelector('.view-btn').addEventListener('click', () => {
      // Open the file in a new tab
      window.open(doc.data, '_blank');
    });

    // ---- Delete button ----
    card.querySelector('.delete-btn').addEventListener('click', () => {
      if (!confirm(`Delete "${doc.name}"?`)) return;
      client.documents = client.documents.filter(d => d.id !== doc.id);
      api.saveClients();
      renderDocuments();
    });
  });
}




console.log({
  total: document.getElementById('dashTotalClients'),
  active: document.getElementById('dashActiveLeads'),
  recent: document.getElementById('recentClientsBody'),
  upcoming: document.getElementById('upcomingFollowups')
});

const profileName = document.querySelector('.profile-name');

function updateProfile() {
  const btn = document.getElementById('profilebtn');
  if (!btn) {
    console.warn('Button #profilebtn not found');
    return;
  }

  btn.addEventListener('click', () => {
    const name = document.getElementById('input-name').value;
    const email = document.getElementById('input-email').value;

    // Update sidebar
    if (profileName) profileName.textContent = name;

    // Save to localStorage (or your own storage)
    localStorage.setItem('user-name', name);
    localStorage.setItem('user-email', email);

    console.log('Profile updated:', name, email);
  });
}

// Load saved profile on page load
function loadProfile() {
  const savedName = localStorage.getItem('user-name');
  const savedEmail = localStorage.getItem('user-email');
  if (savedName) {
    document.getElementById('input-name').value = savedName;
    if (profileName) profileName.textContent = savedName;
  }
  if (savedEmail) {
    document.getElementById('input-email').value = savedEmail;
  }
}
// Call on page load
document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  updateProfile();
});



function refreshFollowPage() {
  renderglobalfollow();      // Re‑builds the table
  updatefollowcard();        // Updates Due / Overdue / Today / Completed KPI cards
  todaylistandcircle();      // Updates Completion Rate + Today's Queue
}
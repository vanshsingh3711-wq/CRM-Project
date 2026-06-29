// api.js
// ============================================================
//  DATA STORE & PERSISTENCE
// ============================================================

let clients = [];

export function getClients() {
  return clients;
}

export function getClientById(id) {
  return clients.find(c => c.id === id);
}

export function generateId() {
  return crypto.randomUUID();
}

export function loadClients() {
  const data = localStorage.getItem('clients');
  if (data) {
    clients = JSON.parse(data);
  }
  return clients;
}

export function saveClients() {
  localStorage.setItem('clients', JSON.stringify(clients));
}

export function addClient(clientData) {
  const newClient = {
    id: generateId(),
    name: clientData.name,
    email: clientData.email,
    number: clientData.number || '',
    business: clientData.business || '',
    status: 'lead',
    createdAt: new Date().toISOString(),
    notes: [],
    tasks: [],
  };
  clients.push(newClient);
  saveClients();
  return newClient;
}

export function updateClient(id, updatedData) {
  const index = clients.findIndex(c => c.id === id);
  if (index === -1) return null;
  clients[index] = { ...clients[index], ...updatedData };
  saveClients();
  return clients[index];
}

export function deleteClient(id) {
  const index = clients.findIndex(c => c.id === id);
  if (index === -1) return false;
  clients.splice(index, 1);
  saveClients();
  return true;
}

// ============================================================
//  GREETING & DATE HELPERS
// ============================================================

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function getGreeting(hours) {
  if (hours >= 5 && hours < 12) return 'Morning';
  if (hours >= 12 && hours < 17) return 'Afternoon';
  if (hours >= 17 && hours < 21) return 'Evening';
  return 'Night';
}

export function getCurrentDateInfo() {
  const now = new Date();
  return {
    greetingWord: getGreeting(now.getHours()),
    dayName: days[now.getDay()],
    monthName: months[now.getMonth()],
    date: now.getDate(),
    year: now.getFullYear(),
  };
}

export function gettotalclient(){
  return clients.length;
}

export function getactiveclients(){
  return clients.filter(c=> c.status === 'lead' || c.status === 'contacted' || 
    c.status === 'proposal').length
}

export function getclosedclient(){
  return clients.filter(c=> c.status ==='closed').length
}

export function totalpercent(){
const total = clients.length;
if(total === 0)return 0;
const close = getclosedclient();
return Math.round((close/total)*100)
}
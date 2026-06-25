console.log("UI loaded!");

// ui.js
// This MUST be line 1 of ui.js
import { loadclients, getClients , getGreeting} from './api.js';

// 2. Grab the table body from your HTML
const table = document.querySelector("#clientTableBody");

export function renderClients(){
    const clients = getClients();

    if (clients.length === 0){
        table.innerHTML = `<tr><td colspan="6">No clients found</td></tr>`;
        return;
    }
    const htmlString = clients.map(client => `
        <tr>
            <td>${client.name}</td>
            <td>${client.business || 'N/A'}</td>
            <td>${client.number || 'N/A'}</td>
            <td>${client.email}</td>
            <td> <span class="status ${client.status}">${client.status}</span></td>
            <td class="actions">
                <button class="view">View</button>
                <button class="edit">Edit</button>
                <button class="delete" data-id="${client.id}">Delete</button>
            </td>
        </tr>
    `).join('')
    table.innerHTML =htmlString;
}
loadclients();
renderClients();


export function setupNavigation() {
    // 1. Select only the elements needed for navigation
    const navItems = document.querySelectorAll(".nav-item");
    const sidebar = document.querySelector(".sidebar");
    const btn = document.querySelector(".menuBtn");

    // 2. Sidebar Toggle Logic
    if (btn && sidebar) {
        btn.addEventListener("click", () => {
            sidebar.classList.toggle("close");
            console.log("Sidebar status:", sidebar.className);
        });
    }

    // 3. View Switching Logic
    navItems.forEach((item) => {
        item.addEventListener("click", (e) => {
            const targetViewId = item.getAttribute("data-target");
            
            if (targetViewId) {
                e.preventDefault();
                
                // Remove active class from all, add to clicked
                navItems.forEach((x) => x.classList.remove("active"));
                item.classList.add("active");

                // Hide all views, show the target view
                document.querySelectorAll(".view-section").forEach((view) => {
                    view.style.display = "none";
                });
                document.getElementById(targetViewId).style.display = "block";
            }
        });
    });
}
                                                    // Client list Displayinf Function 


export function renderClientList(clientsToDisplay) {
    const tableBody = document.querySelector("#clientTableBody"); // Assuming this is your target
    tableBody.innerHTML = clientsToDisplay.map(client => `
         <tr>
            <td>${client.name}</td>
            <td>${client.business || 'N/A'}</td>
            <td>${client.number || 'N/A'}</td>
            <td>${client.email}</td>
            <td> <span class="status ${client.status}">${client.status}</span></td>
            <td class="actions">
                <button class="view">View</button>
                <button class="edit">Edit</button>
                <button class="delete" data-id="${client.id}">Delete</button>
            </td>
        </tr>
    `).join("");
}

setupNavigation();
function searchf(){
    const clients = getClients();
const search = document.querySelector("#searchBox")
search.addEventListener("input", () => {
    const searchtext = search.value;
    const filterclient = clients.filter(client => {
        const nameMatch = client.name.toLowerCase().includes(searchtext);
        const businessMatch = (client.business || "").toLowerCase().includes(searchtext);
        const emailMactch = client.email.toLowerCase().includes(searchtext);
        return nameMatch || businessMatch || emailMactch;

    })
    renderClientList(filterclient);

})

};
searchf(); 

                                                            // time fucntion 
function display() {
    const now = new Date();
    const greetingWord = getGreeting(now.getHours());

    const dayName = days[now.getDay()];
    const monthName = months[now.getMonth()];
    const dateinfo = ` 📅${dayName} ,${monthName} ${now.getDate()}, ${now.getFullYear()}`

    greeting.innerHTML = `Good ${greetingWord}, Alex`;
    datebox.textContent = dateinfo;
}
display();
setInterval(display, 30000);
document.addEventListener("visibilitychange", function () {
    if (!document.hidden)
        display();
});
display();
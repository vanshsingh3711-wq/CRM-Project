// ----------------------------------------------//--Client data sytem--//--------------------------------------------------//

const clients = [];    //--to store client data--//
function loadclients() {
    let data = localStorage.getItem("clients");
    if (data !== null) {
        clients.push(...JSON.parse(data));

    }
    renderclient();
    
};


function saveclients() { localStorage.setItem("clients", JSON.stringify(clients)) };
function generateid() {
    return crypto.randomUUID();
}


const app = document.querySelector(".class")
const navItems = document.querySelectorAll(".nav-item");
const sidebar = document.querySelector(".sidebar")
const btn = document.querySelector(".menuBtn")
const search = document.querySelector("#searchBox")
btn.addEventListener("click", () => {
    sidebar.classList.toggle("close")
    console.log(sidebar.className);
})
navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
        const targetViewId = item.getAttribute("data-target");
        if (targetViewId) {
            e.preventDefault();
            navItems.forEach((x) => x.classList.remove("active"))
            item.classList.add("active");

            document.querySelectorAll(".view-section").forEach((view) => {
                view.style.display = "none"
            })
            document.getElementById(targetViewId).style.display = "block";

        }
    })
})



document.getElementById("logoutBtn").addEventListener("click", (e) => {
    e.preventDefault();
    alert("Logout clicked");
});

search.addEventListener("input", () => {
    const searchtext = search.value;
    const filterclient = clients.filter(client => {
        const nameMatch = client.name.toLowerCase().includes(searchtext);
        const businessMatch = (client.business || "").toLowerCase().includes(searchtext);
        const emailMactch = client.email.toLowerCase().includes(searchtext);
        return nameMatch || businessMatch || emailMactch;

    })
    renderclient(filterclient);

})


//---------------------------------------------------Greeting and calender featues---//--------------------------------------//

const greeting = document.querySelector(".greeting"); // The "Good Morning" text
const datebox = document.querySelector(".datebox"); // The "Monday, June 15, 2026" text

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];


function getGreeting(hours) {
    if (hours >= 5 && hours < 12) return 'Morning';   // 5 AM to 11:59 AM
    if (hours >= 12 && hours < 17) return 'Afternoon'; // 12 PM to 4:59 PM
    if (hours >= 17 && hours < 21) return 'Evening';   // 5 PM to 8:59 PM
    return 'Night'; // Anything else (9 PM to 4:59 AM)

}
//calender //


// render function to display time // 

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


//  --------------------------------------------- //--Quick button function--//----------------------------------------------------//


const quickbtn = document.querySelectorAll(".btn")
const clientBox = document.getElementById("clientBox");
const closeBtn = clientBox.querySelector(".closeBtn");
const clientPaper = document.getElementById("clientPaper");
quickbtn.forEach((button) => {
    button.addEventListener("click", () => {
        clientBox.style.display = "block"
    });
});

closeBtn.addEventListener("click", () => {
    clientBox.style.display = "none";
})

window.addEventListener("click", (e) => {
    if (e.target === clientBox) {
        clientBox.style.display = "none"; // click outside closes box
    }
});

clientPaper.addEventListener("submit", (e) => {
    e.preventDefault();

    const newclient = {
        id: generateid(),
        name: clientPaper.name.value,
        email: clientPaper.email.value,
        number: clientPaper.number.value,
        business: clientPaper.business.value,
        status: "lead",
        createdat: new Date().toISOString()
    };
    clients.push(newclient);    //client data  
    // alert("Client added successfully!");
    clientBox.style.display = "none"; // close box
    clientPaper.reset(); // clear paper
    saveclients();
    renderclient();
})
console.log(clients)

// ---------------------------------------------------edit button----------------------------------------------------------------//

// const edit = document.querySelector(".edit")
let editBox = document.getElementById("editBox")
const editContent = document.querySelector(".editContent")
const existbtn = document.querySelector(".existbtn")
const editForm = document.getElementById("editform")


existbtn.addEventListener("click", () => {
    editBox.style.display = "none"
})

window.addEventListener("click", (e) => {
    if (e.target === editBox) {
        editBox.style.display = "none";
    }
})

editForm.addEventListener("submit", (e) => {
    const clientId = editForm.dataset.clientId;
    const clientIndex = clients.findIndex(c => c.id === clientId);
    e.preventDefault();

    clients[clientIndex].name = editForm.name.value;
    clients[clientIndex].email = editForm.email.value;
    clients[clientIndex].number = editForm.number.value;
    clients[clientIndex].business = editForm.business.value;
    editBox.style.display = "none";


    saveclients();
    renderclient();

})


document.querySelector(".deal").addEventListener("click", () => {
    const clientId = editForm.dataset.clientId;
    const index = clients.findIndex(c => c.id === clientId);
    if (index === -1) return;
    clients[index].status = "closed";
    editBox.style.display = "none";
    saveclients();
    renderclient();



})

// --------------- Renderclientdetail -------------------//

function renderClientdetail(client){
    if (!client)return; 
        
    
document.querySelector(".client-name").textContent = client.name;
document.querySelector(".client-email").textContent = client.email;
document.querySelector(".client-number").textContent = client.number;
document.querySelector(".client-company").textContent = client.business || "NA";

// document.querySelector(".over-business").textContent = client.business || "NA";
document.querySelector(".over-business").textContent = client.name;
document.querySelector(".over-email").textContent = client.email;
document.querySelector(".over-number").textContent = client.number;


document.querySelectorAll(".view-section").forEach((view)=>{
    view.style.display = "none"
})
document.getElementById("clients-detail").style.display = "block";

 } 
 
 





// ----------------------------------------------------------renderfunction---------------------------------------------------//

function renderclient(dataToRender = clients) {
    const table = document.querySelector("#clientTableBody")
    if (!table) return;
    table.innerHTML = "";
    if (dataToRender.length === 0) {
        table.innerHTML = `<tr><td colspan="6">No clients found</td></tr>`;
        return;
    }
    dataToRender.forEach(client => {                           //to asign each client to their row we used 'for each'
        let tr = document.createElement("tr");
        tr.innerHTML = `
    <td>${client.name}</td>
    <td>${client.business || 'N/A'}</td>
    <td>${client.number || 'N/A'}</td>
    <td>${client.email}</td>
    <td> <span class="status ${client.status}">${client.status}</span></td>
    <td class="actions">
            <button class="view">View</button>
            <button class="edit">Edit</button>
            <button class="delete" title="Delete Client">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
         
                   <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
            </button>
            </td>
    `;
        table.appendChild(tr);

        let deletebtn = tr.querySelector(".delete")
        deletebtn.addEventListener("click", () => {
            dbtnClient(client.id);
            search.value = "";
        });

        const edit = tr.querySelector(".edit")
        edit.addEventListener("click", () => {

            editForm.dataset.clientId = client.id;
            editBox.style.display = "block"
            editForm.name.value = client.name;
            editForm.email.value = client.email;
            editForm.number.value = client.number || "";
            editForm.business.value = client.business || "";

        })
       let viewbtn = tr.querySelector(".view")
        const vbox = document.querySelector(".vbox")

        viewbtn.addEventListener("click", () => {
          
            renderClientdetail(client);
        })

    });

};

loadclients();

function dbtnClient(idToErase) {
    let clientindex = clients.findIndex(c => c.id === idToErase);
    if (clientindex !== -1) {
        clients.splice(clientindex, 1)
        saveclients();
        renderclient();
    }
}










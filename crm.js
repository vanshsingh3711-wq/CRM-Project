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
        createdat: new Date().toISOString(),
        notes: [],
        tasks: [],
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

const editClientDetailBtn = document.querySelector(".edit-client-btn");

editClientDetailBtn.addEventListener("click", () => {
    // 1. Find the currently viewed client (using selectedId)
    const client = clients.find(c => c.id === selectedId);
    if (!client) {
        alert("No client selected");
        return;
    }
    editForm.dataset.clientId = client.id;
    editForm.name.value = client.name;
    editForm.email.value = client.email;
    editForm.number.value = client.number || "";
    editForm.business.value = client.business || "";
    editBox.style.display = "block";
    renderClientdetail();
    saveclients();
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

function renderClientdetail(client) {
    if (!client) return;


    document.querySelector(".client-name").textContent = client.name;
    document.querySelector(".client-email").textContent = client.email;
    document.querySelector(".client-number").textContent = client.number;
    document.querySelector(".client-company").textContent = client.business || "NA";

    // document.querySelector(".over-business").textContent = client.business || "NA";
    document.querySelector(".over-business").textContent = client.name;
    document.querySelector(".over-email").textContent = client.email;
    document.querySelector(".over-number").textContent = client.number;


    document.querySelectorAll(".view-section").forEach((view) => {
        view.style.display = "none"
    })
    document.getElementById("clients-detail").style.display = "block";
    document.querySelector(".back-link").addEventListener("click",()=>{document.getElementById("clients-detail").style.display = "none";
        document.getElementById("clients-view").style.display = "block";
    })

};

//   ----Note Button----//


const notebtn = document.querySelector(".notebtn");
const tabbtn = document.querySelector(".tabs button")
const overactive = document.querySelector(".tabs .active")

document.querySelectorAll(".tabs button").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".content-page").forEach(page => {
            page.style.display = "none"

        }); ``
        const target = btn.dataset.target;
        console.log(target);
        document.querySelectorAll(".tabs button").forEach((x) => {
            x.classList.remove("active");
        });

        document.getElementById(target).style.display = "block";
        document.getElementById(target).classList.add("active");
        btn.classList.add("active")

    });
});



const noteModal = document.getElementById("noteModal");
const noteModalClose = document.getElementById("noteModalClose");
const noteCancelBtn = document.getElementById("noteCancelBtn");
const noteForm = document.getElementById("noteForm");
const notetitle = document.querySelector("#noteTitle");
const notecontent = document.querySelector("#noteText");
const notecategory = document.querySelector("#noteCategory");
const noteimpt = document.querySelector("#notePriority");
let selectedId = null;
const addbtn = document.querySelector("#addNoteBtn");
const closenote = document.querySelector(".note-modal-close")

addbtn.addEventListener("click", () => {
    noteModal.style.display = "block";
})
closenote.addEventListener("click", () => {
    noteModal.style.display = "none";
})
noteCancelBtn.addEventListener("click", () => {
    noteModal.style.display = "none";
});


noteForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const client = clients.find(c => c.id === selectedId);

    if (!notecontent || !notecontent.value.trim()) {
        alert("Please write some content for your note.");
        return;
    };



    const newnote = {
        id: crypto.randomUUID(),
        title: notetitle.value,
        content: notecontent.value,
        category: notecategory.value,
        impt: noteimpt.value,
        createdAt: new Date().toISOString()
    }
    if (!client.notes) {
        client.notes = [];
    }
    client.notes.push(newnote);
    noteForm.reset();
    saveclients();
    rendernote();
    noteModal.style.display = "none";

})


// NOTE RENDER FUNCTION 

function rendernote() {
    // 1. Find the client
    const client = clients.find(c => c.id === selectedId);

    // 2. Safety check - STOP if no client
    if (!client) {

        console.warn("No client found. Can't show notes.");
        const notesList = document.getElementById("notesList");
        if (notesList) {
            notesList.innerHTML = "<p style='color: #888;'>Please select a client first.</p>";
        }
        return; // ← IMPORTANT: Stop here!
    }

    // 3. Get the notes list container
    const notesList = document.getElementById("notesList");
    if (!notesList) {
        console.error("notesList not found in HTML.");
        return;
    };

    // 4. Clear it
    notesList.innerHTML = "";

    // 5. Show "No notes" message if empty
    if (!client.notes || client.notes.length === 0) {
        notesList.innerHTML = `<p style="color: #888; padding: 10px 0;">No notes yet. Click "Add Note" to get started.</p>`;
        return;
    }

    // 6. Loop through each note and display it
    client.notes.forEach(note => {
        // Create container for this note
        const noteDiv = document.createElement("div");
        noteDiv.style.cssText = `
            padding: 12px 0;
            border-bottom: 1px solid #eee;
        `;

        // Format the date
        const date = new Date(note.createdAt);
        const formattedDate = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        // Fill with content
        noteDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <strong>${note.title || "Untitled"}</strong>
                    <p style="margin: 4px 0; color: #555;">${note.content || ""}</p>
                    <small style="color: #999;">
                        📂 ${note.category || "General"} • 
                        ⚡ ${note.impt || "Medium"} • 
                        📅 ${formattedDate}
                    </small>
                </div>
                <button class="delete-note-btn" data-note-id="${note.id}" style="
                    background: none;
                    border: none;
                    color: #f74a6c;
                    cursor: pointer;
                    font-size: 30px;
                ">🗑</button>
            </div>
        `;

        // Add to the list
        notesList.appendChild(noteDiv);
        const deletenote = noteDiv.querySelector(".delete-note-btn")
        deletenote.addEventListener("click", () => {
            delenote(note.id);

        })


    });
}


// TASK BUTTON 

const taskbtn = document.querySelector("#addTaskBtn");
const tabs = document.querySelector(".tabs");
const taskback = document.getElementById("taskModal");
const closetask = document.querySelector(".close-task")
taskbtn.addEventListener("click", () => {
    if (!selectedId) {
        alert("Please Selecte client first")
        return;
    }
    taskId = selectedId;
    taskback.style.display = "block"
});
closetask.addEventListener("click", () => {
    taskback.style.display = "none"
});


window.addEventListener("click", (e) => {
    if (e.target === taskback) {
        taskback.style.display = "none"; // click outside closes box
    }
});
// TASK MODAL 

const taskform = document.querySelector("#taskForm");
const tasktitile = document.querySelector("#taskTitle");
const tasktext = document.querySelector("#taskDescription");
const taskdate = document.querySelector("#taskDate");
const taskimpt = document.querySelector("#taskPriority");
let taskId = null;

taskform.addEventListener("submit", (e) => {
    e.preventDefault();
    const client = clients.find(c => c.id === taskId);
    console.log(taskId);
    console.log(client);
    if (!client) {
        alert("No client Foubnd")
        return;
    };

    if (!tasktext || !tasktext.value.trim()) {
        alert("Please write content for your task")
    };
    const newtask = {
        id: crypto.randomUUID(),
        title: tasktitile.value,
        description: tasktext.value,
        date: taskdate.value,
        Priority: taskimpt.value
    }
    console.log(newtask);
    if (!client.tasks) client.tasks = []
    client.tasks.push(newtask);
    console.log(client)
    saveclients();
    rendertask();
    taskform.reset();
    taskback.style.display = "none"


});

// TASK RENDER FUNCTION 

function rendertask() {
    const client = clients.find(c => c.id === selectedId);
    const taskList = document.getElementById("taskList");
    if (!taskList) return;

    // Clear it
    taskList.innerHTML = "";

    // If no client or no tasks, show a message
    if (!client || !client.tasks || client.tasks.length === 0) {
        taskList.innerHTML = `<p style="color: #888; padding: 10px 0;">No tasks yet.</p>`;
        return;
    }

    // ✅ Build the HTML string
    let html = "";
    client.tasks.forEach(task => {
        const duedate = task.date
            ? new Date(task.date).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })
            : "No due date";
        const priorityClass = (task.Priority || "medium").toLowerCase();

        // ✅ Add this task's HTML to the big string
        html += `
            <div class="task-card">
                <div class="task-top">
                    <div>
                        <h4>${task.title || "Untitled Task"}</h4>
                        <p>${task.description || ""}</p>
                    </div>
                    <span class="priority ${priorityClass}">${task.Priority || "Medium"}</span>
                </div>
                <div class="task-bottom">
                    <span>📅 ${duedate}</span>
                    <div class="task-actions">
                        <button class="delete-task" data-task-id="${task.id}" title="Delete task">🗑</button>
                    </div>
                </div>
            </div>
        `;
    });

    // ✅ Write it ALL to the page at once
    taskList.innerHTML = html;

    // Add delete listeners
    document.querySelectorAll(".delete-task").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const taskId = e.currentTarget.dataset.taskId;
            deleteTask(taskId);
        });
    });
}

// Delete function
function deleteTask(taskId) {
    const client = clients.find(c => c.id === selectedId);
    if (!client) return;
    const taskindex = client.tasks.findIndex(t => t.id === taskId);
    client.tasks.splice(taskindex, 1);
    saveclients();
    rendertask();
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
            selectedId = client.id;
            renderClientdetail(client);
            rendernote();
            rendertask();
            document.querySelectorAll(".tabs button").forEach(b => b.classList.remove("active"));
            document.querySelector('.tabs button[data-target="overview"]').classList.add("active");

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
};

function delenote(noteId) {
    const client = clients.find(c => c.id === selectedId);
    if (!client) return;

    const noteindex = client.notes.findIndex(n => n.id === noteId);
    if (noteindex !== -1) {
        client.notes.splice(noteindex, 1);
        saveclients();
        rendernote();
    }
}

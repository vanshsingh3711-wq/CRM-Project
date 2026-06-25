// api.js
 let clients = [];
 export function getClients(){
    return clients;
 };
 export function generatedId(){
    return crypto.randomUUID();
 }
 export function loadclients(){
    let data = localStorage.getItem("clients")
    if (data !== null) {
        clients = JSON.parse(data);
    }return clients;
 };

 export function saveClients(){
    localStorage.setItem("clients" , JSON.stringify(clients))
 };




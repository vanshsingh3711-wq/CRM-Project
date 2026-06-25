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



const greeting = document.querySelector(".greeting"); // The "Good Morning" text
const datebox = document.querySelector(".datebox"); // The "Monday, June 15, 2026" text

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];


 export function getGreeting(hours) {
    if (hours >= 5 && hours < 12) return 'Morning';   // 5 AM to 11:59 AM
    if (hours >= 12 && hours < 17) return 'Afternoon'; // 12 PM to 4:59 PM
    if (hours >= 17 && hours < 21) return 'Evening';   // 5 PM to 8:59 PM
    return 'Night'; // Anything else (9 PM to 4:59 AM)

}
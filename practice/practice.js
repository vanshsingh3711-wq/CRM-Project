const btn = document.getElementById("btn");
const sidebar = document.querySelector(".sidebar");

btn.addEventListener("click", () => {
    sidebar.classList.toggle("close");

    console.log(sidebar.className);
});
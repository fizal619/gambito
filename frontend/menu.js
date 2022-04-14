const menuItems = document.querySelectorAll("#menu a");
const pages = document.querySelectorAll(".page");

function clearMenu() {
  menuItems.forEach(
    item => item.parentElement.classList.remove("is-active")
  );
}

function hidePages() {
  pages.forEach(page =>
    page.style.display = "none"
  );
}

menuItems.forEach(item => {
  item.addEventListener("click", e => {
    console.log('clicked :>> ', e.target.id);
    clearMenu();
    e.target.parentElement.classList.add("is-active");
    const page = document.querySelector(`.${e.target.id}`);
    console.log('page :>> ', page);
    hidePages();
    page.style.display = "block";
  });
});

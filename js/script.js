mdc.topAppBar.MDCTopAppBar.attachTo(document.querySelector('header.mdc-top-app-bar'));

const drawer = mdc.drawer.MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));

const hideViews = () => {
  document.querySelectorAll("div.view").forEach( (item) => {
    item.style.display = "none";
  })
}


document.querySelector(".mdc-top-app-bar__navigation-icon")
  .addEventListener("click", 
      (e) => {drawer.open = true;}
  );

document.querySelectorAll('aside.mdc-drawer a.mdc-list-item')
  .forEach(item => {
    item.addEventListener('click', event => {

      hideViews();
      let target = item.getAttribute("href");
      document.querySelector(target).style.display = "block";
      drawer.open = false;

      //handle click
    })
})
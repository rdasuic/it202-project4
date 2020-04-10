mdc.topAppBar.MDCTopAppBar.attachTo(document.querySelector('header.mdc-top-app-bar'));

const drawer = mdc.drawer.MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));
let allData = {}; // global var for all of the data loaded from the api
// load the data from the api
fetch("https://pomber.github.io/covid19/timeseries.json")
  .then(response => response.json())
  .then(data => {
    allData = data;
    // populate the data list element
    const dataListEl = document.querySelector('#country-data-list');
    Object.keys(allData).map((countryName) => {
        let optionEl = document.createElement("option");
        optionEl.setAttribute("value", countryName);
        dataListEl.appendChild(optionEl);
    });
});

const hideViews = () => {
  document.querySelectorAll("div.view").forEach((item) => {
    item.style.display = "none";
  });
}


document.querySelector(".mdc-top-app-bar__navigation-icon")
  .addEventListener("click", () => drawer.open = true);

document.querySelectorAll('aside.mdc-drawer a.mdc-list-item')
  .forEach((item) => {
    item.addEventListener('click', () => {
      hideViews();
      let target = item.getAttribute("href");
      document.querySelector(target).style.display = "block";
      drawer.open = false;
    });
});
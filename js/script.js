mdc.topAppBar.MDCTopAppBar.attachTo(document.querySelector('header.mdc-top-app-bar'));

const drawer = mdc.drawer.MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));
const searchView = document.querySelector('#search-view');
const listView = document.querySelector('#list-view');
const chartView = document.querySelector('#chart-view');
const searchViewNavBarLinkEl = document.querySelector('#search-view-link');
const listViewNavBarLinkEl = document.querySelector('#list-view-link');
const chartViewNavBarLinkEl = document.querySelector('#chart-view-link');
const confirmedCheckboxEl = document.querySelector('#confirmed-checkbox');
const deathsCheckboxEl = document.querySelector('#deaths-checkbox');
const recoveredCheckboxEl = document.querySelector('#recovered-checkbox');
const countryInputEl = document.querySelector('#country-input');
const errorDialogEl = document.querySelector('#mdc-dialog-chart-error');
const errorDialog = new mdc.dialog.MDCDialog(errorDialogEl);
const viewChartBtnEl = document.querySelector('#view-chart-btn');
mdc.ripple.MDCRipple.attachTo(viewChartBtnEl);
const confirmedCheckbox = new mdc.checkbox.MDCCheckbox(confirmedCheckboxEl);
const recoveredCheckbox = new mdc.checkbox.MDCCheckbox(recoveredCheckboxEl);
const deathsCheckbox = new mdc.checkbox.MDCCheckbox(deathsCheckboxEl);
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

viewChartBtnEl.addEventListener('click', () => {
    if(countryInputEl.value == '' || (!confirmedCheckbox.checked && !deathsCheckbox.checked && !recoveredCheckbox.checked)) {
        errorDialog.open();
    }
    else {
        const countryData = allData[countryInputEl.value];
        searchView.style.display = "none";
        chartView.style.display = "block";    
    }
});

const hideViews = () => {
    document.querySelectorAll("div.view").forEach((item) => {
        item.style.display = "none";
    });
}


document.querySelector(".mdc-top-app-bar__navigation-icon")
  .addEventListener("click", () => drawer.open = true);

document.querySelectorAll('aside.mdc-drawer a.mdc-list-item').forEach((item) => {
    item.addEventListener('click', () => {
        hideViews();
        let target = item.getAttribute("href");
        document.querySelector(target).style.display = "block";
        drawer.open = false;
    });
});
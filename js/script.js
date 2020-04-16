mdc.topAppBar.MDCTopAppBar.attachTo(document.querySelector('header.mdc-top-app-bar'));

const searchView = document.querySelector('#search-view');
const listView = document.querySelector('#list-view');
const chartView = document.querySelector('#chart-view');
const topBarLinks = document.querySelectorAll('.mdc-top-app-bar__action-item');
const confirmedCheckboxEl = document.querySelector('#confirmed-checkbox');
const deathsCheckboxEl = document.querySelector('#deaths-checkbox');
const recoveredCheckboxEl = document.querySelector('#recovered-checkbox');
const countryInputEl = document.querySelector('#country-input');
const errorDialogEl = document.querySelector('#mdc-dialog-chart-error');
const errorDialog = new mdc.dialog.MDCDialog(errorDialogEl);
const coronaChartCanvas = document.querySelector('#corona-chart').getContext('2d');
const viewChartBtnEl = document.querySelector('#view-chart-btn');
const noDataErrEls = document.querySelectorAll('.no-data-error');
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
        const chartLabels = countryData.map((data) => data.date); // grabs all the dates from each obj
        const chartDataConfirmed = countryData.map((data) => data.confirmed);
        const chartDataRecovered = countryData.map((data) => data.recovered);
        const chartDataDeaths = countryData.map((data) => data.deaths);
        const chartConfirmedDataset = {
                    label: 'Confirmed',
                    data: chartDataConfirmed,
                    fill: false,
                    borderColor: 'orange',
                    pointBackgroundColor: 'orange'
                }
        const chartRecoveredDataset = {
                    label: 'Recovered',
                    data: chartDataRecovered,
                    fill: false,
                    borderColor: 'green',
                    pointBackgroundColor: 'green'
                }
        const chartDeathsDataset = {
                    label: 'Deaths',
                    data: chartDataDeaths,
                    fill: false,
                    borderColor: 'red',
                    pointBackgroundColor: 'red'
                }
        const chartConfig = {
            type: 'line',
            data: {
                labels: chartLabels,
                datasets: []
            },
            options: {
                responsive: true
            }
        }
        if(confirmedCheckbox.checked) chartConfig.data.datasets.push(chartConfirmedDataset);
        if (recoveredCheckbox.checked) chartConfig.data.datasets.push(chartRecoveredDataset);
        if (deathsCheckbox.checked) chartConfig.data.datasets.push(chartDeathsDataset);
        new Chart(coronaChartCanvas, chartConfig);
        hideNoDataErrs();
        searchView.style.display = "none";
        chartView.style.display = "block";    
    }
});

const hideViews = () => {
    document.querySelectorAll("div.view").forEach((item) => {
        item.style.display = "none";
    });
}
const hideNoDataErrs = () => {
    noDataErrEls.forEach((el) => {
        el.style.display = 'none';
    })
}



topBarLinks.forEach((item) => {
    item.addEventListener('click', () => {
        hideViews();
        let target = item.getAttribute("href");
        document.querySelector(target).style.display = "block";
    });
})
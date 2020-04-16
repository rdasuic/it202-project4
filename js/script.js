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
const addCountryBtnEl = document.querySelector('#add-country-btn');
const noDataErrEls = document.querySelectorAll('.no-data-error');
const selectedCountriesListEl = document.querySelector('.selected-countries-list');
mdc.ripple.MDCRipple.attachTo(viewChartBtnEl);
mdc.ripple.MDCRipple.attachTo(addCountryBtnEl);
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
        generateDataTable(countryData);
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

addCountryBtnEl.addEventListener('click', () =>{
    if(countryInputEl.value == '') {
        errorDialog.open();
    }
    else {
        showCountriesDataTable();
        addCountryToList();
    }
    
})

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
const generateDataTable = (countryData) => {
    const dataTableBody = document.querySelector('#cases-list-content');
    dataTableBody.textContent = '';
    countryData.map((dayStats) => {
        let row = document.createElement('tr');
        row.classList.add('mdc-data-table__row');
        let dateCell = document.createElement('td');
        dateCell.classList.add('mdc-data-table__cell');
        let confirmedCell = document.createElement('td');
        confirmedCell.classList.add('mdc-data-table__cell');
        let deathsCell = document.createElement('td');
        deathsCell.classList.add('mdc-data-table__cell');
        let recoveredCell = document.createElement('td');
        recoveredCell.classList.add('mdc-data-table__cell');
        dateCell.textContent = dayStats.date;
        confirmedCell.textContent = dayStats.confirmed;
        deathsCell.textContent = dayStats.deaths;
        recoveredCell.textContent = dayStats.recovered;
        row.appendChild(dateCell);
        row.appendChild(confirmedCell);
        row.appendChild(deathsCell);
        row.appendChild(recoveredCell);
        dataTableBody.appendChild(row);
    });
}
const showCountriesDataTable = () => {
    selectedCountriesListEl.style.display = "block";
}
const addCountryToList = () => {
    const selectedCountriesListTableBody = document.querySelector('#country-list-content');
    const selectedCountry = countryInputEl.value;
    // clear the input so the user can continue adding new countries
    countryInputEl.value = '';
    let row = document.createElement('tr');
    row.classList.add('mdc-data-table__row');
    const formDiv = document.createElement('div');
    formDiv.classList.add('mdc-form-field');
    let countryNameCell = document.createElement('td');
    countryNameCell.classList.add('mdc-data-table__cell');
    let confirmedCell = document.createElement('td');
    confirmedCell.classList.add('mdc-data-table__cell');
    
    const confirmedRadioDiv = document.createElement('div');
    confirmedRadioDiv.classList.add('mdc-radio');
    const confirmedRadioInput = document.createElement('input');
    confirmedRadioInput.classList.add('mdc-radio__native-control');
    confirmedRadioInput.setAttribute('type', 'radio');
    confirmedRadioInput.setAttribute('name', selectedCountry + '-radio');
    confirmedRadioInput.setAttribute('checked', true);
    confirmedRadioInput.id = 'confirmed-radio';
    const confirmedRadioBgDiv = document.createElement('div');
    confirmedRadioBgDiv.classList.add('mdc-radio__background');
    const confirmedRadioOuterCirleDiv = document.createElement('div');
    confirmedRadioOuterCirleDiv.classList.add('mdc-radio__outer-circle');
    const confirmedRadioInnerCirleDiv = document.createElement('div');
    confirmedRadioInnerCirleDiv.classList.add('mdc-radio__inner-circle');
    const confirmedRadioRippleDiv = document.createElement('div');
    confirmedRadioRippleDiv.classList.add('mdc-radio__ripple');
    confirmedRadioBgDiv.appendChild(confirmedRadioOuterCirleDiv);
    confirmedRadioBgDiv.appendChild(confirmedRadioInnerCirleDiv);
    confirmedRadioDiv.appendChild(confirmedRadioInput);
    confirmedRadioDiv.appendChild(confirmedRadioBgDiv);
    confirmedRadioDiv.appendChild(confirmedRadioRippleDiv);
    formDiv.appendChild(confirmedRadioDiv);
    
    let deathsCell = document.createElement('td');
    deathsCell.classList.add('mdc-data-table__cell');
    
    const deathsRadioDiv = document.createElement('div');
    deathsRadioDiv.classList.add('mdc-radio');
    const deathsRadioInput = document.createElement('input');
    deathsRadioInput.classList.add('mdc-radio__native-control');
    deathsRadioInput.setAttribute('type', 'radio');
    deathsRadioInput.setAttribute('name', selectedCountry + '-radio');
    deathsRadioInput.id = 'deaths-radio';
    const deathsRadioBgDiv = document.createElement('div');
    deathsRadioBgDiv.classList.add('mdc-radio__background');
    const deathsRadioOuterCirleDiv = document.createElement('div');
    deathsRadioOuterCirleDiv.classList.add('mdc-radio__outer-circle');
    const deathsRadioInnerCirleDiv = document.createElement('div');
    deathsRadioInnerCirleDiv.classList.add('mdc-radio__inner-circle');
    const deathsRadioRippleDiv = document.createElement('div');
    deathsRadioRippleDiv.classList.add('mdc-radio__ripple');
    deathsRadioBgDiv.appendChild(deathsRadioOuterCirleDiv);
    deathsRadioBgDiv.appendChild(deathsRadioInnerCirleDiv);
    deathsRadioDiv.appendChild(deathsRadioInput);
    deathsRadioDiv.appendChild(deathsRadioBgDiv);
    deathsRadioDiv.appendChild(deathsRadioRippleDiv);
    formDiv.appendChild(deathsRadioDiv);
    
    let recoveredCell = document.createElement('td');
    recoveredCell.classList.add('mdc-data-table__cell');
    
    const recoveredRadioDiv = document.createElement('div');
    recoveredRadioDiv.classList.add('mdc-radio');
    const recoveredRadioInput = document.createElement('input');
    recoveredRadioInput.classList.add('mdc-radio__native-control');
    recoveredRadioInput.setAttribute('type', 'radio');
    recoveredRadioInput.setAttribute('name', selectedCountry + '-radio');
    recoveredRadioInput.id = 'recovered-radio';
    const recoveredRadioBgDiv = document.createElement('div');
    recoveredRadioBgDiv.classList.add('mdc-radio__background');
    const recoveredRadioOuterCirleDiv = document.createElement('div');
    recoveredRadioOuterCirleDiv.classList.add('mdc-radio__outer-circle');
    const recoveredRadioInnerCirleDiv = document.createElement('div');
    recoveredRadioInnerCirleDiv.classList.add('mdc-radio__inner-circle');
    const recoveredRadioRippleDiv = document.createElement('div');
    recoveredRadioRippleDiv.classList.add('mdc-radio__ripple');
    recoveredRadioBgDiv.appendChild(recoveredRadioOuterCirleDiv);
    recoveredRadioBgDiv.appendChild(recoveredRadioInnerCirleDiv);
    recoveredRadioDiv.appendChild(recoveredRadioInput);
    recoveredRadioDiv.appendChild(recoveredRadioBgDiv);
    recoveredRadioDiv.appendChild(recoveredRadioRippleDiv);
    formDiv.appendChild(recoveredRadioDiv);
    formDiv.id = `${selectedCountry}-form`;
    
    countryNameCell.textContent = selectedCountry;
    row.appendChild(countryNameCell);
    row.appendChild(confirmedCell);
    row.appendChild(deathsCell);
    row.appendChild(recoveredCell);
    
    
    
    
    confirmedCell.appendChild(confirmedRadioDiv);
    deathsCell.appendChild(deathsRadioDiv);
    recoveredCell.appendChild(recoveredRadioDiv);
    selectedCountriesListTableBody.appendChild(row);
    
}

//  <div class="mdc-form-field">
//   <div class="mdc-radio">
//     <input class="mdc-radio__native-control" type="radio" id="radio-1" name="radios" checked>
//     <div class="mdc-radio__background">
//       <div class="mdc-radio__outer-circle"></div>
//       <div class="mdc-radio__inner-circle"></div>
//     </div>
//     <div class="mdc-radio__ripple"></div>
//   </div>
//  <div class="mdc-radio">
//     <input class="mdc-radio__native-control" type="radio" id="radio-2" name="radios">
//     <div class="mdc-radio__background">
//       <div class="mdc-radio__outer-circle"></div>
//       <div class="mdc-radio__inner-circle"></div>
//     </div>
//     <div class="mdc-radio__ripple"></div>
//   </div>
//  <div class="mdc-radio">
//     <input class="mdc-radio__native-control" type="radio" id="radio-3" name="radios">
//     <div class="mdc-radio__background">
//       <div class="mdc-radio__outer-circle"></div>
//       <div class="mdc-radio__inner-circle"></div>
//     </div>
//     <div class="mdc-radio__ripple"></div>
//   </div>
// </div>
      
topBarLinks.forEach((item) => {
    item.addEventListener('click', () => {
        hideViews();
        let target = item.getAttribute("href");
        document.querySelector(target).style.display = "block";
    });
});

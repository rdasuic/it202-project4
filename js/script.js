mdc.topAppBar.MDCTopAppBar.attachTo(document.querySelector('header.mdc-top-app-bar'));

const searchView = document.querySelector('#search-view');
const listView = document.querySelector('#list-view');
const chartView = document.querySelector('#chart-view');
const topBarLinks = document.querySelectorAll('.mdc-top-app-bar__action-item');
const countryInputEl = document.querySelector('#country-input');
const errorDialogEl = document.querySelector('#mdc-dialog-chart-error');
const errorDialog = new mdc.dialog.MDCDialog(errorDialogEl);
const coronaChartCanvas = document.querySelector('#corona-chart').getContext('2d');
const viewChartBtnEl = document.querySelector('#view-chart-btn');
const viewDataTableBtnEl = document.querySelector('#view-data-table-btn');
const addCountryBtnEl = document.querySelector('#add-country-btn');
const noDataErrEls = document.querySelectorAll('.no-data-error');
const selectedCountriesListEl = document.querySelector('.selected-countries-list');
const selectedCountriesTableEl = document.querySelector('#selected-countries-table');
const selectedCountriesTable = new mdc.dataTable.MDCDataTable(selectedCountriesTableEl);
mdc.ripple.MDCRipple.attachTo(viewChartBtnEl);
mdc.ripple.MDCRipple.attachTo(viewDataTableBtnEl);
mdc.ripple.MDCRipple.attachTo(addCountryBtnEl);
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
    const segmentedData = getOptionsFromSelectedCountryList();
    generateChart(segmentedData);
    generateDataTable(segmentedData);
    hideNoDataErrs();
    searchView.style.display = "none";
    chartView.style.display = "block";
});
viewDataTableBtnEl.addEventListener('click', () => {
    const segmentedData = getOptionsFromSelectedCountryList();
    generateDataTable(segmentedData);
    generateChart(segmentedData);
    hideNoDataErrs();
    searchView.style.display = "none";
    listView.style.display = "block";
});

addCountryBtnEl.addEventListener('click', () =>{
    if(countryInputEl.value == '') {
        errorDialog.open();
    }
    else {
        showCountriesDataTable();
        // remove the country from the datalist so the use can't readd it
        document.querySelector(`datalist > option[value=${countryInputEl.value}]`).remove()
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
const generateChart = (countryData) => {
    const chartLabels = countryData[0].data.map((data) => data.date); // grabs all the dates from each obj
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
    countryData.map((countryDataPoint) => {
        const randColor = '#'+Math.floor(Math.random()*16777215).toString(16); //generates a random color!
        const countryDataset = {
            label: `${countryDataPoint.country}(${countryDataPoint.valueToPlot})`,
            data: (countryDataPoint.data).map((e) => e.data), // gets the datapoints only, leaves out the dates
            fill: false, 
            borderColor: randColor,
            pointBackgroundColor: randColor
        }
        chartConfig.data.datasets.push(countryDataset);
    });
    new Chart(coronaChartCanvas, chartConfig);
}
const generateDataTable = (countryData) => {
    const dataTable = document.querySelector('#data-table');
    const dataTableBody = document.querySelector('#cases-list-content');
    const dataTableHeader = document.querySelector("#data-table > table > thead")
    dataTableBody.textContent = '';
    dataTableHeader.textContent = '';
    const thDateEl = document.createElement('th');
    thDateEl.classList.add('mdc-data-table__header-cell', 'mdc-data-table__header-cell--numeric')
    thDateEl.textContent = "Date"
    dataTableHeader.appendChild(thDateEl);
    countryData.map((countryDataPoint) => {
        const thEl = document.createElement('th');
        thEl.classList.add('mdc-data-table__header-cell', 'mdc-data-table__header-cell--numeric')
        thEl.textContent = `${countryDataPoint.country}(${countryDataPoint.valueToPlot})`
        dataTableHeader.appendChild(thEl);
        (countryDataPoint.data).map((dataPoint) => {
            let dateCell = document.createElement('td');
            dateCell.classList.add('mdc-data-table__cell');
            dateCell.textContent = dataPoint.date;
            let dataCell = document.createElement('td');
            dataCell.classList.add('mdc-data-table__cell');
            dataCell.textContent = dataPoint.data;
            let row;
            // if the row for the given date already exists, append the data to that row
            if(document.querySelector(`.data-${dataPoint.date}`)) {
                row = document.querySelector(`.data-${dataPoint.date}`);
                row.appendChild(dataCell);
            }
            // if a row with the date doesn't exist, create it
            else {
                row = document.createElement('tr');
                row.classList.add('mdc-data-table__row', `data-${dataPoint.date}`);
                row.appendChild(dateCell);
                row.appendChild(dataCell);
            }
            dataTableBody.appendChild(row);
        });
    });
}
const getOptionsFromSelectedCountryList = () => {
    const rows = selectedCountriesTable.getRows();
    const countryOptions = {};
    rows.map((countryRow) => {
        const currentCountryName = countryRow.querySelector('td').textContent;
        const confirmedCheckboxStatus = countryRow.querySelector('#confirmed-radio').checked;
        const deathsCheckboxStatus = countryRow.querySelector('#deaths-radio').checked;
        const recoveredCheckboxStatus = countryRow.querySelector('#recovered-radio').checked;
        switch(true) {
            case confirmedCheckboxStatus:
                countryOptions[currentCountryName] = "confirmed";
                break;
            case deathsCheckboxStatus:
                countryOptions[currentCountryName] = "deaths";
                break;
            case recoveredCheckboxStatus:
                countryOptions[currentCountryName] = "recovered";
                break;
            default:
                break;
        }
    });
    segmentedData = segmentDataBasedOnOptions(countryOptions);
    return segmentedData;
}
const segmentDataBasedOnOptions = (countryOptions) => {
    const countryNames = Object.keys(countryOptions);
    const segmentedArray = countryNames.map((country) => {
        let value = countryOptions[country];
        return {
                country: country,
                valueToPlot: value,
                data: allData[country].map(e => {
                return {
                            "date": e.date,
                            "data": e[value]
                        }
                })
            };
        });
    return segmentedArray;
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
    
    getOptionsFromSelectedCountryList();
}
      
topBarLinks.forEach((item) => {
    item.addEventListener('click', () => {
        hideViews();
        let target = item.getAttribute("href");
        document.querySelector(target).style.display = "block";
    });
});

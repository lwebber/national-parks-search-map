'use strict';

const apiKey = "qxerkHGC1cOFXxcU0XMPH5FBDsDatsjhbLJby4gd";

const searchURL = `https://developer.nps.gov/api/v1/parks`;

const myMap = L.map('mapid').setView([36, -100], 4);

function formatQueryParams(params) {
    const queryItems = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
}

function displayResults(responseJson, max) {
    // if there are previous results, remove them
    console.log(responseJson);
    $('#results-list').empty();
    // iterate through the data array, stopping at the max number of results
    for (let i = 0; i < responseJson.data.length & i < max; i++) {
        // for each park in the results list, list it's linkable name
        //description, directions and directions link, and weather
        $('#results-list').append(
            `<li><h3><a href="${responseJson.data[i].url} "target="_blank">${responseJson.data[i].fullName}</a></h3>
      <p>${responseJson.data[i].description}</p>
      <p>By ${responseJson.data[i].directionsInfo} <a href="${responseJson.data[i].directionsUrl}" target="_blank">Directions</a></p>
	  <p>${responseJson.data[i].weatherInfo}</p>
      </li>`
        )
    };
    //display the results section  
    $('#results').removeClass('hidden');
    paintMap();
    mapParks(responseJson, max);
}

function paintMap() {
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1Ijoid3dlYmJ5MSIsImEiOiJjazI3dWs2dTEwdHFxM2lxaGJndjRpdzZiIn0.rlFiPrSydlJ-HY3K4cdTgw'
    }).addTo(myMap);
    $('#mapid').show();
}

function mapParks(responseJson, max) {
    for (let i = 0; i < max; i++) {
        let park = responseJson.data[i];
        let park_full_name = park.fullName;
        console.log(`name: ${park_full_name}`);
        let lat = park.latLong.slice(4, 14);
        console.log(`lat: ${lat}`);
        let long = park.latLong.slice(22, 31);
        console.log(`long: ${long}`);
        let park_url = park.url;


        let parkmarker = L.marker([lat, long]).bindPopup(`<a href="${park_url}" target="_blank">${park_full_name}</a>`);
        parkmarker.addTo(myMap);
    }

}

function getParks(states, max = 10) {
    const params = {
        api_key: apiKey,
        stateCode: states,
        limit: max,
    }
    const queryString = formatQueryParams(params)
    const url = searchURL + '?' + queryString;

    console.log(url);

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayResults(responseJson, max))
        .catch(err => {
            $('#js-error-message').text(`Something went wrong: ${err.message}`);
        });
}

function watchForm() {
    $('#mapid').hide();
    console.log('watchForm ran');

    $(".chosen-select").chosen({
        no_results_text: "Oops, nothing found!",
        width: "95%"
    });

    $('form').submit(event => {
        event.preventDefault();
        const states = $('#select').val().join(',');
        console.log(states);
        const max = $('#max').val();
        console.log(max);
        getParks(states, max);
    });

}

$(watchForm);
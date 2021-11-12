/*global jQuery */

const vehicleArray = [
    {
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut a blandit velit, vel pellentesque sem.',
        efficiency: 3.7,
        gasPerKm: 0.37,
        gasType: 91,
        id: 1,
        image: "motorbike.jpg",
        maxCap: 2,
        maxDay: 5,
        minCap: 1,
        minDay: 1,
        price: 109,
        type: "Motorbike"
    },
    {
        type: "Small Car",
        minCap: 1,
        maxCap: 2,
        minDay: 1,
        maxDay: 10,
        efficiency: 8.5,
        gasPerKm: 0.85,
        gasType: 91,
        price: 129,
        image: "small-car.jpg",
        id: 2,
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut a blandit velit, vel pellentesque sem.'
    },
    {
        type: "Large Car",
        minCap: 1,
        maxCap: 5,
        minDay: 3,
        maxDay: 10,
        efficiency: 9.7,
        gasPerKm: 0.97,
        gasType: 91,
        price: 144,
        image: "large-car.jpg",
        id: 3,
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut a blandit velit, vel pellentesque sem.'
    },
    {
        type: "Motorhome",
        minCap: 2,
        maxCap: 6,
        minDay: 2,
        maxDay: 15,
        efficiency: 17,
        gasPerKm: 1.7,
        gasType: 91,
        price: 200,
        image: "motorhome.jpg",
        id: 4,
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut a blandit velit, vel pellentesque sem.'
    }
];

const locationArray = [
    {
        id: 1,
        cityName: "Auckland",
        lat: -36.850,
        lng: 174.764
    },
    {
        id: 2,
        cityName: "Wellington",
        lat: -41.289,
        lng: 174.778
    },
    {
        id: 3,
        cityName: "Christchurch",
        lat: -43.521,
        lng: 172.626
    },
    {
        id: 4,
        cityName: "Queenstown",
        lat: -45.030,
        lng: 168.661
    },
    {
        id: 5,
        cityName: "Nelson",
        lat: -41.298,
        lng: 173.244
    },
    {
        id: 6,
        cityName: "Dunedin",
        lat: -45.879,
        lng: 170.500
    },
    {
        id: 7,
        cityName: "Tauranga",
        lat: -37.747,
        lng: 176.122
    },
    {
        id: 8,
        cityName: "New Plymouth",
        lat: -39.057,
        lng: 174.079
    },
    {
        id: 9,
        cityName: "Whangarei",
        lat: -35.727,
        lng: 174.316
    },
    {
        id: 10,
        cityName: "Wanaka",
        lat: -44.694,
        lng: 169.141
    }
];

const maxDuration = 15;

// Selection of input and results regions

const introText = document.getElementById('intro-text-section');
const vehicleSelectionSection = document.getElementById('vehicle-selection-section');
const tripInformation = document.getElementById('trip-information');
const vehicleModal = document.getElementById('vehicle-modal');
const loadingScreen = document.getElementById('loading-screen');
const tripResult = document.getElementById('trip-results');

//Selection of input and error message's
const userInputForm = document.querySelector('#journey-form');

const partyInput = document.querySelector("#party-size");
const partyErrorMessage = document.querySelector("#party-error-message");

const dateErrorMessage = document.querySelector("#date-error-message");
let selectedDates = [];

const arrivalInput = document.querySelector("#arrival-city");
const mapArrivalInput = document.querySelector("#map-arrival-city");
const arrivalErrorMessage = document.querySelector("#arrival-error-messsage");

const departureInput = document.querySelector("#departure-city");
const mapDepartureInput = document.querySelector("#map-departure-city");
const departureErrorMessage = document.querySelector("#departure-error-message");

const homeIcon = document.getElementById('home-icon');
const prevScreen = document.getElementById('previous-screen');

const mymap = L.map('mapid').setView([-40.900, 174.886], 5);
let routeControl = null;

let userData = {
    partySize: 0,
    startDate: '',
    endDate: '',
    rentalDays: 0,
    pickupLocationId: null,
    dropoffLocationId: null,
    vehicleId: null
};

let calculatedData = {
    distance: 0,
    hireCost: 0,
    fuelCost: 0,
    fuelLitre: 0,
    totalCost: 0
};

const fuelData = [
    {
        price: 2.20,
        type: 91
    },
    {
        price: 2.40,
        type: 95
    },
    {
        price: 2.50,
        type: 98
    },
    {
        price: 2.20,
        type: "diesel"
    }
];

//Hide error messages
partyErrorMessage.style.display = "none";
dateErrorMessage.style.display = "none";
arrivalErrorMessage.style.display = "none";
departureErrorMessage.style.display = "none";

// FUNCTIONS: Set up page

    function init()
    {
        userInputForm.addEventListener('submit', submitUserForm);
        introText.style.display = 'flex';
        tripInformation.style.display = 'flex';
        vehicleSelectionSection.style.display = 'none';
        vehicleModal.style.display = 'none';
        loadingScreen.style.display = 'none';
        tripResult.style.display = 'none';

        initDestinations();
        // displayVehicleDetailModal(2);
        homeIcon.addEventListener('click', init);
        prevScreen.addEventListener('click', editInputs);

    }

    function initDestinations()
    {
        let html = `<option hidden disabled selected value>Select city</option>`;

        locationArray.forEach(function(location) {
            html += `<option value="${location.id}">${location.cityName}</option>`;
        });

        $("#arrival-city").html(html);
        $("#departure-city").html(html);
    }

    function editInputs()
    {
        introText.style.display = 'none';
        tripInformation.style.display = 'flex';
        vehicleSelectionSection.style.display = 'flex';
        vehicleModal.style.display = 'none';
        loadingScreen.style.display = 'none';
        tripResult.style.display = 'none';
    }

    //Flatpickr plugin

    $(".trip-date").flatpickr({ // activate the plugin on this element
        mode: "range",    // set it to range mode to allow selection of a range of dates
        dateFormat: "F j, Y", // specify the format that the date strings should have
        minDate: "today", // specify the earliest date allowed
        maxDate: new Date().fp_incr(365), // specify the latest date allowed (14 days from now),
        onChange: function() {
            let date = new Date(this.selectedDates[0]);
            this.set('maxDate', date.setDate(date.getDate() + (maxDuration - 1)));
            selectedDates = this.selectedDates;
        }
    });

    //Leaflet plugin

    function initMap()
    {
        // create a tile layer using tiles from openstreetmaps.org, and add it to the map we created
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mymap);
    }

//FUNCTIONS: Validation of user input

    function validate(event) 
    {
        event.preventDefault();

        let validatedParty = checkParty();

        let validatedDates = checkDates();

        let validatedArrival = checkArrival(arrivalInput.value);

        let validatedDeparture = checkDeparture(departureInput.value);

        if (
            validatedParty && 
            validatedDates &&
            validatedArrival &&
            validatedDeparture
        ) {
            // save the information
            return true;
        }
    }

    function checkParty()
    {
        const partyRegex = /^[1-6]$/;
        if (partyRegex.test(partyInput.value)) {
            partyErrorMessage.style.display = "none";

            return true;
        }

        partyErrorMessage.style.display = "inline";
        
        return false;
    }

    function checkDates()
    {
        if (
            selectedDates.length === 2
        ) {
            let diff = parseInt((selectedDates[1] - selectedDates[0]) / (24 * 3600 * 1000));

            if (diff > 0 && diff < maxDuration) {
                dateErrorMessage.style.display = "none";

                return true;
            }
        }

        dateErrorMessage.style.display = "inline";

        return false;
    }

    function checkArrival(value)
    {
        if(value === ""){
            arrivalErrorMessage.style.display = "inline";

            return false;
        }
        
        arrivalErrorMessage.style.display = "none";
        
        return true;
    }

    function checkDeparture(value)
    {
        if (value === "") {
            departureErrorMessage.style.display = "inline";

            return false;
        }
        
        departureErrorMessage.style.display = "none";
        
        return true;
    }

// Submit functions

    function submitUserForm(event)
    {
        if (validate(event)) {
            // now save data
            userData.partySize = partyInput.value;
            userData.startDate = selectedDates[0];
            userData.endDate = selectedDates[1];
            userData.rentalDays= parseInt((selectedDates[1] - selectedDates[0]) / (24 * 3600 * 1000)) + 1;

            userData.pickupLocationId = arrivalInput.value;
            userData.dropoffLocationId = departureInput.value;

            // console.log(userData);

            let filteredVehicleArray = filterVehiclesBasedOnUserData();

            displayVehicles(filteredVehicleArray);

            introText.style.display = 'none';
            vehicleSelectionSection.style.display = 'flex';

        }
    }

    function submitVehicleSelectionForm()
    {
        vehicleModal.style.display = 'none';

        if (userData.vehicleId === null) {
            document.querySelector(".select-error-message").style.display = "inline";
        } else {
            document.querySelector(".select-error-message").style.display = "none";

            let location1 = locationArray.find((location) => location.id == userData.pickupLocationId);
            let location2 = locationArray.find((location) => location.id == userData.dropoffLocationId);
            
            if (routeControl !== null) {
                routeControl.setWaypoints([
                    location1,
                    location2
                ]);
            } else {
                generateRoute(
                    location1,
                    location2
                );
            }

            setSelectedMapDestinations();
            displayUserVehicle();
            displayUserDetails();
    
            tripInformation.style.display = 'none';
            loadingScreen.style.display = 'flex';

            initMap();
        }
    }

    function submitRegenerateRoute()
    {

        let validatedArrival = checkArrival(mapArrivalInput.value);

        let validatedDeparture = checkDeparture(mapDepartureInput.value);

        if (validatedArrival && validatedDeparture) {
            tripResult.style.display = 'none';
            
            userData.pickupLocationId = mapArrivalInput.value;
            userData.dropoffLocationId = mapDepartureInput.value;
            
            submitVehicleSelectionForm();
        }
    }

//Compares user data to vehicle options and display matches for user selection

    function filterVehiclesBasedOnUserData()
    {
        return vehicleArray.filter(function(vehicle) {
                return (userData.partySize <= vehicle.maxCap &&
                        userData.partySize >= vehicle.minCap &&
                        userData.rentalDays <= vehicle.maxDay &&
                        userData.rentalDays >= vehicle.minDay);
            });
    }

    function displayVehicles(vehicleArray)
    {
        let html = '';

        vehicleArray.forEach(function(vehicle) {
            const dailyHire = vehicle.price.toLocaleString("en-US", {style:"currency", currency:"NZD"});
            html += `
                <div class="vehicle-card" data-vehicle-number="${vehicle.id}">
                    <img src="assets/images/${vehicle.image}" alt="vehicle image">
                    <div class="vehicle-details">
                        <h3> ${vehicle.type} </h3>
                        <p class="gas-efficiency">${vehicle.efficiency}L/100km</p>
                        <p> ${dailyHire} per day </p>
                        <p class="cap-tag">${vehicle.minCap} - ${vehicle.maxCap} people.</p>
                        <button class="modal-detail" data-vehicle-number="${vehicle.id}"> See detail </button>
                    </div>
                </div>`;
        });

        $("#vehicle-display").html(html);
        $(".vehicle-card").click(vehicleCardClickListener);
        $(".modal-detail").click(vehicleSeeDetailClickListener);

        html = `
            <button id="select-vehicle-sub" class="event-submit"> Continue </button>
            <span style="display: none" class="select-error-message" id="select-error-message">
                <i class="fas fa-exclamation-circle"></i> 
                <p>Please select a vehicle.</p>
            </span>`;

        $('#vehicle-button').html(html);
        $("#select-vehicle-sub").click(submitVehicleSelectionForm);
    }
    
//Vehicle Modal
    function displayVehicleDetailModal(selectedVehicleId)
    {
        let selectedVehicle = vehicleArray.find(function(vehicle) {
            return selectedVehicleId === vehicle.id;
        });

        const dailyHire = selectedVehicle.price.toLocaleString("en-US", {style:"currency", currency:"NZD"});
    
        let modalHtml = `
            <div class="modal-detail" id="modal-detail">
                <i class="fas fa-times" id="close-modal"></i>
                <div class="vehicle-info" id="vehicle-info">
                    <img src="assets/images/${selectedVehicle.image}" alt="">
                    <div class="content">
                        <h2>${selectedVehicle.type}</h2>
                        <h3> Capacity: ${selectedVehicle.minCap} - ${selectedVehicle.maxCap} people </h3>
                        <h3> Hire Cost: ${dailyHire} per day</h3>
                        <h3> Gas Type: ${selectedVehicle.gasType}</h3>
                        <h3> Gas Efficiency: ${selectedVehicle.efficiency}L/km.</h3>
                        <p>${selectedVehicle.description}</p>
                        <button class="modal-select-button">Select Vehicle</button>
                    </div>
                </div>    
            </div>`;
    
        $(".vehicle-modal").html(modalHtml);

        vehicleModal.style.display = 'flex';
        
        $("#close-modal").click(function(){
            $("#vehicle-modal").hide();
        });

        $(".modal-select-button").click(submitVehicleSelectionForm);
    
        // selectVehicleButtonListener();
    }

    function vehicleSeeDetailClickListener()
    {
        userData.vehicleId = $(this).data('vehicle-number');

        displayVehicleDetailModal(userData.vehicleId);
    }

//User selects a vehicle and their selection is saved

    function vehicleCardClickListener()
    {
        let vehicles = $(".vehicle-card");

        for (const vehicle of vehicles) {
            if ($(vehicle).data('vehicle-number') === $(this).data('vehicle-number')) {
                $(vehicle).addClass('border');
            } else {
                $(vehicle).removeClass('border');
            }
        }
        userData.vehicleId = $(this).data('vehicle-number');
    }

    function generateRoute(location1, location2)
    {
        routeControl = L.Routing.control({ waypoints: [
            location1,
            location2
        ] }).addTo(mymap);

        routeControl.on('routesfound', function(e) {
            let routes = e.routes;

            performCalculations(routes[0]);

            displayUserTripSummary();
        });
    }

// Calculation functions

    function performCalculations(route)
    {
        // do your route calcs here

        calculatedData.distance = route.summary.totalDistance / 1000;

        let selectedVehicle = vehicleArray.find(function(vehicle) {
            return userData.vehicleId === vehicle.id;
        });

        //Caculate litre of fuel used. 

        calculatedData.fuelLitre = selectedVehicle.gasPerKm * calculatedData.distance;

        calculatedData.fuelCost = calculateFuelTotal(selectedVehicle);

        calculatedData.hireCost = calculateHireage(selectedVehicle);

        calculatedData.totalCost = calculateTotalCost();
    }

    function calculateHireage(selectedVehicle)
    {
        return userData.rentalDays * selectedVehicle.price;
    }

    function calculateFuelTotal(selectedVehicle)
    {

        let requiredFuelType = fuelData.find(function(fuel) {
            return selectedVehicle.gasType === fuel.type;
        });

        return calculatedData.fuelLitre * requiredFuelType.price;

    }

    function calculateTotalCost()
    {
        return calculatedData.fuelCost + calculatedData.hireCost;
    }

// Complete trip

    function setSelectedMapDestinations()
    {
        let html = '<option hidden disabled selected value>-- Please select from the dropdown --</option>';
        locationArray.forEach(function(location) {
            html += `<option value="${location.id}" ${(
                location.id == userData.pickupLocationId ? 'selected' : ''
            )}>${location.cityName}</option>`;
        });
        $("#map-arrival-city").html(html);

        html = '<option hidden disabled selected value>-- Please select from the dropdown --</option>';
        locationArray.forEach(function(location) {
            html += `<option value="${location.id}" ${(
                location.id == userData.dropoffLocationId ? 'selected' : ''
            )}>${location.cityName}</option>`;
        });
        $("#map-departure-city").html(html);

        $('#recalculate-button').click(submitRegenerateRoute);
    }

    function displayUserDetails()
    {
    let html = `
        <h2>Your Trip:</h2>
        <p class="map-para">Number of people: ${userData.partySize}</p>
        <p class="map-para">Trip Duration: ${userData.rentalDays} days </p>`;
        $('.user-trip-summary').html(html);
    }

    function displayUserVehicle()
    {
        let vehicle = vehicleArray.find(function(vehicle) {
            return vehicle.id == userData.vehicleId;
        });

        let html = 
            `<h2 class='map-heading'>Selected Vehicle:</h2>
            <div class='vehicle-wrapper'>
                <img src="assets/images/${vehicle.image}" alt="selected vehicle image">
                <div class="vehicle-summ-info">
                    <h3 class='map-para'>${vehicle.type}</h3>
                    <p>Fuel Efficiency: ${vehicle.efficiency}L/100km</p>
                    <p>Gas Type: ${vehicle.gasType}</p>
                    <p>Capacity: ${vehicle.minCap} - ${vehicle.maxCap} people</p>
                </div>
            </div>`;
        $(".user-vehicle-summary").html(html);
    }

    function displayUserTripSummary()
    {
        const dailyHire = calculatedData.hireCost.toLocaleString("en-US", {style:"currency", currency:"NZD"});
        const fuelCost = calculatedData.fuelCost.toLocaleString("en-US", {style:"currency", currency:"NZD"});
        const totalTripCost = calculatedData.totalCost.toLocaleString("en-US", {style:"currency", currency:"NZD"});
        let html = 
            `<h2 class='map-heading'>Summary:</h3>
            <h3 class='map-para'>Total KM:${Math.round(calculatedData.distance)} km</h3>
            <h3 class='map-para'>Total Hire Cost: ${dailyHire} </h3>
            <h3 class='map-para'>Fuel cost (approx): ${fuelCost}</h3>
            <h2 class='map-total'>Total Cost (approx): </h2>
            <h2 class='total-heading'>${totalTripCost}</h2>`;

        $("#cost-summary").html(html);

        loadingScreen.style.display = 'none';
        tripResult.style.display = 'flex';

        mymap.invalidateSize();
    }

//SEQUENCE

init();
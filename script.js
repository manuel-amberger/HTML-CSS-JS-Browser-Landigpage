// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// User Data
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const username = "Gast";
const latitudeKrems = 48.4092;
const longitudeKrems = 15.6142;
const latitudeWien = 48.210033;
const longitudeWien = 16.363449;
let currentCoordinates = [latitudeWien, longitudeWien];

// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Quotes
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const quotes = [
    "The best time to plant a tree was 20 years ago. The second best time is now.",
    "Your limitation—it's only your imagination.",
    "Push yourself, because no one else is going to do it for you.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Success doesn't just find you. You have to go out and get it.",
    "The harder you work for something, the greater you'll feel when you achieve it.",
    "Don't stop when you're tired. Stop when you're done.",
    "Wake up with determination. Go to bed with satisfaction.",
    "Do something today that your future self will thank you for.",
    "Little things make big days.",
    "It's going to be hard, but hard does not mean impossible.",
    "Don't wait for opportunity. Create it.",
    "Sometimes we're tested not to show our weaknesses, but to discover our strengths.",
    "The key to success is to focus on goals, not obstacles.",
    "Dream bigger. Do bigger.",
    "Don't be afraid to give up the good to go for the great.",
    "The difference between ordinary and extraordinary is that little extra.",
    "Challenges are what make life interesting and overcoming them is what makes life meaningful.",
    "If you want to achieve excellence, you can get there today. As of this second, quit doing less-than-excellent work."
];

// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Fetch Weather Data
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
async function getWeather() {
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${currentCoordinates[0]}&longitude=${currentCoordinates[1]}&daily=apparent_temperature_max,apparent_temperature_min,sunrise,sunset&hourly=precipitation_probability,wind_speed_10m,temperature_2m&current=temperature_2m,apparent_temperature,weather_code&timezone=auto&forecast_days=1`);
        const json = await response.json();

        if (!response.ok || json.current.temperature_2m === undefined) {
            throw new Error('Error fetching weather data');
        }

        return json;
    } catch (err) {
        console.error('Error fetching weather data: ', err);
    }
}

// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Wallpaper
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
/*
function chooseRandomWp() {
    const wallpapers = [
        "wp1.jpg",
        "wp2.jpg",
        "wp3.jpg",
        "wp4.jpg",
        "wp5.jpeg"
    ];

    const randomWp = wallpapers[Math.floor(Math.random() * wallpapers.length)];

    $('#hero').css('background-image', `url("img/wallpaper/${randomWp}")`);
}
*/

// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Render Greeting
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function renderGreeting() {
    const currentHour = new Date().getHours();

    if (currentHour >= 4 && currentHour <= 10) {
        $('#greetingContainer #greeting').text(`Guten Morgen, ${username}`);
    } else if (currentHour >= 11 && currentHour <= 17) {
        $('#greetingContainer #greeting').text(`Guten Tag, ${username}`);
    } else if (currentHour >= 18 && currentHour <= 21) {
        $('#greetingContainer #greeting').text(`Guten Abend, ${username}`);
    } else {
        $('#greetingContainer #greeting').text(`Gute Nacht, ${username}`);
    }
}

// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Render Quote
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function renderQuote() {
    const totalQuoteCount = quotes.length;
    const randomIndex = Math.floor(Math.random() * totalQuoteCount);

    $('#greetingContainer #quote').text(quotes[randomIndex]);
}

// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Render Clock
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function renderClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    $('#clockContainer #clock').text(hours + ':' + minutes + ':' + seconds);
}

// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Render Date Widget
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function getISOWeek(date) {
    const tempDate = new Date(date.getTime());
    tempDate.setDate(tempDate.getDate() + 3 - (tempDate.getDay() + 6) % 7);
    const firstThursday = new Date(tempDate.getFullYear(), 0, 4);
    return 1 + Math.round(
        ((tempDate - firstThursday) / 86400000 - 3 + (firstThursday.getDay() + 6) % 7) / 7
    );
}

function renderDate() {
    const now = new Date();
    const weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

    const output = `${weekdays[now.getDay()]}, ${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()} - KW ${getISOWeek(now)}`;
    $('#dateContainer #date').text(output);
}

// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Render Timer Widget
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
let timerIntervall = null;
let blinkIntervall = null;
let timerDuration = 10 * 60;
let isInInputMode = false;
let inputString = "0000";
let inputs = 0;

function renderTimer() {
    let minutes = Math.floor(timerDuration / 60);
    let seconds = timerDuration % 60;

    $('#timer').text(minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0'));
}

function renderInputMode() {
    let minutes = inputString.substring(0, 2);
    let seconds = inputString.substring(2, 4);

    $('#timer').text(minutes + ':' + seconds);
}

function startInputMode() {
    clearInterval(timerIntervall);
    timerIntervall = null;
    $('#timerStartStopBtn').empty().append('<i data-lucide="timer"></i>');
    lucide.createIcons();
    isInInputMode = true;
    inputs = 0;
    inputString = "0000";
    renderInputMode();

    $('#timer').css('opacity', '0.5');

    $(document).off('keydown', handleTimerKeyInput);
    $(document).on('keydown', handleTimerKeyInput);
}

function startTimerAfterInput() {
    const minutes = parseInt(inputString.substring(0, 2));
    const seconds = parseInt(inputString.substring(2, 4));

    timerDuration = (minutes * 60) + seconds;

    isInInputMode = false;
    $(document).off('keydown', handleTimerKeyInput);
    $('#timer').css('opacity', '1');

    renderTimer();
    if (timerDuration > 0) {
        startStopTimer();
    }
}

function handleTimerKeyInput(e) {
    if (!isInInputMode) return;

    if (e.key >= '0' && e.key <= '9') {
        if (inputs < 4) {
            inputs++;
            inputString = inputString.substring(1) + e.key;
            renderInputMode();
        }
    } else if (e.key === 'Backspace') {
        if (inputs > 0) {
            inputs--;
            inputString = '0' + inputString.substring(0, 3);
            renderInputMode();
        }
    } else if (e.key === 'Enter') {
        startTimerAfterInput();
    }
}

function startStopTimer() {
    if (isInInputMode) {
        startTimerAfterInput();
        return;
    }

    if (timerDuration <= 0) return;

    if (timerIntervall !== null) {
        clearInterval(timerIntervall);
        timerIntervall = null;
        $('#timerStartStopBtn').empty().append('<i data-lucide="timer"></i>');
        lucide.createIcons();
        return;
    }

    $('#timer').css('opacity', '1');

    clearInterval(timerIntervall);
    timerIntervall = null;
    timerIntervall = setInterval(function() {
        if (timerDuration <= 0) {
            clearInterval(timerIntervall);
            timerIntervall = null;
            $('#timer').text('00:00');
            $('#timerStartStopBtn').empty().append('<i data-lucide="timer"></i>');
            lucide.createIcons();

            $('#timerStopwatchContainer').addClass('isBlinking')
                .one('animationend webkitAnimationEnd oAnimationEnd', function() {
                    $(this).removeClass('isBlinking');
                });
        } else {
            timerDuration--;
            renderTimer();
        }
    }, 1000)

    if (timerIntervall !== null) {
        $('#timerStartStopBtn').empty().append('<i data-lucide="timer-off"></i>');
        lucide.createIcons();
    }
}

// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Render Stopwatch Widget
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
let stopwatchIntervall = null;
let startTime = 0;
let elapsedTime = 0;

function startStopStopwatch() {
    if (stopwatchIntervall !== null) {
        clearInterval(stopwatchIntervall);
        stopwatchIntervall = null;
        return;
    }

    startTime = performance.now() - elapsedTime;

    stopwatchIntervall = setInterval(function() {
        elapsedTime = performance.now() - startTime;

        const minutes = Math.floor(elapsedTime / 60000);
        const seconds = Math.floor((elapsedTime % 60000) / 1000);
        const hundredths = Math.floor((elapsedTime % 1000) / 10);

        $('#stopwatch').text(
            minutes.toString().padStart(2, '0') + ':' +
            seconds.toString().padStart(2, '0') + ':' +
            hundredths.toString().padStart(2, '0')
        );
    }, 10);
}

function resetStopwatch() {
    clearInterval(stopwatchIntervall);
    stopwatchIntervall = null;

    elapsedTime = 0;

    $('#stopwatch').text('00:00:00');
}

// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Render Network Latency Widget
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
async function renderNetworkLatency() {
    const startTime = performance.now();
    const url = 'https://1.1.1.1';

    try {
        const cacheBuster = `?t=${Date.now()}`;

        await fetch(url + cacheBuster, {
            method: 'HEAD',
            mode: 'no-cors',
            cache: 'no-store'
        });

        const duration = performance.now() - startTime;

        console.log(`Network Latency to ${url} took ${duration.toFixed(2)} ms`);
        $('#networkLatency').text(Math.round(duration) + ' ms');
    } catch (error) {
        console.error('Error measuring network latency:', error);
    }
}

// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Render Weather Widget
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
async function renderWeather() {
    const weatherData = await getWeather();
    const hourIndex = new Date().getHours();

    if (!weatherData) {
        console.error('No weather data available');
        return;
    }

    $('#weatherContainer #weatherMinMax').text(weatherData.daily.apparent_temperature_min[0] + weatherData.daily_units.apparent_temperature_min + ' / ' + weatherData.daily.apparent_temperature_max[0] + weatherData.daily_units.apparent_temperature_max);
    $('#weatherContainer #currentTemp').text(weatherData.current.temperature_2m + weatherData.current_units.temperature_2m);
    $('#weatherContainer #realFeelTemp').text(weatherData.current.apparent_temperature + weatherData.current_units.apparent_temperature);
    $('#weatherContainer #windSpeed').text(weatherData.hourly.wind_speed_10m[hourIndex] + weatherData.hourly_units.wind_speed_10m);
    $('#weatherContainer #rainProbability').text(weatherData.hourly.precipitation_probability[hourIndex] + weatherData.hourly_units.precipitation_probability);

    const weatherIconMap = {
        0: 'sun',
        1: 'cloud-sun',
        2: 'cloud-sun',
        3: 'cloudy',

        45: 'cloud-fog',
        48: 'cloud-fog',

        51: "cloud-drizzle",
        53: "cloud-drizzle",
        55: "cloud-drizzle",

        56: 'cloud-snow',
        57: 'cloud-snow',

        61: "cloud-rain",
        63: "cloud-rain",
        65: "cloud-rain",

        66: 'cloud-snow',
        67: 'cloud-snow',

        71: 'snowflake',
        73: 'snowflake',
        75: 'snowflake',

        77: 'cloud-snow',

        80: 'cloud-rain-wind',
        81: 'cloud-rain-wind',
        82: 'cloud-rain-wind',

        85: 'snowflake',
        86: 'snowflake',

        95: 'cloud-lightning',
        96: 'cloud-lightning',
        99: 'cloud-lightning'
    }

    const weatherCode = weatherData.current.weather_code;
    const currentWeatherIcon = weatherIconMap[weatherCode] || 'cloud';

    $('#weatherContainer #weatherIcon').attr('data-lucide', currentWeatherIcon);
    lucide.createIcons();

    const forecastHours = [
        (hourIndex + 1) % 24,
        (hourIndex + 2) % 24,
        (hourIndex + 3) % 24
    ];

    $('#forecastH1 #forecastHour1').text(forecastHours[0] + ' Uhr');
    $('#forecastH1 #forecastTemp1').text(weatherData.hourly.temperature_2m[forecastHours[0]] + weatherData.hourly_units.temperature_2m);
    $('#forecastH1 #forecastRainProbability1').text(weatherData.hourly.precipitation_probability[forecastHours[0]] + weatherData.hourly_units.precipitation_probability);

    $('#forecastH2 #forecastHour2').text(forecastHours[1] + ' Uhr');
    $('#forecastH2 #forecastTemp2').text(weatherData.hourly.temperature_2m[forecastHours[1]] + weatherData.hourly_units.temperature_2m);
    $('#forecastH2 #forecastRainProbability2').text(weatherData.hourly.precipitation_probability[forecastHours[1]] + weatherData.hourly_units.precipitation_probability);

    $('#forecastH3 #forecastHour3').text(forecastHours[2] + ' Uhr');
    $('#forecastH3 #forecastTemp3').text(weatherData.hourly.temperature_2m[forecastHours[2]] + weatherData.hourly_units.temperature_2m);
    $('#forecastH3 #forecastRainProbability3').text(weatherData.hourly.precipitation_probability[forecastHours[2]] + weatherData.hourly_units.precipitation_probability);

    $('#weatherContainer').removeClass('hiden');
}

// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Render Daytime Widget
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function isoToTime(iso) {
    return new Date(iso).toLocaleTimeString("de-AT", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
}

async function renderDayTime() {
    const weatherData = await getWeather();

    if (!weatherData) {
        console.error('No daytime data available');
        return;
    }

    $('#dayTimeContainer #sunriseTime').text(isoToTime(weatherData.daily.sunrise[0]) + ' Uhr');
    $('#dayTimeContainer #sunsetTime').text(isoToTime(weatherData.daily.sunset[0]) + ' Uhr');

    $('#dayTimeContainer').removeClass('hiden');
}

// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Render Time Boxes
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function renderTimeBoxes() {
    const currentHour = new Date().getHours();

    $('#timeBoxesContainer .box').removeClass('passed current');
    $('#timeBoxesContainer .box').each(function(index) {
        if (index < currentHour) {
            $(this).addClass('passed');
        } else if (index == currentHour) {
            $(this).addClass('current');
        }
    });
}


// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Init
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
let lastHour = new Date().getHours();

function renderIfNewHour() {
    const currentHour = new Date().getHours();

    if (currentHour !== lastHour) {
        renderGreeting();
        renderDate();
        renderDayTime();
        renderTimeBoxes();
        lastHour = currentHour;
    }
}

function init() {
    $(document).ready(function() {
        // chooseRandomWp();
        renderGreeting();
        renderQuote();
        renderClock();
        renderDate();
        renderNetworkLatency();
        renderWeather();
        renderDayTime();
        renderTimeBoxes();

        $('#weatherContainer #weatherLocation').text('Wien');

        setInterval(function() {
            renderClock();
        }, 1000);

        setInterval(function() {
            renderIfNewHour();
            renderNetworkLatency();
        }, 60000);

        setInterval(function() {
            renderWeather();
        }, 900000);
    })
}

init();


// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Inputs
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Search Form
$('#searchForm').on('submit', function(e) {
    e.preventDefault();
    const input = $(this).find('input[name="q"]').val().trim();

    if (input.startsWith('http://') || input.startsWith('https://') || input.startsWith('www.')) {
        const url = input.startsWith('http://') || input.startsWith('https://') ? input : 'https://' + input;
        window.location.href = url;
    } else {
        window.location.href = 'https://www.google.com/search?q=' + encodeURIComponent(input);
    }

    $('#searchbar').val('');
});

$('#searchBarBtn').click(function() {
    window.location.href = 'https://gemini.google.com/app';
});

// Timer / Stopwatch Selection
let isTimerSelected = true;

$('#timerBtn').click(function() {
    if (!isTimerSelected) {
        $('.timerContainer').removeClass('hiden');
        $('.stopwatchContainer').addClass('hiden');
        $('#timerBtn').addClass('selected');
        $('#stopwatchBtn').removeClass('selected');
        isTimerSelected = true;
    }
});

$('#stopwatchBtn').click(function() {
    if (isTimerSelected) {
        $('.stopwatchContainer').removeClass('hiden');
        $('.timerContainer').addClass('hiden');
        $('#stopwatchBtn').addClass('selected');
        $('#timerBtn').removeClass('selected');
        isTimerSelected = false;
    }
});

// Timer Buttons
$('#timerStartStopBtn').click(startStopTimer);

$('#timerResetBtn').click(function() {
    this.blur();
    startInputMode();
});

// Stopwatch Buttons
$('#stopwatchStartStopBtn').click(startStopStopwatch);

$('#stopwatchResetBtn').click(resetStopwatch);

// Weather Location Button
$('#weatherLocation').click(function() {
    if (currentCoordinates[0] === latitudeWien && currentCoordinates[1] === longitudeWien) {
        currentCoordinates = [latitudeKrems, longitudeKrems];
        $('#weatherLocation').text('Krems an der Donau');
    } else {
        currentCoordinates = [latitudeWien, longitudeWien];
        $('#weatherLocation').text('Wien');
    }
    renderWeather();
});
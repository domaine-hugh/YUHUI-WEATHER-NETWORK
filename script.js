const app = {
    config: {
        weatherApi: {
            url: 'https://api.weatherbit.io/v2.0/current',
            key: 'de365115a7284ad4bf2cd265044b2341',
        },
        locationApi: {
            url: 'https://ipgeolocation.abstractapi.com/v1/',
            key: '4f0ef52ad4ea4a7885160d22767b99b3',
        },
        gify: {
            url: 'http://api.giphy.com/v1/gifs/search',
            key: 'qqanPZz7sLSn7kVSm7oDDrm4Az3ZQ1XH'
        },
    },
    props: {
        isUnitCentigrade: true, // Centigrade default
        weather: {
            country: null,
            city: null,
            code: null,
            description: null,
            dayNight: null,
            feelsLike: null,
            temperature: null,
            windSpeed: null,
            windDirection: null,
            humidity: null,
            pressue: null,
        },
        // Weather backup object to enable us restore data back to previous data entry.
        weatherBackup: {
            country: null,
            city: null,
        },
    },
    Util: {
        apiCall: function (opt, callback) {
            $.ajax({
                url: opt.url,
                method: opt.method || 'GET',
                dataType: 'json',
                data: opt.data,
            }).then((data) => {
                callback(data);
            })
        },
        toFormattedFixed: (val) => {
            return Number(val).toFixed(1);
        },
        toCentigrade: (val) => {
            return app.Util.toFormattedFixed((val - 32) / 1.8)
        },
        toFahrenheit: (val) => {
            return app.Util.toFormattedFixed(val * 1.8 + 32)
        },
        strCapitalize: (str) => {
            return str[0].toUpperCase() + str.substr(1);
        },
    }
};

app.countryAbbreviationCode = `
 There are some abbreviated codes of areas:</br>
 </br>
 Canada : CA</br>
 United States : US</br>
 China : CN</br>
 India : IN</br>
 United Kingdom : UK</br>
 France : FR</br>
 Italy : IT</br>
 Germany : DE</br>
 Japan : JP</br>
 South Korea : KR</br>
 </br>
 Please click <strong>"More Area Code"</strong> if you cannot find the abbreviated code you are looking for, and this button will switch to another then providing you an external link for abbreviated code search.
`;

app.applicationGuideContent =
    `Thanks to use Yuhui's weather network!</br>
</br>
<strong>WEATHER DISPLAY: </strong>The application could automatically display the weather in your city, also you can input a city and and its country abbreviation code to check somewhere all over the world! </br>
<strong>COUNTRY ABBREVIATION CODE: </strong>The button of area abbreviation code may help you during your inputting. To be more specific, it will display some codes for areas; if the code you are looking for is not in the pop-up window, please click <strong>"More Area Code"</strong> and the button will change its function then proving an external link for more area abbreviation code checkings.</br>
<strong>UNITS SWITCH: </strong>The temperatues on page can be exhibited by Centigrade or Fahrenheit. You can select one of them by clicking corresponding unit button.</br>
<strong>SAVING WEATHER DATA: </strong>The application can save the current weather data and display below. In addition, you can highlight the block which you want to use for comparison.</br>
<strong>GIF FOR FUN: </strong>There are some Gifs which are searched based on the weather desciption as keywords. Please feel free to right click and save them :).</br>
<strong>CONTACT ME: </strong>Please do not be hesitant to contact me if you meet any issue during application use or have feedback and suggestion to share with me. On the right top corner, there are my Tweeter and Github and Linkedin link.</br>`;

app.putGifOnPage = data => { //Adding Gifs on page
    data.forEach(function (gifObject) {
        const gifhtml = `
                <div class="gifBox">
                    <div class="imgBox">
                        <img src="${gifObject.images.original.url} alt="${gifObject.title}"
                    </div>
                    <div class="gifTittle">
                        <p>${gifObject.title}</p>
                    </div>
                </div>
           `
        $('.gifDisplayDiv').append(gifhtml);
    });
};

app.getWeatherGif = (query) => {
    const gify = app.config.gify;
    app.Util.apiCall({
        url: gify.url,
        data: {
            api_key: gify.key,
            q: query,
            format: 'json',
            limit: 3 //Limit 3 gifs
        }
    }, (result) => { //Put Gifs on pages
        $('.gifDisplayDiv').empty(); // empty gif box to avoid too many gifs
        app.putGifOnPage(result.data);
    });
};

app.setLocationAndDisplayWeather = (weatherObj) => {
    $('.currentCityName').text(`${weatherObj.city}, ${weatherObj.country}`);
    app.getCurrentWeather();
}

app.weatherDataDisplay = (weatherObj) => { //Weather data display on page        
    $('.currentTempertureNumber').text(weatherObj.temperature);
    $('.currentFeelsLikeTemperatureNumber').text(weatherObj.feelsLike);
    $('.humidityDisplay').text(`${weatherObj.humidity}%`);
    $('.pressureDisplay').text(`${weatherObj.pressue} mb`);
    $('.windDisplay').text(`${weatherObj.windSpeed} m/s  ${weatherObj.windDirection}`);
};

app.restoreBackupWeather = (isRestore) => {
    const weatherObj = app.props.weather,
        weatherObjBackup = app.props.weatherBackup;

    if (isRestore) {
        weatherObj.city = weatherObjBackup.city;
        weatherObj.country = weatherObjBackup.country;
    } else {
        weatherObjBackup.city = weatherObj.city;
        weatherObjBackup.country = weatherObj.country;
    }
}

app.getCurrentWeather = () => {
    const weatherApi = app.config.weatherApi;
    const weatherObj = app.props.weather;

    app.Util.apiCall({
        url: weatherApi.url,
        data: {
            key: weatherApi.key,
            city: weatherObj.city,
            country: weatherObj.country
        }
    }, (result) => {
        //Saving weather data
        if (result === undefined) {
            //If user input invalid city name, alert shows and let page go back to show the last city data
            prompt(`Please enter a <strong>corret</strong> city name and its country abbreviation!`);
            app.restoreBackupWeather(true);
            app.setLocationAndDisplayWeather(weatherObj);
        } else {

            const resData = result.data[0];

            weatherObj.code = resData.weather.code;
            weatherObj.description = resData.weather.description;
            weatherObj.dayNight = resData.pod;

            //Keep one decimal place
            weatherObj.feelsLike = app.Util.toFormattedFixed(resData.app_temp);
            weatherObj.temperature = app.Util.toFormattedFixed(resData.temp);

            //Wind direction use first letter upper case
            weatherObj.windDirection = app.Util.strCapitalize(resData.wind_cdir_full);

            weatherObj.windSpeed = resData.wind_spd;
            weatherObj.humidity = resData.rh;
            weatherObj.pressue = resData.pres;
            app.weatherDataDisplay(weatherObj);
            app.getWeatherGif(weatherObj.description); //Put current weather description into GIF API to get GIF
            app.currentTimeWallPaper(); //Change wall paper
            app.currentTimeTittleBackground(); //Change header tittle gif background
            // Restore the city data and use it if use input invalid city info
            app.restoreBackupWeather(false);
            app.weatherIconAndDescriptionDisplay(); // Display weather icon
        }
    });
};

app.getCurrentLocationWeather = () => {
    const locationApi = app.config.locationApi;
    const weatherObj = app.props.weather;
    //Get data from location API
    app.Util.apiCall({
        url: locationApi.url,
        data: {
            api_key: locationApi.key
        }
    }, (result) => {
        //Put location data into weather API to get current weather
        weatherObj.city = result.city;
        weatherObj.country = result.country_code;
        app.setLocationAndDisplayWeather(weatherObj);
    })
};

app.temperatureUnitTransferMethod = () => { //Unit Transfer function
    $('.currentTempertureNumber').text(app.props.weather.temperature);
    $('.currentFeelsLikeTemperatureNumber').text(app.props.weather.feelsLike);
    $('.fahrenheitSign').addClass('.onusedSign');
    $('.centigradeSign').removeClass('.onusedSign');
    app.props.isUnitCentigrade = !app.props.isUnitCentigrade;
};



app.renderTempretureData = (unit) => { //Saving data when centigrade is used on page
    const weatherObj = app.props.weather,
        htmlcontent = `
<div class="savingTemperatureDataDisplayDiv">
    <p>The weather in ${weatherObj.city}, ${weatherObj.country} is:</p>
    <p>${weatherObj.description}, ${weatherObj.temperature}°${unit}, feels like ${weatherObj.feelsLike}°${unit}.</p>
    <p>Pressure: ${weatherObj.pressue} mb.</p>
    <p>Humidity: ${weatherObj.humidity}%.</p>
    <p>Wind: ${weatherObj.windSpeed} m/s  ${weatherObj.windDirection}</p>
    <button class="importantButton">Highlight This!</button>
</div>
`
    $('.savingWeatherDataDisplay').append(htmlcontent);
};

app.currentTimeWallPaper = () => {
    $('body').toggleClass(app.props.weather.dayNight === 'n' ? 'nightTimeWallPaper' : 'dayTimeWallPaper')
};

app.currentTimeTittleBackground = () => {
    const currCode = app.props.weather.code,
        thunderCodes = [200, 201, 202, 230, 231, 232, 233],
        rainingCodes = [300, 301, 302, 500, 501, 502, 511, 520, 521, 522],
        snowCodes = [600, 601, 602, 610, 611, 612, 621, 622, 623],
        fogCodes = [700, 711, 721, 731, 741, 751],
        cloudyCodes = [801, 802, 803, 804];

    if (thunderCodes.indexOf(currCode) !== -1) { //Thunder day title background gif
        clsName = 'thunerTittleTextArea';
    } else if (rainingCodes.indexOf(currCode) !== -1) { //Raining day tittle background gif
        clsName = 'rainingTittleTextArea';
    } else if (snowCodes.indexOf(currCode) !== -1) { //Snowing day tittle background gif
        clsName = 'snowingTittleTextArea';
    } else if (fogCodes.indexOf(currCode) !== -1) { //Fogging day tittle background gif
        clsName = 'foggingTittleTextArea';
    } else if (currCode === 800) { //Sunny day tittle background gif
        clsName = 'clearSkyTittleTextArea';
    } else if (cloudyCodes.indexOf(currCode) !== -1) { //Cloudy day tittle background gif
        clsName = 'cloudySkyTittleTextArea';
    };

    $('#headerTextArea').toggleClass(clsName);
};

app.weatherIconAndDescriptionDisplay = () => {
    const currCode = app.props.weather.code,
        dayNight = app.props.weather.dayNight,
        insertImage = (image, alt) => {
            $('#weatherIconDiv').empty();
            $('#weatherIconDiv').append(`<img src="./image/${image}" alt="${alt} logo">`);
        },
        insertWithCondition = (image, alt) => {
            let isNight = dayNight === 'n',
                dayNightSymbol = isNight ? 'n' : 'd',
                imageName = `${image}${dayNightSymbol}.png`,
                altLabel = `${alt} ${isNight ? 'nighttime' : 'daytime'}`;
            insertImage(imageName, altLabel);
        };

    if ([200, 201, 202].indexOf(currCode) !== -1) {
        insertWithCondition('200', 'thunder rain');
    } else if ([230, 231, 232, 233].indexOf(currCode) !== -1) {
        insertWithCondition('230', 'hunder drizzle');
    } else if ([300, 301, 302].indexOf(currCode) !== -1) {
        insertImage('300.png', 'drizzle');
    } else if ([500, 501, 511].indexOf(currCode) !== -1) {
        insertImage('500.png', 'light Rain');
    } else if (502 === currCode) {
        insertImage('502.png', 'heavy Rain');
    } else if ([520, 522].indexOf(currCode) !== -1) {
        insertWithCondition('520', 'shower rain');
    } else if (521 === currCode) {
        insertWithCondition('521', 'shower rain');
    } else if ([600, 610, 621].indexOf(currCode) !== -1) {
        insertWithCondition('600', 'light snow');
    } else if ([601, 602, 622].indexOf(currCode) !== -1) {
        insertImage('601.png', 'heavy Snow');
    } else if ([611, 612].indexOf(currCode) !== -1) {
        insertImage('611.png', 'sleet');
    } else if (623 === currCode) {
        insertImage('623.png', 'flurries');
    } else if ([700, 711, 721, 731, 741, 751].indexOf(currCode) !== -1) {
        insertWithCondition('700', 'mist');
    } else if (800 === currCode) {
        insertWithCondition('800', 'clear sky');
    } else if ([801, 802].indexOf(currCode) !== -1) {
        insertWithCondition('801', 'few clouds');
    } else if (803 === currCode) {
        insertWithCondition('803', 'broken clouds');
    } else if (804 === currCode) {
        insertImage('804.png', 'overcast clouds');
    } else { //code = 900
        insertImage('900.png', 'overcast clouds');
    };
    $('.currentWeatherDescriptionDisplay').empty();
    $('.currentWeatherDescriptionDisplay').append(app.props.weather.description);
};

//Building a custom alert box -- used in application guide
window.alert = alert;
app.alertSituation = 0;
function alert(e) {
    if (app.alertSituation === 0) {
        $('body').append(`
        <div id="newAlertBox">
            <div id="newAlertBoxTittle">Application Guide ( ･ω･ )ﾉ<span class="boxCloseButton">x</span></div>
            <div id="newAlerBoxMessege">`+ e + `</div>
            <button id="newAlerBoxCloseButton" class="boxCloseButton">I Got It!</button>
        </div>
     `);
        app.alertSituation = 1;
    };
    $('.boxCloseButton').click(function () {
        $('#newAlertBox').remove();
        app.alertSituation = 0;
    });
};

//Building a custom alert box -- used in unit switch and invalid input
app.promptSituation = 0;
window.prompt = function prompt(e) {
    if (app.promptSituation === 0) {
        $('body').append(`
        <div id="newPromptBox">
            <div id="newPromptBoxTittle">Oops (ﾟoﾟ〃)<span class="boxPromptCloseButton">x</span></div>
            <div id="newPromptBoxMessege">`+ e + `</div>
            <button id="newPromptBoxCloseButton" class="boxPromptCloseButton">Thanks!</button>
        </div>
     `);
        app.promptSituation = 1;
    };
    $('.boxPromptCloseButton').click(function () {
        $('#newPromptBox').remove();
        app.promptSituation = 0;
    });
};

//Building a custom comfirm box -- used in country abbr code check
app.confirmSituation = 0;
window.confirm = function confirm(e) {
    if (app.confirmSituation === 0) {
        $('body').append(`
        <div id="newConfirmBox">
            <div id="newConfirmBoxTittle">(╭☞•́•̀)╭☞ Please find your code below: <span class="boxConfirmCloseButton">x</span></div>
            <div id="newConfirmBoxMessege">`+ e + `</div>
            <div id="newConfirmBoxButtonDiv">
                <button id="newConfirmBoxCloseButton" class="boxConfirmCloseButton">I Found My Code!</button>
                <button id="newConfirmBoxMoreInfoButton" value="false">More Area Code</button>
            </div>
        </div>
     `);
        app.confirmSituation = 1;
    };
    $('.boxConfirmCloseButton').click(function () {
        $('#newConfirmBox').remove();
        app.confirmSituation = 0;
    });
    $('#newConfirmBoxMoreInfoButton').click(function () {
        $('#newConfirmBox').remove();
        $('.commonAbbrCode').off('click').hide();
        $('.externalLink').show();
    });
};

app.init = () => {
    app.getCurrentLocationWeather();
    $('.centigradeSign').attr('id', 'onUsedUnitSignButton'); //Default used Centigrade
};

$(() => {

    const weatherObj = app.props.weather;

    app.init();

    $('.locationInputForm').on(`submit`, function (event) { //Input city name 
        event.preventDefault();
        app.props.isUnitCentigrade = true; //Centigrade default

        $('.centigradeSign').attr('id', 'onUsedUnitSignButton'); //Default used
        $('.fahrenheitSign').removeAttr('id');//Default used 

        //City name uses first letter upper case
        weatherObj.city = app.Util.strCapitalize($('#cityNameInput').val());

        //Country abbr uses upper case
        weatherObj.country = $('#countryNameInput').val().toUpperCase();

        app.setLocationAndDisplayWeather(weatherObj);
        app.currentTimeWallPaper(); //Change wall paper
        app.currentTimeTittleBackground(); //Change header tittle gif background
        app.weatherIconAndDescriptionDisplay(); // Display weather icon
    });

    $('.centigradeSign').click(function (event) { //Transfer to Centigrade
        event.preventDefault();
        if (app.props.isUnitCentigrade === true) {
            prompt(`You already used <strong>Centigrade</strong> as unit!`)
        } else {
            weatherObj.temperature = app.Util.toCentigrade(weatherObj.temperature);
            weatherObj.feelsLike = app.Util.toCentigrade(weatherObj.feelsLike);

            $('.currentFeelsLikeTemperatureSign').text(`°C`);
            app.temperatureUnitTransferMethod();

            $('.fahrenheitSign').removeAttr('id');
            $('.centigradeSign').attr('id', 'onUsedUnitSignButton');
        }
    });

    $('.fahrenheitSign').click(function (event) { //Transfer to Fahrenheit
        event.preventDefault();
        if (app.props.isUnitCentigrade === false) {
            prompt(`You already used <strong>Fahrenheit</strong> as unit!`)
        } else {
            weatherObj.temperature = app.Util.toFahrenheit(weatherObj.temperature);
            weatherObj.feelsLike = app.Util.toFahrenheit(weatherObj.feelsLike);

            $('.currentFeelsLikeTemperatureSign').text(`°F`);
            app.temperatureUnitTransferMethod();
            $('.centigradeSign').removeAttr('id');
            $('.fahrenheitSign').attr('id', 'onUsedUnitSignButton');
        }
    });

    $('.savingWeatherDataButton').click(function (event) { //Saving weather data
        event.preventDefault();
        let unit = (app.props.isUnitCentigrade === true) ? 'C' : 'F';
        app.renderTempretureData(unit);
    });

    $('.savingWeatherDataDisplay').on('click', '.importantButton', function () {
        $(this).parent('div').toggleClass('importantData');
        $(this).toggleClass('importantButtonFlag');
    });

    $('.commonAbbrCode').click(function (event) {
        event.preventDefault();
        confirm(app.countryAbbreviationCode);
    });

    $('.headerTopDiv button').click(function (event) {
        event.preventDefault();
        alert(app.applicationGuideContent);
    });
});
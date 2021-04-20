  /**
   * Name: "Script for weather service"
   * Date: 20.01.21.
   * Version: 1.0
   * Autor: Kremenchuk Yaroslav
   */
  
  "use strict"

  const sendButton = document.getElementById('send-req');
  const cityname = document.getElementById('searchField');
  const todayList = document.getElementById('todayList');
  const forecastdayList = document.getElementById('forecastdayList');
  const tog_menu = document.querySelector('.tog-menu');
  const error_loc = document.getElementById('error-loc');

  function getLocation() {                           
    fetch('https://ipinfo.io/?token=7872718c4c703f')
    .then(response => locationOff(response))
    .then(dataloc => getWeather(dataloc));
  };
  
  sendButton.addEventListener('click', (event) => {
    event.preventDefault();
    forecastdayList.style.display = 'none';
    error_loc.style.display = 'none';
    setTimeout(function(){
      document.getElementById('forecast_info0').click();
    },3000);
    fetch('https://api.openweathermap.org/data/2.5/weather?q=' + `${cityname.value}` + '&appid=83400fcd5285dd37625fd2e10864086b')
    .then(response => errorWeather(response))
    .then(datacity => getWeather(datacity));
  });

  function getWeather(data) {                
    let lat, lon;
    if (data.loc) {
      cityname.value = data.city + ',' + data.country;
      let coordinates = data.loc.split(",");
      lat = coordinates[0];
      lon = coordinates[1];
    }else{
      cityname.value = data.name + ',' + data.sys.country;
      lat = data.coord.lat;
      lon = data.coord.lon;
    };

    fetch('https://api.openweathermap.org/data/2.5/onecall?lat=' + `${lat}` + '&lon=' + `${lon}` + '&APPID=83400fcd5285dd37625fd2e10864086b&units=metric')
    .then(response => errorWeather(response))
    .then(data => addCurrentWeather(data));

    fetch('https://api.openweathermap.org/data/2.5/find?lat=' + `${lat}` + '&lon=' + `${lon}` + '&cnt=5&appid=83400fcd5285dd37625fd2e10864086b&units=metric')
    .then(response => response.json())
    .then(data => addNearbyPlaces(data));

    fetch('https://api.openweathermap.org/data/2.5/forecast?q=' + `${cityname.value}` + '&appid=83400fcd5285dd37625fd2e10864086b&units=metric')
    .then(response => response.json())
    .then(data => addForecastTable(data));
  };

  function locationOff(response) {         
    if( !response.ok ) {
      error_loc.style.display = 'block';
      todayList.style.display = 'none';
      forecastdayList.style.display = 'none';
      tog_menu.style.display = 'none';
    } else {
      error_loc.style.display = 'none';
      todayList.style.display = 'block';
      tog_menu.style.display = 'block';
      return response.json();
    };
  };

  function errorWeather(response) {             
    const error404 = document.getElementById('error404');
    if( !response.ok ) {
      error404.style.display = 'block';
      todayList.style.display = 'none';
      forecastdayList.style.display = 'none';
      tog_menu.style.display = 'none';
    } else {
      error404.style.display = 'none';
      todayList.style.display = 'block';
      tog_menu.style.display = 'block';
      return response.json();
    };
  };

  function addEvents(){
    const todaySelector = document.getElementById('today-selector');
    const forecastSelector = document.getElementById('forecast-selector');
    const tog_menu = document.querySelector('.tog-menu');
    let activeEl = null;

    todaySelector.addEventListener('click', () => {
      todayList.style.display = 'block';
      forecastdayList.style.display = 'none';
    });
    
    forecastSelector.addEventListener('click', () => {
      todayList.style.display = 'none';
      forecastdayList.style.display = 'block';
    });

    document.addEventListener('DOMContentLoaded', function(){
      setTimeout(function(){
        document.getElementById('forecast_info0').click();
      },3000);
  
      todaySelector.click();
    });

    tog_menu.onclick = function(event){
      let target = event.target.closest('.link-style');
      
      if(target){
        if(activeEl){
          activeEl.classList.remove('link-style-active');
        };
        activeEl = target;
        activeEl.classList.add('link-style-active');
      };
    };
  };

  function timeConverter(timestemp) {
    let utcTime = new Date(timestemp * 1000);
    let hours = utcTime.getHours();
    let minutes = utcTime.getMinutes();
    let convertTime = hours + ':' + minutes;
    return convertTime;
    
  };

  function getCurrentDate() {
    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth()+1;
    let year = date.getFullYear();
    let content = day + '.' + month + '.' + year;
  
    const currentDate = document.getElementById('current-date');
    addElement('h3', content, '', currentDate);
  };

  function addElement(tag, content, cl, parent){
    const el = document.createElement(tag);
    el.innerHTML = content;
    el.className= cl;
    parent.append(el);
    return el;
  };

  function addCurrentWeather(data) {           
    const curWeather = document.getElementById('curWeather');
    let flex = curWeather.querySelector('.flex-weather');
    
    if(flex) {        
      flex.remove();
    };

    let sunrise = timeConverter(data.current.sunrise);
    let sunset = timeConverter(data.current.sunset);
    let duration = timeConverter(data.current.sunset - data.current.sunrise);
    
    let current_content = `
      <div class="weather-img">
          <img src="http://openweathermap.org/img/wn/${data.current.weather[0].icon}.png" alt="${data.current.weather[0].main}">
          <p>${data.current.weather[0].description}</span>
      </div>
      <div class="current-temperature">
          <p>${data.current.temp}&#176;C</p>
          <span>Reel feel: ${data.current.feels_like}&#176;C</p>
      </div>
      <div class="sys">
          <p>Sunrise: ${sunrise} AM</p>
          <p>Sunset: ${sunset} PM</p>
          <p>Duration: ${duration} hr</p>
      </div>
    `;

    addElement('div', current_content, 'flex-weather', curWeather);

    const hourly = document.getElementById('hourlyWeather');
    let hourlyTime = data.hourly.slice(1, 7);

    while(hourly.hasChildNodes()){
      hourly.removeChild(hourly.firstChild);
    };
    
    let hourly_content = `
      <div class="bold-font">TODAY</div>
      <div class="bold-font"></div>
      <div class="bold-font">Forecast</div>
      <div class="bold-font">Temp(&#176;C)</div>
      <div class="bold-font">RealFeal</div>
      <div class="bold-font">Wind(km/h)</div>
    `;
    
    addElement('div', hourly_content, 'table-weather', hourly);

    for( let i = 0; i < hourlyTime.length; i++ ){
      let shortObj = [];
      shortObj.push(hourlyTime[i]);
      let gmtTime = new Date(shortObj[0].dt*1000);
      let gmtHours = gmtTime.getHours();
      let ampm = gmtHours >= 12 ? 'pm' : 'am';
      let windDeg = shortObj[0].wind_deg;
           if (windDeg>=0 && windDeg<22.5) {
                  windDeg = "N";
               } else if (windDeg>=22.5 && windDeg<67.5) {
                  windDeg = "N-E";
                }else if (windDeg>=67.5 && windDeg<112.5) {
                  windDeg = "E";
                }else if (windDeg>=112.5 && windDeg<157.5) {
                  windDeg = "S-E";
                }else if (windDeg>=157.5 && windDeg<202.5) {
                  windDeg = "S";
                }else if (windDeg>=202.5 && windDeg<247.5) {
                  windDeg = "S-W";
                }else if (windDeg>=247.5 && windDeg<292.5) {
                  windDeg = "W";
                }else if (windDeg>=292.5 && windDeg<337.5) {
                  windDeg = "N-W";
                }else if (windDeg>=337.5) {
                  windDeg = "N";
                };
      
      let content = `
          <div>${gmtHours} ${ampm}</div>
          <div><img src="http://openweathermap.org/img/wn/${shortObj[0].weather[0].icon}.png" alt="${shortObj[0].weather[0].main}"></div>
          <div>${shortObj[0].weather[0].description}</div>
          <div>${shortObj[0].temp}&#176;</div>
          <div>${shortObj[0].feels_like}&#176;</div>
          <div>${shortObj[0].wind_speed} ${windDeg}</div>
        `;
        
        addElement('div', content, 'table-weather', hourly);
    };

    let dailylist = data.daily;
    addForcastList(dailylist);
  };

  function addNearbyPlaces(data){              
    const nearby = document.getElementById('nearbyPlaces');
    let citylist = nearby.querySelector('.citylist');

    if(citylist){
      citylist.remove();
    };

    let content = `
      <div class="city-info">
          <div><p>${data.list[1].name}</p></div>
          <div class="flexbox">
            <img src="http://openweathermap.org/img/wn/${data.list[1].weather[0].icon}.png" alt="${data.list[1].weather[0].main}">
            <p>${data.list[1].main.temp}&#176;C</p>
          </div>
      </div>
      <div class="city-info">
          <div><p>${data.list[2].name}</p></div>
          <div class="flexbox">
            <img src="http://openweathermap.org/img/wn/${data.list[2].weather[0].icon}.png" alt="${data.list[2].weather[0].main}">
            <p>${data.list[2].main.temp}&#176;C</p>
          </div>
      </div>
      <div class="city-info">
          <div><p>${data.list[3].name}</p></div>
          <div class="flexbox">
            <img src="http://openweathermap.org/img/wn/${data.list[3].weather[0].icon}.png" alt="${data.list[3].weather[0].main}">
            <p>${data.list[3].main.temp}&#176;C</p>
          </div>
      </div>
      <div class="city-info">
          <div><p>${data.list[4].name}</p></div>
          <div class="flexbox">
            <img src="http://openweathermap.org/img/wn/${data.list[4].weather[0].icon}.png" alt="${data.list[4].weather[0].main}">
            <p>${data.list[4].main.temp}&#176;C</p>
          </div>
      </div>
    `;

    addElement('div', content, 'citylist', nearby);
  };

  function addForcastList(data){                  
    const forecastList = document.getElementById('forecastWeather');
    let monthArr = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    let dayArr = ["SUN","MON","TUE","WED","THI","FRI","SAT"];

    while(forecastList.hasChildNodes()){
      forecastList.removeChild(forecastList.firstChild);
    };

    for( let i = 0; i < data.length-2; i++ ){
      let curDate = new Date(data[i].dt*1000);
      let tDate = curDate.getFullYear() + '-' +curDate.getMonth()+1 + '-' + curDate.getDate();
      let day = dayArr[curDate.getDay()];
      let date = monthArr[curDate.getMonth()] + curDate.getDate();
      let content = `
        <div id="forecast_info${i}">
          <h3>${day}</h3>
          <p>${date}</p>
          <img src="http://openweathermap.org/img/wn/${data[i].weather[0].icon}.png" alt="${data[i].weather[0].description}">
          <p class="blue-font">Min: ${data[i].temp.min}&#176;C</p>
          <p class="red-font">Max: ${data[i].temp.max}&#176;C</p>
          <p>${data[i].weather[0].main}</p>
          <strong style="display: none;">${tDate}</strong>
        </div>
      `;
      
      addElement('div', content, 'forecast-list', forecastList);
    };
  };

  function addForecastTable(data){          
    const forecastTab = document.getElementById('forecastHourly');
    const forecastList = document.getElementById('forecastWeather');
    let weatherList = data.list;
    let activeEl = null;

    while(forecastTab.hasChildNodes()){
      forecastTab.removeChild(forecastTab.firstChild);
    };

    weatherList.forEach(function (dt_txt, j){
      weatherList[j].dt_txt = weatherList[j].dt_txt.split(" ");
    });
    
    forecastList.onclick = function(event){
      let target = event.target.closest('.forecast-list');
      
      if(target){
        if(activeEl){
          activeEl.classList.remove('active');
        }
        activeEl = target;
        activeEl.classList.add('active');
      };
      
      let short_weatherList = [];
      if(!target){
        return;
      } else {
        let date_target = target.querySelector('strong').innerHTML;
        
        let previous_dtDate;
        let weatherListGrouped = [];

        for(let index in weatherList){
          let dtDate = weatherList[index].dt_txt[0]; 
          if(dtDate != previous_dtDate){
            let new_dtDate = dtDate;
            weatherListGrouped[new_dtDate] = [];
            for(index in weatherList){
              if(weatherList[index].dt_txt[0] == dtDate){
                weatherListGrouped[new_dtDate].push(weatherList[index]);
                
              };
            };
          };
        };
        
        for(let list in weatherListGrouped){
          if (list == date_target){
            short_weatherList.push(weatherListGrouped[list]);
          };
        };

        while(forecastTab.hasChildNodes()){
          forecastTab.removeChild(forecastTab.firstChild);
        };

        let content = `
        <div class="bold-font"></div>
        <div class="bold-font"></div>
        <div class="bold-font">Forecast</div>
        <div class="bold-font">Temp(&#176;C)</div>
        <div class="bold-font">RealFeal</div>
        <div class="bold-font">Wind(km/h)</div>
        `;

        addElement('div', content, 'table-weather', forecastTab);
console.log(data);
        for(let i = 0; i < short_weatherList[0].length; i++){
          let gmtTime = new Date(short_weatherList[0][i].dt*1000);
          let gmtHours = gmtTime.getHours();
          let ampm = gmtHours >= 12 ? 'pm' : 'am';
          let windDeg = short_weatherList[0][i].wind.deg;
          
          if (windDeg>=0 && windDeg<22.5) {
            windDeg = "N";
          } else if (windDeg>=22.5 && windDeg<67.5) {
            windDeg = "N-E";
          }else if (windDeg>=67.5 && windDeg<112.5) {
            windDeg = "E";
          }else if (windDeg>=112.5 && windDeg<157.5) {
            windDeg = "S-E";
          }else if (windDeg>=157.5 && windDeg<202.5) {
            windDeg = "S";
          }else if (windDeg>=202.5 && windDeg<247.5) {
            windDeg = "S-W";
          }else if (windDeg>=247.5 && windDeg<292.5) {
            windDeg = "W";
          }else if (windDeg>=292.5 && windDeg<337.5) {
            windDeg = "N-W";
          }else if (windDeg>=337.5) {
            windDeg = "N";
          };

          let content = `
              <div>${gmtHours} ${ampm}</div>
              <div><img src="http://openweathermap.org/img/wn/${short_weatherList[0][i].weather[0].icon}.png" alt="${short_weatherList[0][i].weather[0].main}"></div>
              <div>${short_weatherList[0][i].weather[0].description}</div>
              <div>${short_weatherList[0][i].main.temp}&#176;</div>
              <div>${short_weatherList[0][i].main.feels_like}&#176;</div>
              <div>${short_weatherList[0][i].wind.speed} ${windDeg}</div>
            `;

          addElement('div', content, 'table-weather', forecastTab);
        };
      };
    };
  };

  getLocation();
  addEvents();
  getCurrentDate();
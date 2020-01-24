
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', event => {
  fetchTemperatureData();
});

function generateChart(temps, humidity) {
  var chart = new CanvasJS.Chart('chartContainer', {
    animationEnabled: true,
    theme: 'dark2',
    title:{
      text: 'Temperature and Humidity'
    },
    axisX:{
      valueFormatString: 'h:mm TT',
      crosshair: {
        enabled: true,
        snapToDataPoint: true
      }
    },
    axisY: {
      title: 'Temperature (F)',
      crosshair: {
        enabled: true
      },
      minimum: 40,
      maximum: 100,
      interval: 10
    },
    axisY2: {
      title: 'Relative Humidity (%)',
      crosshair: {
        enabled: true
      },
      minimum: 0,
      maximum: 100
    },
    toolTip:{
      shared: true,
      content: '{name}: {y} {label}'
    },  
    legend:{
      cursor:'pointer',
      verticalAlign: 'bottom',
      horizontalAlign: 'center',
      dockInsidePlotArea: false
    },
    data: [{
      type: 'line',
      showInLegend: true,
      name: 'Temperature',
      label: 'F',
      markerType: 'square',
      xValueFormatString: 'h:mm TT',
      color: '#F08080',
      dataPoints: temps
    },
    {
      type: 'line',
      axisYType: 'secondary',
      showInLegend: true,
      name: 'Humidity',
      label: '%',
      lineDashType: 'dash',
      dataPoints: humidity
    }]
  });

  chart.render();
}

function updateCards(temp, time) {
  let prettyTime = formatTime(time);

  let tempSpan = document.getElementById('latestTemp')
  tempSpan.innerHTML = `${temp} &#8457`;

  let updatedSpan = document.getElementById('lastUpdate');
  updatedSpan.textContent = `Last Update: ${prettyTime}`;
}

function fetchTemperatureData() {
  // declares a new date object equal to 24 hours ago
  let yesterday = new Date(new Date().valueOf() - 86400000);

  db.collection('temp_records').where('timestamp', '>', yesterday).orderBy('timestamp', 'desc').get().then(querySnapshot => {
    let temperature = [];
    let humidity = [];

    let count = 0;

    querySnapshot.forEach(doc => {
      let data = doc.data();
      let datetime = new Date(data.endTime);
      let tempF = convertToFahrenheit(data.temp);

      if (count == 0) {
        let latestTemp = tempF.toFixed(2);
        let updatedAt = datetime;

        updateCards(latestTemp, updatedAt);
      }

      temperature.push({
        x: datetime,
        y: tempF
      });

      humidity.push({
        x: datetime,
        y: data.humidity
      });

      count++;
    });

    generateChart(temperature, humidity);
  }).catch(error => {
    console.log(error);
  });
}

function convertToFahrenheit(temp) {
  return temp * 9 / 5 + 32;
}

function formatTime(time) {
  return time.toLocaleTimeString();
}
async function getWeather() {
    const apiKey = "4c4aa6c96077526f38ada9da54a96b12";
    const city = document.getElementById("location").value.trim();
    const resultDiv = document.getElementById("result");
    
    if (!city) {
        resultDiv.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-circle"></i> Please Enter a City!</div>';
        return;
    }

    resultDiv.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

    try {
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
        console.log("Geo URL:", geoUrl);
        const geoRes = await fetch(geoUrl);
        
        if (!geoRes.ok) {
            const errorText = await geoRes.text();
            console.log("Geo API Error Response:", errorText);
            throw new Error(`Geo API error: ${geoRes.status} - ${errorText}`);
        }
        
        const geoData = await geoRes.json();
        
        if (geoData.length === 0) {
            resultDiv.innerHTML = '<div class="error-message"><i class="fas fa-map-location-dot"></i> City Not Found</div>';
            return;
        }
        
        const { lat, lon, name } = geoData[0];
        const country = geoData[0].country || "";

        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
        const weatherRes = await fetch(weatherUrl);
        
        if (!weatherRes.ok) {
            throw new Error(`Weather API error: ${weatherRes.status}`);
        }
        
        const weatherData = await weatherRes.json();
        if (weatherData.main.temp > 30) {
            alert("It's quite hot outside! Stay hydrated and avoid prolonged sun exposure.");
            document.getElementById("advise").innerHTML = "<p style='color: whitesmoke; font-weight: bold;'>It's quite hot outside! Stay hydrated and avoid prolonged sun exposure.</p>";
        }
         else if (weatherData.main.temp < 10) {
            document.getElementById("advise").innerHTML = "<p style='color: blue; font-weight: bold;'>It's quite cold outside! Dress warmly and take care in chilly conditions.</p>";
            alert("It's quite cold outside! Dress warmly and take care in chilly conditions.")
        }
        

        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
        const forecastRes = await fetch(forecastUrl);
        const forecastData = await forecastRes.json();

       
       
        // Build feature cards (small grid)
        const humidity = weatherData.main.humidity;
        const rainfall = weatherData.rain ? (weatherData.rain["1h"] || 0) : 0;
        const sunshine = weatherData.clouds ? (100 - weatherData.clouds) : 0;

        let featureCardsHtml = `
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon"><i class="fas fa-sun"></i></div>
                    <div class="feature-value">${sunshine.toFixed(0)}%</div>
                    <div class="feature-label">Sunshine</div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon"><i class="fas fa-cloud-rain"></i></div>
                    <div class="feature-value">${rainfall.toFixed(1)} mm</div>
                    <div class="feature-label">Rainfall</div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon"><i class="fas fa-droplet"></i></div>
                    <div class="feature-value">${humidity}%</div>
                    <div class="feature-label">Humidity</div>
                </div>
            </div>
        `;

        // Build forecast table - filter for 5 days at 9am
        const fiveDayNineAm = [];
        const processedDates = new Set();
        
        forecastData.list.forEach(item => {
            const forecastDate = new Date(item.dt * 1000);
            const dateKey = forecastDate.toDateString();
            
            // Only process if we haven't seen this date and we have less than 5 days
            if (!processedDates.has(dateKey) && fiveDayNineAm.length < 5) {
                const hour = forecastDate.getHours();
                // Find entry closest to 9am (09:00)
                if (hour >= 6 && hour < 12) {
                    fiveDayNineAm.push(item);
                    processedDates.add(dateKey);
                }
            }
        });

        let forecastHtml = "<div class='forecast-container'><table class='forecast-table'>";
        forecastHtml += `
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Temperature</th>
                    <th>Condition</th>
                    <th>Humidity</th>
                </tr>
            </thead>
            <tbody>
        `;
        
        fiveDayNineAm.forEach(item => {
            const forecastDate = new Date(item.dt * 1000);
            const dateStr = forecastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const timeStr = forecastDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            
            forecastHtml += `
                <tr>
                    <td>${dateStr}</td>
                    <td>${timeStr}</td>
                    <td><strong>${item.main.temp}°C</strong></td>
                    <td>${item.weather[0].description}</td>
                    <td>${item.main.humidity}%</td>
                </tr>
            `;
        });
        forecastHtml += `
            </tbody>
        </table></div>`;

        resultDiv.innerHTML = `
            <div class="weather-container">
                <div class="location-header">
                    <h3>${city}, ${country}</h3>
                    <p class="current-temp">${weatherData.main.temp}°C</p>
                    <p class="current-condition">${weatherData.weather[0].description}</p>
                </div>
                ${featureCardsHtml}
                <h4 class="forecast-title">5-Day Forecast</h4>
                ${forecastHtml}
            </div>
        `;
           } catch (error) {
        console.error(error);
        resultDiv.innerHTML = '<div class="error-message"><i class="fas fa-triangle-exclamation"></i> Something Went Wrong. Try Again.</div>';
    }
}
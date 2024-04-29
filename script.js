document.addEventListener('DOMContentLoaded', function() {
    const sensorGrid = document.getElementById('sensor-grid');

    async function fetchData() {
        const configResponse = await fetch('config.json');
        const sensors = await configResponse.json();

        for (let sensor of sensors) {
            const response = await fetch(`http://${sensor.host}/api/states/${sensor.entity_id}`, {
                headers: { 'Authorization': `Bearer ${sensor.token}` }
            });
            const data = await response.json();
            updateUI(sensor.name, sensor.entity_id, data.state);
        }
    }

    function updateUI(name, id, state) {
        let stateDisplay = state === 'on' ? 'Nein' : state === 'off' ? 'Ja' : state;
        let colorClass = state === 'on' ? 'sensor-on' : state === 'off' ? 'sensor-off' : '';

        let tile = document.getElementById(id);
        if (!tile) {
            tile = document.createElement('div');
            tile.id = id;
            tile.className = `sensor-tile ${colorClass}`;
            tile.innerHTML = `<div class="sensor-title">${name}</div><div class="sensor-value">${stateDisplay}</div>`;
            sensorGrid.appendChild(tile);
        } else {
            tile.className = `sensor-tile ${colorClass}`;
            tile.innerHTML = `<div class="sensor-title">${name}</div><div class="sensor-value">${stateDisplay}</div>`;
        }
    }

    fetchData();
    setInterval(fetchData, 5000); // Aktualisiert die Daten alle 5 Sekunden
});

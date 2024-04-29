fetch('config.json')
  .then(response => response.json())
  .then(config => {
    const sensorDataElement = document.getElementById("sensorData");
    const sensorStates = {};

    function updateSensorState(sensorState, customText) {
        let stateText = sensorState.state;
        if (stateText === "on") {
            stateText = "Nein";
        } else if (stateText === "off") {
            stateText = "Ja";
        }
        sensorStates[sensorState.entity_id] = `${customText}: ${stateText}`;
        sensorDataElement.innerHTML = Object.values(sensorStates).join('<br>');
    }

    function fetchAndDisplaySensorStates() {
        const websocket = new WebSocket("wss://" + config.home_assistant_ip + "/api/websocket");

        websocket.onopen = function() {
            const authPayload = JSON.stringify({
                type: "auth",
                access_token: config.access_token
            });
            websocket.send(authPayload);

            const getStatesPayload = JSON.stringify({
                id: 2,
                type: "get_states"
            });
            websocket.send(getStatesPayload);
        };

        websocket.onmessage = function(event) {
            const eventData = JSON.parse(event.data);

            if (eventData.type === "result" && eventData.id === 2) {
                const states = eventData.result;

                config.sensors.forEach(sensor => {
                    const sensorState = states.find(state => state.entity_id === sensor.entity_id);
                    if (sensorState) {
                        updateSensorState(sensorState, sensor.custom_text);
                    } else {
                        sensorDataElement.innerHTML += `<p>Sensor ${sensor.entity_id}: Not found</p>`;
                    }
                });
            }
        };
    }

    fetchAndDisplaySensorStates();

    const websocket = new WebSocket("wss://" + config.home_assistant_ip + "/api/websocket");

    websocket.onopen = function() {
        const authPayload = JSON.stringify({
            type: "auth",
            access_token: config.access_token
        });
        websocket.send(authPayload);

        const subscribeEventsPayload = JSON.stringify({
            id: 3,
            type: "subscribe_events",
            event_type: "state_changed"
        });
        websocket.send(subscribeEventsPayload);
    };

    websocket.onmessage = function(event) {
        const eventData = JSON.parse(event.data);

        if (eventData.type === "event" && eventData.event.event_type === "state_changed") {
            const newState = eventData.event.data.new_state;
            const entityId = newState.entity_id;
            const sensor = config.sensors.find(sensor => sensor.entity_id === entityId);
            if (sensor) {
                updateSensorState(newState, sensor.custom_text);
            }
        }
    };
  })
  .catch(error => console.error('Error fetching config.json:', error));

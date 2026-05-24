const BASE_URL = "https://localhost:20443/api/Save-JSON";

function displayResult(data) {
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "<pre>" + JSON.stringify(data, null, 2) + "</pre>";
}

function getInputData() {
    return {
        op: document.getElementById("op").value,
        x: Number(document.getElementById("x").value),
        y: Number(document.getElementById("y").value)
    };
}

async function sendGET() {
    try {
        const response = await fetch(BASE_URL);
        const data = await response.json();
        displayResult(data);
    } catch (error) {
        displayResult({ error: "Ошибка при GET запросе: " + error.message });
    }
}

async function sendPOST() {
    try {
        const body = getInputData();

        const response = await fetch(BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        displayResult(data);
    } catch (error) {
        displayResult({ error: "Ошибка при POST запросе: " + error.message });
    }
}

async function sendPUT() {
    try {
        const body = getInputData();

        const response = await fetch(BASE_URL, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        displayResult(data);
    } catch (error) {
        displayResult({ error: "Ошибка при PUT запросе: " + error.message });
    }
}

async function sendDELETE() {
    try {
        const response = await fetch(BASE_URL, {
            method: "DELETE"
        });

        const data = await response.json();
        displayResult(data);
    } catch (error) {
        displayResult({ error: "Ошибка при DELETE запросе: " + error.message });
    }
}
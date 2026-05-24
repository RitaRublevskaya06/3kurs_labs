const BASE_URL = "http://localhost:20000/api/Save-JSON";

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
    const response = await fetch(BASE_URL);
    const data = await response.json();
    displayResult(data);
}

async function sendPOST() {
    const body = getInputData();

    const response = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    const data = await response.json();
    displayResult(data);
}

async function sendPUT() {
    const body = getInputData();

    const response = await fetch(BASE_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    const data = await response.json();
    displayResult(data);
}

async function sendDELETE() {
    const response = await fetch(BASE_URL, {
        method: "DELETE"
    });

    const data = await response.json();
    displayResult(data);
}
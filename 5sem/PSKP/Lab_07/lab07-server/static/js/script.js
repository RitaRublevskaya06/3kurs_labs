async function loadData() {
  const jsonResponse = await fetch('/api/data.json');
  const jsonData = await jsonResponse.json();
  document.getElementById('json-data').textContent = JSON.stringify(jsonData, null, 2);

  const xmlResponse = await fetch('/api/data.xml');
  const xmlText = await xmlResponse.text();
  document.getElementById('xml-data').textContent = xmlText;
}

window.addEventListener('DOMContentLoaded', loadData);

const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  try {
    const farmId = '3180392530100142';
    const url = `https://sfl.world/map/${farmId}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    const html = await response.text();

    // Parsear o HTML (ajuste o seletor conforme o DOM do sfl.world)
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const patches = doc.querySelectorAll('table td'); // Placeholder

    const farmData = Array.from(patches).map((td, index) => ({
      patch: index + 1,
      harvestsRemaining: parseInt(td.textContent.trim()) || 0
    })).slice(0, 15); // Limita a 15 patches

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(farmData)
    };
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro ao buscar dados do sfl.world' })
    };
  }
};

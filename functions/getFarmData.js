const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

exports.handler = async (event, context) => {
  try {
    const farmId = '3180392530100142';
    const url = `https://sfl.world/map/${farmId}`;
    const response = await fetch(url);
    const status = response.status;
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${status} - ${response.statusText}`);
    }
    const html = await response.text();

    // Usar jsdom para parsear o HTML
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const patches = doc.querySelectorAll('table td'); // Ajuste conforme o DOM real

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
    console.error('Erro detalhado:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

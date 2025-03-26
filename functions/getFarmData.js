const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

exports.handler = async (event, context) => {
  try {
    const farmId = '3180392530100142';
    const url = `https://sfl.world/map/${farmId}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    const html = await response.text();

    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const patches = doc.querySelectorAll('table td');

    const farmData = Array.from(patches).map((td, index) => ({
      patch: index + 1,
      harvestsRemaining: parseInt(td.textContent.trim()) || 0
    })).slice(0, 15);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // Permite qualquer origem
      },
      body: JSON.stringify(farmData)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // Também em caso de erro
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};

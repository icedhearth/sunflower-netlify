const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

exports.handler = async (event, context) => {
  try {
    const farmId = '3180392530100142'; // Substitua pelo ID desejado
    const url = `https://sfl.world/map/${farmId}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    const html = await response.text();

    const dom = new JSDOM(html);
    const doc = dom.window.document;

    // Seleciona todos os <span> com <div class="small"> dentro
    const patchElements = doc.querySelectorAll('span:has(div.small)');

    const farmData = Array.from(patchElements).map((span, index) => {
      // Extrai o número do patch do atributo title
      const title = span.getAttribute('title') || '';
      const patchNumber = title.includes('Left:') 
        ? parseInt(title.split(':')[1].trim()) 
        : index + 1;

      // Extrai as colheitas restantes do <div class="small">
      const harvestsRemaining = parseInt(span.querySelector('div.small').textContent.trim()) || 0;

      return {
        patch: patchNumber,
        harvestsRemaining: harvestsRemaining
      };
    });

    // Ordena por número do patch
    farmData.sort((a, b) => a.patch - b.patch);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // Para CORS
      },
      body: JSON.stringify(farmData)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};

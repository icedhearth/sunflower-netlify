const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

exports.handler = async (event, context) => {
  try {
    const farmId = '3180392530100142'; // Substitua pelo ID correto, se necessário
    const url = `https://sfl.world/map/${farmId}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    const html = await response.text();

    const dom = new JSDOM(html);
    const doc = dom.window.document;

    // Seleciona todos os containers de patches
    const patchContainers = doc.querySelectorAll('div.position-relative');

    // Mapeia os dados de cada patch
    const farmData = Array.from(patchContainers).map((container, index) => {
      // Extrai o número do patch do atributo onclick
      const onclick = container.getAttribute('onclick') || '';
      const patchNumber = onclick.includes('Left:') 
        ? parseInt(onclick.split(':')[1].trim().replace("')", '')) 
        : index + 1;

      // Pega o número de colheitas restantes
      const span = container.querySelector('span:has(div.small)');
      const harvestsRemaining = span 
        ? parseInt(span.querySelector('div.small').textContent.trim()) || 0 
        : 0;

      return {
        patch: patchNumber,
        harvestsRemaining: harvestsRemaining
      };
    });

    // Remove duplicatas mantendo apenas a primeira ocorrência de cada patch
    const uniquePatches = Array.from(new Set(farmData.map(p => p.patch)))
      .map(patch => farmData.find(p => p.patch === patch));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(uniquePatches)
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

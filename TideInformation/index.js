const fetch = require('node-fetch');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

module.exports = async function (context, req) {
    const fullUrl = process.env.FULL_URL;
    context.log('JavaScript HTTP trigger function processed a request with full URL ' + fullUrl);
    const fullUrlResponse = await fetch(fullUrl);
    const tidePageText = await fullUrlResponse.text();
    const dom = new JSDOM(tidePageText);

    const highTideLowTide = Array.from(dom.window.document.querySelectorAll('h3')).map(h3 => h3.innerHTML);

    const highTide = highTideLowTide
	  .filter(tt => tt.indexOf('Hochwasser') >= 0)
	  .map(tt => tt.split('<br>')[1])[0];
    const lowTide = highTideLowTide
	  .filter(tt => tt.indexOf('Niedrigwasser') >= 0)
	  .map(tt => tt.split('<br>')[1])[0];
    
    context.log('High tide: ' + highTide);
    context.log('Low tide: ' + lowTide);

    const result = {
	high: highTide,
	low: lowTide,
	water: ''
    };

    const weatherReportP = dom.window.document.querySelector('h2 ~ p:not(.d-print-none)');
    
    if (weatherReportP) {
	const m = /Wassertemperatur (\S+)/.exec(weatherReportP.innerHTML);
	if (m) {
	    result.water = '' + m[1];
	}
    }

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: result
    };
}

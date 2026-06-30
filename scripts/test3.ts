import * as fs from 'fs';

async function main() {
  const url = `https://heatperu.com/trampas-de-vapor/balde-invertido`;
  const res = await fetch(url);
  const html = await res.text();
  
  const dataPageMatch = html.match(/data-page="([^"]+)"/);
  if (!dataPageMatch) {
    console.log('No data page match');
    return;
  }
  
  const jsonStr = dataPageMatch[1].replace(/&quot;/g, '"');
  const data = JSON.parse(jsonStr);
  
  if (data.props.commodities && data.props.commodities.data) {
    console.log(`Found commodities.data, length: ${data.props.commodities.data.length}`);
    if(data.props.commodities.data.length > 0) {
      console.log(JSON.stringify(data.props.commodities.data[0], null, 2));
    }
  } else {
    console.log('No commodities.data found in props.');
  }
}
main();

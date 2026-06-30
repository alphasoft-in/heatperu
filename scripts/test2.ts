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
  
  console.log('Props keys:', Object.keys(data.props));
  if (data.props.commodityList) {
    console.log(`Found commodityList, length: ${data.props.commodityList.length}`);
    if(data.props.commodityList.length > 0) {
      console.log(JSON.stringify(data.props.commodityList[0], null, 2));
    }
  } else if (data.props.commodities) {
    console.log(`Found commodities, length: ${data.props.commodities.length}`);
    if(data.props.commodities.length > 0) {
      console.log(JSON.stringify(data.props.commodities[0], null, 2));
    }
  } else {
    console.log('No commodities found in props.');
  }
}
main();

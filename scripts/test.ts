import * as fs from 'fs';

async function main() {
  const url = `https://heatperu.com/trampas-de-vapor`;
  const res = await fetch(url);
  const html = await res.text();
  
  const dataPageMatch = html.match(/data-page="([^"]+)"/);
  if (!dataPageMatch) {
    console.log('No data page match');
    return;
  }
  
  const jsonStr = dataPageMatch[1].replace(/&quot;/g, '"');
  const data = JSON.parse(jsonStr);
  
  // Imprimir estructura para ver dónde están las subcategorías (o si tienen otro nombre)
  console.log(Object.keys(data.props));
  if (data.props.categoryList) {
    console.log(`Found categoryList, length: ${data.props.categoryList.length}`);
    console.log(JSON.stringify(data.props.categoryList[0], null, 2));
  } else {
    console.log('No categoryList found in props.');
  }
}
main();

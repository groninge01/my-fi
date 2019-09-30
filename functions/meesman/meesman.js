const request = require('axios')
const cheerio = require('cheerio')
const parser = require('@joshuaavalon/cheerio-table-parser');

exports.handler = async (event, context) => {
  const url = 'https://www.meesman.nl/onze-fondsen/koersen-en-rendementen'
  const jsonKeys = ['fundName', 'fundDate', 'fundValue'];

  const array = [];
  let table, result;
  
  function cleanElem(e) {
      e = e.trim()
      if (e.match('€ ')) {
        e = e.substring(2)
      }
      return e;
    }

  try {
    const { data } = await request(url)
    const $ = cheerio.load(data)
    /* queryDOM */
    table = parser.parseTable($("table"));
    array.push(table[4]);
    array.push(table[5]);
    array.push(table[7]);

    const cleanArray = array.map(e => {
        a = [];
        e
        .slice(0,4)
        .filter(e => e !== '')
        .map(e => {
            a.push(cleanElem(e));
        });
        return a;
    })

    result = cleanArray.map(a => {
        let object = {};
        jsonKeys.forEach((k, i) => {
            object[k] = a[i];
        });
        return object;
    });

    console.log(result);
    
    return {
        statusCode: 200,
        body: JSON.stringify(result)
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error
      })
    }
  }
}
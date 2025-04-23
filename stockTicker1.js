const http = require('http');
const fs = require('fs');
const url = require('url');

const fileName = "companies.csv";
let companies = [];

//read csv
function readCSV() {
  try {
    const data = fs.readFileSync(fileName, 'utf8');
    const rows = data.trim().split('\n');
    rows.shift(); // Skip header

    //read into array companies
    companies = rows.map(line => {
      const [companyName, ticker, stockPrice] = line.split(',');
      return {
        companyName: companyName.trim(),
        ticker: ticker.trim(),
        stockPrice: parseFloat(stockPrice.trim())
      };
    });

  } catch (err) {
    console.error("Couldn't read CSV:", err);
  }
}
readCSV();

const PORT = process.env.PORT || 3000;

http.createServer(function (req, res) {
    const parsedUrl = url.parse(req.url, true);
    const query = parsedUrl.query;

  if (parsedUrl.pathname === "/") {
    
    const file = 'formpage.html';
    fs.readFile(file, function (err, txt) {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.write("Error loading form page");
        return res.end();
      }

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write(txt);
      res.end();
    });
  }

  else if (parsedUrl.pathname === "/process" && req.method === "GET") {
    //gets input and input type from form
    const input = query.name?.trim();
    const inputType = query.inputType;

    res.writeHead(200, { 'Content-Type': 'text/html' });

    let result;
    //should return true for result if it is found
    if (inputType == "ticker") {
        result = companies.find(compItem => compItem.ticker === input);
    } else if (inputType == "compName") {
        result = companies.find(compItem => compItem.companyName.includes(input));

    }

    //if it is found, return is true
    if (result) {
    //writes it to the console log
    console.log(result.companyName);
    console.log(result.ticker);
    console.log(result.stockPrice);

    //writes it to the page
      res.write(`Company: ${result.companyName}<br>`);
      res.write(`Ticker: ${result.ticker}<br>`);
      res.write(`Price: $${result.stockPrice}<br>`);
    } else {
      res.write("No matching company found.");
    }

    return res.end();
  }

  else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.write("Unknown page request");
    res.end();
  }

}).listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

console.log("Server running");

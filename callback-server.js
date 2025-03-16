


// I have developed different services for each functionality. You need to run one service at one time by
//  changing the " main " in the package.json file accoding to script tag in package.json
// I can make just one server with different controller and routes, since the task insisted to use the one and only route given there


import express from "express";
import { get } from "https";
import { get as httpGet } from "http";
import { adjustUrl } from "./utils";

const app = express();
const PORT = 3000;

const fetchTitleCallback = (url, callback) => {
  const client = url.startsWith("https") ? get : httpGet;

  client(url, (res) => {
    let data = "";
    
    res.on("data", (chunk) => data += chunk);
    
    res.on("end", () => {
      const match = data.match(/<title>(.*?)<\/title>/i);
      const title = match ? match[1] : "NO RESPONSE";
      callback(null, { url, title });
    });
  }).on("error", () => callback(null, { url, title: "NO RESPONSE" }));
};


app.get("/I/want/title", (req, res) => {
  let addresses = req.query.address;
  if (!addresses) return res.status(400).send("No address provided.");

  addresses = Array.isArray(addresses) ? addresses : [addresses];
  const urls = adjustUrl(addresses)

  let results = [];
  let completed = 0;

  urls.forEach((url, index) => {
    fetchTitleCallback(url, (err, result) => {
      results[index] = result;
      completed++;
      if (completed === urls.length) {
        const htmlResponse = `
          <html>
            <head></head>
            <body>
              <h1>Following are the titles of given websites:</h1>
              <ul>${results.map(t => `<li>${t.url} - "${t.title}"</li>`)}</ul>
            </body>
          </html>`;
        res.send(htmlResponse);
      }
    });
  });
});

app.use((req, res) => res.status(404).send("Not Found"));

app.listen(PORT, () => console.log(`Server running at :${PORT}`));

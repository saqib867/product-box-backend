import express from "express";
import http from "http";
import https from "https";
import { JSDOM } from "jsdom";
import { fromBinder, combineAsArray, End } from "baconjs"; 
import { adjustUrl } from "./utils.js"; 

const app = express();
const PORT = 3000;

const fetchTitle = (url) => {
  return fromBinder((sink) => {
    const protocol = url.startsWith("https") ? https : http;

    protocol
      .get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const dom = new JSDOM(data);
            const title = dom.window.document.querySelector("title")?.textContent || "NO RESPONSE";
            sink(title); 
          } catch {
            sink("NO RESPONSE");
          }
          sink(new End()); t
        });
      })
      .on("error", () => {
        sink("NO RESPONSE");
        sink(new End()); 
      });

    return () => {}; 
  });
};

app.get("/I/want/title", (req, res) => {
  let { address } = req.query;
  if (!address) return res.status(400).send("No address provided");

  const addresses = Array.isArray(address) ? address : [address];
  const urls = adjustUrl(addresses); 
stream
  const titleStreams = urls.map(url => fetchTitle(url).map(title => ({ url, title })));

  combineAsArray(titleStreams).onValues((...titles) => {
    console.log("Titles =>", titles); 

    const htmlResponse = `
      <html>
        <head></head>
        <body>
          <h1>Following are the titles of given websites:</h1>
          <ul>
            ${titles.map(({ url, title }) => `<li>${url} - "${title}"</li>`).join("")}
          </ul>
        </body>
      </html>`;

    res.send(htmlResponse);
  });
});


app.use((req, res) => res.status(404).send("Not Found"));

app.listen(PORT, () => console.log(`Server running :${PORT}`));

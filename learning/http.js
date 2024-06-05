import http from "http";
import fs from "fs";

const server = http.createServer((req, res) => {
  const val = req.url;
  res.write(`<h1>${val}</h1>`); // Close the <h1> tag properly
  fs.readFile("./home.cpp", (err, data) => {
    if (err) {
      res.writeHead(404); // Set 404 Not Found status code if file is not found
      res.end("File not found!");
    } else {
      res.write(data); // Write the contents of the file to the response
      // End the response after writing the file contents
    }
  });
  setTimeout(()=>res.end(),10)
});

server.listen(5000, () => {
  console.log("port available");
});

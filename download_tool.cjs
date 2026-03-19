const https = require('https');
const fs = require('fs');
const { execSync } = require('child_process');

const file = fs.createWriteStream("prometheus_decryptor.zip");
https.get("https://github.com/cycraft-corp/Prometheus-Decryptor/releases/download/1.2/prometheus_decryptor.zip", function(response) {
  if (response.statusCode === 302) {
    https.get(response.headers.location, function(res) {
      res.pipe(file);
      file.on('finish', function() {
        file.close();
        console.log("Downloaded.");
        execSync('unzip -o prometheus_decryptor.zip');
        console.log("Unzipped.");
        console.log(execSync('ls -la').toString());
      });
    });
  }
});

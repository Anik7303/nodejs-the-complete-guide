const fs = require('fs');

const requestHandler = (req, res) => {
    const url = req.url;
    switch(url) {
        case '/send-message':
            res.write('<html>');
            res.write('<head><title>Send Message</title></head>');
            res.write('<body>');
            res.write('<h2>Enter Message:</h2>');
            res.write('<form action="/message" method="POST">');
            res.write('<input type="text" name="message"><button type="submit">Send</button>');
            res.write('</form>');
            res.write('</body>');
            res.write('</html>');
            res.end();
            break;

        case '/message':
            switch(req.method) {
                case 'POST':
                    const body = [];
                    req.on('data', (chunk) => {
                        body.push(chunk);
                    });
                    req.on('end', () => {
                        const parsedBody = Buffer.concat(body).toString();
                        const message = parsedBody.split('=')[1];
                        fs.writeFile('message.txt', message, (err) => {
                            res.statusCode = 302;
                            res.setHeader('Location', '/');
                            res.end();
                        });
                    });
                    break;
                default:
                    res.statusCode = 302;
                    res.setHeader('Location', '/');
                    res.end();
            }
            break;

        default:
            // res.setHeader('Content-Type', 'text/html');
            res.write('<html>');
            res.write('<head><title>First Page</title></head>')
            res.write('<body><h1>Hello from NodeJS server!</h1></body>');
            res.write('</html>')
            res.end();
    }
}

module.exports = {
    handler : requestHandler
}

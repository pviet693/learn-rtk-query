// server.js
const jsonServer = require("json-server");
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

server.use(jsonServer.bodyParser);
server.use(middlewares);
server.use((req, res, next) => {
    if (["POST", "PUT", "PATCH"].includes(req.method)) {
        console.log(req.body);
        if (new Date(req.body.publishDate).getTime() < new Date().getTime()) {
            return res.status(422).json({
                error: {
                    publishDate: "Published date cannot be in the past"
                }
            })
        }
    }

    if (req.body.title === "admin") {
        return res.status(500).json({
            error: "Internal server error"
        })
    }

    setTimeout(() => {
        next();
    }, 2000);
});
server.use(router);
server.listen(3001, () => {
    console.log('JSON Server is running')
})
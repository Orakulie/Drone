import express from "express";

const server = express();

server.use(express.static("."));

// server.get("/", () => { });
// caching disabled for every route
server.use(function (req, res, next) {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
});
server.listen(8080, () => {
    console.log("Server started on port 8080");
})

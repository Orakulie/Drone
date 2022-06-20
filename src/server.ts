import express from "express";

const server = express();

server.use(express.static("."));

// server.get("/", () => { });

server.listen(8080, () => {
    console.log("Server started on port 8080");
})

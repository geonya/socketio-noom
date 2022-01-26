import "dotenv/config";
import express from "express";
import SocketIo from "socket.io";
import http from "http";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIo(httpServer);

wsServer.on("connection", (socket) => {
	socket.on("enter_room", (msg, done) => {
		console.log(msg);
		setTimeout(() => {
			done();
		}, 5000);
	});
});

httpServer.listen(process.env.PORT, () => {
	console.log(`✅ Listening on http://localhost:${process.env.PORT} 🚀`);
});

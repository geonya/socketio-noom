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
	socket.onAny((event) => {
		console.log(`Socket Event: ${event}`);
	});
	socket.on("enter_room", (room, nick, done) => {
		socket.join(room);
		done();
		socket["nickname"] = nick || "anonymous";
		socket.to(room).emit("join", socket.nickname); //send message everybody except me
	});
	socket.on("disconnecting", () => {
		socket.rooms.forEach((room) =>
			socket.to(room).emit("bye", socket.nickname)
		);
	});

	socket.on("new_message", (message, room, done) => {
		socket.to(room).emit("new_message", socket.nickname, message);
		done();
	});
});
httpServer.listen(process.env.PORT, () => {
	console.log(`✅ Listening on http://localhost:${process.env.PORT} 🚀`);
});

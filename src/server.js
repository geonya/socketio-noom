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

const getPublicRooms = () => {
	const {
		sockets: {
			adapter: { sids, rooms },
		},
	} = wsServer;
	const publicRooms = [];
	rooms.forEach((_, key) => {
		if (sids.get(key) === undefined) {
			publicRooms.push(key);
		}
	});
	return publicRooms;
};

const countUser = (room) => {
	return wsServer.sockets.adapter.rooms.get(room)?.size;
};

wsServer.on("connection", (socket) => {
	wsServer.sockets.emit("room_change", getPublicRooms());
	socket.onAny((event) => {
		console.log(`Socket Event: ${event}`);
	});
	socket.on("enter_room", (room, nick, done) => {
		socket.join(room);
		socket["nickname"] = nick || "";
		done(countUser(room));
		socket.to(room).emit("join", socket.nickname, countUser(room)); //send message everybody except me
		wsServer.sockets.emit("room_change", getPublicRooms(), countUser(room));
	});
	socket.on("disconnecting", () => {
		//before socket has left room
		socket.rooms.forEach((room) =>
			socket.to(room).emit("bye", socket.nickname, countUser(room) - 1)
		);
	});
	socket.on("nickname", (nick) => {
		socket["nickname"] = nick || "";
	});
	socket.on("disconnect", () => {
		//just socket has left room
		wsServer.sockets.emit("room_change", getPublicRooms());
	});

	socket.on("new_message", (message, room, done) => {
		socket.to(room).emit("new_message", socket.nickname, message);
		done();
	});
	socket.on("leave_room", (room, done) => {
		socket.to(room).emit("bye", socket.nickname, countUser(room) - 1);
		socket.leave(room);
		done();
	});
});
httpServer.listen(process.env.PORT, () => {
	console.log(`✅ Listening on http://localhost:${process.env.PORT} 🚀`);
});

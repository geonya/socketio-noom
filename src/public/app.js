import { CLOSING } from "ws";

const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");

const handleRoomSubmit = (event) => {
	event.preventDefault();
	const input = form.querySelector("input");
	socket.emit("enter_room", { payload: input.value }, () => {
		console.log("server is done"); // 서버에서 실행되는 콜백 함수
	});
	input.value = "";
};
form.addEventListener("submit", handleRoomSubmit);

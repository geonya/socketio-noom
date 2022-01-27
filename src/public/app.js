const socket = io();
const join = document.getElementById("join");
const joinForm = join.querySelector("form");

const room = document.getElementById("room");

room.hidden = true;
let roomName;
let nickName;

const addMessage = (message) => {
	const ul = room.querySelector("ul");
	const li = document.createElement("li");
	li.innerText = message;
	ul.appendChild(li);
};
const handleMessageSubmit = (event) => {
	event.preventDefault();
	const input = room.querySelector("input");
	const value = input.value;
	socket.emit("new_message", input.value, roomName, () => {
		addMessage(`You : ${value}`);
	});
	input.value = "";
};
const showRoom = () => {
	join.hidden = true;
	room.hidden = false;
	const h3 = room.querySelector("h3");
	h3.innerText = `Hello ${nickName}, This is Room : ${roomName}`;
	const messageForm = room.querySelector("form");
	messageForm.addEventListener("submit", handleMessageSubmit);
};

const handleRoomSubmit = (event) => {
	event.preventDefault();
	const roomNameInput = document.querySelector("#join #roomname");
	const nickNameInput = document.querySelector("#join #nickname");
	socket.emit(
		"enter_room",
		roomNameInput.value,
		nickNameInput.value,
		showRoom
	);
	socket.emit("nickname", nickNameInput.value);
	roomName = roomNameInput.value;
	nickName = nickNameInput.value;
};

joinForm.addEventListener("submit", handleRoomSubmit);

socket.on("join", (nickname) => {
	addMessage(`${nickname} is arrived!`);
});

socket.on("bye", (nickname) => {
	addMessage(`${nickname} left T^T`);
});

socket.on("new_message", (nickname, message) => {
	addMessage(`${nickname} : ${message}`);
});

const socket = io();
const nickNameForm = document.querySelector("#nickNameForm");
const createRoom = document.querySelector("#createRoom");
const room = document.querySelector("section");
const messageForm = room.querySelector("#messageForm");
const leaveBtn = document.querySelector("#leaveBtn");
const messageSubmit = messageForm.querySelector("form");

let roomName;
let nickName;

const makeMessage = (nickname, message, whom) => {
	const ul = document.querySelector("#messagePrint ul");
	const li = document.createElement("li");
	li.id = whom;
	const avatarDiv = document.createElement("div");
	const avatarImage = document.createElement("img");
	const nickNameDiv = document.createElement("div");
	const nickNameSpan = document.createElement("span");
	const messageDiv = document.createElement("div");
	avatarDiv.id = "avatar";
	avatarImage.src =
		"https://davidlowpa.com/wp-content/uploads/2021/08/empty-profile-picture-png-2-2-1.png";
	avatarDiv.appendChild(avatarImage);
	nickNameDiv.id = "nickName";
	nickNameSpan.innerText = nickname;
	nickNameDiv.appendChild(nickNameSpan);
	messageDiv.id = "message";
	const messageDivBox = document.createElement("div");
	const messageDivSpan = document.createElement("span");
	messageDivSpan.innerText = message;
	messageDivBox.appendChild(messageDivSpan);
	messageDiv.appendChild(messageDivBox);
	li.appendChild(avatarDiv);
	li.appendChild(nickNameDiv);
	li.appendChild(messageDiv);
	ul.appendChild(li);
};

const makeMyMessage = (nickname, message) => {
	makeMessage(nickname, message, "myMessage");
};
const makeOtherMessage = (nickname, message) => {
	makeMessage(nickname, message, "otherMessage");
};

const handleMessageSubmit = (event) => {
	event.preventDefault();
	if (nickName === undefined) {
		alert("닉네임을 저장해주세요!");
		return;
	}
	if (roomName === undefined) {
		alert("방을 만들어주세요!");
		return;
	}
	const input = messageForm.querySelector("input");
	const value = input.value;
	socket.emit("new_message", input.value, roomName, () => {
		makeMyMessage("", value);
	});
	input.value = "";
};

const messagePrint = document.querySelector("#messagePrint");
messagePrint.scrollTop = messagePrint.scrollHeight;

const showRoom = (user) => {
	const chatHeader = document.querySelector("#chatHeader");
	const roomTitle = chatHeader.querySelector("div span");
	roomTitle.innerText = `${nickName} (${roomName})`;
	const userCountForm = document.querySelector("#userCount span");
	userCountForm.innerText = user + "명";
};
const handleNickSubmit = (event) => {
	event.preventDefault();
	const nickNameInput = document.querySelector("#nickNameInput");
	nickNameInput.className = "";
	nickName = nickNameInput.value;
	socket.emit("nickname", nickNameInput.value);
	nickNameInput.classList.add("saved");
};

const handleRoomSubmit = (event) => {
	event.preventDefault();
	if (nickName === undefined) {
		alert("닉네임을 저장해주세요!");
		return;
	}
	socket.emit("leave_room", roomName, () => {
		const messagePrintUl = document.querySelector("#messagePrint ul");
		messagePrintUl.innerHTML = "";
	});
	const createRoomInput = document.querySelector("#createRoomInput");
	socket.emit("enter_room", createRoomInput.value, nickName, showRoom);
	roomName = createRoomInput.value;

	createRoomInput.value = "";
};

const handleRoomClick = (event) => {
	if (nickName === undefined) {
		alert("닉네임을 저장해주세요!");
		return;
	}
	socket.emit("leave_room", roomName, () => {
		const messagePrintUl = document.querySelector("#messagePrint ul");
		messagePrintUl.innerHTML = "";
	});
	roomName = event.target.outerText;
	socket.emit("enter_room", roomName, nickName, showRoom);
};

const handleLeaveRoomClick = () => {
	socket.emit("leave_room", roomName, () => {
		window.location.reload();
	});
};

leaveBtn.addEventListener("click", handleLeaveRoomClick);
nickNameForm.addEventListener("submit", handleNickSubmit);
createRoom.addEventListener("submit", handleRoomSubmit);
messageSubmit.addEventListener("submit", handleMessageSubmit);

socket.on("join", (nickname, countUser) => {
	const ul = document.querySelector("#messagePrint ul");
	const li = document.createElement("li");
	li.className = "notification";
	li.innerText = `${nickname}님이 입장하셨습니다. (총 인원 : ${countUser}명)`;
	ul.appendChild(li);
});

socket.on("bye", (nickname, countUser) => {
	const ul = document.querySelector("#messagePrint ul");
	const li = document.createElement("li");
	li.className = "notification";
	li.innerText = `${nickname}님이 방을 나가셨습니다. (총 인원 : ${countUser}명)`;
	ul.appendChild(li);
});

socket.on("new_message", (nickname, message) => {
	makeOtherMessage(nickname, message);
});

socket.on("room_change", (rooms) => {
	const roomBoard = document.querySelector("#roomBoard");
	roomBoard.innerHTML = "";
	if (rooms.length === 0) {
		return;
	}
	rooms.forEach((room) => {
		const roomList = document.createElement("div");
		roomList.id = "roomList";
		const roomTitle = document.createElement("span");
		roomTitle.id = "roomTitle";
		roomTitle.innerText = room;
		roomList.appendChild(roomTitle);
		roomBoard.append(roomList);
		roomList.addEventListener("click", handleRoomClick);
	});
});

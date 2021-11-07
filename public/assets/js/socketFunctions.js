function Messenger(){
    this.userid = document.getElementById("userid").value;;
    this.socket = io({autoConnect: false, transports: ["websocket"]});
    this.users = [];
    this.messages = [];
    this.usersContainer = document.getElementById("chat_users");
    this.messageDataContainer = document.getElementById("message-data");
    this.loading = false;

    this.initialize = () => {
        this.socket.onAny((event, ...args) => {
            console.log(event, args);
        })

        this.socket.on("connect_error", (err) => {
            console.log(err);
        })

        this.socket.on("hello", () => {
            alert("hello")
        })

        if(this.userid){
            this.socket.auth = this.userid;
            this.socket.connect();
            console.log("connecting");
        }
    }

    this.addChat = (message) => {
       const li = document.createElement("li");
       li.className = `${message.sender._id === this.userid ? "left" : "right"} clearfix`;
       const img = document.createElement("img");
       img.className = "user_pix";
       img.src = message.sender.image;
       img.alt = `${message.sender.username} avatar`;
       li.appendChild(img);
       const messageDiv = document.createElement("div");
       const messageItem = document.createElement("span");
       messageItem.innerText = message.message;
       messageDiv.appendChild(messageItem);
       const dateItem = document.createElement("span");
       dateItem.className = "date_time";
       dateItem.innerText = message.created_at.toDateString();
       li.appendChild(dateItem);
       this.messageDataContainer.appendChild(li);
    }

    this.replaceChats = (messages) => {
        const messageList = '';
        for (const message of messages){
            const messageItem = `<li class="${message.sender._id === this.userid ? "left" : "right"} clearfix">
                                        <img class="user_pix" src="${message.sender.image}" alt="avatar">
                                        <div class="message">
                                            <span>${message.message}</span>
                                        </div>
                                        <span class="data_time">${message.created_at.toDateString()}</span>
                                    </li>`
           messageList += messageItem; 
        }
        this.messageDataContainer.innerHTML = messageList;
    }

    this.getChats = async (id) => {
        const res = await fetch(`/messenger/chats/${id}`);
        const data = res.json();
        this.messages = data;
        this.replaceChats(this.messages);
    }

    this.replaceUsers = (users) => {
        const userList = '';
        for (const user of users){
            const colors = ['red', 'orange', 'green', 'yellow', 'pink', 'blue']
            const userItem = `<li class="${user.online ? "online" : "offline"}">
                                        <a href="javascript:void(0);">
                                            <div class="media">
                                                <div class="avtar-pic w35 bg-${colors[Math.floor(Math.random() * colors.length)]}">${user.user.profile_pic ? `<img src=${user.user.profile_pic} />` : `<span>${user.username.substring(0, 2)}</span>` }</div>
                                                <div class="media-body">
                                                    <span class="name">${user.username}</span>
                                                    <span class="message">${user.online ? "online" : "offline"}</span>
                                                    <span class="badge badge-outline status"></span>
                                                </div>
                                            </div>
                                        </a>                            
                                    </li>`
            userList += userItem;
        }
        this.usersContainer.innerHTML = userList;
    }

    this.getUsers = async () => {
        const res = await fetch("/messenger/users");
        const data = res.json();
        this.users = data;
        this.replaceUsers(users);
    }
}

const messenger = new Messenger();
messenger.initialize();
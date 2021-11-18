function Messenger(){
    this.userid = document.getElementById("userid").value;
    this.user = null;
    this.socket = io({autoConnect: false, transports: ["websocket"]});
    this.users = JSON.parse(localStorage.getItem("users")) || [];
    this.messages = JSON.parse(localStorage.getItem("messages")) || {};
    this.page = 1;
    this.perPage = 5;
    this.messagesLoadedFully = false;
    this.newMessagesLoading = false;
    this.selectedUser = null;
    this.usersContainer = document.getElementById("chat_users");
    this.selectedDetail = document.getElementById("chatapp_detail");
    this.messageDataContainer = document.getElementById("message-data");
    this.chatHistoryContainer = document.getElementById("chat-history-container");
    this.loading = false;

    this.initialize = async () => {
        if(this.userid){
            this.socket.auth = {uid: this.userid};
            this.socket.connect();

            const res = await fetch("/auth/getuser");
            const data = await res.json();
            this.user = data;
        }

        if (this.usersContainer)
            this.getUsers()

        this.socket.onAny((event, ...args) => {
            console.log(event, args);
        })

        this.socket.on("error", (err) => {
            toastErr(err);
        })
        this.socket.on("connect_error", (err) => {
            console.log(err);
        })

        this.socket.on("hello", () => {
            console.log("hello")
        })

        this.socket.on("get users", (users) => {
            localStorage.setItem("users", JSON.stringify(users));
            this.users = JSON.parse(localStorage.getItem("users"));
        })

        this.socket.on("user connected", (user) => {
           const newUserIndex = this.users.findIndex(u => u.user._id === user.uid);
           this.users[newUserIndex] = {
               user: this.users[newUserIndex].user,
               socketID: user.socketID,
               online: user.online
           }
           // checking if a disconnected user is already selected to change socket id
            if(this.selectedUser.user._id === this.users[newUserIndex].user._id){
            console.log(this.users[newUserIndex]);
               this.selectedUser = this.users[newUserIndex];
           }
           localStorage.setItem("users", JSON.stringify(this.users));
           this.updateUserStatus(this.users[newUserIndex], newUserIndex);
        })

        this.socket.on("user disconnected", (user) => {
           const newUserIndex = this.users.findIndex(u => u.user._id === user.uid);
           this.users[newUserIndex] = {
               user: this.users[newUserIndex].user,
               socketID: user.socketID,
               online: user.online
           }
           // checking if a disconnected user is already selected to change socket id
           if(this.selectedUser.user._id === this.users[newUserIndex].user._id){
               this.selectedUser = this.users[newUserIndex];
           }
           localStorage.setItem("users", JSON.stringify(this.users));
           this.updateUserStatus(this.users[newUserIndex], newUserIndex);
        })

        this.socket.on("private message", ({content, fromUid}) => {
            this.receiveChat(content, fromUid);
        })

        if(this.chatHistoryContainer){
            this.chatHistoryContainer.addEventListener("scroll", (e) => {
                if(!this.newMessagesLoading && e.target.scrollTop === 0){
                    this.page += 1;
                    this.AddMoreChats(this.selectedUser.user._id, this.page);
                    this.newMessagesLoading = true;
                }
            })
        }
    }

    this.addChat = (message, prepend = false) => {
       const li = document.createElement("li");
       li.className = `${message.sender._id === this.userid ? "right" : "left"} clearfix`;
       const img = document.createElement("img");
       img.className = "user_pix";
       img.src = message.sender.image;
       img.alt = `${message.sender.username} avatar`;
       if (message.sender.image)
        li.appendChild(img)
       const messageDiv = document.createElement("div");
       const messageItem = document.createElement("span");
       messageDiv.className = "message";
       messageItem.innerText = message.message;
       messageDiv.appendChild(messageItem);
       const dateItem = document.createElement("span");
       dateItem.className = "data_time";
       dateItem.innerText = moment(message.created_at).fromNow();
       li.appendChild(messageDiv);
       li.appendChild(dateItem);
       if(prepend)
            this.messageDataContainer.prepend(li);
       else{
           this.messageDataContainer.appendChild(li);
            this.scrollChatBottom();
       }
    }

    this.addChats = (messages, prepend=true) => {
        for (const message of messages)
            this.addChat(message, prepend);
    }

    this.sendChat = (content) => {
        console.log(this.selectedUser, content);
        if(content && this.selectedUser){
            this.socket.emit("private message", {
                targetUser: {
                    socketID: this.selectedUser.socketID,
                    uid: this.selectedUser.user._id
                },
                fromUid: this.userid,
                content
            })
            const created_at = new Date(Date.now());
            const newMessage = {
                sender: this.user,
                receipient: this.selectedUser.user,
                message: content,
                created_at
            }
            this.messages[newMessage.receipient._id].push(newMessage);
            localStorage.setItem("messages", JSON.stringify(this.messages));
            this.addChat(newMessage);
        }
    }

    this.receiveChat = (content, fromUid) => {
        const sender = this.users.find(u => u.user._id === fromUid);
        if(sender){
            const created_at = new Date(Date.now());
            const newMessage = {
                sender: sender.user,
                receipient: this.user,
                message: content,
                created_at
            }
            console.log(this.messages[newMessage.sender._id]);
            // checking message target key if already in messages
            if(this.messages.hasOwnProperty(newMessage.sender._id))
                this.messages[newMessage.sender._id].push(newMessage) 
            else
                this.messages[newMessage.sender._id] = [newMessage] 
            localStorage.setItem("messages", JSON.stringify(this.messages));
            this.addChat(newMessage);
        }
    }

    this.updateUserStatus = (user, index) => {
        const users = document.querySelectorAll(".chat-user-item");
        const userEl = users[index];
        userEl.className = `chat-user-item ${user.online ? "online" : "offline"}`
        userEl.querySelector(".message").textContent = `${user.online ? 'online' : 'offline'}`;
    } 

    this.replaceChatMessages = (messages) => {
        let messageList = '';
        const chatNameHeader = document.getElementById("chatapp_current_chat_name");
        for (const message of messages){
            const messageItem = `<li class="${message.sender._id == this.userid ? "right" : "left"} clearfix">
                                        ${message.sender.image ? `<img class="user_pix" src="${message.sender.image}" alt="avatar">` : ''}
                                        <div class="message">
                                            <span>${message.message}</span>
                                        </div>
                                        <span class="data_time">${moment(message.created_at).fromNow()}</span>
                                    </li>`
           messageList += messageItem; 
        }
        this.messageDataContainer.innerHTML = messageList;
        chatNameHeader.textContent = this.selectedUser.user ? this.selectedUser.user.username.toUpperCase() : '';
        this.scrollChatBottom();
    }

    this.getChatMessages = async (uid) => {
        const user = this.users.find(user => user.user._id === uid);
        if(user){
            const isFetched = this.messages[uid];
            if(!isFetched){
                const res = await fetch(`/messenger/chats?target=${uid}&user=${this.userid}`);
                const data = await res.json();
                this.selectedUser = user;
                this.messages[uid] = data;
                localStorage.setItem("messages", JSON.stringify(this.messages));
                this.replaceChatMessages(this.messages[uid]);
                this.fillDetail(user.user);
            }else{
                this.selectedUser = user;
                const lastChatMessage = this.messages[uid][this.messages[uid].length-1];
                if(lastChatMessage){
                    const lastMessageDate = lastChatMessage.created_at;
                    const res = await fetch(`/messenger/chats?target=${uid}&user=${this.userid}&lastMessageDate=${lastMessageDate}`);
                    const data = await res.json();
                    console.log(data);
                    if(data.length === 1){
                        const isEqual = data[0]._id === lastChatMessage._id;
                        if(!isEqual)
                            this.messages[uid].concat(data);
                    }
                    else{
                        const savedMessages = JSON.parse(localStorage.getItem("messages"));
                        for (const message of data){
                            const indx = savedMessages.findIndex(msg => msg._id === message._id);
                            if(indx === -1)
                                this.messages.push(message);
                        }
                    }
                }
                const newStoreMessages = this.messages[uid].slice(-this.perPage);
                localStorage.setItem("messages", JSON.stringify(newStoreMessages));
                this.replaceChatMessages(this.messages[uid]);
                this.fillDetail(user.user);
            }
            console.log(this.messages)
        }
    }

    this.replaceUsers = (users) => {
        let userList = '';
        for (const user of users){
            const colors = ['red', 'orange', 'green', 'pink', 'blue']
            const userItem = `<li class="chat-user-item ${user.online ? "online" : "offline"}">
                                        <a href="javascript:void(0);" class="user_chat_btn" data-socket-id="${user.socketID}" data-id="${user.user._id}">
                                            <div class="media">
                                                <div class="avtar-pic w35 bg-${colors[Math.floor(Math.random() * colors.length)]}">${user.user.profile_pic ? `<img src=${user.user.profile_pic} />` : `<span>${user.user.username.substring(0, 2)}</span>` }</div>
                                                <div class="media-body">
                                                    <span class="name">${user.user.username}</span>
                                                    <span class="message">${user.online ? "online" : "offline"}</span>
                                                    <span class="badge badge-outline status"></span>
                                                </div>
                                            </div>
                                        </a>                            
                                    </li>`
            userList += userItem;
        }
        this.usersContainer.innerHTML = userList;
        this.bindChatUserBtnAction();
    }

    this.bindChatUserBtnAction = function(){
        const usersBtns = document.querySelectorAll(".user_chat_btn");
        if(usersBtns){
            for (let i =0; i<usersBtns.length; i++){
                const uBtn = usersBtns[i];
                const id = uBtn.dataset.id;
                uBtn.addEventListener("click", () => {messenger.getChatMessages(id)});
            }
        }
    }

    this.getUsers = async () => {
        const users = JSON.parse(localStorage.getItem("users"));
        this.users = users;
        this.replaceUsers(this.users);
    }

    this.fillDetail = (selectedUser) => {
        const detailHtml = `<div class="profile-image"><img src="${selectedUser.profile_pic}" class="rounded-circle mb-3" alt=""></div>
                                <h5 class="mb-0">${selectedUser.username ? selectedUser.username : ''}</h5>                                
                                <small class="text-muted">Address: </small>
                                <p> ${selectedUser.city ? selectedUser.city : ''}</p>
                                <small class="text-muted">Email address: </small>
                                <p>${selectedUser.email ? selectedUser.email : ''}</p>
                                <small class="text-muted">Mobile: </small>
                                <p>${selectedUser.phone ? selectedUser.phone : ''}</p>
                                <button class="btn btn-round btn-success">View Profile</button>`
        this.selectedDetail.innerHTML = detailHtml;
    }

    this.scrollChatBottom = () => {
        const chatHistoryScrollHeight = this.chatHistoryContainer.scrollHeight;
        this.chatHistoryContainer.scrollTop = chatHistoryScrollHeight;
    }

    this.AddMoreChats = async (target, page) => {
        console.log(this.page);
        if(!this.messagesLoadedFully){
            const res = await fetch(`/messenger/chats?page=${page}&target=${target}&user=${this.user._id}`);
            const data = await res.json();
            data.forEach(msg => this.messages[target].unshift(msg));
            this.addChats(data);
            this.newMessagesLoading = false;
            if(data.length === 0)
                this.messagesLoadedFully = true;
        }
    }
}

const messenger = new Messenger();
messenger.initialize();

const chatMessageInput = document.getElementById("chat-message-text");
const chatSubmitBtn = document.getElementById("chat-submit-btn");

if(chatSubmitBtn && chatMessageInput)
    chatSubmitBtn.addEventListener("click", () => {
        messenger.sendChat(chatMessageInput.value);
        chatMessageInput.value = "";
    })

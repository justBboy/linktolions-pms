function Messenger(){
    this.userid = document.getElementById("userid").value;
    this.user = null;
    this.socket = io({autoConnect: false, transports: ["websocket"]});
    this.users = JSON.parse(localStorage.getItem("users")) || [];
    this.messages = JSON.parse(localStorage.getItem("messages")) || {};
    this.userPages = {};
    this.page = 1;
    this.perPage = 5;
    this.newMessages = 0;
    this.newMessagesLoading = false;
    this.lastRefreshDate = localStorage.getItem("lastRefreshDate") || null;
    this.selectedUser = null;
    this.tabSelectedUser = null;
    this.usersContainer = document.getElementById("chat_users");
    this.selectedDetail = document.getElementById("chatapp_detail");
    this.messageDataContainer = document.getElementById("message-data");
    this.chatHistoryContainer = document.getElementById("chat-history-container");
    this.tabChatHistoryContainer = document.getElementById("tab-chat-history");
    this.tabUsersContainer = document.getElementById("tab-chat-users");
    this.searchInput = document.getElementById("chat-user-search")
    this.newMessagesCountContainer = document.getElementById("new-messages-count");
    this.topChatToggleBtn = document.getElementById("top-chat-toggle");
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

        if (this.tabUsersContainer)
            this.tabGetUsers()
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
           // checking if a connected user is already selected to change socket id
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

        /* if(this.chatHistoryContainer){
            this.chatHistoryContainer.addEventListener("scroll", (e) => {
                if(!this.newMessagesLoading && e.target.scrollTop === 0){
                    this.page += 1;
                    this.AddMoreChats(this.selectedUser.user._id, this.page);
                    this.newMessagesLoading = true;
                }
            })
        } */
        this.getNewMessagesCount();
        this.bindScrollFetchAction();
        this.bindUserSearchAction();
        this.bindTopChatToggleActions();
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

    this.addTabChat = (message, prepend=false) => {
        const li = document.createElement("li");
       li.className = `${message.sender._id === this.userid ? "right" : "left float-left"} `;
       const img = document.createElement("img");
       img.className = "user_pix";
       img.src = message.sender.image;
       img.alt = `${message.sender.username} avatar`;
       if (message.sender.image)
       li.appendChild(img)
       const chatDiv = document.createElement("div");
       chatDiv.className = "chat-info";
       const messageDiv = document.createElement("div");
       const messageItem = document.createElement("span");
       messageDiv.className = "message";
       messageItem.innerText = message.message;
       messageDiv.appendChild(messageItem);
       chatDiv.appendChild(messageDiv);
       li.appendChild(chatDiv);
       if(prepend)
            this.tabChatHistoryContainer.prepend(li);
        else
            this.tabChatHistoryContainer.appendChild(li);
    }

    this.addChats = (messages, prepend=true) => {
        for (const message of messages){
            this.addChat(message, prepend);
            this.addTabChat(message, prepend);
        }
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

    this.tabSendChat = (content) => {
        if(content && this.tabSelectedUser){
            this.socket.emit("private message", {
                targetUser: {
                    socketID: this.tabSelectedUser.socketID,
                    uid: this.tabSelectedUser.user._id
                },
                fromUid: this.userid,
                content
            })
            const created_at = new Date(Date.now());
            const newMessage = {
                sender: this.user,
                receipient: this.tabSelectedUser.user,
                message: content,
                created_at
            }
            this.messages[newMessage.receipient._id].push(newMessage);
            localStorage.setItem("messages", JSON.stringify(this.messages));
            this.addTabChat(newMessage);
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
            //this.addChat(newMessage);
            //this.addTabChat(newMessage);
        }
    }

    this.updateUserStatus = (user, index) => {
        const users = document.querySelectorAll(".chat-user-item");
        const userEl = users[index];
        userEl.className = `chat-user-item ${user.online ? "online" : "offline"}`
        userEl.querySelector(".message").textContent = `${user.online ? 'online' : 'offline'}`;
    } 

    this.tabUpdateUserStatus = (user, index) => {
        const users = document.querySelectorAll(".tab-chat-user-item");
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
this.replaceTabChatMessages = (messages) => {
        let messageList = '';
        for (const message of messages){
            const messageItem = `<li class="${message.sender._id == this.userid ? "right" : "left float-left"}">
                                ${message.sender.image ? `<img class="user_pix" src="${message.sender.image}" alt="avatar">` : ''}
                                <div class="chat-info">       
                                    <span class="message">${message.message}</span>
                                </div>
                            </li>`
            messageList += messageItem
        }
        this.tabChatHistoryContainer.innerHTML = messageList;
    }

    this.getAllChatMessages = async (uid) => {
            const res = await fetch(`/messenger/chats?target=${uid}&user=${this.userid}`);
            const data = await res.json();
            this.messages[uid] = data;
            localStorage.setItem("messages", JSON.stringify(this.messages));
            return this.messages[uid];
    }

    this.getLatestMessages = async (uid) => {
                const lastChatMessage = this.messages[uid][this.messages[uid].length-1];
                console.log(lastChatMessage);
                if(lastChatMessage){
                    try{
                        const lastMessageDate = lastChatMessage.created_at;
                        const res = await fetch(`/messenger/chats?target=${uid}&user=${this.userid}&lastMessageDate=${lastMessageDate}`);
                        const data = await res.json();
                        if(data.length === 1){
                            const isEqual = data[0]._id === lastChatMessage._id;
                            if(!isEqual)
                                this.messages[uid].concat(data);
                        }
                        else{
                            const savedMessages = JSON.parse(localStorage.getItem("messages"));
                            for (const message of data){
                                const indx = savedMessages[uid].findIndex(msg => msg._id === message._id);
                                if(indx === -1)
                                    this.messages[uid].push(message);
                            }
                        }
                    }
                    catch(err){
                        console.log(err);
                    }
                }
                this.messages[uid] = this.messages[uid].slice(-this.perPage);
                localStorage.setItem("messages", JSON.stringify(this.messages));
                return this.messages[uid];
    }

    this.getChatMessages = async (uid) => {
        const user = this.users.find(user => user.user._id === uid);
        if(user){
            this.selectedUser = user;
            const isFetched = this.messages[uid];
            if(!isFetched){
                try{
                    const messages = await this.getAllChatMessages(uid) 
                    console.log(messages);
                    this.replaceChatMessages(messages);
                    this.fillDetail(user.user);
                }
                catch(err){
                    console.log(err);
                }

            }else{
                const messages = await this.getLatestMessages(uid);
                console.log(messages);
                this.replaceChatMessages(messages);
                this.fillDetail(user.user);
            }
            this.bindScrollFetchAction();
            this.refreshDate(); 
        }
    }

    this.tabGetChatMessages = async (uid) => {
        const user = this.users.find(user => user.user._id === uid);
        if (user){
            this.tabSelectedUser = user;
            const isFetched = this.messages[uid];
            if(!isFetched){
                try{
                    const messages = await this.getAllChatMessages(uid);
                    this.replaceTabChatMessages(messages);
                }
                catch(err){
                    console.log(err);
                }
            }
            else{
                const messages = await this.getLatestMessages(uid);
                this.replaceTabChatMessages(messages)
            }
            this.refreshDate(); 
        }
    }

    this.getNewMessagesCount = async () => {
        if(this.userid){
            const lastRefreshDate = this.lastRefreshDate;
            let res;
            if(this.lastRefreshDate)
                res = await fetch(`/messenger/chats/newCount/${this.userid}?lastRefreshDate=${lastRefreshDate}`)
            else
                res = await fetch(`/messenger/chats/newCount/${this.userid}`)
            const {messagesCount} = await res.json();
            this.newMessages = messagesCount;
            this.showNewMessages();
        }
    }

    this.showNewMessages = () => {
        if(this.newMessagesCountContainer)
            this.newMessagesCountContainer.textContent = this.newMessages;
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

    this.tabReplaceUsers = (users) => {
        let userList = '';
        for (const user of users){
            const colors = ['red', 'orange', 'green', 'pink', 'blue']
            const userItem = `<li class="chat-user-item ${user.online ? "online" : "offline"}">
                                        <a href="javascript:void(0);" class="tab-user_chat_btn" data-socket-id="${user.socketID}" data-id="${user.user._id}">
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
        this.tabUsersContainer.innerHTML = userList;
        this.tabBindChatUserBtnAction();
    }

    this.bindChatUserBtnAction = function(){
        const usersBtns = document.querySelectorAll(".user_chat_btn");
        if(usersBtns){
            for (let i =0; i<usersBtns.length; i++){
                const uBtn = usersBtns[i];
                const id = uBtn.dataset.id;
                uBtn.addEventListener("click", () => {
                    this.getChatMessages(id)
                    this.setUserPage(id);
                });
            }
        }
    }

    this.tabBindChatUserBtnAction = () => {
        const usersBtns = document.querySelectorAll(".tab-user_chat_btn");
        if(usersBtns){
            for (let i =0; i<usersBtns.length; i++){
                const uBtn = usersBtns[i];
                const id = uBtn.dataset.id;
                uBtn.addEventListener("click", () => {
                    this.tabGetChatMessages(id)
                    this.setUserPage(id);
                });
            }
        }
    }

    this.bindScrollFetchAction = function(){
        if(this.chatHistoryContainer){
            this.chatHistoryContainer.addEventListener("scroll", (e) => {
                if(!this.newMessagesLoading && e.target.scrollTop === 0){
                    console.log(this.userPages);
                    // making current page of selected user
                    let currentPageOfUser = this.userPages[this.selectedUser.user._id];
                    if(!currentPageOfUser.messageLoadedFully);
                        this.userPages[this.selectedUser.user._id] = {page: currentPageOfUser.page+1, messageLoadedFully: currentPageOfUser.messageLoadedFully};
                    this.page = this.userPages[this.selectedUser.user._id].page;
                    this.AddMoreChats(this.selectedUser.user._id, this.page);
                    this.newMessagesLoading = true;
                }
            })
        }
    }

    this.bindUserSearchAction = function(){
        if(this.searchInput){
            this.searchInput.addEventListener("keyup", (e) => {
                const search = e.target.value;
                if(!search){
                    this.replaceUsers(this.users);
                    return;
                }
                const newUsersShow = [];
                for (const user of this.users){
                    const isMatch = user.user.username.includes(search);
                    if(isMatch)
                        newUsersShow.push(user);
                }
                this.replaceUsers(newUsersShow);
            })
        }
    }

    this.bindTopChatToggleActions = () => {
        if(this.topChatToggleBtn){
            this.topChatToggleBtn.addEventListener("click", () => {
                this.refreshDate();
            })
        }
    }

    this.getUsers = async () => {
        this.replaceUsers(this.users);
    }

    this.tabGetUsers = async () => {
        this.tabReplaceUsers(this.users);
    }

    this.setUserPage = (id) => {
        if(!(id in this.userPages))
            this.userPages[id] = {page: 1, messageLoadedFully: false};
    }

    this.refreshDate = () => {
            const now = (new Date(Date.now())).toString();
            this.lastRefreshDate = now;
            localStorage.setItem("lastRefreshDate", this.lastRefreshDate);
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
        if(!this.userPages[target].messageLoadedFully){
            const res = await fetch(`/messenger/chats?page=${page}&target=${target}&user=${this.userid}`);
            const data = await res.json();
            data.forEach(msg => this.messages[target].unshift(msg));
            this.addChats(data);
            this.newMessagesLoading = false;
            if(data.length === 0)
                this.userPages[target].messageLoadedFully = true;
        }
    }
}

const messenger = new Messenger();
messenger.initialize();

const chatMessageInput = document.getElementById("chat-message-text");
const chatSubmitBtn = document.getElementById("chat-submit-btn");

const tabChatMessageInput = document.getElementById("tab-chat-message");
const tabChatSubmitBtn = document.getElementById("tab-chat-submit-btn");

if(chatSubmitBtn && chatMessageInput)
    chatSubmitBtn.addEventListener("click", () => {
        messenger.sendChat(chatMessageInput.value);
        chatMessageInput.value = "";
    })


if(tabChatMessageInput && tabChatSubmitBtn)
    tabChatSubmitBtn.addEventListener("click", () => {
        messenger.tabSendChat(tabChatMessageInput.value);
        tabChatMessageInput.value = "";
    })

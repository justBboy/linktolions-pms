function Email(){
    this.summernoteContainer = document.getElementById("email-summernote");
    this.mailsListContainer = document.getElementById("mails-list-container");
    this.emailToInput = document.getElementById("email-compose-to");
    this.emailSubjectInput = document.getElementById("email-compose-subject");
    this.emailSubmitBtn = document.getElementById("email-submit-btn");
    this.emailDraftBtn = document.getElementById("email-draft-btn");
    this.mailInboxBtn = document.getElementById("mail-inbox-btn");
    this.mailSentBtn = document.getElementById("mail-sent-btn");
    this.mailDraftBtn = document.getElementById("mail-draft-btn");
    this.mailTrashBtn = document.getElementById("mail-trash-btn");
    this.mailDeleteBtn = document.getElementById("mail-delete-btn");
    this.mailsListContainer = document.getElementById("mails-list-container");
    this.mailsPaginationContainer = document.getElementById("mails-pagination-container");
    this.draftedMails = JSON.stringify(localStorage.getItem("draftedMails")) || [];
    this.mails = [];
    this.selectedMails = [];
    this.mailsLength = 0;
    this.pageNumber = 1;
    this.lastPageNumber = 1;
    this.currentFilter = "";
    this.noteHtml = "";
    this.emailTo = "";
    this.emailSubject = "";
    this.composeLoading = false;


    this.initialize = () => {
        this.noteHtml = this.getNoteFromLocalStorage() || "";
        this.emailTo = this.getEmailToFromLocalStorage() || "";
        this.emailSubject = this.getEmailSubjectFromLocalStorage() || "";

        if(this.summernoteContainer){
            $(this.summernoteContainer).summernote()
            $(this.summernoteContainer).on("summernote.change", () => {
                this.onNoteChange();
            })

            this.syncData();
        }

        if(this.emailToInput){
            this.emailToInput.addEventListener("keypress", (e) => {
                this.emailTo = e.target.value;
                this.setEmailToToStorage()
            })
            this.emailToInput.addEventListener("keyup", (e) => {
                this.emailTo = e.target.value;
                this.setEmailSubjectToStorage();
            })
        }

        if(this.emailSubjectInput){
            this.emailSubjectInput.addEventListener("keypress", (e) => {this.emailSubject = e.target.value});
            this.emailSubjectInput.addEventListener("keyup", (e) => {this.emailSubject = e.target.value})
        }

        if(this.emailDraftBtn)
            this.emailDraftBtn.addEventListener("click", () => {this.onDraft()})
        
        if(this.emailSubmitBtn)
            this.emailSubmitBtn.addEventListener("click", this.sendMail)
        
        if(this.mailDeleteBtn)
            this.bindDeleteBtnListener();

        const filter = this.getPageFilter();
        switch(filter){
            case "inbox":
                if (this.mailInboxBtn)
                    this.mailInboxBtn.className = "active";
                this.currentFilter = "inboxMails";
                break;
            case "sent":
                if (this.mailSentBtn)
                    this.mailSentBtn.className = "active";
                this.currentFilter = "sentMails";
                break;
            case "draft":
                if (this.mailDraftBtn)
                    this.mailDraftBtn.className = "active";
                this.currentFilter = "draftMails";
                break;
            case "trash":
                if (this.mailTrashBtn)
                    this.mailTrashBtn.className = "active";
                this.currentFilter = "trashMails";
                break;
            default:
                if (this.mailInboxBtn)
                    this.mailInboxBtn.className = "active"
                this.currentFilter = "inboxMails";
        }

        if(this.mailsListContainer)
            this.getMails();
    }

    this.onNoteChange = () => {
        const noteHtmlContainer = document.querySelector("#mail-compose-div .note-editable");
        this.noteHtml = noteHtmlContainer.innerHTML;
        this.setNoteToLocalStorage();
    }

    this.sendDraftToBackend = async (emailData) => {
        const res = await fetch("/email/draft", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(emailData)
        });
        const data = await res.json();
        return data;
    }

    this.onDraft = async () => {
        const emailData =  {to: this.emailTo, subject: this.emailSubject, html: this.noteHtml};
        const data = await this.sendDraftToBackend(emailData);
        if(data.error)
            return toastErr(data.error)
        toastSuccess("Drafted Successfully")
    }

    this.sendMailToBackend = async (to, subject, html) => {
            const emailData = {to, subject,  html};
            const res = await fetch('/email/compose', {
                method: "POST",
                headers: {
                    'Content-Type': "application/json"
                },
                body: JSON.stringify(emailData)
            })
            const data = await res.json();
            return data;
    }

    this.sendMail = async () => {
        if(this.emailTo && this.emailSubject && this.noteHtml){
            this.onComposeLoading();
            const data = await this.sendMailToBackend(this.emailTo, this.emailSubject, this.noteHtml);
            if(data.error){
                window.location.href = `/email/compose?error=${data.error}`;
                return;
            }
            this.stopComposeLoading();
            this.resetInputs();
            window.location.href = `/email/compose?sentSuccessful=true&name=${data.title}`;
        }
        else
            toastErr("Fill all email details");
    }

    this.getMailsFromBackend = async (url="", filter="inboxMails", page=1) => {
        try{
            let res;
            if(url)
                res = await fetch(url); 
            else 
                res = await fetch(`/email/all?filter=${filter}&page=${page}`);
            const data = await res.json();
            return data;
        }
        catch(err){
            console.log(err)
        }
    }

    this.getMails = async () => {
        const data = await this.getMailsFromBackend(null, this.currentFilter);
        if(data.error)
            return toastErr(data.error)
        const {mails, mailsLength, lastPageNumber, pageNumber} = data;
        this.acceptMails(mails, mailsLength, lastPageNumber, pageNumber) 
    }

    this.deleteMail = async (id) => {
        try{
            const data = await fetch(`/email/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            return data;
        }
        catch(err){
            console.log(err);
        }
    }

    this.acceptMails = (mails, mailsLength, lastPageNumber, pageNumber) => {
        this.mails = mails;
        this.mailsLength = mailsLength;
        this.lastPageNumber = lastPageNumber;
        this.pageNumber = pageNumber;
        this.fillMails(this.mails);
    }

    this.refreshDelete = (id) => {

        
    }

    this.fillMails = async (mails) => {
        let mailList = "";
        for (const mail of mails){
            const mailItem  = `<li class="clearfix">
                                            <div class="md-left">
                                                <label class="fancy-checkbox">
                                                    <input type="checkbox" data-id="${mail._id}" name="checkbox" class="checkbox-tick">
                                                    <span></span>
                                                </label>
                                                <a href="javascript:void(0);" class="mail-star"><i class="fa fa-star"></i></a>                                                
                                            </div>
                                            <div class="md-right">
                                                ${mail.sender.profile_pic ? `<img class="rounded" src="${mail.sender.profile_pic}" alt="">` : ''}
                                                <p class="sub"><a href="/email/${mail._id}" class="mail-detail-expand">${mail.subject}</a></p>
                                                <p class="dep"><span class="m-r-jkk10"></p>
                                                <span class="time">${moment(mail.created_at).fromNow()}</span>
                                            </div>
                                        </li>`
            mailList += mailItem;
        }
        if(this.lastPageNumber > 1){
            let paginationList = `
                    ${parseInt(this.pageNumber) > 1 ? `<li class="page-item"><a class="page-link" href="#" data-link="/email/all/?page=${this.pageNumber-1}&filter=${this.currentFilter}">Previous</a></li>` : ''}
                    <li class="page-item ${this.pageNumber == 1 ? 'active' : '' }"><a class="page-link" href="#" data-link="/email/all?page=1&filter=${this.currentFilter}">1</a></li>
                    <li class="page-item ${this.pageNumber == 2 ? 'active' : '' }"><a class="page-link" href="#" data-link="/email/all?page=2&filter=${this.currentFilter}">2</a></li>
            `
            for ( let i = this.pageNumber; i<this.pageNumber+4; i++){
                if(i<this.lastPageNumber && i > 2)
                    paginationList += `<li class="page-item ${this.pageNumber == i ? 'active' : ''}"><a class="page-link" href="#" data-link="/email/all/?page=${i}&filter=${this.currentFilter}">${i}</a></li>`
            }
            if(this.lastPageNumber > 2){
                paginationList += `
                        <li class="page-item ${this.pageNumber == this.lastPageNumber ? 'active' : '' }"><a class="page-link" href="#" data-link="/email/all?page=${this.lastPageNumber}&filter=${this.currentFilter}">${this.lastPageNumber}</a></li>
                `
            }
            if(this.pageNumber < this.lastPageNumber){
                paginationList += `
                        <li class="page-item">
                            <a class="page-link" href="#" data-link="/email/all?page=${parseInt(this.pageNumber)+1}&filter=${this.currentFilter}" aria-label="Next">
                                        <span aria-hidden="true">»</span>
                                        <span class="sr-only">Next</span>
                            </a>
                        </li>
                        `
            }
            this.mailsPaginationContainer.innerHTML = paginationList;
        }
        this.mailsListContainer.innerHTML = mailList;
        this.bindPaginationListener();
        this.bindSelectMailListener();
    }

    this.onComposeLoading = () => {
        this.composeLoading = true;
        if(this.emailSubmitBtn){
            this.emailSubmitBtn.textContent = "loading";
            this.emailSubmitBtn.disabled = true;
        }
    }

    this.stopComposeLoading = () => {
        this.composeLoading = false;
        if (this.emailSubmitBtn){
            this.emailSubmitBtn.textContent = "send",
            this.emailSubmitBtn.disabled = false;
        }
    }

    this.setNoteToLocalStorage = () => {
        localStorage.setItem("draftedNote", this.noteHtml);
    }

    this.getNoteFromLocalStorage = () => {
        return localStorage.getItem("draftedNote");
    }

    this.setEmailToToStorage = () => {
        localStorage.setItem("emailTo", this.emailTo);
    }

    this.setEmailSubjectToStorage = () => {
        localStorage.setItem("emailSubject", this.emailSubject);
    }

    this.setDetailsToLocalStorage = () => {
        this.setEmailSubjectToStorage();
        this.setEmailToToStorage();
    }

    this.getEmailToFromLocalStorage = () => {
        const emailTo = localStorage.getItem("emailTo");
        return emailTo;
    }

    this.getEmailSubjectFromLocalStorage = () => {
        const emailSubject = localStorage.getItem("emailSubject");
        return emailSubject
    }

    this.getDetailsFromLocalStorage = () => {
        const emailTo = this.getEmailToFromLocalStorage;
        const emailSubject = this.getEmailSubjectFromLocalStorage;
        return {emailTo, emailSubject};
    }

    this.syncData = () => {
        this.emailSubjectInput.value = this.emailSubject;
        this.emailToInput.value = this.emailTo;
        const noteHtmlContainer = document.querySelector("#mail-compose-div .note-editable");
        noteHtmlContainer.innerHTML = this.noteHtml;
    }

    this.resetInputs = () => {
        this.emailSubject = "";
        this.emailTo = "";
        this.noteHtml = "";
        this.setDetailsToLocalStorage();
        this.setNoteToLocalStorage();
    }

    this.getPageFilter = () => {
        var routes = new URLSearchParams(window.location.search)
        var filter = routes.get("filter");
        return filter;
    }
    
    this.bindPaginationListener = () => {
        const paginationItems = Array.from(this.mailsPaginationContainer.querySelectorAll(".page-link"));

        paginationItems.forEach((el) => {
            el.addEventListener("click", async (e) => {
                e.preventDefault();
                const link = el.dataset.link;
                const {mails, mailsLength, lastPageNumber, pageNumber} = await this.getMailsFromBackend(link);
                this.acceptMails(mails, mailsLength, lastPageNumber, pageNumber);
            })
        })
    }

    this.bindSelectMailListener = () => {
        const selectItems = Array.from(this.mailsListContainer.querySelectorAll(".checkbox-tick"));
        selectItems.forEach((el) => {
            el.addEventListener("change", (e) => {
                const checked = e.target.checked;
                const id = e.target.dataset.id;
                if(checked)
                    this.selectedMails.push(id);
                else
                    removeFromArray(this.selectedMails, id)
            })
        })
    }

    this.bindDeleteBtnListener = () => {
        this.mailDeleteBtn.addEventListener("click", () => {
            this.selectedMails.forEach(async (mailId) => {
                const data = await this.deleteMail(mailId);
                if(data.error)
                    toastErr(data.error)
                toastSuccess(`Mail to ${data.title} successfully deleted`)
            })
        })
    }
}

const email = new Email();

$(document).ready(() => {
    email.initialize();
})

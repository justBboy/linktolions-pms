function toastErr(msg){
        toastr.options.timeOut = 5000;
        toastr.options.closeButton = true;
        toastr.options.positionClass = 'toast-bottom-right';
        toastr['error'](msg);
}
function toastSuccess(msg)
    { 
        toastr.options.timeOut = 5000; 
        toastr.options.closeButton = true; 
        toastr.options.positionClass = 'toast-bottom-right'; 
        toastr['success'](msg); 
    }
function deleteFromBackend(id, name, url, redirect=""){
        $.ajax({
            url: `${url}${id}`,
            method: "DELETE",
            success: function(data){
                if(data.error) {
                    toastErr(data.error)
                    return;
                }
                window.location.href = `${redirect ? redirect : url}?deleteSuccessful=true&name=${name}`;
            },
            error: function(err){
                toastErr(err);
            }
        })
    }


function updateToBackend(id, data, url, name){
    $.ajax({
            url: `${url}update/${id}`,
            method: "POST",
            data: JSON.stringify(data),
            headers: {
                'Content-Type': "application/json"
            },
            success: function(data){
                console.log(data);
                if(data.error){
                    toastErr(data.error)
                }
                window.location.href = `${url}?updateSuccessful=true&name=${data[name]}`;
            },
            error: function(err){
                toastErr(err);
            }
        })
}

function addToBackend(data, url, name){
    $.ajax({
            url: `${url}add`,
            method: "POST",
            data: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            },
            success: function(data){
                console.log(data)
                if(data.error){
                    toastErr(data.error)
                    return;
                }
                window.location.href = `${url}?addSuccessful=true&name=${data[name]}`;
            },
            error: function(err){
                toastErr(err);
            }
        })
}

document.addEventListener("DOMContentLoaded", function(){
	var routes = new URLSearchParams(window.location.search)
	var deleteSuccessful = routes.get("deleteSuccessful");
	var updateSuccessful = routes.get("updateSuccessful");
	var addSuccessful = routes.get("addSuccessful");
    var error = routes.get("error");
	var name = routes.get("name");
	console.log(routes);
	if (deleteSuccessful || updateSuccessful || addSuccessful){
		console.log("hello")
		toastr.options.timeOut = 4998;
		toastr.options.closeButton = true;
		toastr.options.positionClass = 'toast-bottom-right';
		toastr['success'](`Contact of ${name} Successfully ${deleteSuccessful ? 'Deleted' : updateSuccessful ? 'Updated' : 'Added'}`);
	}
    else if (error){
        toastErr(error);
    }
})


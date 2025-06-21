const usernameInput=document.getElementById('username_input');
const passwardInput=document.getElementById('passward_input');

async function processInput(){
    const username = usernameInput.value;
    const passward=passwardInput.value;
    try {
        const response = await fetch(`/manager/${username}/${passward}`);
        
        if(response.status === 401) {
            //console.log("Username not found");
            window.location.href="/falsecustomer.html";
        }else{
            window.location.href = "/managerworkpage.html";
            // Process and display data as needed
        }
    } catch(error){
        console.error(error);
        // Handle error, e.g., display an error message to the user
    }
}
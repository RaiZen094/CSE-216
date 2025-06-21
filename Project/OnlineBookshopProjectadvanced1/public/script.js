const usernameInput = document.getElementById('username_input');
const passwordInput = document.getElementById('password_input');

async function processInput() {
    const username = usernameInput.value;
    const password = passwordInput.value;
    try {
        const response = await fetch(`/customer/${username}/${password}`);
        
        if (response.status === 401) {
            window.location.href = "/falsecustomer.html";
        } else {
            localStorage.setItem("customername", username);
            window.location.href = "/customerworkpage.html";
        }
    } catch (error) {
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const contentDiv = document.querySelector('.content-box p');
    const messages = ['Join our Facebook page!', 'Get info about books!'];
    let currentIndex = 0;
    
    function updateContent() {
        contentDiv.classList.add('flip'); // Apply flip animation
        setTimeout(() => {
            contentDiv.innerHTML = messages[currentIndex];
            currentIndex = (currentIndex + 1) % messages.length;
            contentDiv.classList.remove('flip'); // Remove flip animation
        }, 250); // Wait for half of the animation time
    }
    
    updateContent();
    setInterval(updateContent, 2100);
});

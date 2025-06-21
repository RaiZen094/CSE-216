async function processInput() {
    const form = document.getElementById('account_form');
    const usernameInput = form.querySelector('#username_input');
    const passwordInput = form.querySelector('#password_input');
    const emailInput = form.querySelector('#email_input');
    const addressInput = form.querySelector('#address_input');

    const username = usernameInput.value;
    const passward = passwordInput.value;
    const email = emailInput.value;
    const address = addressInput.value;

    try {
        const response = await fetch(`/customersignin/${username}/${passward}/${email}/${address}`);
        const jsonResponse = await response.json();

        if (response.status === 200 && jsonResponse.success) {
            // Successful signup
            window.location.href = "/Firstpage.html";
        } else if (response.status === 409 && !jsonResponse.success) {
            // Duplicate username
            window.location.href = "/duplicatecustomer.html";
        } else {
            // Other cases (error or unsuccessful signup)
            window.location.href = "/falsecustomer.html";
        }
    } catch (error) {
        console.error(error);
        // Handle error, e.g., display an error message to the user
    }
}

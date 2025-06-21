async function processInput() {
    console.log('form submitted');
    const form = document.getElementById('add_new_employee');
    const nameInput = form.querySelector('#name');
    const phoneInput = form.querySelector('#phone_no');
    const emailInput = form.querySelector('#email');
    const salaryInput = form.querySelector('#salary');

    const name = nameInput.value;
    const phoneno = parseInt(phoneInput.value);
    const email = emailInput.value;
    const salary = parseInt(salaryInput.value);
    console.log(name + 'name' + typeof name);
    console.log(phoneno + 'pn' + typeof phoneno);
    console.log(email + 'em' + typeof email);
    console.log(salary + 's' + typeof salary);
    try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('phoneno', phoneno);
        formData.append('email', email);
        formData.append('salary', salary);

        // Define the jsonData object
        const jsonData = {
            name: name,
            phoneno: phoneno,
            email: email,
            salary: salary
        };

        const response = await fetch('/employee', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Set the content type to JSON
            },
            body: JSON.stringify(jsonData) // Convert the JSON object to a string
        });

        const jsonResponse = await response.json();
        // Handle the response, e.g., display a success message to the user
    } catch (error) {
        console.error(error);
        // Handle error, e.g., display an error message to the user
    }
}

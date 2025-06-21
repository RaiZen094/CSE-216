async function processInput() {
    const form = document.getElementById('add_new_books');
    const titleInput = form.querySelector('#title');
    const isbnInput = form.querySelector('#isbn');
    const categoriesInput = form.querySelector('#categories');
    const authorInput = form.querySelector('#author');
    const publisherInput = form.querySelector('#publisher');
    const priceInput = form.querySelector('#price');
    const stockInput = form.querySelector('#stock');
    const imageInput = form.querySelector('#bookImage');
    const imageFile = imageInput.files[0]; // Get the selected image file


    const title = titleInput.value;
    const isbn = isbnInput.value;
    const categories = categoriesInput.value;
    const author = authorInput.value;
    const publisher = publisherInput.value;
    const price = parseInt(priceInput.value);
    const stock = parseInt(stockInput.value);

    console.log(stock);
    console.log(price);
    console.log(title);

    try {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('isbn', isbn);
        formData.append('categories', categories);
        formData.append('author', author);
        formData.append('publisher', publisher);
        formData.append('price', price);
        formData.append('stock', stock);
        formData.append('image', imageFile);

        const response = await fetch('/addnewbooks', {
            method: 'POST',
            body: formData,
        });

        const jsonResponse = await response.json();

        if (response.status === 200 && jsonResponse.success) {
            // Successful submission of text-based data
            // Now, handle the image upload
            const imageFormData = new FormData();
            imageFormData.append('image', imageInput.files[0]);

            const imageResponse = await fetch('/uploadimage', {
                method: 'POST',
                body: imageFormData,
            });

            const imageJsonResponse = await imageResponse.json();

            if (imageResponse.status === 200 && imageJsonResponse.success) {
                // Successful image upload
                window.location.href = "managerworkpage.html";
            } else {
                // Handle error cases for image upload
            }
        } else {
            // Handle error cases for text-based data submission
        }
    } catch (error) {
        console.error(error);
        // Handle error, e.g., display an error message to the user
    }
}

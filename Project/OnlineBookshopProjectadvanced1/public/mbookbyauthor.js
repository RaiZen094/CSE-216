const backButton = document.getElementById("backButton");
        backButton.addEventListener("click", () => {
            window.location.href = "managerworkpage.html";
        });

document.addEventListener("DOMContentLoaded", async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const authorName = urlParams.get('author');
    const authorNameElement = document.getElementById("authorName"); 

    if (authorName) {
        try {
            const response = await fetch(`/author/${authorName}`);
            if (!response.ok) {
                throw new Error(`Fetch error: ${response.status} ${response.statusText}`);
            }
            const books = await response.json();
            const authorbook_Table = document.getElementById("authorbook_Table");
            authorNameElement.textContent = `Books by ${authorName}`; 
            books.forEach(book => {
                const row = authorbook_Table.insertRow();
                row.insertCell().textContent = book.ID; 
                row.insertCell().textContent = book.TITLE; 
                row.insertCell().textContent = book.ISBN; 
                row.insertCell().textContent = book.CATEGORIES; 
                row.insertCell().textContent = book.PUBLISHER;
                row.insertCell().textContent = book.PRICE; 
                row.insertCell().textContent = book.STOCK; 
            });
        } catch (error) {
            console.error(error);
        }
    }
});

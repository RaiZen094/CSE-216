const backButton = document.getElementById("backButton");
        backButton.addEventListener("click", () => {
            window.location.href = "managerworkpage.html";
        });

document.addEventListener("DOMContentLoaded", async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const publisherName = urlParams.get('publisher');
    const publisherNameElement = document.getElementById("publisherName"); 
    if(publisherName) {
        try {
            const response = await fetch(`/publisher/${publisherName}`);
            if(!response.ok) {
                throw new Error(`Fetch error: ${response.status} ${response.statusText}`);
            }
            const books = await response.json();
            const publisherbook_Table = document.getElementById("publisherbook_Table");
            publisherNameElement.textContent = `Books by ${publisherName}`; 
            books.forEach(book => {
                const row = publisherbook_Table.insertRow();
                row.insertCell().textContent =book.ID; 
                row.insertCell().textContent =book.TITLE; 
                row.insertCell().textContent =book.ISBN; 
                row.insertCell().textContent =book.CATEGORIES; 
                row.insertCell().textContent =book.AUTHOR;
                row.insertCell().textContent =book.PRICE; 
                row.insertCell().textContent =book.STOCK; 
            });
        } catch (error) {
            console.error(error);
        }
    }
});

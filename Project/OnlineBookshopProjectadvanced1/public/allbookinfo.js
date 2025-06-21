const bookTable = document.getElementById("bookTable");

async function fetchAndDisplayBookInfo(){
    try{
        const response=await fetch("/books"); 
        const bookData=await response.json();
        //console.log(bookData);
        bookData.forEach(book=>{
            const row=bookTable.insertRow();
            row.insertCell().textContent=book.ID; 
            row.insertCell().textContent=book.TITLE; 
            row.insertCell().textContent=book.ISBN; 
            row.insertCell().textContent=book.CATEGORIES; 
            row.insertCell().textContent=book.AUTHOR; 
            row.insertCell().textContent=book.PUBLISHER;
            row.insertCell().textContent=book.PRICE; 
            row.insertCell().textContent=book.STOCK; 
            var cell = row.insertCell();
            var link = document.createElement('a');
            link.href = book.SHORTINFOLINK;
            link.textContent = book.SHORTINFOLINK;
            cell.appendChild(link);
        });
    } catch (error) {
        console.error("Error fetching book information:", error);
    }
}

fetchAndDisplayBookInfo();

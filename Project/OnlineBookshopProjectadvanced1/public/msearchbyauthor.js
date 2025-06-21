const bookauthortable = document.getElementById("bookauthortable");

async function fetchAndDisplaypubInfo(){
    try{
        //console.log("Fool");
        const response=await fetch("/bookbyauthor"); 
        const bookData=await response.json();
        //console.log(bookData);
        bookData.forEach(book=>{
            const row=bookauthortable.insertRow();
            row.insertCell().textContent=book.AUTHOR; 
            row.insertCell().textContent=book.TOTAL_BOOKS; 
      
        });
    }catch (error) {
        console.error("Error fetching book information:", error);
    }
}

fetchAndDisplaypubInfo();

const backButton= document.getElementById("backButton");
        backButton.addEventListener("click", () => {
            window.location.href = "managerworkpage.html";
        });

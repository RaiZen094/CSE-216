const bookpublishertable = document.getElementById("bookpublishertable");

async function fetchAndDisplaypubInfo(){
    try{
        //console.log("Fool");
        const response=await fetch("/bookbypublisher"); 
        const bookData=await response.json();
        //console.log(bookData);
        bookData.forEach(book=>{
            const row=bookpublishertable.insertRow();
            row.insertCell().textContent=book.PUBLISHER; 
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

const searchbypublication = document.getElementById("sbp");
searchbypublication.addEventListener("click", () => {
    window.location.href = "searchbypub.html";
});

const searchbyauthor = document.getElementById("sba");
searchbyauthor.addEventListener("click", () => {
    window.location.href = "msearchbyauthor.html";
});

const buyoldbooks = document.getElementById("bob");
buyoldbooks.addEventListener("click",() => {
    window.location.href = "buyoldbooks.html";
});

const addnewbooks = document.getElementById("anb");
addnewbooks.addEventListener("click",()=> {
    window.location.href = "addnewbooks.html";
});

const offerdiscount = document.getElementById("od");
offerdiscount.addEventListener("click",()=> {
    window.location.href = "offerdiscount.html";
});

const bookshopinfo=document.getElementById("bi");
bookshopinfo.addEventListener("click",()=>{
    window.location.href="bookshopinfo.html";
    
});

const employeeinfo=document.getElementById("ei");
employeeinfo.addEventListener("click",()=>{
    window.location.href="employeeinfo.html";
    
});

const addnewemployee=document.getElementById("ane");
addnewemployee.addEventListener("click",()=>{
    window.location.href="AddNewEmployee.html";
    
});

const shownotification=document.getElementById("shownotification");
shownotification.addEventListener("click",()=>{
    window.location.href="ManagerNotification.html";
})


document.addEventListener("DOMContentLoaded", function () {
    const dropdownBtn = document.getElementById("authorDropdownBtn");
    const dropdown = document.getElementById("authorDropdown");
    
    const dropdownBtn1 = document.getElementById("publisherDropdownBtn");
    const dropdown1 = document.getElementById("publisherDropdown");

    dropdownBtn.addEventListener("click", async function () {
        dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
        if (dropdown.options.length === 0) {
            try {
                const response = await fetch('/author');
                const authors = await response.json();
                const option=document.createElement("option");
                option.textContent="Authors";
                dropdown.appendChild(option);
                authors.forEach(author => {
                    const option = document.createElement("option");
                    option.value = author.AUTHOR;
                    option.textContent = author.AUTHOR;
                    dropdown.appendChild(option);
                });
            } catch (error) {
                console.error(error);
            }
        }
    });

    dropdown.addEventListener("change", function (){
        const selectedAuthor = dropdown.value;
        window.location.href = `/mbookbyauthor.html?author=${encodeURIComponent(selectedAuthor)}`;
    });

    dropdownBtn1.addEventListener("click", async function (){
        dropdown1.style.display = dropdown1.style.display === "none" ? "block" : "none";
        if (dropdown1.options.length === 0) {
            try {
                const response = await fetch('/publisher');
                const publishers = await response.json();
                const option=document.createElement("option");
                option.textContent="Publishers";
                dropdown1.appendChild(option);
                publishers.forEach(publisher => {
                    const option = document.createElement("option");
                    option.value = publisher.PUBLISHER;
                    option.textContent = publisher.PUBLISHER;
                    dropdown1.appendChild(option);
                });
            } catch (error) {
                console.error(error);
            }
        }
    });
    dropdown1.addEventListener("change", function () {
        const selectedPublisher =dropdown1.value;
        window.location.href = `/mbookbypublisher.html?publisher=${encodeURIComponent(selectedPublisher)}`;
    });
});

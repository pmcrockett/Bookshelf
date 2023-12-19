const bookshelf = [];

function Book(_title, _authorFirst, _authorLast, _pageCount, _desc, _format, 
        _read, _rating, _dateRead) {
    this.title = _title;
    this.authorFirst = _authorFirst;
    this.authorLast = _authorLast;
    this.pageCount = _pageCount;
    this.desc = _desc;
    this.format = _format;
    this.read = _read;
    this.rating = Math.max(1, Math.min(_rating, 5));
    this.dateRead = _dateRead;
}

Book.prototype.setRead = function(_read, _dateRead) {
    this.read = _read;
    this.dateRead = _dateRead;
};

Book.prototype.addToBookshelf = function(_bookshelf) {
    _bookshelf.push(this);
};

const firstBook = new Book("Nona the Ninth", "Tamsyn", "Muir", 550, 
    "Third in the Locked Tomb series.", "Digital", true, 5, "12/10/2023");
const secondBook = new Book("The Long Way to a Small, Angry Planet", "Becky", 
    "Chambers", 440, "It's sci-fi.", "Digital", false);

firstBook.addToBookshelf(bookshelf);
secondBook.addToBookshelf(bookshelf);

console.log(bookshelf);

const bookList = document.querySelector(".book-list");

bookshelf.forEach(_e => {
    let listItem = document.createElement("button");
    listItem.classList.add("book-display");
    let node = document.createTextNode(`${_e.title.toString()} (${_e.authorLast}, ${_e.authorFirst})`);
    listItem.appendChild(node);
    let itemContent = document.createElement("div");
    itemContent.classList.add("content");
    createBookDisplayItem(_e.title, 
        `Title: ${_e.title}`, itemContent);
    createBookDisplayItem(_e.authorFirst && _e.authorLast, 
        `Author: ${_e.authorFirst} ${_e.authorLast}`, itemContent);
    createBookDisplayItem(_e.pageCount, 
        `Page count: ${_e.pageCount}`, itemContent);
    createBookDisplayItem(_e.desc, 
        `Description: ${_e.desc}`, itemContent);
    createBookDisplayItem(_e.format, 
        `Format: ${_e.format}`, itemContent);
    createBookDisplayItem(_e.read, 
        `Read: ${_e.read ? "Yes" : "No"}`, itemContent);
    
    if (_e.read) {
        createBookDisplayItem(_e.dateRead, 
            `Date read: ${_e.dateRead}`, itemContent);
            createBookDisplayItem(_e.rating, 
                `Rating: ${_e.rating}/5`, itemContent);
    }
    
    itemContent.style.display = "none"
    bookList.appendChild(listItem);
    bookList.appendChild(itemContent);
});

function createBookDisplayItem(_fieldIsValid, _str, _parentElement) {
    if (_fieldIsValid == null) return;
    let newDiv = document.createElement("div");
    let node = document.createTextNode(_str);
    newDiv.appendChild(node);
    _parentElement.appendChild(newDiv);
}

const bookDisplay = document.getElementsByClassName("book-display");

//const bookDisplay = [1, 2, 3, 4];
console.log(bookDisplay);

for (let e of bookDisplay) {
    e.addEventListener("click", () => {
        e.classList.toggle("active");
        let content = e.nextElementSibling;
        content.style.display === "block" ? content.style.display = "none" :
            content.style.display = "block";
    });
};
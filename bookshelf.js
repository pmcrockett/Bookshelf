String.prototype.toSnakeCase = function() {
    return this.toLocaleLowerCase().replace(" ", "-");
};

let id = 0;
const bookshelf = [];

function Book(_title, _authorFirst, _authorLast, _pageCount, _desc, _format, 
        _read, _rating, _dateRead) {
    this.title = _title || "[Untitled]";
    this.authorFirst = _authorFirst || "";
    this.authorLast = _authorLast || "";
    this.pageCount = _pageCount || "";
    this.desc = _desc || "";
    this.format = _format || "N/A";
    this.read = _read || "N/A";
    this.rating = _rating || "N/A";
    this.dateRead = _dateRead || "";
    this.id = ++Book.prototype.nextId;
}

Book.prototype.nextId = -1;

Book.prototype.setRead = function(_read, _dateRead) {
    this.read = _read;
    this.dateRead = _dateRead;
};

Book.prototype.addToBookshelf = function(_bookshelf) {
    _bookshelf.push(this);
};

const newBook = [];
newBook[0] = new Book("Nona the Ninth", "Tamsyn", "Muir", "550", 
    "Third in the Locked Tomb series.", "Digital", "Yes", "5/5", "2023-12-10");
newBook[1] = new Book("The Long Way to a Small, Angry Planet", "Becky", 
    "Chambers", "440", "It's sci-fi.", "Digital", "No");
newBook[2] = new Book();

newBook.forEach(_e => _e.addToBookshelf(bookshelf));

sortByField(bookshelf, "read", 1);

const bookList = document.querySelector(".book-list");

bookshelf.forEach(_e => {
    let listItem = document.createElement("button");
    listItem.classList.add(`id-${_e.id}`);
    listItem.classList.add("book-display");
    let combinedAuthor = getCombinedAuthor(_e.authorFirst, _e.authorLast, -1);
    let node = document.createTextNode(`${_e.title.toString()}` + 
        `${combinedAuthor.length ? ` (${combinedAuthor})` : ""}`);
    listItem.appendChild(node);
    let itemContent = document.createElement("form");
    itemContent.classList.add(`id-${_e.id}`);
    itemContent.classList.add("content");
    createBookDisplayItem(_e, 
        "Title:", _e.title, itemContent);
    createBookDisplayItem(_e, 
        //"Author:", getCombinedAuthor(_e.authorFirst, _e.authorLast, 1), itemContent);
        "Author:", [_e.authorFirst, _e.authorLast], itemContent);
    createBookDisplayItem(_e, 
        "Page count:", _e.pageCount, itemContent);
    createBookDisplayItem(_e, 
        "Description:", _e.desc, itemContent);
    createBookDisplayItem(_e, 
        "Format:", _e.format, itemContent);
    createBookDisplayItem(_e, 
        "Read:", _e.read, itemContent);
    createBookDisplayItem(_e, 
        "Date read:", _e.dateRead, itemContent);
    createBookDisplayItem(_e, 
        "Rating:", _e.rating, itemContent);
  
    itemContent.style.display = "none"
    bookList.appendChild(listItem);
    bookList.appendChild(itemContent);

    let editButton = document.createElement("button");
    editButton.appendChild(document.createTextNode("Edit"));
    editButton.style.display = "inline";
    editButton.classList.add(_e.id);

    editButton.addEventListener("click", _event => {
        _event.preventDefault();
        const fieldContent = document.getElementsByClassName(`id-${_e.id} book-field-content`);
        const fieldInput = document.getElementsByClassName(`id-${_e.id} book-field-input`);

        if (!fieldContent[0].classList.contains("hidden")) {
            for (let item of fieldContent) {
                item.parentElement.classList.remove("invalid");
                item.classList.add("hidden");
            }
            for (let item of fieldInput) {
                item.classList.remove("hidden");
            }

            resetForm(_e.id);
        } else {
            // Submit form
            const formHtml = document.querySelector(`.id-${_e.id}.content`);
            const form = new FormData(formHtml);

            applyInput(form, _e.id, "title");
            applyInput(form, _e.id, "author");
            applyInput(form, _e.id, "page-count");
            applyInput(form, _e.id, "description");
            applyInput(form, _e.id, "format");
            applyInput(form, _e.id, "read");
            applyInput(form, _e.id, "date-read");
            applyInput(form, _e.id, "rating");

            for (let item of fieldContent) {
                let parent = item.parentElement;
                item.classList.remove("hidden");
            }
            for (let item of fieldInput) {
                item.classList.add("hidden");
            }
        }
    });

    itemContent.appendChild(editButton);

});

function applyInput(_formDat, _id, _snakeClassName) {
    let text = "";

    if (_snakeClassName == "author") {
        const first = _formDat.get(`${_snakeClassName}-0-input-${_id}`);
        const last = _formDat.get(`${_snakeClassName}-1-input-${_id}`);
        //text = getCombinedAuthor(first, last, 1);
        if (first == "" && last == "") {
            let rowToHide = document.querySelector(`.id-${_id}.book-field-row.${_snakeClassName}`);
            rowToHide.classList.add("invalid");
        }

        document.querySelector(`.id-${_id}.book-field-content.${_snakeClassName}-0`)
            .textContent = first;
        document.querySelector(`.id-${_id}.book-field-content.${_snakeClassName}-1`)
            .textContent = last;
    } else {
        text = _formDat.get(`${_snakeClassName}-input-${_id}`);

        if (_snakeClassName == "page-count") {
            if (text != "" && text != "0") {
                text = String(Math.max(1, parseInt(text)));
            } else text = "";
        }
        
        if (((_snakeClassName == "format" || _snakeClassName == "read" 
                || _snakeClassName == "rating") && text === "N/A") 
                || text == "") {
            let rowToHide = document.querySelector(`.id-${_id}.book-field-row.${_snakeClassName}`);
            rowToHide.classList.add("invalid");
        };

        document.querySelector(`.id-${_id}.book-field-content.${_snakeClassName}`)
            .textContent = text;
    }
    

}

function getRowValidity(_fieldName, _fieldContent) {
    if (_fieldContent === null) {
        return false;
    } else if (_fieldName == "Read:" || _fieldName == "Rating:"
            || _fieldName == "Format:") {
        if (_fieldContent == "N/A") return false;
    } else {
        if (_fieldContent == "") return false;
    }

    return true;
}

function getCombinedAuthor(_first, _last, _order) {
    _order = _order > 0 ? 1 : -1;
    let combinedAuthor = "";
    if (_first && _last) {
        if (_order > 0) {
            combinedAuthor = `${_first} ${_last}`;
        } else {
            combinedAuthor = `${_last}, ${_first}`;
        }
    } else if (_last) {
        combinedAuthor = `${_last}`;
    } else if (_first) {
        combinedAuthor = `${_first}`;
    }

    return combinedAuthor;
}

function resetForm(_id) {
    const tags = ["title", "author-0", "author-1", "page-count", "description",
        "format", "read", "date-read"]
    
    tags.forEach(_tag => {
        console.log(`.id-${_id}.book-field-input.${_tag}`);
        document.querySelector(`.id-${_id}.book-field-input.${_tag}`).value =
            document.querySelector(`.id-${_id}.book-field-content.${_tag}`).textContent;
    });

    let ratingVal = document.querySelector(`.id-${_id}.book-field-content.rating`).textContent;
    let ratingLabel = document.getElementsByClassName(`rating-input-label-${_id}`);

    for (let rating of ratingLabel) {
        if (rating.textContent == ratingVal) {
            let ratingInput = document.getElementById(rating.getAttribute("for"));
            ratingInput.setAttribute("checked", "checked");
            break;
        }
    }
    //console.log(document.querySelector(`.id-${_id}.book-field-content.title`));
    // document.querySelector(`.id-${_id}.book-field-input.title`).value =
    //     document.querySelector(`.id-${_id}.book-field-content.title`).textContent;
    // document.querySelector(`.id-${_id}.book-field-input.page-count`).value =
    //     document.querySelector(`.id-${_id}.book-field-content.page-count`).textContent;
    // document.querySelector(`.id-${_id}.book-field-input.date-read`).value =
    //     document.querySelector(`.id-${_id}.book-field-content.date-read`).textContent;
}

function createBookDisplayItem(_e, _fieldName, _fieldContent, _parentElement) {
    function formatElem(_elem, _text, _class) {
        if (_text.length) {
            _elem.appendChild(document.createTextNode(_text));
        }
        _elem.classList.add(..._class);
        return _elem;
    }

    const snakeClassName = _fieldName.toSnakeCase().slice(0, _fieldName.length - 1);

    let validCheck = _fieldContent
    if (typeof _fieldContent == "object") {
        validCheck = _fieldContent[0] + _fieldContent[1];
    }

    //Row div
    let rowElem = document.createElement("div");
    rowElem = formatElem(rowElem, "", [
        `id-${_e.id}`, 
        "book-field-row", 
        snakeClassName]);
    if (!getRowValidity(_fieldName, validCheck)) {
        rowElem.classList.add("invalid");
    }

    // Static fields
    let newElem = document.createElement("div");
    newElem = document.createElement("div");
    newElem = formatElem(newElem, _fieldName, [
        `id-${_e.id}`, 
        "book-field-name", 
        snakeClassName]);
    //if (!_fieldIsValid) {
    //    newElem.style.display = "none";
    //}
    rowElem.appendChild(newElem);

    newElem = document.createElement("div");

    if (typeof _fieldContent == "object") {
        newElem = formatElem(newElem, "", [
            `id-${_e.id}`, 
            "book-field-content",
            "author-container"]);
        for (let i = 0; i < _fieldContent.length; i++) {
            let authorElem = document.createElement("div");
            authorElem = formatElem(authorElem, _fieldContent[i], [
                `id-${_e.id}`, 
                "book-field-content", 
                snakeClassName + `${i == 0 ? "-0" : "-1"}`]);
            
            if (i == 0 && _fieldContent[0].length) {
                authorElem.style.marginRight = "0.33em";
            }

            newElem.appendChild(authorElem);
        }
    } else {
        newElem = formatElem(newElem, _fieldContent, [
            `id-${_e.id}`, 
            "book-field-content", 
            snakeClassName]);
    }
    rowElem.appendChild(newElem);

    // Input fields
    if (_fieldName == "Author:") {
        newElem = document.createElement("div");
        newElem = formatElem(newElem, "", [
            `id-${_e.id}`, 
            "book-field-input",
            "author"]);
        //newElem.style.display = "grid";
        newElem.style.gridAutoFlow = "column";

        for (let i = 0; i < 2; i++) {
            let authorElem = document.createElement("input");
            authorElem = formatElem(authorElem, "", [
                `id-${_e.id}`, 
                "book-field-input", 
                snakeClassName + "-" + i]);
            authorElem.setAttribute("value", i == 0 ? _e.authorFirst : _e.authorLast);
            //authorElem.appendChild(document.createTextNode(i == 0 ? _e.authorFirst : _e.authorLast));
            authorElem.setAttribute("name", `author-${i}-input-${_e.id}`);
            //authorElem.classList.add("hidden");
            newElem.appendChild(authorElem);
        }

        newElem.classList.add("hidden");
    } else if (_fieldName == "Rating:") {
        newElem = document.createElement("fieldset");
        newElem = formatElem(newElem, "", [
            `id-${_e.id}`, 
            "book-field-input",]);
        //newElem.style.display = "grid";
        newElem.style.gridAutoFlow = "column";
        const ratingLabel = ["N/A", "1", "2", "3", "4", "5"]
        const ratingVal = ["N/A", "1/5", "2/5", "3/5", "4/5", "5/5"]

        for (let i = 0; i < 6; i++) {
            let ratingElem = document.createElement("input");
            ratingElem = formatElem(ratingElem, "", [
                `id-${_e.id}`, 
                "book-field-input", 
                snakeClassName + "-" + i]);
            ratingElem.setAttribute("type", "radio");
            ratingElem.setAttribute("name", `rating-input-${_e.id}`);
            ratingElem.setAttribute("id", `rating-input-${_e.id}-id-${i}`);
            ratingElem.setAttribute("value", ratingVal[i]);

            if (_fieldContent == ratingVal[i]) {
                ratingElem.setAttribute("checked", "checked");
            }
            //ratingElem.classList.add("hidden");
            newElem.appendChild(ratingElem);

            let newLabel = document.createElement("label");
            newLabel.setAttribute("for", `rating-input-${_e.id}-id-${i}`);
            newLabel.classList.add(`rating-input-label-${_e.id}`);
            newLabel = formatElem(newLabel, ratingLabel[i], []);
            newElem.appendChild(newLabel);
        }

        newElem.classList.add("hidden");
    } else if (_fieldName == "Format:") {
        newElem = document.createElement("select");
        newElem = formatElem(newElem, "", [
            `id-${_e.id}`, 
            "book-field-input", 
            snakeClassName]);
        newElem.setAttribute("name", `format-input-${_e.id}`);

        for (let i = 0; i < 3; i++) {
            let optionElem = document.createElement("option");
            let val = i == 0 ? "N/A" : i == 1 ? "Print" : "Digital";
            optionElem = formatElem(optionElem, val, [
                `id-${_e.id}`, 
                snakeClassName + "-" + i]);
            optionElem.setAttribute("value", val);
            if (val == _fieldContent) {
                optionElem.setAttribute("selected", "selected");
            }
            newElem.appendChild(optionElem);
        }

        newElem.classList.add("hidden");
    } else if (_fieldName == "Read:") {
        newElem = document.createElement("select");
        newElem = formatElem(newElem, "", [
            `id-${_e.id}`, 
            "book-field-input", 
            snakeClassName]);
        newElem.setAttribute("name", `read-input-${_e.id}`);

        for (let i = 0; i < 3; i++) {
            let optionElem = document.createElement("option");
            let val = i == 0 ? "N/A" : i == 1 ? "Yes" : "No";
            optionElem = formatElem(optionElem, val, [
                `id-${_e.id}`, 
                snakeClassName + "-" + i]);
            optionElem.setAttribute("value", val);
            if (val == _fieldContent) {
                optionElem.setAttribute("selected", "selected");
            }
            newElem.appendChild(optionElem);
        }

        newElem.classList.add("hidden");
    } else {
        newElem = document.createElement(_fieldName == "Description:" ? "textarea" : "input");
        let textContent = "";

        if (_fieldName == "Title:") {
            //textContent = _fieldContent;
            newElem.setAttribute("value", _fieldContent);
        } else if (_fieldName == "Page count:") {
            newElem.setAttribute("type", "number");
            newElem.setAttribute("value", _fieldContent);
        } else if (_fieldName == "Description:") {
            textContent = _fieldContent;
        } else if (_fieldName == "Format:") {
            newElem.setAttribute("type", "list");
            newElem.setAttribute("value", _fieldContent);
        // } else if (_fieldName == "Read:") {
        //     newElem.setAttribute("type", "checkbox");
        //     if (_fieldContent == "Yes") {
        //         newElem.setAttribute("checked", "checked");
        //     }
        } else if (_fieldName == "Date read:") {
            newElem.setAttribute("type", "date");
            newElem.setAttribute("value", _fieldContent || "");
        }

        newElem = formatElem(newElem, textContent, [
            `id-${_e.id}`, 
            "book-field-input", 
            snakeClassName]);
        newElem.setAttribute("name", `${snakeClassName}-input-${_e.id}`);
        newElem.classList.add("hidden");
    }

    // if (!_fieldIsValid) {
    //     //newElem.style.display = "none";
    //     //newElem.classList.add("invalid");
    //     //rowElem.style.display = "none";
    //     rowElem.classList.add("invalid");
    // }

    rowElem.appendChild(newElem);
    _parentElement.appendChild(rowElem);
}

function validateInput() {

}

const bookDisplay = document.getElementsByClassName("book-display");

for (let e of bookDisplay) {
    e.addEventListener("click", () => {
        e.classList.toggle("active");
        let content = e.nextElementSibling;
        content.style.display === "grid" ? content.style.display = "none" :
            content.style.display = "grid";
    });
};

function sortByField(_bookshelf, _field, _dir) {
    _dir > 0 ? _dir = 1 : _dir = -1;

    _bookshelf.sort((_a, _b) => {
        let val1 = _a[_field];
        let val2 = _b[_field];

        if (typeof val1 === "string") {
            val1 = val1.toLocaleLowerCase();
            val2 = val2.toLocaleLowerCase();

            if (_field === "title") {
                val1 = removeLeadingArticle(val1);
                val2 = removeLeadingArticle(val2);
            }
        }
        return val1 > val2 ? _dir : _dir * -1;
    });
}

function removeLeadingArticle(_str) {
    const lower = _str.toLocaleLowerCase();

    if (lower.startsWith("the ")) {
        _str = _str.slice(4, _str.length);
    } else if (lower.startsWith("a ")) {
        _str = _str.slice(2, _str.length);
    }
    return _str;
}
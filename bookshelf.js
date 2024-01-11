String.prototype.toSnakeCase = function() {
    return this.toLocaleLowerCase().replace(" ", "-");
};

const newBookButton = document.querySelector(".new-book");
const authorAscButton = document.querySelector(".author-asc");
const authorDescButton = document.querySelector(".author-desc");
const titleAscButton = document.querySelector(".title-asc");
const titleDescButton = document.querySelector(".title-desc");
const ratingAscButton = document.querySelector(".rating-asc");
const ratingDescButton = document.querySelector(".rating-desc");
const expandButton = document.querySelector(".expand");
const collapseButton = document.querySelector(".collapse");

let id = 0;
const bookshelf = [];

function Book(_title, _authorFirst, _authorLast, _pageCount, _desc, _format, 
        _read, _rating, _dateRead) {
    this.title = _title || "[Untitled]";
    this["author-0"] = _authorFirst || "";
    this["author-1"] = _authorLast || "";
    this["page-count"] = _pageCount || "";
    this.description = _desc || "";
    this.format = _format || "N/A";
    this.read = _read || "N/A";
    this.rating = _rating || "N/A";
    this["date-read"] = _dateRead || "";
    this.id = ++Book.prototype.lastId;
    this.expand = false;
}

Book.prototype.lastId = -1;

Book.prototype.setRead = function(_read, _dateRead) {
    this.read = _read;
    this["date-read"] = _dateRead;
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

const mainDiv = document.querySelector(".main");
let bookList = document.querySelector(".book-list");
initBookshelf(bookshelf)

function initBookshelf(_bookshelf) {
    _bookshelf.forEach(_e => {
        let listItem = document.createElement("button");
        listItem.classList.add(`id-${_e.id}`);
        listItem.classList.add("book-display");

        let rightArrowSvg = "M2,12A10,10 0 0,1 12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12M10,17L15,12L10,7V17Z";
        let downArrowSvg = "M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M7,10L12,15L17,10H7Z"
        listItem = appendSvg(listItem, "var(--dark-text-col)", rightArrowSvg);
        
        listItem.addEventListener("click", () => {
            listItem.classList.toggle("active");
            let idx = getBookIdxById(_bookshelf, _e.id);
            let content = listItem.nextElementSibling;

            autoSubmit(_e.id)

            if (content.style.display === "grid") {
                content.style.display = "none";
                _bookshelf[idx].expand = false;
                let pathElem = document.querySelector(`button.id-${_e.id}.book-display > svg > path`);
                pathElem.setAttribute("d", rightArrowSvg);
            } else {
                content.style.display = "grid";
                _bookshelf[idx].expand = true;
                let pathElem = document.querySelector(`button.id-${_e.id}.book-display > svg > path`);
                pathElem.setAttribute("d", downArrowSvg);
            }
        });

        let combinedAuthor = getCombinedAuthor(_e["author-0"], _e["author-1"], -1);
        let node = document.createTextNode(`${_e.title.toString()}` + 
            `${combinedAuthor.length ? ` (${combinedAuthor})` : ""}`);
        listItem.appendChild(node);
        let itemContent = document.createElement("form");
        itemContent.classList.add(`id-${_e.id}`);
        itemContent.classList.add("content");
        createBookDisplayItem(_e, 
            "Title:", _e.title, itemContent);
        createBookDisplayItem(_e, 
            "Author:", [_e["author-0"], _e["author-1"]], itemContent);
        createBookDisplayItem(_e, 
            "Description:", _e.description, itemContent);
        createBookDisplayItem(_e, 
            "Page count:", _e["page-count"], itemContent);
        createBookDisplayItem(_e, 
            "Format:", _e.format, itemContent);
        createBookDisplayItem(_e, 
            "Read:", _e.read, itemContent);
        createBookDisplayItem(_e, 
            "Date read:", _e["date-read"], itemContent);
        createBookDisplayItem(_e, 
            "Rating:", _e.rating, itemContent);
    
        itemContent.style.display = "none"
        bookList.appendChild(listItem);
        bookList.appendChild(itemContent);

        let buttonDiv = document.createElement("div");

        buttonDiv.classList.add(`id-${_e.id}`, "button-div");
        itemContent.appendChild(buttonDiv);

        let editButton = document.createElement("button");
        let editSvg = "M12,2C6.47,2 2,6.47 2,12C2,17.53 6.47,22 12,22C17.53,22 22,17.53 22,12C22,6.47 17.53,2 12,2M15.1,7.07C15.24,7.07 15.38,7.12 15.5,7.23L16.77,8.5C17,8.72 17,9.07 16.77,9.28L15.77,10.28L13.72,8.23L14.72,7.23C14.82,7.12 14.96,7.07 15.1,7.07M13.13,8.81L15.19,10.87L9.13,16.93H7.07V14.87L13.13,8.81Z";
        editButton = appendSvg(editButton, "var(--side-button-col)", editSvg);
        editButton.classList.add("svg-button");

        editButton.classList.add(`id-${_e.id}`, "edit", "modifier");
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
                editButton.classList.add("is-editing");
                let pathElem = document.querySelector(`button.id-${_e.id}.edit > svg > path`);
                pathElem.setAttribute("d", "M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z");
            } else {
                // Submit form
                const formHtml = document.querySelector(`.id-${_e.id}.content`);
                const form = new FormData(formHtml);

                applyInput(form, _e.id, "title");
                applyInput(form, _e.id, "author");
                applyInput(form, _e.id, "description");
                applyInput(form, _e.id, "page-count");
                applyInput(form, _e.id, "format");
                applyInput(form, _e.id, "read");
                applyInput(form, _e.id, "date-read");
                applyInput(form, _e.id, "rating");

                for (let item of fieldContent) {
                    item.classList.remove("hidden");
                }
                for (let item of fieldInput) {
                    item.classList.add("hidden");
                }

                let bookButton = document.querySelector(`.id-${_e.id}.book-display`);
                let title = document.querySelector(`.id-${_e.id}.book-field-content.title`).textContent;
                let authorFirst = form.get(`author-0-input-${_e.id}`);
                let authorLast = form.get(`author-1-input-${_e.id}`);
                let combinedAuthor = getCombinedAuthor(authorFirst, authorLast, -1);
                bookButton.textContent = "";
                bookButton = appendSvg(bookButton, "var(--dark-text-col)", downArrowSvg);
                node = document.createTextNode(title + 
                    `${combinedAuthor.length ? ` (${combinedAuthor})` : ""}`);
                bookButton.appendChild(node);

                editButton.classList.remove("is-editing");
                let pathElem = document.querySelector(`button.id-${_e.id}.edit > svg > path`);
                pathElem.setAttribute("d", editSvg);
            }
        });
        
        buttonDiv.appendChild(editButton);

        let deleteButton = document.createElement("button");
        deleteButton.classList.add(`id-${_e.id}`, "delete", "modifier");
        deleteButton = appendSvg(deleteButton, "var(--side-button-col)",
            "M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M17,7H14.5L13.5,6H10.5L9.5,7H7V9H17V7M9,18H15A1,1 0 0,0 16,17V10H8V17A1,1 0 0,0 9,18Z");
        deleteButton.classList.add("svg-button");

        deleteButton.addEventListener("click", _event => {
            _event.preventDefault();
            let bookDisplay = document.querySelector(`.id-${_e.id}.book-display`);
            let content = document.querySelector(`.id-${_e.id}.content`);
            bookDisplay.remove();
            content.remove();
            let idx = getBookIdxById(_bookshelf, _e.id);
            _bookshelf.splice(idx, 1);
        });

        buttonDiv.appendChild(deleteButton);
    });
}

function appendSvg(_elem, _col, _path) {
    let editSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    editSvg.setAttribute("viewBox", "0 0 24 24");
    editSvg.setAttribute("style", "fill:" + _col);
    let editTitle = document.createElement("title");
    editTitle.textContent = "svg-img";
    editSvg.appendChild(editTitle);
    let editPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    editPath.setAttribute("d", _path);
    editSvg.appendChild(editPath);
    _elem.appendChild(editSvg);

    return _elem;
}

function autoSubmit(_id) {
    let editButton = document.querySelector(`.id-${_id}.edit`);
    
    if (editButton && editButton.classList.contains("is-editing")) {
        editButton.dispatchEvent(new Event("click"));
    }
}

function reinitBookshelf(_bookshelf) {
    _bookshelf.forEach(_e =>  {
        autoSubmit(_e.id);
    });

    bookList.remove();
    bookList = document.createElement("div");
    bookList.classList.add("book-list");
    mainDiv.appendChild(bookList);
    initBookshelf(_bookshelf);

    _bookshelf.forEach(_e =>  {
        if (_e.expand) {
            let bookDisplay = 
                document.querySelector(`.id-${_e.id}.book-display`)
            bookDisplay.dispatchEvent(new Event("click"));
        }
    });
}

function getBookIdxById(_bookshelf, _id) {
    for (let i = 0; i < _bookshelf.length; i++) {
        if (_bookshelf[i].id == _id) return i;
    }

    return -1;
}

newBookButton.addEventListener("click", _event => {
    window.scrollTo(0, 0);
    bookshelf.splice(0, 0, new Book());
    reinitBookshelf(bookshelf);
    let bookDisplay = document.querySelector(`.id-${Book.prototype.lastId}.book-display`);
    let bookEdit = document.querySelector(`.id-${Book.prototype.lastId}.edit`);
    bookDisplay.dispatchEvent(new Event("click"));
    bookEdit.dispatchEvent(new Event("click"));
});

authorAscButton.addEventListener("click", _event => {
    sortBookshelf(bookshelf, "title", 1);
    sortBookshelf(bookshelf, "author-1", 1);
});

authorDescButton.addEventListener("click", _event => {
    sortBookshelf(bookshelf, "title", 1);
    sortBookshelf(bookshelf, "author-1", -1);
});

titleAscButton.addEventListener("click", _event => {
    sortBookshelf(bookshelf, "author-1", 1);
    sortBookshelf(bookshelf, "title", 1);
});

titleDescButton.addEventListener("click", _event => {
    sortBookshelf(bookshelf, "author-1", 1);
    sortBookshelf(bookshelf, "title", -1);
});

ratingAscButton.addEventListener("click", _event => {
    sortBookshelf(bookshelf, "title", 1);
    sortBookshelf(bookshelf, "author-1", 1);
    sortBookshelf(bookshelf, "rating", 1);
});

ratingDescButton.addEventListener("click", _event => {
    sortBookshelf(bookshelf, "title", 1);
    sortBookshelf(bookshelf, "author-1", 1);
    sortBookshelf(bookshelf, "rating", -1);
});

expandButton.addEventListener("click", _event => {
    bookshelf.forEach(_e =>  {
        if (!_e.expand) {
            let bookDisplay = 
                document.querySelector(`.id-${_e.id}.book-display`)
            bookDisplay.dispatchEvent(new Event("click"));
        }
    });
});

collapseButton.addEventListener("click", _event => {
    bookshelf.forEach(_e =>  {
        if (_e.expand) {
            let bookDisplay = 
                document.querySelector(`.id-${_e.id}.book-display`)
            bookDisplay.dispatchEvent(new Event("click"));
        }
    });
});

function sortBookshelf(_bookshelf, _field, _dir) {
    sortByField(_bookshelf, _field, _dir);
    reinitBookshelf(_bookshelf);
}

function applyInput(_formDat, _id, _snakeClassName) {
    let text = "";

    if (_snakeClassName == "author") {
        const first = _formDat.get(`${_snakeClassName}-0-input-${_id}`);
        const last = _formDat.get(`${_snakeClassName}-1-input-${_id}`);
        
        let firstContent = document.querySelector(`.id-${_id}.book-field-content.${_snakeClassName}-0`);
        firstContent.textContent = first;
        let lastContent = document.querySelector(`.id-${_id}.book-field-content.${_snakeClassName}-1`);
        lastContent.textContent = last;

        if (first == "" && last == "") {
            let rowToHide = document.querySelector(`.id-${_id}.book-field-row.${_snakeClassName}`);
            rowToHide.classList.add("invalid");
        } else if (first.length) {
            firstContent.style.marginRight = "0.5ch";
        } else {
            firstContent.style.marginRight = "0px";
        }

        bookshelf.forEach(_e => {
            if (_e.id == _id) {
                _e[_snakeClassName + "-0"] = first;
                _e[_snakeClassName + "-1"] = last;
            }
        });
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
        
        bookshelf.forEach(_e => {
            if (_e.id == _id) {
                _e[_snakeClassName] = text;
            }
        });
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
        let elem = document.querySelector(`.id-${_id}.book-field-input.${_tag}`);
        let newVal = document.querySelector(`.id-${_id}.book-field-content.${_tag}`).textContent;
        elem.setAttribute("value", newVal);
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
                authorElem.style.marginRight = "0.5ch";
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
        newElem.style.gridAutoFlow = "column";

        for (let i = 0; i < 2; i++) {
            let authorElem = document.createElement("input");
            authorElem = formatElem(authorElem, "", [
                `id-${_e.id}`, 
                "book-field-input", 
                snakeClassName + "-" + i]);
            authorElem.setAttribute("value", i == 0 ? _e["author-0"] : _e["author-1"]);
            authorElem.setAttribute("name", `author-${i}-input-${_e.id}`);
            newElem.appendChild(authorElem);
        }

        newElem.classList.add("hidden");
    } else if (_fieldName == "Rating:") {
        newElem = document.createElement("fieldset");
        newElem = formatElem(newElem, "", [
            `id-${_e.id}`, 
            "book-field-input",]);
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
            newElem.setAttribute("value", _fieldContent);
        } else if (_fieldName == "Page count:") {
            newElem.setAttribute("type", "number");
            newElem.setAttribute("value", _fieldContent);
        } else if (_fieldName == "Description:") {
            textContent = _fieldContent;
        } else if (_fieldName == "Format:") {
            newElem.setAttribute("type", "list");
            newElem.setAttribute("value", _fieldContent);
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

    rowElem.appendChild(newElem);
    _parentElement.appendChild(rowElem);
}

function sortByField(_bookshelf, _field, _dir) {
    _dir > 0 ? _dir = 1 : _dir = -1;

    _bookshelf.sort((_a, _b) => {
        let val1 = _a[_field];
        let val2 = _b[_field];

        if (_field == "rating" || _field == "read" || _field == "format") {
            if (val1 == "N/A") val1 = "";
            if (val2 == "N/A") val2 = "";
        }

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
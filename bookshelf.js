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

function BookButton(_book) {
    const buttonTemplate = document.querySelector("#book-button-template");
    const clone = buttonTemplate.content.cloneNode(true);
    this.button = clone.querySelector("button");
    this.button.classList.add(`id-${_book.id}`);
    this.svgPath = this.button.querySelector(`svg > path`);
    this.textDiv = this.button.querySelector(".book-button-text");
    this.book = _book;
    this.expand = false;
    this.setRightArrow();

    this.button.addEventListener("click", this.click.bind(this));
}

BookButton.prototype.rightArrowSvg = "M2,12A10,10 0 0,1 12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12M10,17L15,12L10,7V17Z";
BookButton.prototype.downArrowSvg = "M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M7,10L12,15L17,10H7Z";

BookButton.prototype.setRightArrow = function() {
    this.svgPath.setAttribute("d", this.rightArrowSvg);
}

BookButton.prototype.setDownArrow = function() {
    this.svgPath.setAttribute("d", this.downArrowSvg);
}

BookButton.prototype.click = function(_e) {
    this.button.classList.toggle("active");
    let content = this.button.nextElementSibling;

    this.book.autoSubmit();

    if (content.style.display === "grid") {
        content.style.display = "none";
        this.expand = false;
        this.setRightArrow();
    } else {
        content.style.display = "grid";
        this.expand = true;
        this.setDownArrow();
    }
}

BookButton.prototype.updateText = function(_title, _authorFirst, _authorLast) {
    let combinedAuthor = getCombinedAuthor(_authorFirst, _authorLast, -1);
    this.textDiv.textContent = _title + 
        `${combinedAuthor.length ? ` (${combinedAuthor})` : ""}`;
}

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
}

Book.prototype.editSvg = "M12,2C6.47,2 2,6.47 2,12C2,17.53 6.47,22 12,22C17.53,22 22,17.53 22,12C22,6.47 17.53,2 12,2M15.1,7.07C15.24,7.07 15.38,7.12 15.5,7.23L16.77,8.5C17,8.72 17,9.07 16.77,9.28L15.77,10.28L13.72,8.23L14.72,7.23C14.82,7.12 14.96,7.07 15.1,7.07M13.13,8.81L15.19,10.87L9.13,16.93H7.07V14.87L13.13,8.81Z";
Book.prototype.submitSvg = "M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z";
Book.prototype.deleteSvg = "M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M17,7H14.5L13.5,6H10.5L9.5,7H7V9H17V7M9,18H15A1,1 0 0,0 16,17V10H8V17A1,1 0 0,0 9,18Z";

Book.prototype.setShelf = function(_shelf) {
    this.shelf = _shelf;
}

Book.prototype.removeHTML = function() {
    this.form.remove();
    this.bookButton.button.remove();
}

Book.prototype.appendHTML = function(_parent) {
    _parent.appendChild(this.bookButton.button);
    _parent.appendChild(this.form);
}

Book.prototype.buildForm = function() {
    const formTemplate = document.querySelector("#form-template");
    clone = formTemplate.content.cloneNode(true);
    this.form = clone.querySelector("form");

    let allElems = this.form.querySelectorAll("*");
    let allInput = this.form.querySelectorAll("book-field-input:not(div):not(fieldset)");

    for (let e of allElems) {
        e.classList.add(`id-${this.id}`)
    }
    for (let e of allInput) {
        let name = e.getAttribute("name");
        name += `-id-${this.id}`;
        e.setAttribute("name", name);

        if (e.classList.contains("rating")) {
            let id = e.getAttribute("id");
            id += `-id-${this.id}`;
            e.setAttribute("id", id);
        }
    }
}

Book.prototype.buildHTML = function() {
    this.bookButton = new BookButton(this);
    this.buildForm();

    // Field content is only visible when not editing book data.
    this.fieldContent = this.form.getElementsByClassName(`id-${this.id} book-field-content`);
    // Field input is only visible when editing book data.
    this.fieldInput = this.form.getElementsByClassName(`id-${this.id} book-field-input`);

    this.editButton = this.form.querySelector(".svg-button.edit");
    this.editButtonSvgPath = this.form.querySelector(`button.id-${this.id}.edit > svg > path`);
    this.editButton.addEventListener("click", this.clickEdit.bind(this));

    this.deleteButton = this.form.querySelector(".svg-button.delete");
    this.deleteButton.addEventListener("click", this.clickDelete.bind(this));
}

Book.prototype.clickEdit = function(_e) {
    if (_e) {
        _e.preventDefault();
    }

    if (!this.fieldContent[0].classList.contains("hidden")) {
        //Show input form
        for (let item of this.fieldContent) {
            item.parentElement.classList.remove("invalid");
            item.classList.add("hidden");
        }
        for (let item of this.fieldInput) {
            item.classList.remove("hidden");
        }

        this.prefillFormFromContent(this.id);
        this.editButton.classList.add("is-editing");
        this.editButtonSvgPath.setAttribute("d", this.submitSvg);
    } else {
        // Submit and hide input form
        const form = new FormData(this.form);
        this.applyInput(form, "title");
        this.applyInput(form, "author");
        this.applyInput(form, "description");
        this.applyInput(form, "page-count");
        this.applyInput(form, "format");
        this.applyInput(form, "read");
        this.applyInput(form, "date-read");
        this.applyInput(form, "rating");

        for (let item of this.fieldContent) {
            item.classList.remove("hidden");
        }
        for (let item of this.fieldInput) {
            item.classList.add("hidden");
        }

        this.bookButton.updateText(this.title, this["author-0"], this["author-1"]);
        this.editButton.classList.remove("is-editing");
        this.editButtonSvgPath.setAttribute("d", this.editSvg);
    }
}

Book.prototype.clickDelete = function(_e) {
    _e.preventDefault();
    this.removeHTML();

    if (this.shelf) {
        this.shelf.removeBook(this.id);
        this.shelf = null;
    }
}

Book.prototype.prefillFormFromContent = function() {
    const tags = ["title", "author-0", "author-1", "page-count", "description",
        "format", "read", "date-read"]
    
    tags.forEach(_tag => {
        let elem = this.form.querySelector(`.book-field-input.${_tag}`);
        let newVal = this.form.querySelector(`.book-field-content.${_tag}`).textContent;
        elem.setAttribute("value", newVal);
    });

    let ratingVal = this.form.querySelector(`.book-field-content.rating`).textContent;
    let ratingLabel = this.form.getElementsByClassName(`rating-input-label-${this.id}`);

    for (let rating of ratingLabel) {
        if (rating.textContent == ratingVal) {
            let ratingInput = this.form.getElementById(rating.getAttribute("for"));
            ratingInput.setAttribute("checked", "checked");
            break;
        }
    }
}

Book.prototype.applyInput = function(_formDat, _snakeClassName) {
    let text = "";

    if (_snakeClassName == "author") {
        console.log(_formDat);
        const first = _formDat.get(`${_snakeClassName}-0-input`) || "";
        const last = _formDat.get(`${_snakeClassName}-1-input`) || "";
        
        let firstContent = this.form.querySelector(`.id-${this.id}.book-field-content.${_snakeClassName}-0`);
        firstContent.textContent = first;
        let lastContent = this.form.querySelector(`.id-${this.id}.book-field-content.${_snakeClassName}-1`);
        lastContent.textContent = last;

        if (first == "" && last == "") {
            let rowToHide = this.form.querySelector(`.id-${this.id}.book-field-row.${_snakeClassName}`);
            rowToHide.classList.add("invalid");
            console.log("no author input data");
        } else if (first.length) {
            firstContent.style.marginRight = "0.5ch";
        } else {
            firstContent.style.marginRight = "0px";
        }

        this[_snakeClassName + "-0"] = first;
        this[_snakeClassName + "-1"] = last;
    } else {
        text = _formDat.get(`${_snakeClassName}-input`) || "";

        if (_snakeClassName == "page-count") {
            if (text != "" && text != "0") {
                text = String(Math.max(1, parseInt(text)));
            } else text = "";
        }
        
        if (((_snakeClassName == "format" || _snakeClassName == "read" 
                || _snakeClassName == "rating") && text === "N/A") 
                || text == "") {
            let rowToHide = this.form.querySelector(`.id-${this.id}.book-field-row.${_snakeClassName}`);
            rowToHide.classList.add("invalid");
        };
        
        let elem = this.form.querySelector(`.id-${this.id}.book-field-content.${_snakeClassName}`);

        if (_snakeClassName == "description") {
            console.log(text);
            elem = insertLineBreaks(elem, text);
        } else {
            elem.textContent = text;
        }
        
        this[_snakeClassName] = text;;
    }
}

Book.prototype.autoSubmit = function() {
    if (this.editButton && this.editButton.classList.contains("is-editing")) {
        this.clickEdit(null);
    }
}

Book.prototype.lastId = -1;

Book.prototype.prefillInput = function() {

}

function Bookshelf(_books) {
    this.bookListDiv = document.querySelector(".book-list");
    this.bookList = [];
    _books.forEach(_e => {
        this.addBook(_e);
    });
}

Bookshelf.prototype.addBook = function(_book) {
    this.bookList.splice(0, 0, _book);
    _book.setShelf(this);
    _book.buildHTML();
    _book.appendHTML(this.bookListDiv);
}

Bookshelf.prototype.removeBook = function(_id) {
    const idx = this.getBookIdxById(this.id);
    this.bookList.splice(idx, 1);
}

Bookshelf.prototype.getBookIdxById = function(_id) {
    for (let i = 0; i < this.bookList.length; i++) {
        if (this.bookList[i].id == _id) return i;
    }

    return -1;
}

Bookshelf.prototype.sort = function(_field, _dir) {
    _dir > 0 ? _dir = 1 : _dir = -1;

    this.bookList.sort((_a, _b) => {
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

    this.reinitHTML();
}

Bookshelf.prototype.reinitHTML = function() {
    this.bookList.forEach(_e =>  {
        _e.autoSubmit();
        _e.removeHTML();
    });

    this.bookList.forEach(_e =>  {
        _e.appendHTML(this.bookListDiv);
        if (_e.bookButton.expand) {
            _e.bookButton.click(null);
        }
    });
}

Bookshelf.prototype.expandAll = function(_e) {
    this.bookList.forEach(_book => {
        if (!_book.bookButton.expand) {
            _book.bookButton.click(null);
        }
    });
}

Bookshelf.prototype.collapseAll = function(_e) {
    this.bookList.forEach(_book =>  {
        if (_book.bookButton.expand) {
            _book.bookButton.click(null);
        }
    });
}

const newBook = [];
newBook[0] = new Book("Nona the Ninth", "Tamsyn", "Muir", "467", 
    "Her city is under siege. The zombies are coming back. And all Nona wants is a birthday party.\n\n(From Goodreads.com)", 
    "Digital", "Yes", "5/5", "2023-12-10");
newBook[1] = new Book("The Long Way to a Small, Angry Planet", "Becky", 
    "Chambers", "518", "Follow a motley crew on an exciting journey through space-and one adventurous young explorer who discovers the meaning of family in the far reaches of the universe-in this light-hearted debut space opera from a rising sci-fi star.\n\n(From Goodreads.com)", 
    "Digital", "Yes", "4/5");
newBook[2] = new Book("Our Wives Under the Sea", "Julia", "Armfield", "223",
    "Leah is changed. Months earlier, she left for a routine expedition, only this time her submarine sank to the sea floor. When she finally surfaces and returns home, her wife Miri knows that something is wrong. Barely eating and lost in her thoughts, Leah rotates between rooms in their apartment, running the taps morning and night.\n\nAs Miri searches for answers, desperate to understand what happened below the water, she must face the possibility that the woman she loves is slipping from her grasp.\n\n(From Goodreads.com)",
    "Digital", "Yes", "5/5");
newBook[3] = new Book("The Mountain in the Sea", "Ray", "Nayler", "464",
    "Rumors begin to spread of a species of hyperintelligent, dangerous octopus that may have developed its own language and culture. Marine biologist Dr. Ha Nguyen, who has spent her life researching cephalopod intelligence, will do anything for the chance to study them.\n\nThe transnational tech corporation DIANIMA has sealed the remote Con Dao Archipelago, where the octopuses were discovered, off from the world. Dr. Nguyen joins DIANIMA’s team on the islands: a battle-scarred security agent and the world’s first android.\n\nThe octopuses hold the key to unprecedented breakthroughs in extrahuman intelligence. The stakes are high: there are vast fortunes to be made by whoever can take advantage of the octopuses’ advancements, and as Dr. Nguyen struggles to communicate with the newly discovered species, forces larger than DIANIMA close in to seize the octopuses for themselves.\n\nBut no one has yet asked the octopuses what they think. And what they might do about it.\n\nA near-future thriller about the nature of consciousness, Ray Nayler’s The Mountain in the Sea is a dazzling literary debut and a mind-blowing dive into the treasure and wreckage of humankind’s legacy.\n\n(From Goodreads.com)",
    "Digital", "Yes", "4/5");
newBook[4] = new Book("Momenticon", "Andrew", "Caldecott", "362",
    "A hugely compelling, dark, offbeat adventure from the bestselling author of ROTHERWEIRD, a master storyteller at the height of his powers.\n\nThe world has become a dangerous place. Despite the environmentalists' best efforts, the atmosphere has turned toxic, destroying almost all life - plants, animals, and most of humanity too.\n\nSurvivors live in domes protected by chitin shields, serving one or other of the two great companies, Lord Vane's Tempestas or Lord Sine's Genrich, with their very different visions for mankind's future.\n\nFogg has been the curator of the isolated Museum Dome for three years. It contains Man's finest artefacts, but Fogg hasn't had a single visitor. He immerses himself in the exhibits with only AI PT, his automated physical trainer, for company.\n\nThen a single mysterious pill appears in the Museum as if from nowhere: a momenticon. It signals the end of his hermit's life and an impending struggle with the dark forces which threaten everything that remains: a struggle which will take him and his new companions to the ends of the earth.\n\nThis is a post-apocalyptic world unlike any other.\n\n(From Goodreads.com)",
    "Digital", "Yes", "4/5", "2023-05-02");
newBook[5] = new Book("The Luminous Dead", "Caitlin", "Starling", "432",
    "A thrilling, atmospheric debut with the intensive drive of The Martian and Gravity and the creeping dread of Annihilation, in which a caver on a foreign planet finds herself on a terrifying psychological and emotional journey for survival.\n\nWhen Gyre Price lied her way into this expedition, she thought she’d be mapping mineral deposits, and that her biggest problems would be cave collapses and gear malfunctions. She also thought that the fat paycheck—enough to get her off-planet and on the trail of her mother—meant she’d get a skilled surface team, monitoring her suit and environment, keeping her safe. Keeping her sane.\n\nInstead, she got Em.\n\nEm sees nothing wrong with controlling Gyre’s body with drugs or withholding critical information to “ensure the smooth operation” of her expedition. Em knows all about Gyre’s falsified credentials, and has no qualms using them as a leash—and a lash. And Em has secrets, too . . .\n\nAs Gyre descends, little inconsistencies—missing supplies, unexpected changes in the route, and, worst of all, shifts in Em’s motivations—drive her out of her depths. Lost and disoriented, Gyre finds her sense of control giving way to paranoia and anger. On her own in this mysterious, deadly place, surrounded by darkness and the unknown, Gyre must overcome more than just the dangerous terrain and the Tunneler which calls underground its home if she wants to make it out alive—she must confront the ghosts in her own head.\n\nBut how come she can't shake the feeling she’s being followed?\n\n(From Goodreads.com)",
    "Digital", "Yes", "5/5", "2023-04-25");
newBook[6] = new Book("Circe", "Madeline", "Miller", "433",
    "In the house of Helios, god of the sun and mightiest of the Titans, a daughter is born. But Circe has neither the look nor the voice of divinity, and is scorned and rejected by her kin. Increasingly isolated, she turns to mortals for companionship, leading her to discover a power forbidden to the gods: witchcraft.\n\nWhen love drives Circe to cast a dark spell, wrathful Zeus banishes her to the remote island of Aiaia. There she learns to harness her occult craft, drawing strength from nature. But she will not always be alone; many are destined to pass through Circe's place of exile, entwining their fates with hers. The messenger god, Hermes. The craftsman, Daedalus. A ship bearing a golden fleece. And wily Odysseus, on his epic voyage home.\n\nThere is danger for a solitary woman in this world, and Circe's independence draws the wrath of men and gods alike. To protect what she holds dear, Circe must decide whether she belongs with the deities she is born from, or the mortals she has come to love.\n\n(From Goodreads.com)",
    "Digital", "Yes", "4/5");
newBook[7] = new Book("The Final Empire", "Brandon", "Sanderson", "537",
    "For a thousand years the ash fell and no flowers bloomed. For a thousand years the Skaa slaved in misery and lived in fear. For a thousand years the Lord Ruler, the \"Sliver of Infinity,\" reigned with absolute power and ultimate terror, divinely invincible. Then, when hope was so long lost that not even its memory remained, a terribly scarred, heart-broken half-Skaa rediscovered it in the depths of the Lord Ruler's most hellish prison. Kelsier \"snapped\" and found in himself the powers of a Mistborn. A brilliant thief and natural leader, he turned his talents to the ultimate caper, with the Lord Ruler himself as the mark.\n\nKelsier recruited the underworld's elite, the smartest and most trustworthy allomancers, each of whom shares one of his many powers, and all of whom relish a high-stakes challenge. Then Kelsier reveals his ultimate dream, not just the greatest heist in history, but the downfall of the divine despot.\n\nBut even with the best criminal crew ever assembled, Kel's plan looks more like the ultimate long shot, until luck brings a ragged girl named Vin into his life. Like him, she's a half-Skaa orphan, but she's lived a much harsher life. Vin has learned to expect betrayal from everyone she meets. She will have to learn trust if Kel is to help her master powers of which she never dreamed.\n\nBrandon Sanderson, fantasy's newest master tale-spinner and author of the acclaimed debut Elantris, dares to turn a genre on its head by asking a simple question: What if the prophesied hero failed to defeat the Dark Lord? The answer will be found in the Mistborn Trilogy, a saga of surprises that begins with the book in your hands. Fantasy will never be the same again.\n\n(From Goodreads.com)",
    "Digital", "Yes", "3/5", "2023-01-01");

let shelf = new Bookshelf(newBook);

const mainDiv = document.querySelector(".main");

function initBookshelf(_bookshelf) {
    _bookshelf.forEach(_e => {
        _e.setShelf(_bookshelf);
        _e.buildHTML();
        _e.appendHTML(bookList);
    });
}




newBookButton.addEventListener("click", _event => {
    window.scrollTo(0, 0);
    shelf.addBook(new Book());
    shelf.reinitHTML();
    let bookDisplay = document.querySelector(`.id-${Book.prototype.lastId}.book-display`);
    let bookEdit = document.querySelector(`.id-${Book.prototype.lastId}.edit`);
    bookDisplay.dispatchEvent(new Event("click"));
    bookEdit.dispatchEvent(new Event("click"));
});

authorAscButton.addEventListener("click", _event => {
    shelf.sort("title", 1);
    shelf.sort("author-1", 1);
});

authorDescButton.addEventListener("click", _event => {
    shelf.sort("title", 1);
    shelf.sort("author-1", -1);
});

titleAscButton.addEventListener("click", _event => {
    shelf.sort("author-1", 1);
    shelf.sort("title", 1);
});

titleDescButton.addEventListener("click", _event => {
    shelf.sort("author-1", 1);
    shelf.sort("title", -1);
});

ratingAscButton.addEventListener("click", _event => {
    shelf.sort("title", 1);
    shelf.sort("author-1", 1);
    shelf.sort("rating", 1);
});

ratingDescButton.addEventListener("click", _event => {
    shelf.sort("title", 1);
    shelf.sort("author-1", 1);
    shelf.sort("rating", -1);
});

expandButton.addEventListener("click", shelf.expandAll.bind(shelf));

collapseButton.addEventListener("click", shelf.collapseAll.bind(shelf));

function insertLineBreaks(_elem, _text) {
    _elem.textContent = "";
    let textNode = document.createTextNode("");
    
    for (let i = 0; i < _text.length; i++) {
        if (_text.charCodeAt(i) == 10) {
            _elem.appendChild(textNode);
            textNode = document.createTextNode("");
            _elem.appendChild(document.createElement("br"));
        } else {
            textNode.nodeValue += _text[i];
        }
    }

    _elem.appendChild(textNode);
    return _elem;
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
        if (snakeClassName === "description") {
            newElem.classList.add(`id-${_e.id}`, 
                "book-field-content", 
                snakeClassName);
            newElem = insertLineBreaks(newElem, _fieldContent);
        } else {
            newElem = formatElem(newElem, _fieldContent, [
                `id-${_e.id}`, 
                "book-field-content", 
                snakeClassName]);
        }
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

function removeLeadingArticle(_str) {
    const lower = _str.toLocaleLowerCase();

    if (lower.startsWith("the ")) {
        _str = _str.slice(4, _str.length);
    } else if (lower.startsWith("a ")) {
        _str = _str.slice(2, _str.length);
    }
    return _str;
}
String.prototype.removeLeadingArticle = function() {
    let str = this.toString();
    const lower = str.toLocaleLowerCase();

    if (lower.startsWith("the ")) {
        str = str.slice(4, this.length);
    } else if (lower.startsWith("a ")) {
        str = str.slice(2, this.length);
    }
    return str;
}

class BookButton {
    button;
    svgPath;
    svgTitle;
    textDiv;
    book;
    static rightArrowSvg = "M2,12A10,10 0 0,1 12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12M10,17L15,12L10,7V17Z";
    static downArrowSvg = "M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M7,10L12,15L17,10H7Z";

    constructor(_book) {
        const buttonTemplate = document.querySelector("#book-button-template");
        const clone = buttonTemplate.content.cloneNode(true);
        this.button = clone.querySelector("button");
        this.button.classList.add(`id-${_book.id}`);
        this.button.addEventListener("click", e => {this.click(e)});
        this.svgPath = this.button.querySelector(`svg > path`);
        this.svgTitle = this.button.querySelector(`svg > title`);
        this.textDiv = this.button.querySelector(".book-button-text");
        this.book = _book;

        this.setRightArrow();
    }

    setRightArrow() {
        this.svgPath.setAttribute("d", BookButton.rightArrowSvg);
    }

    setDownArrow() {
        this.svgPath.setAttribute("d", BookButton.downArrowSvg);
    }

    click(_e) {
        this.button.classList.toggle("active");
        let content = this.button.nextElementSibling;
    
        this.book.autoSubmit();
    
        if (content.style.display === "grid") {
            content.style.display = "none";
            this.book.expand = false;
            this.setRightArrow();
        } else {
            content.style.display = "grid";
            this.book.expand = true;
            this.setDownArrow();
        }
    }
    
    updateText() {
        const combinedAuthor = this.book.getCombinedAuthor(-1);
        const buttonText = this.book.title + 
            `${combinedAuthor.length ? ` (${combinedAuthor})` : ""}`
        this.textDiv.textContent = buttonText;
        this.button.setAttribute("title", buttonText)
        this.svgTitle.textContent = buttonText;
    }
}

class Book {
    title;
    ["author-0"];
    ["author-1"];
    ["page-count"];
    description;
    format;
    read;
    rating;
    ["date-read"];
    id;
    expand;

    static lastId = -1;
    static editSvg = "M12,2C6.47,2 2,6.47 2,12C2,17.53 6.47,22 12,22C17.53,22 22,17.53 22,12C22,6.47 17.53,2 12,2M15.1,7.07C15.24,7.07 15.38,7.12 15.5,7.23L16.77,8.5C17,8.72 17,9.07 16.77,9.28L15.77,10.28L13.72,8.23L14.72,7.23C14.82,7.12 14.96,7.07 15.1,7.07M13.13,8.81L15.19,10.87L9.13,16.93H7.07V14.87L13.13,8.81Z";
    static submitSvg = "M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z";
    static deleteSvg = "M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M17,7H14.5L13.5,6H10.5L9.5,7H7V9H17V7M9,18H15A1,1 0 0,0 16,17V10H8V17A1,1 0 0,0 9,18Z";

    constructor(_title, _authorFirst, _authorLast, _pageCount, _desc, _format, 
            _read, _rating, _dateRead) {
        this.title = _title || "[untitled]";
        this["author-0"] = _authorFirst || "";
        this["author-1"] = _authorLast || "";
        this["page-count"] = _pageCount || "";
        this.description = _desc || "";
        this.format = _format || "N/A";
        this.read = _read || "N/A";
        this.rating = _rating || "N/A";
        this["date-read"] = _dateRead || "";
        this.id = ++Book.lastId;
        this.expand = false;
    }

    setShelf(_shelf) {
        this.shelf = _shelf;
    }

    removeHTML() {
        this.form.remove();
        this.bookButton.button.remove();
    }

    appendHTML(_parent) {
        _parent.appendChild(this.bookButton.button);
        _parent.appendChild(this.form);
    }

    buildForm() {
        const formTemplate = document.querySelector("#form-template");
        const clone = formTemplate.content.cloneNode(true);
        this.form = clone.querySelector("form");
        this.titleInput = this.form.querySelector(".book-field-input.title");

        let allElems = this.form.querySelectorAll("*");
        let allRating = this.form.querySelectorAll(".rating");
        let allRatingLabel = this.form.querySelectorAll(".rating-input-label");

        for (let e of allElems) {
            e.classList.add(`id-${this.id}`)
        }
        for (let e of allRating) {
            let id = e.getAttribute("id");
            id += `-id-${this.id}`;
            e.setAttribute("id", id);
        }
        for (let e of allRatingLabel) {
            let forTag = e.getAttribute("for");
            forTag += `-id-${this.id}`;
            e.setAttribute("for", forTag);
        }
    }

    buildHTML() {
        this.bookButton = new BookButton(this);
        this.buildForm();

        // Field content is only visible when not editing book data.
        this.fieldContent = this.form.getElementsByClassName(`id-${this.id} book-field-content`);
        // Field input is only visible when editing book data.
        this.fieldInput = this.form.getElementsByClassName(`id-${this.id} book-field-input`);

        this.editButton = this.form.querySelector(".svg-button.edit");
        this.editButtonSvgPath = this.editButton.querySelector(`svg > path`);
        this.svgEditTitle = this.editButton.querySelector(`svg > title`);
        this.editButton.addEventListener("click", this.clickEdit.bind(this));

        this.deleteButton = this.form.querySelector(".svg-button.delete");
        this.deleteButton.addEventListener("click", this.clickDelete.bind(this));

        this.prefillForm();
        this.hideInput();
    }

    showInput() {
        for (let item of this.fieldContent) {
            item.parentElement.classList.remove("invalid");
            item.classList.add("hidden");
        }
        for (let item of this.fieldInput) {
            item.classList.remove("hidden");
        }

        this.prefillForm();
        this.editButton.classList.add("is-editing");
        this.svgEditTitle.textContent = "Confirm";
        this.editButtonSvgPath.setAttribute("d", Book.submitSvg);
    }

    hideInput() {
        let form = new FormData(this.form);
        this.applyInput(form, "title");
        this.applyInput(form, "author");
        this.applyInput(form, "description");
        this.applyInput(form, "page-count");
        this.applyInput(form, "format");
        this.applyInput(form, "read");
        this.applyInput(form, "date-read");
        this.applyInput(form, "rating");

        // If no title/author fields are filled, force title to be "[untitled]".
        if (this.title === "" && this["author-0"] === "" && this["author-1"] === "") {
            this.title = "[untitled]";
            this.prefillForm();
            form = new FormData(this.form);
            this.applyInput(form, "title");
        }

        for (let item of this.fieldContent) {
            item.classList.remove("hidden");
        }
        for (let item of this.fieldInput) {
            item.classList.add("hidden");
        }

        this.bookButton.updateText(this.title, this["author-0"], this["author-1"]);
        this.editButton.classList.remove("is-editing");
        this.svgEditTitle.textContent = "Edit book";
        this.editButtonSvgPath.setAttribute("d", Book.editSvg);
    }

    clickEdit(_e) {
        if (_e) {
            _e.preventDefault();
        }

        if (!this.fieldContent[0].classList.contains("hidden")) {
            this.showInput();
            this.titleInput.focus();
            this.titleInput.setSelectionRange(this.title.length, this.title.length);
        } else {
            this.hideInput();
        }
    }

    clickDelete(_e) {
        _e.preventDefault();
        this.removeHTML();

        if (this.shelf) {
            this.shelf.removeBook(this.id);
            this.shelf = null;
        }
    }

    prefillForm() {
        const tags = ["title", "author-0", "author-1", "page-count", "format", 
            "read", "date-read"]
        
        tags.forEach(_tag => {
            let elem = this.form.querySelector(`.book-field-input.${_tag}`);
            elem.setAttribute("value", this[_tag]);
        });

        let descElem = this.form.querySelector(`.book-field-input.description`);
        descElem.textContent = this.description;

        let formatOption = this.form.querySelectorAll(`.format > option`);
        for (let opt of formatOption) {
            if (opt.textContent == this.format) {
                opt.setAttribute("selected", "selected");
                break;
            }
        }

        let readOption = this.form.querySelectorAll(`.read > option`);
        for (let opt of readOption) {
            if (opt.textContent == this.read) {
                opt.setAttribute("selected", "selected");
                break;
            }
        }

        let ratingLabel = this.form.getElementsByClassName(`rating-input-label`);
        for (let rating of ratingLabel) {
            if (rating.textContent[0] == this["rating"][0]) {
                const radioId = rating.getAttribute("for");
                // radioId[13] gives us the index of the label (from 0 to 5)
                let ratingInput = this.form.querySelector(`.rating.idx-${radioId[13]}`);
                ratingInput.setAttribute("checked", "checked");
                break;
            }
        }

        this.form.reset();
    }

    applyInput(_formDat, _snakeClassName) {
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

        let text = "";

        if (_snakeClassName == "author") {
            const first = _formDat.get(`${_snakeClassName}-0-input`) || "";
            const last = _formDat.get(`${_snakeClassName}-1-input`) || "";
            
            let firstContent = this.form.querySelector(`.id-${this.id}.book-field-content.${_snakeClassName}-0`);
            firstContent.textContent = first;
            let lastContent = this.form.querySelector(`.id-${this.id}.book-field-content.${_snakeClassName}-1`);
            lastContent.textContent = last;

            if (first == "" && last == "") {
                let rowToHide = this.form.querySelector(`.id-${this.id}.book-field-row.${_snakeClassName}`);
                rowToHide.classList.add("invalid");
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
            
            const row = this.form.querySelector(`.id-${this.id}.book-field-row.${_snakeClassName}`);
            if (((_snakeClassName == "format" || _snakeClassName == "read" 
                    || _snakeClassName == "rating") && text === "N/A") 
                    || text == "") {
                row.classList.add("invalid");
            } else {
                row.classList.remove("invalid");
            };
            
            let elem = this.form.querySelector(`.id-${this.id}.book-field-content.${_snakeClassName}`);

            if (_snakeClassName == "description") {
                elem = insertLineBreaks(elem, text);
            } else {
                elem.textContent = text;
            }
            
            this[_snakeClassName] = text;;
        }
    }

    selectTitleInput() {
        this.titleInput.focus();
        this.titleInput.select();
    }

    autoSubmit() {
        if (this.editButton && this.editButton.classList.contains("is-editing")) {
            this.clickEdit(null);
        }
    }

    getCombinedAuthor(_order) {
        _order = _order > 0 ? 1 : -1;
        const first = this["author-0"];
        const last = this["author-1"];
        let combinedAuthor = "";

        if (first && last) {
            if (_order > 0) {
                combinedAuthor = `${first} ${last}`;
            } else {
                combinedAuthor = `${last}, ${first}`;
            }
        } else if (last) {
            combinedAuthor = `${last}`;
        } else if (first) {
            combinedAuthor = `${first}`;
        }

        return combinedAuthor;
    }
}

class Bookshelf {
    bookListDiv;
    bookList;

    constructor(_books) {
        const timer = new Date().getTime();
        this.bookListDiv = document.querySelector(".book-list");
        this.bookList = [];
    
        _books.forEach(_e => {
            this.addBook(_e, this.bookListDiv);
        });
    }

    addBook(_book, _parent) {
        this.bookList.splice(0, 0, _book);
        _book.setShelf(this);
        _book.buildHTML();
        _parent.insertAdjacentElement("afterbegin", _book.form);
        _parent.insertAdjacentElement("afterbegin", _book.bookButton.button);
    }
    
    removeBook(_id) {
        const idx = this.getBookIdxById(_id);
        this.bookList.splice(idx, 1);
    }
    
    getBookIdxById(_id) {
        for (let i = 0; i < this.bookList.length; i++) {
            if (this.bookList[i].id == _id) return i;
        }
    
        return -1;
    }
    
    sort(_field, _dir) {
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
                    val1 = val1.removeLeadingArticle();
                    val2 = val2.removeLeadingArticle();
                }
            }
            return val1 > val2 ? _dir : _dir * -1;
        });
    }
    
    reinitHTML() {
        this.bookListDiv.innerHTML = null;
    
        this.bookList.forEach(_e =>  {
            _e.autoSubmit();
            _e.appendHTML(this.bookListDiv);
        });
    }
    
    expandAll(_e) {
        this.bookList.forEach(_book => {
            if (!_book.expand) {
                _book.bookButton.click(null);
            }
        });
    }
    
    collapseAll(_e) {
        this.bookList.forEach(_book =>  {
            if (_book.expand) {
                _book.bookButton.click(null);
            }
        });
    }
}

function initButtonListeners(_shelf) {
    newBookButton.addEventListener("click", _event => {
        window.scrollTo(0, 0);
        const newBook = new Book();
        _shelf.addBook(newBook, _shelf.bookListDiv);
        newBook.bookButton.click(null);
        newBook.clickEdit(null);
        newBook.selectTitleInput();
    });
    
    authorAscButton.addEventListener("click", _event => {
        _shelf.sort("title", 1);
        _shelf.sort("author-1", 1);
        _shelf.reinitHTML();
    });
    
    authorDescButton.addEventListener("click", _event => {
        _shelf.sort("title", 1);
        _shelf.sort("author-1", -1);
        _shelf.reinitHTML();
    });
    
    titleAscButton.addEventListener("click", _event => {
        _shelf.sort("author-1", 1);
        _shelf.sort("title", 1);
        _shelf.reinitHTML();
    });
    
    titleDescButton.addEventListener("click", _event => {
        _shelf.sort("author-1", 1);
        _shelf.sort("title", -1);
        _shelf.reinitHTML();
    });
    
    ratingAscButton.addEventListener("click", _event => {
        _shelf.sort("title", 1);
        _shelf.sort("author-1", 1);
        _shelf.sort("rating", 1);
        _shelf.reinitHTML();
    });
    
    ratingDescButton.addEventListener("click", _event => {
        _shelf.sort("title", 1);
        _shelf.sort("author-1", 1);
        _shelf.sort("rating", -1);
        _shelf.reinitHTML();
    });
    
    expandButton.addEventListener("click", _shelf.expandAll.bind(_shelf));
    collapseButton.addEventListener("click", _shelf.collapseAll.bind(_shelf));
}

function getDefaultBooks() {
    const newBook = [];
    newBook[0] = new Book("Nona the Ninth", "Tamsyn", "Muir", "467", 
        `Her city is under siege. The zombies are coming back. And all Nona wants is a birthday party.\n\n(From Goodreads.com)`, 
        "Digital", "Yes", "5/5", "2023-12-10");
    newBook[1] = new Book("The Long Way to a Small, Angry Planet", "Becky", 
        "Chambers", "518", 
        `Follow a motley crew on an exciting journey through space-and one adventurous young explorer who discovers the meaning of family in the far reaches of the universe-in this light-hearted debut space opera from a rising sci-fi star.\n\n(From Goodreads.com)`, 
        "Digital", "Yes", "4/5");
    newBook[2] = new Book("Our Wives Under the Sea", "Julia", "Armfield", "223",
        `Leah is changed. Months earlier, she left for a routine expedition, only this time her submarine sank to the sea floor. When she finally surfaces and returns home, her wife Miri knows that something is wrong. Barely eating and lost in her thoughts, Leah rotates between rooms in their apartment, running the taps morning and night.\n\nAs Miri searches for answers, desperate to understand what happened below the water, she must face the possibility that the woman she loves is slipping from her grasp.\n\n(From Goodreads.com)`,
        "Digital", "Yes", "5/5");
    newBook[3] = new Book("The Mountain in the Sea", "Ray", "Nayler", "464",
        `Rumors begin to spread of a species of hyperintelligent, dangerous octopus that may have developed its own language and culture. Marine biologist Dr. Ha Nguyen, who has spent her life researching cephalopod intelligence, will do anything for the chance to study them.\n\nThe transnational tech corporation DIANIMA has sealed the remote Con Dao Archipelago, where the octopuses were discovered, off from the world. Dr. Nguyen joins DIANIMA's team on the islands: a battle-scarred security agent and the world's first android.\n\nThe octopuses hold the key to unprecedented breakthroughs in extrahuman intelligence. The stakes are high: there are vast fortunes to be made by whoever can take advantage of the octopuses' advancements, and as Dr. Nguyen struggles to communicate with the newly discovered species, forces larger than DIANIMA close in to seize the octopuses for themselves.\n\nBut no one has yet asked the octopuses what they think. And what they might do about it.\n\nA near-future thriller about the nature of consciousness, Ray Nayler's The Mountain in the Sea is a dazzling literary debut and a mind-blowing dive into the treasure and wreckage of humankind's legacy.\n\n(From Goodreads.com)`,
        "Digital", "Yes", "4/5");
    newBook[4] = new Book("Momenticon", "Andrew", "Caldecott", "362",
        `A hugely compelling, dark, offbeat adventure from the bestselling author of ROTHERWEIRD, a master storyteller at the height of his powers.\n\nThe world has become a dangerous place. Despite the environmentalists' best efforts, the atmosphere has turned toxic, destroying almost all life - plants, animals, and most of humanity too.\n\nSurvivors live in domes protected by chitin shields, serving one or other of the two great companies, Lord Vane's Tempestas or Lord Sine's Genrich, with their very different visions for mankind's future.\n\nFogg has been the curator of the isolated Museum Dome for three years. It contains Man's finest artefacts, but Fogg hasn't had a single visitor. He immerses himself in the exhibits with only AI PT, his automated physical trainer, for company.\n\nThen a single mysterious pill appears in the Museum as if from nowhere: a momenticon. It signals the end of his hermit's life and an impending struggle with the dark forces which threaten everything that remains: a struggle which will take him and his new companions to the ends of the earth.\n\nThis is a post-apocalyptic world unlike any other.\n\n(From Goodreads.com)`,
        "Digital", "Yes", "4/5", "2023-05-02");
    newBook[5] = new Book("The Luminous Dead", "Caitlin", "Starling", "432",
        `A thrilling, atmospheric debut with the intensive drive of The Martian and Gravity and the creeping dread of Annihilation, in which a caver on a foreign planet finds herself on a terrifying psychological and emotional journey for survival.\n\nWhen Gyre Price lied her way into this expedition, she thought she'd be mapping mineral deposits, and that her biggest problems would be cave collapses and gear malfunctions. She also thought that the fat paycheck -- enough to get her off-planet and on the trail of her mother—meant she'd get a skilled surface team, monitoring her suit and environment, keeping her safe. Keeping her sane.\n\nInstead, she got Em.\n\nEm sees nothing wrong with controlling Gyre's body with drugs or withholding critical information to "ensure the smooth operation" of her expedition. Em knows all about Gyre's falsified credentials, and has no qualms using them as a leash -- and a lash. And Em has secrets, too . . .\n\nAs Gyre descends, little inconsistencies -- missing supplies, unexpected changes in the route, and, worst of all, shifts in Em's motivations -- drive her out of her depths. Lost and disoriented, Gyre finds her sense of control giving way to paranoia and anger. On her own in this mysterious, deadly place, surrounded by darkness and the unknown, Gyre must overcome more than just the dangerous terrain and the Tunneler which calls underground its home if she wants to make it out alive—she must confront the ghosts in her own head.\n\nBut how come she can't shake the feeling she's being followed?\n\n(From Goodreads.com)`,
        "Digital", "Yes", "5/5", "2023-04-25");
    newBook[6] = new Book("Circe", "Madeline", "Miller", "433",
        `In the house of Helios, god of the sun and mightiest of the Titans, a daughter is born. But Circe has neither the look nor the voice of divinity, and is scorned and rejected by her kin. Increasingly isolated, she turns to mortals for companionship, leading her to discover a power forbidden to the gods: witchcraft.\n\nWhen love drives Circe to cast a dark spell, wrathful Zeus banishes her to the remote island of Aiaia. There she learns to harness her occult craft, drawing strength from nature. But she will not always be alone; many are destined to pass through Circe's place of exile, entwining their fates with hers. The messenger god, Hermes. The craftsman, Daedalus. A ship bearing a golden fleece. And wily Odysseus, on his epic voyage home.\n\nThere is danger for a solitary woman in this world, and Circe's independence draws the wrath of men and gods alike. To protect what she holds dear, Circe must decide whether she belongs with the deities she is born from, or the mortals she has come to love.\n\n(From Goodreads.com)`,
        "Digital", "Yes", "4/5");
    newBook[7] = new Book("The Final Empire", "Brandon", "Sanderson", "537",
        `For a thousand years the ash fell and no flowers bloomed. For a thousand years the Skaa slaved in misery and lived in fear. For a thousand years the Lord Ruler, the "Sliver of Infinity," reigned with absolute power and ultimate terror, divinely invincible. Then, when hope was so long lost that not even its memory remained, a terribly scarred, heart-broken half-Skaa rediscovered it in the depths of the Lord Ruler's most hellish prison. Kelsier "snapped" and found in himself the powers of a Mistborn. A brilliant thief and natural leader, he turned his talents to the ultimate caper, with the Lord Ruler himself as the mark.\n\nKelsier recruited the underworld's elite, the smartest and most trustworthy allomancers, each of whom shares one of his many powers, and all of whom relish a high-stakes challenge. Then Kelsier reveals his ultimate dream, not just the greatest heist in history, but the downfall of the divine despot.\n\nBut even with the best criminal crew ever assembled, Kel's plan looks more like the ultimate long shot, until luck brings a ragged girl named Vin into his life. Like him, she's a half-Skaa orphan, but she's lived a much harsher life. Vin has learned to expect betrayal from everyone she meets. She will have to learn trust if Kel is to help her master powers of which she never dreamed.\n\nBrandon Sanderson, fantasy's newest master tale-spinner and author of the acclaimed debut Elantris, dares to turn a genre on its head by asking a simple question: What if the prophesied hero failed to defeat the Dark Lord? The answer will be found in the Mistborn Trilogy, a saga of surprises that begins with the book in your hands. Fantasy will never be the same again.\n\n(From Goodreads.com)`,
        "Digital", "Yes", "3/5", "2023-01-01");
    
    // Stress test
    // for (let i = 0; i < 1992; i++) {
    //     newBook.push(new Book("Test Book", "Jane", "Doe"));
    // }
    
    return newBook;
}

const newBookButton = document.querySelector(".new-book");
const authorAscButton = document.querySelector(".author-asc");
const authorDescButton = document.querySelector(".author-desc");
const titleAscButton = document.querySelector(".title-asc");
const titleDescButton = document.querySelector(".title-desc");
const ratingAscButton = document.querySelector(".rating-asc");
const ratingDescButton = document.querySelector(".rating-desc");
const expandButton = document.querySelector(".expand");
const collapseButton = document.querySelector(".collapse");

let shelf = new Bookshelf(getDefaultBooks());
initButtonListeners(shelf);
// Define Book class
class Book {
    constructor(title, author, isbn, genre, availability, checkedOutDate) {
        this._title = title;
        this._author = author;
        this._isbn = isbn;
        this._genre = genre;
        this._availability = availability;
        this._checkedOutDate = checkedOutDate || null;
    }

    // Getter and setter methods for Book properties
    get title() {
        return this._title;
    }

    set title(newTitle) {
        this._title = newTitle;
    }

    get author() {
        return this._author;
    }

    set author(newAuthor) {
        this._author = newAuthor;
    }

    get isbn() {
        return this._isbn;
    }

    set isbn(newIsbn) {
        this._isbn = newIsbn;
    }

    get genre() {
        return this._genre;
    }

    set genre(newGenre) {
        this._genre = newGenre;
    }

    get availability() {
        return this._availability;
    }

    set availability(newAvailability) {
        this._availability = newAvailability;
    }

    get checkedOutDate() {
        return this._checkedOutDate;
    }

    set checkedOutDate(date) {
        this._checkedOutDate = date;
    }

    // Method to display book details
    displayDetails() {
        let details = `Title:${this.title}\nAuthor: ${this.author}\nISBN: ${this.isbn}\nGenre: ${this.genre}\nAvailability: ${this.availability}`;
        if (this.availability === 'checkedout' && this.checkedOutDate) {
            details += `\nChecked out date: ${this.checkedOutDate}`;
        }
        return details;
    }
}
class ReferenceBook extends Book {
    constructor(title, author, isbn, genre, availability, edition, publishedDate) {
        super(title, author, isbn, genre, availability);
        this._edition = edition;
        this._publishedDate = publishedDate;
    }

    // Getter and setter methods for ReferenceBook properties
    get edition() {
        return this._edition;
    }

    set edition(newEdition) {
        this._edition = newEdition;
    }

    get publishedDate() {
        return this._publishedDate;
    }

    set publishedDate(newPublishedDate) {
        this._publishedDate = newPublishedDate;
    }

    // Method to display reference book details
    displayDetails() {
        let details = super.displayDetails();
        details += `\nEdition: ${this.edition}\nPublished Date: ${this.publishedDate}`;
        return details;
    }
}
// Define LibraryCatalog class (only once)
class LibraryCatalog {
    constructor() {
        this._books = [];
        this.loadLibraryFromLocalStorage();
    }

    // Getter for books array
    get books() {
        return this._books;
    }

    // Method to add a book to the catalog
    addBook(book) {
        this._books.push(book);
        this.saveLibraryToLocalStorage();
    }
    
    // Method to remove a book from the catalog
    removeBook(isbn) {
        const index = this._books.findIndex(book => book.isbn === isbn);
        if (index !== -1) {
            this._books.splice(index, 1);
            this.saveLibraryToLocalStorage();
            return true;
        }
        return false;
    }

    // Method to search for books by title, author, or ISBN
    searchBook(query) {
        query = query.toLowerCase();
        return this._books.filter(book => {
            if (!book) return false; // Skip if book is undefined
            return (book.title && book.title.toLowerCase().includes(query)) ||
                (book.author && book.author.toLowerCase().includes(query)) ||
                (book.isbn && book.isbn.toLowerCase().includes(query));
        });
    }

    // Method to display all books
    displayBooks() {
        this.clearBookDisplay();
        const bookDisplay = document.getElementById("bookDisplay");
        this._books.forEach(book => {
            const bookCard = document.createElement("div");
            bookCard.classList.add("book-card");

            // Display book title in bold font
            const title = document.createElement("h3");
            title.innerText = book.title;
            title.style.fontWeight = "bold";
            bookCard.appendChild(title);

            // Display book details
            const details = document.createElement("p");
            details.innerText = book.displayDetails();
            bookCard.appendChild(details);

            // Create and append remove button
            const removeBtn = document.createElement("button");
            removeBtn.innerText = "Remove";
            removeBtn.classList.add("remove-btn");
            removeBtn.addEventListener("click", () => {
                const returnOption = bookCard.querySelector(".return-option");
                if (returnOption && returnOption.style.display !== 'none') {
                    alert("You can only remove the book after it has been returned.");
                } else {
                    this.removeBook(book.isbn);
                    this.displayBooks(); // Refresh display after removing book
                }
            });
            bookCard.appendChild(removeBtn);

            // Create and append checkout button if available
            if (book.availability === 'available') {
                const checkoutBtn = document.createElement("button");
                checkoutBtn.innerText = "Checkout";
                checkoutBtn.classList.add("checkout-btn");
                checkoutBtn.addEventListener("click", () => {
                    this.checkoutBook(book);
                    this.displayBooks(); // Refresh display after checkout
                });
                bookCard.appendChild(checkoutBtn);
            }

            // Create and append return option if checked out
            if (book.availability === 'checkedout') {
                const returnOption = document.createElement("p");
                returnOption.classList.add("return-option");
                returnOption.innerHTML = `<button class="return-btn">Return</button>`;
                bookCard.appendChild(returnOption);
                const returnBtn = returnOption.querySelector(".return-btn");
                returnBtn.addEventListener("click", () => {
                    this.returnBook(book);
                    this.displayBooks(); // Refresh display after returning
                });
            }

            bookDisplay.appendChild(bookCard);
        });
    }

    // Method to clear book display area
    clearBookDisplay() {
        const bookDisplay = document.getElementById("bookDisplay");
        bookDisplay.innerHTML = "";
    }

    // Method to load library data from localStorage
    loadLibraryFromLocalStorage() {
        const libraryData = localStorage.getItem('library');
        if (libraryData) {
            const parsedData = JSON.parse(libraryData);
            if (Array.isArray(parsedData)) {
                this._books = parsedData.map(bookData => {
                    // Check if it's a ReferenceBook
                    if (bookData.edition && bookData.publishedDate) {
                        return new ReferenceBook(
                            bookData.title,
                            bookData.author,
                            bookData.isbn,
                            bookData.genre,
                            bookData.availability,
                            bookData.edition,
                            bookData.publishedDate
                        );
                    } else {
                        // Otherwise, treat it as a regular Book
                        return new Book(
                            bookData.title,
                            bookData.author,
                            bookData.isbn,
                            bookData.genre,
                            bookData.availability,
                            bookData.checkedOutDate
                        );
                    }
                });
                this.displayBooks();
            } else {
                console.error('Library data in localStorage is not in the correct format.');
                 this.displayInitialLabels();
            }
        }
    }

    // Method to save library data to localStorage
    saveLibraryToLocalStorage() {
        localStorage.setItem('library', JSON.stringify(this._books.map(book => ({
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            genre: book.genre,
            availability: book.availability,
            checkedOutDate: book.checkedOutDate,
            edition: book.edition, // Include edition for ReferenceBooks
            publishedDate: book.publishedDate // Include publishedDate for ReferenceBooks
        }))));
    }

    // Method to checkout a book
    checkoutBook(book) {
        if (book.availability === 'available') {
            // Show a message indicating the book has been checked out
            alert(`You have successfully checked out the book titled "${book.title}"`);
            book.availability = 'checkedout';
            book.checkedOutDate = new Date().toISOString().split('T')[0]; // Store only the date
            this.saveLibraryToLocalStorage();
        }
    }

    // Method to return a book
    returnBook(book) {
        if (book.availability === 'checkedout') {
            alert(`You have successfully returned the book titled "${book.title}"`);
            book.availability = 'available';
            book.checkedOutDate = null; // Reset the checkedOutDate when returning
            this.saveLibraryToLocalStorage();
        }
    }
}

// Event listener for adding a book
document.getElementById("addBookForm").addEventListener("submit", function (event) {
    event.preventDefault();
    const title = document.getElementById("title").value;
    const author = document.getElementById("author").value;
    const isbn = document.getElementById("isbn").value;
    const genre = document.getElementById("genre").value;
    const availability = document.getElementById("availability").value;
    const edition = document.getElementById("edition").value;
    const publishedDate = document.getElementById("published_date").value;

    const newBook = new ReferenceBook(title, author, isbn, genre, availability, edition, publishedDate);
    libraryCatalog.addBook(newBook); 
    libraryCatalog.displayBooks();

    // Clear input fields
    document.getElementById("title").value = "";
    document.getElementById("author").value = "";
    document.getElementById("isbn").value = "";
    document.getElementById("genre").value = "";
    document.getElementById("availability").value = "";
    document.getElementById("edition").value = "";
    document.getElementById("published_date").value = "";

    // Hide add book section
    toggleAddBookSection();
});


// Function to toggle the visibility of the add book section
function toggleAddBookSection() {
    var addBookSection = document.getElementById("add-book-section");
    addBookSection.style.display = (addBookSection.style.display === "none") ? "block" : "none";
}

// Create an instance of LibraryCatalog
const libraryCatalog = new LibraryCatalog();

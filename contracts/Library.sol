// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Library {
    struct Book {
        uint id;
        string title;
        bool isBorrowed;
    }

    mapping(uint => Book) public books;
    uint public booksCount;

    event BookBorrowed(uint indexed id);
    event BookReturned(uint indexed id);

    constructor() {
        _addBook("Book 1");
        _addBook("Book 2");
        _addBook("Book 3");
    }

    function _addBook(string memory _title) private {
        booksCount++;
        books[booksCount] = Book(booksCount, _title, false);
    }

    function borrowBook(uint _id) public {
        require(_id > 0 && _id <= booksCount, "Invalid book ID");
        require(!books[_id].isBorrowed, "Book already borrowed");

        books[_id].isBorrowed = true;
        emit BookBorrowed(_id);
    }

    function returnBook(uint _id) public {
        require(_id > 0 && _id <= booksCount, "Invalid book ID");
        require(books[_id].isBorrowed, "Book not borrowed");

        books[_id].isBorrowed = false;
        emit BookReturned(_id);
    }
}

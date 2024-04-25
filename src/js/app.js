App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
      return await App.initWeb3();
  },

  initWeb3: async function() {
      if (window.ethereum) {
          App.web3Provider = window.ethereum;
          try {
              await window.ethereum.enable();
          } catch (error) {
              console.error("User denied account access")
          }
      } else if (window.web3) {
          App.web3Provider = window.web3.currentProvider;
          console.log("default connected");
      } else {
          App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
          console.log("ethereum connected");
      }
      web3 = new Web3(App.web3Provider);
      return App.initContract();
  },

  initContract: function() {
      $.getJSON('Library.json', function(data) {
          var LibraryArtifact = data;
          App.contracts.Library = TruffleContract(LibraryArtifact);
          App.contracts.Library.setProvider(App.web3Provider);
          return App.render();
      });
  },

  render: function() {
      var libraryInstance;

      App.contracts.Library.deployed().then(function(instance) {
          libraryInstance = instance;
          return libraryInstance.booksCount();
      }).then(function(booksCount) {
          var booksTableBody = $("#booksTableBody");
          booksTableBody.empty();

          for (var i = 1; i <= booksCount; i++) {
              (function(i) {
                  libraryInstance.books(i).then(function(book) {
                      var id = book.id;
                      var title = book.title;
                      var isBorrowed = book.isBorrowed;

                      var row = "<tr>";
                      row += "<td>" + id + "</td>";
                      row += "<td>" + title + "</td>";
                      row += "<td>" + (isBorrowed ? "No" : "Yes") + "</td>";
                      row += "</tr>";

                      booksTableBody.append(row);
                  });
              })(i);
          }
      }).catch(function(err) {
          console.log(err.message);
      });
  },

  handleBorrow: function(event) {
      event.preventDefault();

      var bookId = parseInt($('#bookId').val());
      App.contracts.Library.deployed().then(function(instance) {
          return instance.borrowBook(bookId, {from: web3.eth.accounts[0]});
      }).then(function(result) {
          console.log('Book borrowed');
          // Mise à jour de la liste des livres après l'emprunt
          App.render();
      }).catch(function(err) {
          console.error(err.message);
      });
  },

  handleReturn: function(event) {
      event.preventDefault();

      var bookId = parseInt($('#bookIdReturn').val());
      App.contracts.Library.deployed().then(function(instance) {
          return instance.returnBook(bookId, {from: web3.eth.accounts[0]});
      }).then(function(result) {
          console.log('Book returned');
          // Mise à jour de la liste des livres après le retour
          App.render();
      }).catch(function(err) {
          console.error(err.message);
      });
  }
};

$(function() {
  $(window).on('load', function() {
      App.init();
      $('#borrowForm').submit(App.handleBorrow);
      $('#returnForm').submit(App.handleReturn);
  });
});

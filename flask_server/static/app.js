App = {
    web3Provider: null,
    contracts: {},
  
    init: async function () {
      return await App.initWeb3();
    },
  
    initWeb3: async function () {
      // Modern dapp browsers...
      if (window.ethereum) {
        App.web3Provider = window.ethereum;
        try {
          // Request account access
          await window.ethereum.enable();
        } catch (error) {
          // User denied account access...
          console.error("User denied account access")
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        App.web3Provider = window.web3.currentProvider;
      }
      // If no injected web3 instance is detected, fall back to Ganache
      else {
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      }
      web3 = new Web3(App.web3Provider);

      return App.initContract();
    },
  
    initContract: function () {
      $.getJSON('../static/greeter.json', function (data) {
        // Get the necessary contract artifact file and instantiate it with truffle-contract
        var greeterArtifct = data;
        App.contracts.greeter = TruffleContract(greeterArtifct);
  
        // Set the provider for our contract
        App.contracts.greeter.setProvider(App.web3Provider);
  
        // Use our contract to retrieve and mark the adopted pets
        return App.displayMessage();
      });
  
      return App.bindEvents();
    },
  
    bindEvents: function () {
      $(document).on('click', '#sub', App.writeMessage);
    },
  
    displayMessage: function () {
      var greeterInstance;
  
      App.contracts.greeter.deployed().then(function (instance) {
        greeterInstance = instance;
  
        return greeterInstance.getGreeting.call();
      }).then(function (message) {
            $('#message').text(message);
      }).catch(function (err) {
        console.log(err.message);
      });
  
    },
  
    writeMessage: function (event) {
     
  
      var messageContent = $('#input').val();
  
      var greeterInstance;
  
      web3.eth.getAccounts(function (error, accounts) {
        if (error) {
          console.log(error);
        }
  
        var account = accounts[0];
  
        App.contracts.greeter.deployed().then(function (instance) {
          greeterInstance = instance;
  
          // Execute adopt as a transaction by sending account
          return greeterInstance.greet(messageContent, {
            from: account
          });
        }).then(function (result) {
          return App.displayMessage();
        }).catch(function (err) {
          console.log(err.message);
        });
      });
  
    }
  
  };
  
$(window).on('load', function () {
    App.init();
    });
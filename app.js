// Budget Controller
var budgetController = (function() {

  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  }

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  }

  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(current) {
      sum += current.value;
    });
    data.totals[type] = sum;
  }

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, des, val) {
      var newItem, ID;
      // [1, 2, 3, 4], next ID = 6
      // [1, 2, 4, 6, 8] next ID = 9
      // ID = last ID + 1

      //Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }


      // Create new item based on 'inc' and 'exp' type
      if (type == 'exp') {
        newItem = new Expense(ID, des, val)
      } else if (type === 'inc') {
        newItem = new Income(ID, des, val)
      }

      // Push to the data structure
      data.allItems[type].push(newItem);

      // Return the new element
      return newItem;
    },

    // Delete item from the UI and array
    deleteItem: function(type, id) {

      // id = 6
      // data.allItems[type][id]
      // [1, 2, 4, 6, 8]
      // index = 3

      var ids = data.allItems[type].map(function(current) {
        return current.id;
      });

      index = ids.indexOf(id)

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }

    },

    calculateBudget: function() {

      // calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');

      // Calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      // calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }

      // Expense = 100 and income 300, spent 33.333% = 100/300 = 0.3333 * 100
    },


    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },

    testing: function() {
      console.log(data);
    }
  };

})();

// UI budgetController
var UIController = (function() {
  var DOMStrings = {
    inputType: '.add__type',
    inputDesctiption: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expenseContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container'

  }
  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMStrings.inputType).value, // will be either inc or exp
        description: document.querySelector(DOMStrings.inputDesctiption).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
      }
    },

    addListItem: function(obj, type) {
      var html, newHTML, element;
      // 1. Create HTML string with placeholder text
      if (type === 'inc') {
        element = DOMStrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      } else {
        element = DOMStrings.expenseContainer;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      }
      // 2. Replace placeholder text with actual data
      newHTML = html.replace('%id%', obj.id);
      newHTML = newHTML.replace('%description%', obj.description);
      newHTML = newHTML.replace('%value%', obj.value);

      // 3. Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
    },

    deleteListItem: function(selectorid) {

      var el = document.getElementById(selectorid);
      el.parentNode.removeChild(el);

    },

    clearFields: function() {
      var fields, fieldsArr;
      fields = document.querySelectorAll(DOMStrings.inputDesctiption + ', ' + DOMStrings.inputValue);

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function(current, index, array) {
        current.value = "";
      });
      fieldsArr[0].focus();
    },

    dispayBudget: function(obj) {
      document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
      document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;
      document.querySelector(DOMStrings.expensesLabel).textContent = obj.totalExp;

      if (obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = '----';
      }


    },

    getDOMStrings: function() {
      return DOMStrings;
    }
  };

})();


// GLobal App Cotroller
var controller = (function(budgetCtrl, UICtrl) {

  var setupEventListener = function() {
    var DOM = UIController.getDOMStrings();

    // click button
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    //If enter is pressed then ctrlAddItem function is called
    document.addEventListener('keypress', function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
  };


  var updateBudget = function() {

    // 1. Calculate the budget
    budgetCtrl.calculateBudget();

    // 2. Return the budget
    var budget = budgetCtrl.getBudget();

    // 3. Display the budget on the UI
    UICtrl.dispayBudget(budget);
  };

  var ctrlAddItem = function() {
    var input, newItem;
    // TODO:

    // 1. Get the filed input data
    input = UIController.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

      // 2. Add the item to the budget Controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      // 3. Add item to the UI
      UICtrl.addListItem(newItem, input.type);

      // 4. Clear the fields
      UICtrl.clearFields();

      //5. Calculate and update the budget
      updateBudget();
    }
  };

  // event is add to know where the target element is
  var ctrlDeleteItem = function(event) {

    var itemID, splitID, type, ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {

      //inc-1
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. Delete ID from data structure
      budgetCtrl.deleteItem(type, ID);
      // 2. Delete the item from the UI
      UICtrl.deleteListItem(itemID)
      // 3. Update and show the new budget
      updateBudget();
    }
  };

  return {
    init: function() {
      console.log("Application has started");
      UICtrl.dispayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setupEventListener();
    }
  };

})(budgetController, UIController);

// Start of the app
controller.init();


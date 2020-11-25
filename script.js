/*****************************/
//BUDGET CONTROLLER
/****************************/
var budgetController = (function() {
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentages = -1;
    };

    Expense.prototype.percentageCalc = function(totalInc) {
        if (totalInc > 0) {
            this.percentages = Math.round((this.value / totalInc) * 100);
        } else {
            this.percentages = -1;
        }
    };

    Expense.prototype.percReturn = function() {
        return this.percentages;
    };

    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        total: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
    };

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(current){
            sum += current.value;
        })
        data.total[type] = sum;
    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            //Declaring the value of ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            //Making the new item
            if (type === 'inc') {
                newItem = new Income(ID, des, val);
            } else if(type === 'exp') {
                newItem = new Expense(ID, des, val);
            }

            //Pushing the new item into the data
            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;

            ids = data.allItems[type].map(function(current) {
                return current.id
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            };
        },

        calculateBudget: function(){
            //Calculate total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');

            //Calculate total budget
            data.budget = data.total.inc - data.total.exp;

            //Calculate percentage of income if income greater than 0
            if(data.total.inc > 0) {
                data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
            } else {
                data.percentage = -1;
            }
            
        },

        calculatePercentages: function() {
            //Calculate the percentages
            data.allItems.exp.forEach(function(cur) {
                cur.percentageCalc(data.total.inc);
            })

        },

        returnPercentages: function() {
            //Return percentages
            var allPercentages = data.allItems.exp.map(function(cur) {
                return cur.percReturn();
            })

            return allPercentages;

        },

        returnBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.total.inc,
                totalExp: data.total.exp,
                percentage: data.percentage
            }
        },

        reloadBudget: function() {

        data.allItems.inc = [];
        data.allItems.exp = [];
        data.total.inc = 0;
        data.total.exp = 0;
        data.budget = 0;
        data.percentage = -1;

        },
        
        test: function() {
            console.log(data);
        }
    }


})();

/*******************************/
//UI CONTROLLER
/*******************************/
var UIController = (function() {
    var DOMStrings = {
        UIType: '.UI__type',
        UIDescription: '.UI__description',
        UIValue: '.UI__value',
        UIIcon: '.UI__icon',
        incomeList: '.income__list',
        expenseList: '.expense__list',
        totalBudget: '.total__budget',
        totalIncome: '.budget__income--value',
        totalExpense: '.budget__expense--value',
        totalPercentage: '.budget__expense--percentage',
        listCont: '.lists__container',
        expensePerc: '.item__percentage',
        currentDate: '.budget__title--month-name',
        reloadIcon: '.reload__icon'
    };

    var formatNum = function(num, type) {
        var splitNum, int, dec, symbol;
        /*
        + 2403
        = 2403
        = 2403.00
        = 2,403
        = 2,403 + '.' + 00
        = + 2403.00
        */

        num = Math.abs(num);
        num = num.toFixed(2);

        splitNum = num.split('.');

        int = splitNum[0];
        if(int.length > 3) {
            int = int.substr(0, int.length-3) + ',' + int.substr(int.length-3, 3);
        };

        dec = splitNum[1];

        if(type === 'inc') {
            symbol = '+';
        } else if(type === 'exp') {
            symbol = '-';
        } else if(type === 'none') {
            symbol = '';
        };

        return symbol + ' ' + int + '.' + dec;
    };

    var nodeForEach = function(list, func) {
        for (var i = 0; i < list.length; i++) {
            func(list[i], i)
        };
    };

    return {
        getInputs: function(){

            return {
                type: document.querySelector(DOMStrings.UIType).value, //Value = Inc or Exp
                description: document.querySelector(DOMStrings.UIDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.UIValue).value)
            }
        },

        addListItem: function(obj, type) {
            var html, element, newHtml;

            //Creating the HTML
            if (type === 'inc') {
                element = DOMStrings.incomeList;

                html = '<div class="list__item" id="inc-%id%"><div class="item__description flex">%description%</div><div class="flex right blue"><div class="item__value">%value%</div><button class="del__icon--btn blue"><i class="material-icons">delete_forever</i></button></div></div>';
            } else if(type === 'exp') {
                element = DOMStrings.expenseList;

                html = '<div class="list__item" id="exp-%id%"><div class="item__description flex">%description%</div><div class="flex right red"><div class="item__value">%value%</div><div class="item__percentage">21%</div><button class="del__icon--btn red"><i class="material-icons">delete_forever</i></button></div></div>';
            };

            //Replacing
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNum(obj.value, type));

            //Inserting into the HTML
            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
        },

        deleteListItem: function(htmlId) {

            var id = document.getElementById(htmlId);
            id.parentNode.removeChild(id);
        },

        getDOMStrings: function(){
            return DOMStrings;
        },

        clearFields: function(){
            var fieldsList, fields;

            //Selecting the fields to be cleared and turning it into an array
            fieldsList = document.querySelectorAll(DOMStrings.UIDescription + ',' + DOMStrings.UIValue);

            fields = Array.prototype.slice.call(fieldsList);

            //CLearing the values
            fields.forEach(function(current, index, array){
                current.value = "";
            });

            //Seting the focus to the first field
            fields[0].focus();

        },

        showBudget: function(obj){
            var type;

            if(obj.budget === 0) {
                type = 'none';
            } else if(obj.budget > 0) {
                type = 'inc';
            } else if(obj.budget < 0) {
                type = 'exp';
            }

            document.querySelector(DOMStrings.totalBudget).textContent = formatNum(obj.budget, type);
            document.querySelector(DOMStrings.totalIncome).textContent = formatNum(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.totalExpense).textContent = formatNum(obj.totalExp, 'exp');
            
            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.totalPercentage).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.totalPercentage).textContent = '––';
            }
        },

        showPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMStrings.expensePerc);

            nodeForEach(fields, function(cur, index) {
                if(percentages[index] > 0) {
                    cur.textContent = percentages[index] + '%';
                } else {
                    cur.textContent = '–';
                }
            });
        },

        displayDate: function() {
            var now, months, month, year;

            now = new Date();

            months = ['January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'];

            month = now.getMonth();

            year = now.getFullYear();

            document.querySelector(DOMStrings.currentDate).textContent = months[month] + ',' + ' ' + year + ':';

        },

        changeType: function() {
            var fields = document.querySelectorAll(
                DOMStrings.UIType + ',' +
                DOMStrings.UIDescription + ',' + 
                DOMStrings.UIValue
            );

            nodeForEach(fields, function(cur) {
                cur.classList.toggle('red__focus');
                cur.classList.toggle('red__hover');
            });

            document.querySelector(DOMStrings.UIIcon).classList.toggle('red');

        },
        
        reloadPage: function() {
            var incomes, expenses;
            
            /*var removeAllChilds = function(parent) {
                if(parent.firstChild) {
                    parent.removeChild(parent.firstChild);
                };
            };
            removeAllChilds(incomes);
            removeAllChilds(expenses);*/

            incomes = document.querySelector(DOMStrings.incomeList);
            expenses = document.querySelector(DOMStrings.expenseList);

            incomes.innerHTML = '';
            expenses.innerHTML = '';



        },

        upArrowPress: function() {
            document.querySelector(DOMStrings.UIType).value = 'inc';

                var fields = document.querySelectorAll(
                    DOMStrings.UIType + ',' +
                    DOMStrings.UIDescription + ',' + 
                    DOMStrings.UIValue
                );
    
                nodeForEach(fields, function(cur) {
                    cur.classList.remove('red__focus');
                    cur.classList.remove('red__hover');
                });
    
                document.querySelector(DOMStrings.UIIcon).classList.remove('red');
        },

        downArrowPress: function() {
            document.querySelector(DOMStrings.UIType).value = 'exp';

                var fields = document.querySelectorAll(
                    DOMStrings.UIType + ',' +
                    DOMStrings.UIDescription + ',' + 
                    DOMStrings.UIValue
                );
    
                nodeForEach(fields, function(cur) {
                    cur.classList.add('red__focus');
                    cur.classList.add('red__hover');
                });
    
                document.querySelector(DOMStrings.UIIcon).classList.add('red');
        },

        valueFocus: function() {
            document.querySelector(DOMStrings.UIValue).focus();
        },

        descriptionFocus: function() {
            document.querySelector(DOMStrings.UIDescription).focus();
        }
        
        /*
        rightChangeFocus: function() {

            document.querySelector(DOMStrings.UIValue).focus();
            
        },

        leftChangeFocus: function() {

            document.querySelector(DOMStrings.UIDescription).focus();

        }*/

    }


})();

/*****************************/
//GlOBAL APP CONTROLLER
/*****************************/
var controller = (function(budgetCtrl, UICtrl) {
    var setupEventListeners, ctrlAddItem, ctrlDeleteItem, calcBudget;


    setupEventListeners = function() {
        var DOM = UICtrl.getDOMStrings();
        
        document.querySelector(DOM.UIIcon).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.listCont).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.UIType).addEventListener('change', UICtrl.changeType);

        document.querySelector(DOM.reloadIcon).addEventListener('click', function() {
            
            // 1. Change all the values in budgetCtrl to 0
            budgetCtrl.reloadBudget();

            // 2. Update the UI
            UICtrl.showBudget({
                budget:0,
                totalInc:0,
                totalExp:0,
                totalPercentage: -1
            });

            // 3. Clear all the income and expenses
            UICtrl.reloadPage();

        });

        window.addEventListener('keyup', function(event) {

            if(event.keyCode === 38 || event.which === 38) {
               UICtrl.upArrowPress();
            }

        });

        window.addEventListener('keyup', function(event) {

            if (event.keyCode === 40 || event.which === 40) {
                UICtrl.downArrowPress();
            }; 
        })

        /*document.addEventListener('keydown', function(event) {
            if(event.keyCode === 39 || event.which === 39) {
                UICtrl.rightChangeFocus();
            };
        });

        document.addEventListener('keydown', function(event) {
            if(event.keyCode === 37 || event.which === 37) {
                UICtrl.leftChangeFocus();
            }
        })*/
    };

    calcBudget = function(){
        //1. Calculate the budget
        budgetCtrl.calculateBudget();

        //2. Return the budget
        var budget = budgetCtrl.returnBudget();

        //3. Display the budget on the UI
        UICtrl.showBudget(budget);
        
    };

    calcPercentages = function() {
        // 1. Calculate the percentages
        budgetCtrl.calculatePercentages();

        // 2. Return the percentages
        var percentages = budgetCtrl.returnPercentages();

        // 3. Display the percentages on the UI
        UICtrl.showPercentages(percentages);
    }

    ctrlAddItem = function(){
        var input, newItem;
        

        //1. Get field input data
        input = UICtrl.getInputs();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0 ){

        //2. Add the item to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);

        //3. Add the item to the UI
        UICtrl.addListItem(newItem, input.type);

        //4. Clear the fields
        UICtrl.clearFields();

        //5. Calculate the budget
        calcBudget();

        // 6. Calculate percentages
        calcPercentages();

        } else if(input.description !== "" && isNaN(input.value) || input.value <= 0) {
            UICtrl.valueFocus();
        } else if(input.description === "" && !isNaN(input.value) && input.value > 0) {
            UICtrl.descriptionFocus();
        }
    };

    ctrlDeleteItem = function(event) {
        var itemId, idCont, type, ID;
        itemId = event.target.parentNode.parentNode.parentNode.id;
        
        if(itemId) {
            idCont = itemId.split('-');
            type = idCont[0];
            ID = parseInt(idCont[1]);

            // 1.Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2.Delete the item from the UI
            UICtrl.deleteListItem(itemId);

            // 3.Update the budget
            calcBudget();

            // 4. Calculate percentages
            calcPercentages();
            
        }
    };

    return {

        init: function() {
            console.log('The app has started working successfully!');
            UICtrl.displayDate();
            UICtrl.showBudget({
                budget:0,
                totalInc:0,
                totalExp:0,
                totalPercentage: -1
            })
            setupEventListeners();
        }
    };
    
})(budgetController, UIController);
controller.init();



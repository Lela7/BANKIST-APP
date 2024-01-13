'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const displayMovements = function (movements, sort = false) {
  //to empty container and start adding only new elements:
  containerMovements.innerHTML = '';
  //.textContent=0; //similar things
  //to create a copy use slice() method
  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;
  //////////////////////////////////
  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const html = `
    <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
          
          <div class="movements__value">${mov}€</div>
    </div>`;
    //to insert this HTML, we use this method insertAdjacentHTML:
    containerMovements.insertAdjacentHTML('afterbegin', html);
    //we use 'beforeend' when we want inverted elements
  });
};

//Calculating balance:
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  //to print value on screen:
  labelBalance.textContent = `${acc.balance} €`;
};

//Calculating incomes and outcomes:
const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  //putting inside html element:
  labelSumIn.textContent = `${incomes} €`;

  const outcomes = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);

  labelSumOut.textContent = `${Math.abs(outcomes)}€`; //Math.abs() to remove sign(-)

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      //console.log(arr);
      return int >= 1; // we want anly interests that are >=1
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest}`;
};

//Making usernames:
const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

//Refactored function can be called anywhere from the code:
const updateUI = function (acc) {
  //Display movements
  displayMovements(acc.movements);
  //Dipslay balance
  calcDisplayBalance(acc);
  //Display summary
  calcDisplaySummary(acc);
};
//Event handler
let currentAccount;

btnLogin.addEventListener('click', function (e) {
  e.preventDefault(); //to prevent  form from submitting
  // console.log('LOGIN');
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  //console.log(currentAccount);
  //to check if the pin is correct
  //using optional chaining for checking if the currentAccount exists (?)
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    //console.log('LOGIN'); //just for checking
    //Dipslay UI and welcome message:
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    //to display UI we have to set opacity to 0 in our CSS file,then to change it here to 100;
    containerApp.style.opacity = 100;
    //Clear the input fields:
    inputLoginUsername.value = inputLoginPin.value = '';
    //to make the cursor invisible:
    inputLoginPin.blur();
    //Update UI:
    updateUI(currentAccount);
  }
});
//Transfering money to the other account:
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault(); //to prevent reloading the page
  const amount = Number(inputTransferAmount.value); //
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  ); //jd, js, ...
  //cleraing the input fields:
  inputTransferAmount.value = inputTransferTo.value = '';
  //to make the cursor invisible:
  inputTransferAmount.blur();
  //check the current user has enough money for transfering
  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    //Doing the transfer:
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //Update UI:
    updateUI(currentAccount);
  }
});

//Requesting loan:
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputLoanAmount.value);
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    //Add movement to current account:
    currentAccount.movements.push(amount);
    //Update UI:
    updateUI(currentAccount);
  }
  //clear input field:
  inputLoanAmount.value = '';
});
//Closing account:
btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    currentAccount.username === inputCloseUsername.value &&
    currentAccount.pin === Number(inputClosePin.value)
  ) {
    //console.log('Delete');
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    //console.log(index);
    //Deleting account:
    accounts.splice(index, 1);

    //Hide UI:
    containerApp.style.opacity = 0;
  }
  //To make the fields invisible:
  inputCloseUsername.value = inputClosePin.value = ' ';
});

btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, true);
});
/////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////

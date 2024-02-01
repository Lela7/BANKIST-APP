'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2024-01-20T14:43:26.374Z',
    '2024-01-19T18:49:59.371Z',
    '2024-01-22T12:01:20.894Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2024-01-20T14:43:26.374Z',
    '2024-01-19T18:49:59.371Z',
    '2024-01-22T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

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
//Functions

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  console.log(daysPassed);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const year = date.getFullYear();
    // return `${day}/${month}/${year}`;
    return new Intl.DateTimeFormat(locale).format(date);
  }
};
const displayMovements = function (acc, sort = false) {
  //to empty container and start adding only new elements:
  containerMovements.innerHTML = '';
  //.textContent=0; //similar things
  //to create a copy use slice() method
  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;
  //////////////////////////////////
  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = new Intl.NumberFormat(acc.locale, {
      style: 'currency',
      currency: 'USD',
    }).format(mov);

    const html = `
    <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
          <div class="movements__date">${displayDate}</div>
          <div class="movements__value">${formattedMov}</div>
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
  labelBalance.textContent = `${acc.balance.toFixed(2)} €`;
};

//Calculating incomes and outcomes:
const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  //putting inside html element:
  labelSumIn.textContent = `${incomes.toFixed(2)} €`;

  const outcomes = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);

  labelSumOut.textContent = `${Math.abs(outcomes).toFixed(2)}€`; //Math.abs() to remove sign(-)

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      //console.log(arr);
      return int >= 1; // we want anly interests that are >=1
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)}`;
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
  displayMovements(acc);
  //Dipslay balance
  calcDisplayBalance(acc);
  //Display summary
  calcDisplaySummary(acc);
};
const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(Math.trunc(time % 60)).padStart(2, 0);
    //In each callback call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    //When the time is at 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = 0;
    }
    //Decrese 1s
    time--;
  };
  //Set time to 5 minutes
  let time = 120;
  //Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

//Event handlers
let currentAccount, timer;

//FAKE ALWAYS LOGGED IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function (e) {
  e.preventDefault(); //to prevent  form from submitting
  // console.log('LOGIN');
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  //console.log(currentAccount);
  //to check if the pin is correct
  //using optional chaining for checking if the currentAccount exists (?)
  if (currentAccount?.pin === +inputLoginPin.value) {
    //console.log('LOGIN'); //just for checking
    //Dipslay UI and welcome message:
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    //to display UI we have to set opacity to 0 in our CSS file,then to change it here to 100;
    containerApp.style.opacity = 100;
    //Create current date and time
    //Experimenting API
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric', //'numeric' or '2-digit'
      year: 'numeric',
      // weekday: 'long', //'short','narrow'
    };
    // const locale = navigator.language;
    // console.log(locale);

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);
    // const now = new Date();
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const minutes = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${minutes}`;
    // day/month/year

    //Clear the input fields:
    inputLoginUsername.value = inputLoginPin.value = '';
    //to make the cursor invisible:
    inputLoginPin.blur();

    //Timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();
    //Update UI:
    updateUI(currentAccount);
  }
});
//Transfering money to the other account:
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault(); //to prevent reloading the page
  const amount = +inputTransferAmount.value; //
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

    //Adding transfer date:
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());
    //Update UI:
    updateUI(currentAccount);

    //Reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

//Requesting loan:
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value); //rounding using Math.floor()
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    //Add movement to current account:
    setTimeout(function () {
      currentAccount.movements.push(amount);
      //Adding loan date:
      currentAccount.movementsDates.push(new Date().toISOString());
      //Update UI:
      updateUI(currentAccount);

      //Reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
  //clear input field:
  inputLoanAmount.value = '';
});
//Closing account:
btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    currentAccount.username === inputCloseUsername.value &&
    currentAccount.pin === +inputClosePin.value
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
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted; //flipping the variable
});
// //coloring rows using remainder operator:
// labelBalance.addEventListener('click', function () {
//   [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
//     if (i % 2 === 0) row.style.backgroundColor = 'orangered'; //0,2,4,6
//     if (i % 3 === 0) row.style.backgroundColor = 'blue'; //0,3,6,9
//   });
// });

/////////////////////////
/////////////////////////////////////////////////

/////////////////////////////////////////////////

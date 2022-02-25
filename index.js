const request = require("request");
const jsdom = require("jsdom");
const fs = require('fs');
const pdf = require('pdf-parse');
const consumerNumberFinder = require("./regex");

let finalResult = [];

const stringToHTML = function (str, consumer) {
  const dom = new jsdom.JSDOM(str);
  const amountPaid = dom.window.document.querySelector(".MemTab")?.childNodes[1].childNodes[24].textContent.trim().replace("\n", "").split(" ").join("");//amount paid
  const paidDate = dom.window.document.querySelector(".MemTab")?.childNodes[1].childNodes[26].textContent.trim().replace("\n", "").split(" ").join("");//paid date
  const accountBalance = dom.window.document.querySelector(".MemTab")?.childNodes[1].childNodes[32].textContent.trim().replace("\n", "").split(" ").join("");//Account Balance

  finalResult.push({
    consumer,
    amountPaid,
    paidDate,
    accountBalance
  })

  // console.log(`${consumer.batch}-${consumer.pre}-${consumer.post}`);
  // console.log(amountPaid);
  // console.log(paidDate);
  // console.log(accountBalance);
  // console.log(`............................................................`);
};



let dataBuffer = fs.readFileSync('./les.pdf');

pdf(dataBuffer).then(function (data) {
  const consumerArray = consumerNumberFinder(data.text);
  // console.log(consumerArray);
  const newArray = consumerArray.map(consumer => {
    return {
      batch: consumer.slice(0, 2),
      pre: consumer.slice(2, 7),
      post: consumer.slice(7, 14),
    }
  });
  newArray.forEach((element, i, arr) => {
    request({ url: `http://www.lesco.gov.pk/Customer_Reg/AccountStatus.aspx?nBatchNo=${element.batch}&nSubDiv=${element.pre}&nRefNo=${element.post}&strRU=U` }, (error, { body } = {}) => {
      stringToHTML(body, element);
      if (i + 1 === arr.length) {
        finalResult = finalResult.sort((a, b) => {
          if (a.consumer.post < b.consumer.post) {
            return -1;
          }
          if (a.consumer.post > b.consumer.post) {
            return 1;
          }
          return 0;
        })
        finalResult = finalResult.filter(el => {
          return el.paidDate !== "PaymentDateNA"
        })
        console.log(finalResult);
      }
    })
    // console.log(`http://www.lesco.gov.pk/Customer_Reg/AccountStatusMDI.aspx?nBatchNo=${element.batch}&nSubDiv=${element.pre}&nRefNo=${element.post}&strRU=U`);
  });

});







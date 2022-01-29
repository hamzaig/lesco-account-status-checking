const request = require("request");
const jsdom = require("jsdom");
const fs = require('fs');
const pdf = require('pdf-parse');
const consumerNumberFinder = require("./regex");

const stringToHTML = function (str, consumer) {
  const dom = new jsdom.JSDOM(str);
  const amountPaid = dom.window.document.querySelector(".MemTab")?.childNodes[1].childNodes[24].textContent.trim().replace("\n", "").split(" ").join("");//amount paid
  const paidDate = dom.window.document.querySelector(".MemTab")?.childNodes[1].childNodes[26].textContent.trim().replace("\n", "").split(" ").join("");//paid date
  const accountBalance = dom.window.document.querySelector(".MemTab")?.childNodes[1].childNodes[32].textContent.trim().replace("\n", "").split(" ").join("");//Account Balance
  console.log(`${consumer.batch}-${consumer.pre}-${consumer.post}`);
  console.log(amountPaid);
  console.log(paidDate);
  console.log(accountBalance);
  console.log(`............................................................`);
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
  newArray.forEach(element => {
    request({ url: `http://www.lesco.gov.pk/Customer_Reg/AccountStatus.aspx?nBatchNo=${element.batch}&nSubDiv=${element.pre}&nRefNo=${element.post}&strRU=U` }, (error, { body } = {}) => {
      stringToHTML(body, element)
    })
    // console.log(`http://www.lesco.gov.pk/Customer_Reg/AccountStatusMDI.aspx?nBatchNo=${element.batch}&nSubDiv=${element.pre}&nRefNo=${element.post}&strRU=U`);
  });

});







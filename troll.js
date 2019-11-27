const csv = require('csvtojson')
const csvPath = "./rawCsv/Inventory.csv"
const { Parser } = require('json2csv');
const fields = ['Product Id', 'Product Sku', 'Product Name', "Product Category", "Sales (Past Week)", "T&T Price", "Lowest Price", "Available", "*On Hold", "*My Price", "*My Cost", "Live Quantity"];
const opts = { fields };

const write = require('write');


module.export = () => {
    csv()
.fromFile(csvPath)
.then((jsonObj)=>{

    jsonObj.map((item) => {

        console.log(item)


        if (item["Available"] !== item["Live Quantity"]) {
            if (item["Available"] / item["Live Quantity"] < .5) {
            //   item["*My Price"] = parseFloat(item["Lowest Price"]) - .01 < .2 ? .2 : (parseFloat(item["Lowest Price"]) - .01).toFixed(2)   
            }
        } else {
            if (Number(item["*My Price"]) < Number(item["T&T Price"])) {
                item["*My Price"] = (parseFloat(item["T&T Price"])).toFixed(2) 
            }
        }


        return item
    })
  //  console.log(jsonObj)
    const parser = new Parser(opts);
    const csv = parser.parse(jsonObj);
    //console.log(csv);

  //  write.sync('foo.csv', csv); 
})
}
const csv = require('csvtojson')
const csvPath = "./rawCsv/Inventory.csv"
const tcgCsvPath = "./rawCsv/tcg.csv"
const { Parser } = require('json2csv');
const fields = ['Product Id', 'Product Sku', 'Product Name', "Product Category", "Sales (Past Week)", "T&T Price", "Lowest Price", "Available", "*On Hold", "*My Price", "*My Cost", "Live Quantity"];
const opts = { fields };
const mv = require('mv');
const path = require("path")



const tcgFields = [
    "TCGplayer Id",
    "Product Line",
    "Set Name",
    "Product Name",
    "Title",
    "Number",
    "Rarity",
    "Condition",
    "TCG Market Price",
    "TCG Direct Low",
    "TCG Low Price With Shipping",
    "TCG Low Price",
    "Pending Quantity",
    "Total Quantity",
    "Add to Quantity",
    "TCG Marketplace Price",
    "Photo URL"
];
const tcgOps = { tcgFields }

const shouldCheck = process.argv[3] === "check"

const write = require('write');

//const repriceTroll = require('./troll.js')
//import repriceTroll from './troll.js'

const site = process.argv[2]

if (site === "troll") { 
    mv('/Users/art/Downloads/Inventory.csv', path.join(__dirname, "rawCsv/Inventory.csv"), function(err) {
        if (!err) {
            parseCsv("troll").then((data) => {
                const parser = new Parser(opts);
                const csv = parser.parse(data);
                if (!shouldCheck) {
                    write.sync('foo.csv', csv);  
                }
            })
        }
    });    
} else if (site === "tcg") {
    parseCsv("tcg").then((data) => {
        //console.log(data)

        const parser = new Parser(tcgOps);
        const csv = parser.parse(data);
        //console.log(csv);
    
        write.sync('tcg.csv', csv); 
    })
}


function parseCsv(site) {
    const csvFile = site === "troll" ? csvPath : tcgCsvPath
    return new Promise ((resolve, reject) => {
        csv()
        .fromFile(csvFile)
        .then((json)=>{
            const jsonObj = site === "troll" ? parseTroll(json) : parseTcg(json)

            resolve(jsonObj)
        })
    })
}

function parseTroll (jsonObj) {
 return jsonObj.map((item) => {
        item["*On Hold"] = 0

        if (Number(item["*My Price"]) > Number(item["Lowest Price"]) && item["Available"] !== item["Live Quantity"]) {
            if (shouldCheck) {
                console.log(item)
            }
              item["*My Price"] = parseFloat(item["Lowest Price"]) - .01 < .2 ? .2 : (parseFloat(item["Lowest Price"]) - .01).toFixed(2)   
        }


        if (item["Available"] !== item["Live Quantity"]) {
            if (item["Available"] / item["Live Quantity"] < .5) {
            //   item["*My Price"] = parseFloat(item["Lowest Price"]) - .01 < .2 ? .2 : (parseFloat(item["Lowest Price"]) - .01).toFixed(2)   
            }
        } else {
            if (Number(item["*My Price"]) < Number(item["T&T Price"])) {
        //     item["*My Price"] = (parseFloat(item["T&T Price"])).toFixed(2) 
            }
        }

        return item
    })
}

function parseTcg (jsonObj) {
    return jsonObj.map((item) => {
            if (Number(item["Total Quantity"]) > 0) {
                /*
                    
                    TCG Marketplace Price - my price
                    TCG Low Price - marketplace low price

                */
                if (item["Product Name"] === "Rocket's Admin.") { 
                   
                   // console.log(item)
                    // item["TCG Marketplace Price"] = item["TCG Low Price"]
                }

                if (item["Product Name"] === "Swamp (238)") { 
                   
                 //  console.log(item)
                    // item["TCG Marketplace Price"] = item["TCG Low Price"]
                }

                if (
                    item["TCG Low Price With Shipping"] !== item["TCG Low Price"] && 
                    Number(item["TCG Low Price"]) > .75
                ) {
                    //console.log(item)
                    item["TCG Marketplace Price"] = Number(item['TCG Low Price With Shipping']) - .78
                }
            }
            return item
        })
}
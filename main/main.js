let itemDB = require('../main/datbase');

const parsingInput = (input) => {
    return input.reduce((acc, val) => {
        let base = 1;
        let separatorPos = val.indexOf('-');
        if (separatorPos !== -1) {
            base = parseInt(val.substring(separatorPos + 1, val.length));
            val = val.substring(0, separatorPos);
        }
        !acc[val] ? acc[val] = base : acc[val] += base;
        return acc;
    }, {});
};

const generateOrderItems = (input) => {
    input = parsingInput(input);
    return Object.keys(input).map(key => {
        let item = itemDB.getItemByBarCode(key);
        let name = item.name;
        let quality = input[key];
        let unitPrice = item.price;
        let priceInfo = calcItemPrice(key, quality)
        let qualityUnit = item.unit;
        let moneyUnit = '元';
        return {
            name: name,
            quality: quality,
            unitPrice: unitPrice,
            qualityUnit: qualityUnit,
            moneyUnit: moneyUnit,
            actualPrice: priceInfo['actualPrice'],
            freeNum: priceInfo['freeNum'],
            saveMoney: priceInfo['saveMoney']
        };
    });
};

const calcItemPrice = (itemBarCode, quantity) => {
    let item = itemDB.getItemByBarCode(itemBarCode);
    let originPrice = quantity * item.price;
    let freeNum = itemDB.isBuyTwoGetOneFreeItem(itemBarCode) ? Math.floor(quantity * (1 / 3)) : 0;
    let saveMoney = freeNum * item.price;
    let actualPrice = originPrice - saveMoney;
    return {'actualPrice': actualPrice, 'freeNum': freeNum, 'saveMoney': saveMoney};
};

const calcTotalPriceInfo = (orderItems) => {
    let total = orderItems.reduce((acc, val) => acc += val.actualPrice, 0);
    let save = orderItems.reduce((acc, val) => acc += val.saveMoney, 0);
    return {'total': total, 'save': save, 'moneyUnit': '元'};
};



module.exports = function printInventory(inputs) {
    let orderItems = generateOrderItems(inputs);
    let totalPriceInfor = calcTotalPriceInfo(orderItems);
    console.log(orderItems);
    console.log(totalPriceInfor);
    console.log("Debug Info");
    return 'Hello World!';
};
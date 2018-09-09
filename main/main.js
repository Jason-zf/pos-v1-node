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
        let quantity = input[key];
        let unitPrice = item.price;
        let priceInfo = calcItemPrice(key, quantity)
        let quantityUnit = item.unit;
        let moneyUnit = '元';
        return {
            name: name,
            quantity: quantity,
            unitPrice: unitPrice,
            quantityUnit: quantityUnit,
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


const generateBillList = (orderItems, totalPrice) => {
    return generateShoppingList(orderItems) + generateFreeList(orderItems) + generatePriceList(totalPrice);
};

const generateShoppingList = (orderItems) => {
    let title = "***<没钱赚商店>购物清单***";
    let bottom = "----------------------";
    let body = orderItems.reduce((acc, val) => acc += printItemInfo(val), "");
    return title + '\n' + body + bottom + '\n';

};

const printItemInfo = (item) => {
    return "名称：" + item.name + "，数量：" + item.quantity
        + item.quantityUnit + "，单价：" + item.unitPrice.toFixed(2) + '(' + item.moneyUnit + ")，小计："
        + item.actualPrice.toFixed(2) + '(' + item.moneyUnit + ")" + '\n';
};

const generateFreeList = (orderItems) => {
    let title = "挥泪赠送商品：";
    let bottom = "----------------------";
    let body = orderItems.reduce((acc, val) => acc += printFreeItemInfo(val), "");
    return title + '\n' + body + bottom + '\n';

};

const printFreeItemInfo = (item) => {
    return item.freeNum === 0 ? "" : "名称：" + item.name + "，数量："
        + item.freeNum + item.quantityUnit + '\n';
};

const generatePriceList = (totalPrice) => {
    let bottom = "**********************";
    let body =
        "总计：" + totalPrice.total.toFixed(2) + '(' + totalPrice.moneyUnit + ")\n" +
        "节省：" + totalPrice.save.toFixed(2) + '(' + totalPrice.moneyUnit + ")\n";
    return body + bottom;
};

module.exports = function printInventory(inputs) {
    let orderItems = generateOrderItems(inputs);
    let totalPriceInfo = calcTotalPriceInfo(orderItems);
    console.log(generateBillList(orderItems, totalPriceInfo));

    return 'Hello World!';
};
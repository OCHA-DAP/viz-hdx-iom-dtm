var Utility = {
    dynamicSort: function dynamicSort(property) {
        var sortOrder = 1;
        if (property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function (a, b) {
            var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
        }
    }
    ,

    // Convert number into million or thosand word format
    abbreviateNumber: function abbreviateNumber(number) {
        var SI_POSTFIXES = ["", "K", "M", "B"];
        var tier = Math.log10(Math.abs(number)) / 3 | 0;
        if (tier == 0) return number;
        var postfix = SI_POSTFIXES[tier];
        var scale = Math.pow(10, tier * 3);
        var scaled = number / scale;
        var formatted = scaled.toFixed(1) + '';
        if (/\.0$/.test(formatted))
            formatted = formatted.substr(0, formatted.length - 2);
        return formatted + postfix;
    }
}
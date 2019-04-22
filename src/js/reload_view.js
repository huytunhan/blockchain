function parse(val) {
    var result = "",
            tmp = [];
    location.search
            .substr(1)
            .split("&")
            .forEach(function (item) {
                tmp = item.split("=");
                if (tmp[0] === val)
                    result = decodeURIComponent(tmp[1]);
            });
    return result;
}
var page = parse('page');
$("#content").load(page+".html");


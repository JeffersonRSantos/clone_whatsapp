var strToBool = function (s) {
    regex = /^\s*(true|1|on|yes)\s*$/i
    return regex.test(s);
}

var toArray = function (s, options = {}) {
    if (typeof (s) === "string") {
        s = s.split(',')
    } else if (typeof (s) === "object" && !Array.isArray(s)) {
        if (options.object_value) {
            s = Object.values(s)
        } else {
            s = Object.keys(s)
        }
    }
    return s;
}

var filterTable = async function (table, fillable, filter, fields = '*') {
    const knex = require("../../config/knex");

    let perPage = 0;
    if (filter.limit <= 0) {
        let result = await knex.count(0, { as: 'count' }).from(table).first();
        filter.page = 1;
        perPage = result.count;
    } else {
        perPage = +filter.limit || 10;
    }
    let currentPage = +filter.page || 1;
    let orderBy = [];
    let filters = [];

    if (filter.sort_by) {
        filter.sort_by.split(",").forEach(item => {
            orderBy.push({ column: item.split(".")[0], order: item.split(".")[1] || "asc" })
        });
    }

    Object.keys(filter).map(function (key) {
        key.split(',').forEach(function (val) {
            fillable.indexOf(val) < 0 ? delete filter[key] : ""
        })
    });

    let k = [];
    let data = await knex.select(fields).table(table)
        .modify(function (query) {
            Object.keys(filter).forEach(function (key) {
                query.where(function (squery) {
                    let f = [];
                    key.split(',').forEach(function (val, index) {
                        let v = [];
                        let field = val;
                        let aop = [];
                        let avl = [];
                        if (!Array.isArray(filter[key])) {
                            v = [filter[key]]
                        } else {
                            v = filter[key]
                        }

                        v.forEach(function (value) {
                            //let value = filter[key];
                            let op = '='
                            if (isNaN(value)) {
                                if (value.split(":")[1] && value.split(":")[0] === "like") {
                                    op = 'like';
                                    value = '%' + value.split(':').splice(1).join(':') + '%';
                                } else if (value.split(":")[1] && value.split(":")[0] === "gte") {
                                    op = '>=';
                                    value = value.split(':').splice(1).join(':');
                                } else if (value.split(":")[1] && value.split(":")[0] === "lte") {
                                    op = '<=';
                                    value = value.split(':').splice(1).join(':');
                                } else if (value.split(":")[1] && value.split(":")[0] === "gt") {
                                    op = '>';
                                    value = value.split(':').splice(1).join(':');
                                } else if (value.split(":")[1] && value.split(":")[0] === "lt") {
                                    op = '<';
                                    value = value.split(':').splice(1).join(':');
                                } else if (value.split(":")[1] && value.split(":")[0] === "in") {
                                    op = 'in';
                                    value = value.split(':').splice(1).join(':').split(",");
                                }
                            }

                            aop.push(op);
                            avl.push(value);

                            if (index <= 0) {
                                squery.where(field, op, value);
                            } else {
                                squery.orWhere(field, op, value);
                            }
                        })


                        if (k.indexOf(key + '-' + val) >= 0) { return }
                        k.push(key + '-' + val)

                        f.push({
                            field,
                            op: (aop.length <= 1 ? aop[0] : aop),
                            value: (avl.length <= 1 ? avl[0] : avl)
                        });
                    })
                    if (f.length > 0) {
                        filters.push(f);
                    }
                })
            });
        })
        .orderBy(orderBy)
        .paginate({ isLengthAware: true, perPage, currentPage });

    data.sort_by = orderBy;
    data.filters = filters;
    data[table.replace("tb_", "")] = data.data;
    data.pagination.last_page = data.pagination.lastPage;
    data.pagination.limit = data.pagination.perPage;
    data.pagination.page = data.pagination.currentPage;

    delete data.data;
    delete data.pagination.lastPage;
    delete data.pagination.perPage;
    delete data.pagination.currentPage;

    return data;
}

module.exports = {
    strToBool,
    toArray,
    filterTable
}
new Vue({
    el: "#app",
    data: {
        // 原始数据
        stockDayData: [],
        bwibbuData: [],
        stockDayAvgData: [],
        mergedData: [],

        // 筛选器相关
        filters: [
            { field: "ClosingPrice", operator: ">", value: "" },
            { field: "MonthlyAveragePrice", operator: "<", value: "" },
            { field: "TradeVolume", operator: "=", value: "" },
        ],
    },
    computed: {
        allFields() {
            return [
                "Code",
                "Name",
                "TradeVolume",
                "TradeValue",
                "OpeningPrice",
                "HighestPrice",
                "LowestPrice",
                "ClosingPrice",
                "Change",
                "Transaction",
                "PEratio",
                "DividendYield",
                "PBratio",
                "MonthlyAveragePrice",
            ];
        },
        filteredData() {
            return this.mergedData.filter((item) => {
                return this.filters.every((filter) => {
                    const fieldValue = parseFloat(item[filter.field]) || 0;
                    const filterValue = parseFloat(filter.value) || 0;

                    switch (filter.operator) {
                        case ">":
                            return fieldValue > filterValue;
                        case "<":
                            return fieldValue < filterValue;
                        case "=":
                            return fieldValue === filterValue;
                        default:
                            return true;
                    }
                });
            });
        },
    },
    methods: {
        async fetchData() {
            const [stockDay, bwibbu, stockDayAvg] = await Promise.all([
                axios.get("https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL"),
                axios.get("https://openapi.twse.com.tw/v1/exchangeReport/BWIBBU_ALL"),
                axios.get("https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_AVG_ALL"),
            ]);

            this.stockDayData = stockDay.data;
            this.bwibbuData = bwibbu.data;
            this.stockDayAvgData = stockDayAvg.data;

            this.mergeData();
        },
        mergeData() {
            const stockDayMap = this.stockDayData.reduce((acc, item) => {
                acc[item.Code] = item;
                return acc;
            }, {});

            const bwibbuMap = this.bwibbuData.reduce((acc, item) => {
                acc[item.Code] = item;
                return acc;
            }, {});

            this.mergedData = this.stockDayAvgData.map((item) => ({
                ...item,
                ...(stockDayMap[item.Code] || {}),
                ...(bwibbuMap[item.Code] || {}),
            }));
        },
        addFilter() {
            this.filters.push({ field: "ClosingPrice", operator: ">", value: "" });
        },
        removeFilter(index) {
            this.filters.splice(index, 1);
        },
    },
    async mounted() {
        await this.fetchData();
    },
});

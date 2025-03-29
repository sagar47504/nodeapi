const crypto = require("crypto");
const axios = require('axios');

class webhookService {

    endpoint = 'https://api.india.delta.exchange/v2/';
    apis = {
        41255895 : {
            apiKey: 'cD5I6w7l4kBwoM0NKonug1AVHEZUHd',
            apiSecret: 'uGrl78bLUjJzsY0LnjILk093qi7DR4k3mAfGC1WrWj3xnSsLyKByznzsoYt6'
        },
        71248653 : {
            apiKey: 'qQ1m9yMDdKk6Ag50YiVghOxfpgRnX5',
            apiSecret: 't0JyMaSDxd2VTEOLLylcBFaBKWWI9Pzj1EKZz1t13pKeFM6XL8kN0esSEF3h'
        }
    }

    generateSignature(timestamp, path, body, API_SECRET) {
        const httpMethod = 'POST';
        const message = `${httpMethod}${timestamp}${path}${JSON.stringify(body)}`;
        return crypto.createHmac('sha256', API_SECRET).update(message).digest('hex');
    }

    async placeOrder(signal) {

        let buyorsell;

        if (signal.orderType == "LONG_EXIT") {
            buyorsell = 'sell';
        } else if (signal.orderType == "SHORT_EXIT") {
            buyorsell = 'buy';
        }

        if (signal.orderType == "LONG_ENTRY") {
            this.closeAllPositions(signal);
            buyorsell = 'buy';
        } else if (signal.orderType == "SHORT_ENTRY") {
            buyorsell = 'sell';
        }

        const orderDetails = {
            "product_symbol": signal.symbol,
            "size": Number(signal.qty),
            "side": buyorsell,
            "order_type": "market_order",
            "reduce_only": (signal.orderType == 'LONG_EXIT' || signal.orderType == 'SHORT_EXIT') ? "true" : "false",
        };

        try {
            const timestamp = Math.floor(Date.now() / 1000).toString();
            const signature = this.generateSignature(timestamp, '/v2/orders', orderDetails, this.apis[Number(signal.account)].apiSecret);

            const headers = {
                'api-key': this.apis[Number(signal.account)].apiKey,
                'timestamp': timestamp,
                'signature': signature,
                'Content-Type': 'application/json',
            };

            const response = await axios.post(this.endpoint + 'orders', orderDetails, { headers });
            if (response.data.success) {
                return { status: true, orderNo: response.data.result.id, data: response.data.result, price: response.data.result.average_fill_price };
            } else {
                return { status: false, data: 'Order Not Placed.' };
            }
        } catch (error) {
            return { status: false, data: error.response.data.error.code };
        }
    }

    async closeAllPositions(signal){

        const orderDetails = {
            "close_all_portfolio": true,
            "close_all_isolated": true,
            "user_id": Number(signal.account)
        };

        try {
            const timestamp = Math.floor(Date.now() / 1000).toString();
            const signature = this.generateSignature(timestamp, '/v2/positions/close_all', orderDetails, this.apis[signal.account].apiSecret);

            const headers = {
                'api-key': this.apis[signal.account].apiKey,
                'timestamp': timestamp,
                'signature': signature,
                'Content-Type': 'application/json',
            };

            const response = await axios.post(this.endpoint + 'positions/close_all', orderDetails, { headers });
            if (response.data.success) {
                return { status: true, orderNo: response.data.result.id, data: response.data.result, price: response.data.result.average_fill_price };
            } else {
                return { status: false, data: 'Order Not Placed.' };
            }
        } catch (error) {
            return { status: false, data: error.response.data.error.code };
        }

    }

    // {
    //     account : 'sgrswing',
    //     orderType: "LONG_ENTRY",
    //     symbol: "BTCUSD",
    //     qty: 1,
    // }
}
module.exports = new webhookService();

const apiKey = "CG-EBE4jd5B73HeK6RLAiNR1pYN";

async function requestCoinInfo (id, currency)  {
    try {
        const res = await axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&ids=${id}`, {
            headers: {'x-cg-demo-api-key': apiKey}
        });
        for (const coin of res.data) {
            console.log(coin.id);
            console.log(`${coin.symbol}/${currency}`);
            console.log(coin.current_price);
            console.log(coin.image);
            console.log(coin.price_change_percentage_24h);
        }
    } catch (e) {
        console.log("ERROR", e);
    }
};
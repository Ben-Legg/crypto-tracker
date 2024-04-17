const apiKey = "CG-EBE4jd5B73HeK6RLAiNR1pYN";


async function requestCoinInfo (id)  {
    try {
        const res = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}`, {
            headers: {'x-cg-demo-api-key': apiKey,}
        });
        return res.data;
    } catch (e) {
        console.log("ERROR", e);
    }
};

async function displayCoinInfo (id) {
    const coinData = await requestCoinInfo(id);
    console.log(coinData);
}
displayCoinInfo("bitcoin");

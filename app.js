const apiKey = "CG-EBE4jd5B73HeK6RLAiNR1pYN";

function convertTime(timestamp) { // Converts ISO 8601 format date to readable format
    const padWithZero = number => number.toString().padStart(2, '0');

    const date = new Date(timestamp);
    const formattedDate = `${padWithZero(date.getDate())}-${padWithZero(date.getMonth() + 1)}-${date.getFullYear()} ${padWithZero(date.getHours())}:${padWithZero(date.getMinutes())}`;
    return formattedDate;
}

function buildTile(coin, currency){ // Function to create a tile using object data
    const list = document.querySelector(".tracked-coins");

    const tile = document.createElement("div"); // Create tile for coin
    tile.classList.add("tile");

    const imgContainer = document.createElement("div"); // Create image element and container
    imgContainer.classList.add("img-container");
    const coinImg = document.createElement("img");
    coinImg.classList.add("coin-logo");
    coinImg.setAttribute("src", coin.image);
    coinImg.setAttribute("alt", `${coin.id} icon`);
    imgContainer.appendChild(coinImg);
    tile.appendChild(imgContainer); // Append to tile

    const nameContainer = document.createElement("div"); // Create name elements and container
    nameContainer.classList.add("name-container");
    const symbol = document.createElement("h3");
    symbol.textContent = `${coin.symbol.toUpperCase()}/${currency}`;
    nameContainer.appendChild(symbol);
    const name = document.createElement("p");
    name.textContent = coin.id;
    nameContainer.appendChild(name);
    const lastUpdatedDate = document.createElement("p");
    lastUpdatedDate.textContent = convertTime(`${coin["last-updated"]}`);
    nameContainer.appendChild(lastUpdatedDate);
    tile.appendChild(nameContainer); // Append to tile

    const priceContainer = document.createElement("div"); // Create Price element and container
    priceContainer.classList.add("price-container");
    const price = document.createElement("h3");
    price.textContent = coin.price;
    priceContainer.appendChild(price);

    const priceChange = document.createElement("p");
    priceChange.classList.add("price-change");
    priceChange.textContent = `${coin['price-change'].toFixed(2)}`;
    priceContainer.appendChild(priceChange);
    const priceChangePercentage = document.createElement("p");
    priceChangePercentage.classList.add("price-change-percentage");
    priceChangePercentage.textContent = `${coin['price-change-percentage'].toFixed(2)}%`;
    priceContainer.appendChild(priceChangePercentage);
    tile.appendChild(priceContainer); // Append to tile

    list.appendChild(tile);
}

// [NEED BACK END, REVISIT LATER IN TIME TO ADD DATA PERSISTENCE]
// async function loadCoins() { // function to load coins from JSON file
//     try {
//         const response = await fetch("coins.json"); // Fetch the JSON data from coins.json
//         const data = await response.json(); // Parse the JSON data
//         data.forEach(coin => { // Build tile for each coin object
//           buildTile(coin);
//         });
//       } catch (error) {
//         console.error("Error: Failed to load coins from coins.json");
//       }
// }

async function requestCoinInfo (id, currency)  {
    try {
        const res = await axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&ids=${id}`, {
            headers: {'x-cg-demo-api-key': apiKey}
        });
        if (!(res.data.length === 0)) {
            for (const coin of res.data) {
                const coinObject = {
                    "id": coin.id,
                    "symbol": coin.symbol,
                    "currency": currency,
                    "price": coin.current_price,
                    "price-change": coin.price_change_24h,
                    "price-change-percentage": coin.price_change_percentage_24h,
                    "image": coin.image,
                    "last-updated": coin.last_updated
                };
                buildTile(coinObject, currency);
            }
        } else {
            alert(`No data for ${id} in ${currency} on CoinGecko`)
        }
    } catch (e) {
        console.log("ERROR", e);
    }
};

const searchForm = document.querySelector("#searchForm");
searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const coinInput = searchForm.elements.coin;
    const coinSearch = coinInput.value.toLowerCase();

    const currencyInput = searchForm.elements.currency;
    const currencySearch = currencyInput.value.toUpperCase();
    
    requestCoinInfo(coinSearch, currencySearch);
    coinInput.value = "";
});
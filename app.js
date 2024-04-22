const apiKey = "CG-EBE4jd5B73HeK6RLAiNR1pYN";

function convertTime(timestamp) { // Converts ISO 8601 format date to readable format
    const padWithZero = number => number.toString().padStart(2, '0');

    const date = new Date(timestamp);
    const formattedDate = `${padWithZero(date.getDate())}-${padWithZero(date.getMonth() + 1)}-${date.getFullYear()} ${padWithZero(date.getHours())}:${padWithZero(date.getMinutes())}`;
    return formattedDate;
}

function dynamicRound(price) {
    if (price < 0.01) {
        return price.toFixed(8); // Round to 8 decimal places for very low prices
    } else if (price < 1) {
        return price.toFixed(6); // Round to 6 decimal places for low prices
    } else if (price < 100) {
        return price.toFixed(4); // Round to 4 decimal places for mid-range prices
    } else {
        return price.toFixed(2); // Round to 2 decimal places for higher prices
    }
}

function addPriceChangeClass(element) {
    const value = parseFloat(element.textContent);
    if (value > 0) {
        element.classList.add("pos-price-change");
        element.classList.remove("neg-price-change");
    } else if (value < 0) {
        element.classList.add("neg-price-change");
        element.classList.remove("pos-price-change");
    } else {
        element.classList.remove("pos-price-change");
        element.classList.remove("neg-price-change");
    }
}

function colourPriceChanges() {
    const priceChanges = document.querySelectorAll(".price-change");
    for (const priceChange of priceChanges) {
        addPriceChangeClass(priceChange);
    }

    const priceChangePercentages = document.querySelectorAll(".price-change-percentage");
    for (const priceChangePercentage of priceChangePercentages) {
        addPriceChangeClass(priceChangePercentage);
    }
}

function buildTile(coin, currency){ // Function to create a tile using object data
    const trackedCoins = document.querySelector(".tracked-coins");

    const tile = document.createElement("div"); // Create coin tile
    tile.classList.add("tile");

    const imgContainer = document.createElement("div"); // Create image container
    imgContainer.classList.add("img-container");
    const coinImg = document.createElement("img"); // Create image element
    coinImg.classList.add("coin-logo");
    coinImg.setAttribute("src", coin.image);
    coinImg.setAttribute("alt", `${coin.id} icon`);
    imgContainer.appendChild(coinImg);
    tile.appendChild(imgContainer); // Append image container to tile

    const nameContainer = document.createElement("div"); // Create name container
    nameContainer.classList.add("name-container");
    const symbol = document.createElement("h3"); // Create coin/currency pairing element
    symbol.textContent = `${coin.symbol.toUpperCase()} / ${currency.toUpperCase()}`;
    nameContainer.appendChild(symbol);
    const name = document.createElement("p"); // Create coin name element
    name.textContent = coin.id;
    nameContainer.appendChild(name);
    const lastUpdatedDate = document.createElement("p"); // Create timestamp element
    lastUpdatedDate.textContent = convertTime(`${coin["last-updated"]}`);
    nameContainer.appendChild(lastUpdatedDate);
    tile.appendChild(nameContainer); // Append name container to tile

    const priceContainer = document.createElement("div"); // Create price container
    priceContainer.classList.add("price-container");
    const price = document.createElement("h3"); // Create price element
    price.textContent = coin.price;
    priceContainer.appendChild(price);

    const priceChange = document.createElement("p"); // Create price change element
    priceChange.classList.add("price-change");
    priceChange.textContent = `${dynamicRound(coin['price-change'])}`; // Dynamically round the price change based on value
    priceContainer.appendChild(priceChange);
    const priceChangePercentage = document.createElement("p"); // Create percentage price change element
    priceChangePercentage.classList.add("price-change");
    priceChangePercentage.classList.add("price-change-percentage");
    priceChangePercentage.textContent = `${dynamicRound(coin['price-change-percentage'])}%`; // Dynamically round the percentage price change based on value
    priceContainer.appendChild(priceChangePercentage);
    tile.appendChild(priceContainer); // Append price container to tile

    trackedCoins.appendChild(tile); // Append tile to tracked coins

    colourPriceChanges();
}

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
    const currencySearch = currencyInput.value;
    
    requestCoinInfo(coinSearch, currencySearch);
    coinInput.value = "";
    currencyInput.value = "";
});
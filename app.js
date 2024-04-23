const apiKey = "CG-EBE4jd5B73HeK6RLAiNR1pYN";

function convertTime(timestamp) { // Converts ISO 8601 format date to readable format
    const padWithZero = number => number.toString().padStart(2, '0');

    const date = new Date(timestamp);
    const formattedDate = `${padWithZero(date.getDate())}-${padWithZero(date.getMonth() + 1)}-${date.getFullYear()} ${padWithZero(date.getHours())}:${padWithZero(date.getMinutes())}`;
    return formattedDate;
}

function dynamicRound(price) {
    if (Math.abs(price) < 0.01) {
        return price.toFixed(8); // Round to 8 decimal places for very low prices
    } else if (Math.abs(price) < 1) {
        return price.toFixed(6); // Round to 6 decimal places for low prices
    } else if (Math.abs(price) < 100) {
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

function searchWarning(warningMessage) {
    const formSubmitBtn = document.querySelector("button");
    formSubmitBtn.disabled = true;

    const warningContainer = document.querySelector(".warning-container"); // Find warning container
    const warningElement = document.querySelector(".warning-message"); // Find warning message p element
    warningElement.textContent = warningMessage;
    warningContainer.classList.add("active"); // Make container visable

    setTimeout(() => {
        warningContainer.classList.remove("active"); // Make container invisable after 10s
        setTimeout(() => {
            warningElement.textContent = ""; // Remove text content once transition is done
            formSubmitBtn.disabled = false;
        }, 500);
    }, 2000);
}

async function requestCoinInfo (coinSeach, currency)  {
    if (coinSeach.length <= 5) {
        searchWarning("Please enter full coin name !");
    } else {
        try {
    
            const res = await axios.get(`https://api.coingecko.com/api/v3/coins/markets`, {
                params: {
                    ids: coinSeach,
                    vs_currency: currency
                },
                headers: {
                    'x-cg-demo-api-key': apiKey
                }
            });
    
            if (!(res.data.length === 0)) {
                for (const coin of res.data) {
                    const coinObject = {
                        "id": coin.coinSeach,
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
                searchWarning(`No data for ${coinSeach.toUpperCase()}/${currency.toUpperCase()} !`);
            }
        } catch (e) {
            searchWarning(`No data for ${currency.toUpperCase()} markets !`);
            console.log("ERROR", e);
        }
    }
};


const searchForm = document.querySelector("#searchForm");
searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const coinInput = searchForm.elements.coin;
    const coinSeach = coinInput.value.toLowerCase();

    const currencyInput = searchForm.elements.currency;
    const currencySearch = currencyInput.value;
    
    if (coinSeach && currencySearch) {
        requestCoinInfo(coinSeach, currencySearch);
    } else {
        let warningMessage = "";
        if (!coinSeach && !currencySearch) {
            warningMessage = "Coin and currency required !";
        } else if (!coinSeach ) {
            warningMessage = "Coin required !";
        } else if (!currencySearch) {
            warningMessage = "Currency required !";
        }
        searchWarning(warningMessage);
    }

    coinInput.value = "";
    currencyInput.value = "";
});
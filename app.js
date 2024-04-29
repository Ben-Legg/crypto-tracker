const apiKey = "CG-EBE4jd5B73HeK6RLAiNR1pYN";

function convertTime(timestamp) { // Converts ISO 8601 format date to readable format
    const padWithZero = number => number.toString().padStart(2, '0');

    const date = new Date(timestamp);
    const formattedDate = `${padWithZero(date.getDate())}-${padWithZero(date.getMonth() + 1)}-${date.getFullYear()} ${padWithZero(date.getHours())}:${padWithZero(date.getMinutes())}`;
    return formattedDate;
}

function dynamicRound(price) { // Function to dynamically round price changes to decimal points based on magnitude of price change
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

function addPriceChangeClass(element) { // Function to add pos/neg style to element based on price change value
    const value = parseFloat(element.textContent);
    if (value > 0) { // Apply pos price class to price changes above 0
        element.classList.add("pos-price-change");
        element.classList.remove("neg-price-change");
    } else if (value < 0) { // Apply neg price class to price changes below 0
        element.classList.add("neg-price-change");
        element.classList.remove("pos-price-change");
    } else { // Remove all price classes to price changes === 0
        element.classList.remove("pos-price-change");
        element.classList.remove("neg-price-change");
    }
}

function colourPriceChanges() { // Function to apply price change styles to all price changes and price change percentages
    const priceChanges = document.querySelectorAll(".price-change");
    for (const priceChange of priceChanges) {
        addPriceChangeClass(priceChange);
    }
    const priceChangePercentages = document.querySelectorAll(".price-change-percentage");
    for (const priceChangePercentage of priceChangePercentages) {
        addPriceChangeClass(priceChangePercentage);
    }
}

function tileHoverEffects(tile) { // Function to apply hover effects to coin tiles
    tile.addEventListener("mouseenter", () => { // Apply tile syles and img animations upon hover
        tile.classList.add("tile-hover");
        const img = tile.querySelector('.img-container img');
        img.classList.add('tile-hover-img');
        setTimeout(() => { // Remove img animation class after animation has finished
            img.classList.remove('tile-hover-img');
        }, 900);
    });
    
    tile.addEventListener('mouseleave', () => { // Remove tile hover styles when mouse leaves tile
        tile.classList.remove("tile-hover");
    });
}

function buildTile(coin, currency){ // Function to create a tile using object data
    const trackedCoins = document.querySelector(".tracked-coins");

    const tile = document.createElement("div"); // Create coin tile
    tile.classList.add("tile");

    const removeTileButton = document.createElement("div"); // Create tile remove button
    removeTileButton.classList.add("remove");
    removeTileButton.addEventListener("click", () => tile.remove()); // Remove the tile when the remove button is clicked
    tile.appendChild(removeTileButton); // Append tile remove button to tile

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

    tileHoverEffects(tile); // Apply hover effects to tile

    colourPriceChanges(); // Apply price change styles to tile price changes
}

function searchWarning(warningMessage) { // Function to create warnings for form submissions
    const formSubmitBtn = document.querySelector("button");
    formSubmitBtn.disabled = true; // Disable submit button when a warning appears

    const warningContainer = document.querySelector(".warning-container"); // Find warning container
    const warningElement = document.querySelector(".warning-message"); // Find warning message p element
    warningElement.textContent = warningMessage;
    warningContainer.classList.add("active"); // Make warning visable

    setTimeout(() => {
        warningContainer.classList.remove("active"); // Make warning invisable after 10s
        setTimeout(() => {
            warningElement.textContent = ""; // Remove text content once transition is done
            formSubmitBtn.disabled = false; // Enable submit button when a warning disappears
        }, 500);
    }, 2000);
}

async function requestCoinInfo (coinSeach, currency) { // Functionn to retrieve coin infomation from api
    if (coinSeach.length <= 5) { // Make sure user is searching for coin name instead for symbol E.g. "bitcoin" instead of "BTC"
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
    
            if (!(res.data.length === 0)) { // If API returns a search result build coin object using data retrieved
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
                    buildTile(coinObject, currency); // Build tile in DOM using coin object
                }
            } else { // Creating warning message if no data is found for coin/currency pairing
                searchWarning(`No data for ${coinSeach.toUpperCase()}/${currency.toUpperCase()} !`);
            }
        } catch (e) { // Creating warning message if no data is found for currency searched
            searchWarning(`No data for ${currency.toUpperCase()} markets !`);
            console.log("ERROR", e);
        }
    }
};


const searchForm = document.querySelector("#searchForm");
searchForm.addEventListener('submit', function (e) { // Define what happens when form is submitted
    e.preventDefault(); // Disable default submisson event behaviour
    const coinInput = searchForm.elements.coin; // Get user coin search
    const coinSeach = coinInput.value.toLowerCase();

    const currencyInput = searchForm.elements.currency; // Get user currency search
    const currencySearch = currencyInput.value;
    
    if (coinSeach && currencySearch) { // If user has searched for coin & currency request data for pairing from API
        requestCoinInfo(coinSeach, currencySearch);
    } else { // Create Custom warning messages based on incorrect searches
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

    coinInput.value = ""; // Reset input fields
    currencyInput.value = "";
});
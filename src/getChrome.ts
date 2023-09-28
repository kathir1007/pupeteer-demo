const chrome = require("chrome-aws-lambda");

export const getChrome = async () => {
    let browser = null;
    try {
        browser = await chrome.puppeteer.launch({
            args: chrome.args,
            executablePath: "C:\\puppeteer\\chrome\\win64-1095492",
            ignoreDefaultArgs: ['--disable-extensions'],
            headless: chrome.headless,
            ignoreHTTPSErrors: true,
        });
    } catch (err) {
        console.log("ERROR LAUNCHING CHROME-"+ err);
        console.error(err);
        throw err;
    }

    return browser;
};

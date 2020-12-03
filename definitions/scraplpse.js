const puppeteer = require('puppeteer');

const preparePageForTests = async (page) => {
    const userAgent = 'Mozilla/5.0 (X11; Linux x86_64)' +
        'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';
    await page.setUserAgent(userAgent);
}

async function parseHtml(html) {
    var x = Array.from(html.match(/(\'<p>Website : <a href=\").*/mig));
    var result = Array();
    x.forEach((url) => {
        var u = url.split("=\"")[1].replace("\">' +", "").trim();
        if (result.indexOf(u) < 1) {
            result.push(u);
        }
    });
    console.log(result.length);
    return result;
}
const getLpseURL = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('http://inaproc.id/lpse', { waitUntil: 'networkidle0' });
    const html = await page.content();

    const dataUrl = await parseHtml(html);

    await browser.close();
}

module.exports = {
    getLpseURL
}
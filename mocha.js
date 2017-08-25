var assert = require("assert"),
    test = require("selenium-webdriver/testing"),
    webdriver = require("selenium-webdriver");

test.describe("Enter to Icetex", function() {
    this.timeout(15000);
    var driver;
    test.before(function() {
        driver = new webdriver.Builder()
            .withCapabilities(webdriver.Capabilities.chrome())
            .build();
    });

    test.it("Get the last row", function() {
        driver.get(
            "https://www.icetex.gov.co/dnnpro5/inicio/consultaderesultados.aspx"
        );
        driver.switchTo().frame("dnn_ctr2714_IFrame_htmIFrame");
        driver.findElement(By.name("cedula")).sendKeys("14837069");
        driver
            .findElement({ xpath: "/html/body/center/div/center/form/center/button" })
            .click();

        driver.switchTo().frame(0);
        driver
            .findElement({
                xpath: "/html/body/center/table/tbody/tr[2]/td[2]/table/tbody/tr[4]/td[1]/small/a[2]"
            })
            .click();
        driver.switchTo().defaultContent();
        driver.switchTo().frame("dnn_ctr2714_IFrame_htmIFrame");
        driver.switchTo().frame(0);
        //driver.findElement({ xpath: '/html/body/form/table[2]/tbody/tr[55]' })
        driver
            .findElement({ xpath: "/html/body/form/table[2]/tbody/tr[last()]/td[2]" })
            .getText()
            .then(function(n) {
                assert.equal(n, 'COBRO ADMINISTRATIVO DEVOLUCION');
            });
    });

    test.after(function() {
        driver.quit();
    });
});
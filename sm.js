var fast_csv = require("fast-csv");
var Promise = require("Promise");
var webdriver = require("selenium-webdriver"),
    By = webdriver.By,
    until = webdriver.until;

var driver = new webdriver.Builder().forBrowser("chrome").build();

function readCsv(name) {
    "use strict";
    var tempArray = [];
    return new Promise((resolve, reject) => {
        fast_csv
            .fromPath(name + ".csv", err => {
                if (err) {
                    reject(err);
                }
            })
            .on("data", function(data) {
                tempArray.push(data);
            })
            .on("end", function() {
                console.log("tempArray");
                console.log(tempArray);
                resolve(tempArray);
                console.log("File Read Correctly");
            });
    });
}

function writeCsv(name, content) {
    "use strict";
    return new Promise((resolve, reject) => {
        fast_csv
            .writeToPath(
                name + ".csv",
                content, {
                    headers: [
                        "cedula",
                        "fecha",
                        "estado anterior",
                        "estado",
                        "ano",
                        "semestre",
                        "calendario"
                    ]
                },
                err => {
                    if (err) {
                        reject(err);
                    }
                }
            )
            .on("finish", () => {
                resolve();
                console.log("File Writted Correctly");
            });
    });
}

function getTableData(student) {
    "use strict";
    //fetch data in the row and push it to the repective student
    driver.wait(
        until.elementLocated(
            By.id("/html/body/form/table[2]/tbody/tr[last()]/td[1]")
        ),
        10000,
        "Could not locate data"
    );
    for (var i = 1; i < 7; i++) {
        driver
            .findElement({
                xpath: `/html/body/form/table[2]/tbody/tr[last()]/td[${i}]`
            })
            .getText()
            .then(data => {
                student.push(data);
            });
    }
}

function goIcetex(student) {
    "use strict";
    return new Promise((resolve, reject) => {
        driver.get(
            "https://www.icetex.gov.co/dnnpro5/inicio/consultaderesultados.aspx"
        );
        driver.switchTo().frame("dnn_ctr2714_IFrame_htmIFrame");
        driver.findElement(By.name("cedula")).sendKeys(student[0]);
        driver
            .findElement({
                xpath: "/html/body/center/div/center/form/center/button"
            })
            .click();
        //driver.wait(until.ableToSwitchFrame(0), 1000, 'Could not locate the frame element within the time specified');
        driver.switchTo().frame(0);

        driver
            .findElements({
                xpath: "/html/body/center/table/tbody/tr[2]/td[2]/table/tbody/tr[last()]/td[1]/small/a[2]" //link
            })
            .then(arr => {
                ///html/body / center / table / tbody / tr[2] / td[2] / table / tbody / tr[3] / td[6] / small
                if (arr.length > 0) {
                    arr[0].click();
                    driver.switchTo().defaultContent();
                    // driver.wait(until.elementLocated(By.id('dnn_ctr2714_IFrame_htmIFrame')), 10000, 'Could not locate the frame element within the time specified');
                    driver.switchTo().frame("dnn_ctr2714_IFrame_htmIFrame");
                    driver.switchTo().frame(0);
                }
            });
    }); //end promise
}

function fetchIcetexData(students) {
    "use strict";
    //go to icetex with every student and wait for them to return a promise array  with the results
    return Promise.all(
        students.map(student => {
            return goIcetex(student);
        })
    );
}

readCsv("student2") //students array
    .then(students => {
        "use strict";
        return fetchIcetexData(students); //return students array with icetex info
    })
    .then(result => {
        "use strict";
        writeCsv("students-result", result).then(() => {
            console.log("Finish!");
        });
    });
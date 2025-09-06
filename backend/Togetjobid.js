const { version } = require('chromedriver');
const { Builder, By, Key, until } = require('selenium-webdriver');
const PO_LIST = [
"MA MX NL v01 22 EN pTE ETE U01",
"MA MX NL v01 22 EN pTE ETE U02"
// "MA MX NL v01 22 EN pTE ETE U03",
// "MA MX NL v01 22 EN pTE ETE U04",
// "MA MX NL v01 22 EN pTE ETE U05",
// "MA MX NL v01 22 EN pTE ETE U06",
// "MA MX NL v01 22 EN pTE ETE U07"
 ];



 
(async function openMultipleTabs() {
  const driver = await new Builder().forBrowser('chrome').build();
  const poTabs = {}; // PO name -> tab handle

  try {
    // 1. Login page
    await driver.get('https://cms.hmhco.com/share/page/');

    // Click the SSO login button
    const readingDiv1 = await driver.wait(
      until.elementLocated(By.xpath(`//*[@id="loginSSOContainerDiv"]/div[1]/div`)),
      15000
    );
    await readingDiv1.click();
 // Username & password
    await driver.wait(until.elementLocated(By.id('okta-signin-username')), 10000);
    await driver.findElement(By.id('okta-signin-username')).sendKeys('praveen.mishra@hmhco.com'); // username

    await driver.wait(until.elementLocated(By.id('okta-signin-password')), 10000);
    await driver.findElement(By.id('okta-signin-password')).sendKeys('Aug2025@Edtech'); // password
    await driver.findElement(By.id('okta-signin-submit')).click();

    // Security question (optional)
    try {
      const securityInput = await driver.wait(
        until.elementLocated(By.css('input[type="password"][name="answer"]')),
        8000
      );
      await securityInput.sendKeys('mario');
      const verifyButton = await driver.findElement(By.css('input[type="submit"][value="Verify"]'));
      await verifyButton.click();
      console.log('✅ Security question answered.');
    } catch {
      console.log('ℹ️ Security question not shown.');
    }

    await driver.sleep(4000);
let po
let alldata=[]
    // 2. Open each PO in separate tab and generate CI
    for (let i = 0; i < PO_LIST.length; i++) {  
       po = PO_LIST[i];

      if (i !== 0) {
        await driver.switchTo().newWindow('tab');
        await driver.get('https://cms.hmhco.com/share/page/');
      }

      let input = await driver.wait(
        until.elementLocated(By.xpath('//*[@id="HEADER_SEARCHBOX_FORM_FIELD"]')),
        10000
      );
      await input.clear();
      await input.sendKeys(po);

      await driver.sleep(2000);

      const allElements = await driver.findElements(By.xpath('//*[contains(text(),"' + po + '")]'));
      let clicked = false;
      for (let el of allElements) {
        const text = await el.getText();
        if (text.includes(po)) {
          await el.click();
          console.log(`✅ [${po}] Clicked on matching result.`);
          clicked = true;
          break;
        }
      }
if (!clicked) {
        console.log(`❌ [${po}] No matching result found.`);
      }

      await driver.sleep(1000);

      await driver.executeScript("window.scrollTo(0, document.body.scrollHeight);");
      await driver.sleep(2000);


      const handle = await driver.getWindowHandle();
      console.log(`Opened tab for ${po} with handle: ${handle}`);
      poTabs[po] = handle;
    

    console.log("this is the Potab",poTabs)

// 3. Function to check status & create version
    }
// Function: Check status and create version if success
 
  try {
     for (let i = 0; i < PO_LIST.length; i++) {  
       po = PO_LIST[i];
    await driver.switchTo().window(poTabs[po]);
     const auditLink = await driver.wait(
    until.elementLocated(By.xpath('//div[@class="audit-history"]//a[@title="Audit History"]')),
    10000
  );

  // Wait until visible
  await driver.wait(until.elementIsVisible(auditLink), 10000);

  // Scroll into view
  await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", auditLink);

  // Try clicking
  try {
    await auditLink.click();
    console.log("✅ Audit History clicked normally!");
  } catch (err) {
    console.log("⚠️ Normal click intercepted, using JS...");
    await driver.executeScript("arguments[0].click();", auditLink);
    console.log("✅ Audit History clicked via JS!");
  }

try {
    // Re-locate element every time
    const clickable = await driver.wait(
      until.elementLocated(
        By.xpath("//*[contains(@class,'yui-dt-bd')]//tbody[contains(@class,'yui-dt-data')]/tr[1]/td[last()]/div/a/img")
      ),
      10000
    );

    // Scroll into view
    await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", clickable);

    // Wait until visible and enabled
    await driver.wait(until.elementIsVisible(clickable), 5000);
    await driver.wait(async () => await clickable.isEnabled(), 5000);

    // Try clicking
    try {
      await clickable.click();
      console.log("✅ Clicked normally!");
    } catch (err) {
      console.log("⚠️ Normal click intercepted, using JS...");
      await driver.executeScript("arguments[0].click();", clickable);
      console.log("✅ Clicked via JS!");
    }
  } catch (err) {
    console.error("❌ Element not found:", err.message);
  }

console.log(`✅ [${po}] First row last cell clicked successfully.`);
// this  is  is  help to extract the table data from the platform 
const tableRows = await driver.findElements(By.xpath('//*[@id="auditData"]/table/tbody/tr'));

let tableData = {};
for (let row of tableRows) {
  const cells = await row.findElements(By.tagName('td'));
  if (cells.length >= 3) {
    let key = (await cells[0].getText()).trim();
    let value = (await cells[2].getText()).trim();
    if (key && key !== ":") {
      tableData[key] = value;
    }
  }
}
console.log(`📊 [${po}] Table data:`, tableData);
// Ab tum status check kar sakte ho
const jobID = (tableData["hmh-cms-jobs_cdmJobID"] || "")
console.log(`[${po}] Job ID: ${jobID}`);
const jobSize = (tableData["hmh-cms-jobs_publishSize"] || "")
console.log(`[${po}] Job Size: ${jobSize}`);
const status = (tableData["hmh-cms-jobs_cdmJobStatus"] || "")
const endTime = (tableData["endTime"] || "")
const startTime = (tableData["startTime"] || "")
console.log(`[${po}] Start Time: ${startTime}`);
console.log(`[${po}] End Time: ${endTime}`);        
console.log(`[${po}] Status: ${status}`);

const start = new Date(startTime);
const end = new Date(endTime);

// Difference in milliseconds
const diffMs = end - start;

// Convert to minutes & seconds
const diffMins = Math.floor(diffMs / 1000 / 60);
const diffSecs = Math.floor((diffMs / 1000) % 60);
console.log(`⏱ Total time taken: ${diffMins} minutes ${diffSecs} seconds`);

const poData = {
 po: { jobId: jobID, jobSize: jobSize },
}
alldata.push(poData)
}
  let okButton = await driver.wait(
      until.elementLocated(By.xpath("//div[@class='ft']//button[normalize-space(.)='Ok']")),
      10000
    );

    // Wait until visible
    await driver.wait(until.elementIsVisible(okButton), 10000);

    // Scroll into view
    await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", okButton);

    // Try normal click
    try {
      await okButton.click();
      console.log("✅ Ok button clicked normally!");
    } catch (err) {
      console.log("⚠️ Normal click intercepted, using JS click...");
      await driver.executeScript("arguments[0].click();", okButton);
      console.log("✅ Ok button clicked via JS!");
    }

    let okButton1 = await driver.wait(
      until.elementLocated(By.xpath("//div[@class='bdft']//button[normalize-space(.)='Ok']")),
      10000
    );

    // Wait until visible
    await driver.wait(until.elementIsVisible(okButton1), 10000);

    // Scroll into view
    await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", okButton1);

    // Try normal click
    try {
      await okButton1.click();
      console.log("✅ Ok button clicked normally!");
    } catch (err) {
      console.log("⚠️ Normal click intercepted, using JS click...");
      await driver.executeScript("arguments[0].click();", okButton1);
      console.log("✅ Ok button clicked via JS!");
    }

 
  } catch (err) {
    // console.error(`❌ [${po}] Error: ${err.message}`);
  
}

 } catch (err) {
    console.error("❌ Error:", err);
  }
})();

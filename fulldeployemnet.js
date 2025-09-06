// from   here this   high  demand  for   automation  in  content  generation  and  management  is  driving  the  need  for  more  sophisticated  tools  and  platforms.  As  a  result,  we  can  expect  to  see  continued  investment  in  AI-powered  solutions  that  streamline  workflows,  enhance  collaboration,  and  improve  overall  efficiency  in  the  content  creation  process.

const { version } = require('chromedriver');
const { Builder, By, Key, until } = require('selenium-webdriver');
const PO_LIST = [
"MA MX NL v01 22 EN pTE ETE EM",
"MA MX NL v01 22 EN pTE ETE FM",
// "MA MX NL v01 22 EN pTE ETE U01",
// "MA MX NL v01 22 EN pTE ETE U02",
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

    // 2. Open each PO in separate tab and generate CI
    for (let i = 0; i < PO_LIST.length; i++) {  
      const po = PO_LIST[i];

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
// fromm  here  the code is start for  generate the CI  on the cms

      try {
        const span = await driver.wait(
          until.elementLocated(By.xpath('//span[contains(text(), "Generate ePub (CI)")]')),
          10000
        );
        const aTag = await span.findElement(By.xpath('ancestor::a'));
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", aTag);
        await driver.wait(until.elementIsVisible(aTag), 10000);
        await driver.wait(async () => await aTag.isEnabled(), 10000);
        await driver.executeScript("arguments[0].click();", aTag);
        console.log(`📚 [${po}] Clicked on Generate ePub (CI).`);
        await driver.sleep(2000);
      } catch (error) {
        console.error(`❌ [${po}] Failed to click Generate ePub (CI):`, error);
      }

      const handle = await driver.getWindowHandle();
      console.log(`Opened tab for ${po} with handle: ${handle}`);
      poTabs[po] = handle;
    }

    console.log("this is the Potab",poTabs)

// 3. Function to check status & create version
const completedPOs = new Set();
const completedversion = new Set();
const MAX_ATTEMPTS = 5;

// Function: Check status and create version if success
async function checkAndVersionPO(po) {
  try {
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
const status = (tableData["hmh-cms-habitat-jobs_ciEpubJobStatus"] || "")
console.log(`[${po}] Status: ${status}`);
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

if (status === "success") {
  // version creation wala code
} else if (status === "failed") {
  // alarm ya log
}
 if (status === 'success') {
      console.log("this is right")
       // OK button
      // OK button by class
     


      // Click Versions
  const versionBtn = await driver.wait(
  until.elementLocated(By.xpath("//*[normalize-space(text())='Version']")),
  20000
);

// Scroll into view
await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", versionBtn);

// Force click with JS (ignores overlays)
await driver.executeScript("arguments[0].click();", versionBtn);

console.log("✅ Version button clicked via JS executor");


 await driver.sleep(2000);
      // Input box
      const input = await driver.wait(
        until.elementLocated(By.xpath('//*[@id="comment"]')),
        10000
      );
      await input.clear();
      await input.sendKeys('Epub update');

      // OK button
      let saveButton = await driver.wait(
  until.elementLocated(By.xpath("//div[@class='ft']//button[normalize-space(.)='Save']")),
  10000
);

// Wait until visible
await driver.wait(until.elementIsVisible(saveButton), 10000);

// Scroll into view
await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", saveButton);

// Try normal click
try {
  await saveButton.click();
  console.log("✅ Save button clicked normally!");
  completedversion.push(po);

} catch (err) {
  console.log("⚠️ Normal click intercepted, using JS click...");
  await driver.executeScript("arguments[0].click();", saveButton);
  console.log("✅ Save button clicked via JS!");
}


      console.log(`✅ [${po}] Version created.`);
      completedPOs.add(po); // mark done
    } 
    else if (status === 'failed') {
      console.log(`❌ [${po}] FAILED status!`);
      completedPOs.add(po); // mark done, no more checking
    } 
    else {

      console.log(`⌛ [${po}] Still pending, will check next attempt...`);
       // OK button
      // Not adding to completed, so will be checked again
    }
  } catch (err) {
    console.error(`❌ [${po}] Error: ${err.message}`);
  }
}

// MAIN LOOP
(async () => {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    console.log(`🚀 Attempt ${attempt} started...`);

    for (let po of Object.keys(poTabs)) {
      if (completedPOs.has(po)) {
        console.log(`⏩ [${po}] Already done, skipping.`);
        continue;
      }
      await checkAndVersionPO(po);
    }

// if (completedPOs.size === Object.keys(poTabs).length) {
//   console.log(`✅ All POs finished (success or fail). Starting publish monitor...`);

//   let maxChecks = 5;
//   for (let attempt = 1; attempt <= maxChecks; attempt++) {
//     console.log(`🔄 Publish check attempt ${attempt}/${maxChecks}`);

//     for (let po of Object.keys(poTabs)) {
//       await driver.switchTo().window(poTabs[po]);
//       await driver.navigate().refresh();
//       await driver.sleep(2000);

//       try {
//         // panel-body wait karke lo
//         const panel = await driver.wait(
//           until.elementLocated(By.css("div.panel-body")),
//           10000
//         );

//         // current-version wait karke lo
//         const currentVersion = await driver.wait(
//           until.elementLocated(By.css("div.current-version.version-list")),
//           10000
//         );

//         const text = await currentVersion.getText();
//         console.log(`[${po}] Version container text:`, text);

//         const match = text.match(/(\d+)\s*min\s*ago/);
//         if (match) {
//           const minutesAgo = parseInt(match[1]);
//           if (minutesAgo >= 2 && minutesAgo <= 20) {
//             // ✅ condition match → publish
//             const publishBtn = await driver.wait(
//               until.elementLocated(By.xpath("//div[@class='panel-body']//button[contains(text(),'Publish')]")),
//               10000
//             );
//             await driver.wait(until.elementIsVisible(publishBtn), 5000);
//             await publishBtn.click();

//             console.log(`📢 [${po}] Publish clicked (version ${minutesAgo} min ago).`);
//           } else {
//             console.log(`⏩ [${po}] Version is ${minutesAgo} min ago, skipping.`);
//           }
//         } else {
//           console.log(`❌ [${po}] No version timestamp found.`);
//         }
//       } catch (err) {
//         console.error(`⚠️ [${po}] Error while checking publish:`, err.message);
//       }
//     }

//     if (attempt < maxChecks) {
//       console.log(`⏳ Sleeping 6 min before next check...`);
//       await driver.sleep(6 * 60 * 1000);
//     }
//   }

//   console.log(`🎉 Publish monitor finished.`);
// }



    if (attempt < MAX_ATTEMPTS) {
      console.log(`⌛ Waiting 6 min before next attempt...`);
      await driver.sleep(6 * 60 * 1000);
    }
  }
 await driver.sleep(30000);
console.log(`🏁 All attempts done. Completed version:`, Array.from(completedversion));
const Versioned = new Set(
completedPOs.filter(po => completedversion.has(po))
); console.log(`❌ These POs did not get versioned:`, Array.from(Versioned));
const filteredObj = Object.fromEntries(
  Object.entries(poTabs).filter(([key]) => Versioned.includes(key))
);
console.log("this is the filtered obj",filteredObj)

let allPublished = false;
let publishedPOs = new Set(); // Yahan store hote hai published POs
for (let attempt = 1; attempt <= maxChecks; attempt++) {
  console.log(`🔄 Publish check attempt ${attempt}/${maxChecks}`);
  let currentAttemptPublished = 0;
  
  for (let po of Object.keys(ptabs)) {
    // 🚫 EXIT LOGIC 1 - Skip already published POs
    if (publishedPOs.has(po)) {
      console.log(`⏩ [${po}] Already published, skipping...`);
      continue; // Ye PO skip kar do
    }
    console.log(`🔍 Processing tab: ${po}`);
    
    try {
      // Switch to tab
      await driver.switchTo().window(ptabs[po]);
      console.log(`✅ Switched to tab: ${po}`);
      
      // Refresh and wait for stability
      await driver.navigate().refresh();
      console.log(`🔄 Page refreshed for: ${po}`);
      
      // Wait longer for complete page load
      await driver.sleep(5000);
      
      // Method 1: Try to get time text using fresh selectors each time
      let timeText = null;
      let retryCount = 0;
      const maxRetries = 5;
      
      while (retryCount < maxRetries && !timeText) {
        try {
          console.log(`🔍 Attempt ${retryCount + 1} to find time text for ${po}`);
          
          // Wait for page to be fully loaded
          await driver.wait(async () => {
            const readyState = await driver.executeScript('return document.readyState');
            return readyState === 'complete';
          }, 10000);
          
          // Use executeScript to safely get the text without storing element references
          timeText = await driver.executeScript(`
            try {
              const versionBlock = document.querySelector('div.panel-body div.current-version.version-list');
              if (!versionBlock) return null;
              
              const timeSpan = versionBlock.querySelector('div.version-details-right > span');
              if (!timeSpan) return null;
              
              return timeSpan.textContent || timeSpan.innerText;
            } catch (e) {
              return null;
            }
          `);
          
          if (timeText) {
            console.log(`✅ Got time text for ${po}: "${timeText}"`);
            break;
          } else {
            console.log(`❌ No time text found for ${po}, retrying...`);
            retryCount++;
            await driver.sleep(2000);
          }
          
        } catch (err) {
          console.log(`⚠️ Retry ${retryCount + 1} failed for ${po}: ${err.message}`);
          retryCount++;
          await driver.sleep(2000);
        }
      }
      
      if (!timeText) {
        console.log(`❌ [${po}] Failed to get time text after ${maxRetries} attempts`);
        continue;
      }

      console.log("⏱ Time text:", timeText);
      const match = timeText.match(/(\d+)\s*min\s*ago|(\d+)\s*day\s*ago|about a day ago/i);;
      console.log("⏱ Time match:", match);

      if (match) {
        const minutesAgo = parseInt(match[1], 10);
        console.log(`⏰ Version is ${minutesAgo} minutes ago`);

        if (true) {
          console.log(`✅ Time window match for ${po} (${minutesAgo} min ago)`);
          
          // Method 2: Use JavaScript to click elements instead of Selenium
          let clickSuccess = false;
          let clickRetryCount = 0;
          
          while (clickRetryCount < 3 && !clickSuccess) {
            try {
              console.log(`🖱️ Click attempt ${clickRetryCount + 1} for ${po}`);
              
              // Use JavaScript to find and click the 3rd action link
              const jsClickResult = await driver.executeScript(`
                try {
                  const versionBlock = document.querySelector('div.panel-body div.current-version.version-list');
                  if (!versionBlock) return {success: false, message: 'Version block not found'};
                  
                  const aTags = versionBlock.querySelectorAll('div.version-panel-right span.actions a');
                  if (aTags.length < 3) return {success: false, message: 'Less than 3 action links found: ' + aTags.length};
                  
                  // Scroll the 3rd link into view
                  aTags[2].scrollIntoView({block: 'center'});
                  
                  // Small delay for scroll
                  await new Promise(resolve => setTimeout(resolve, 500));
                  
                  // Click the 3rd link
                  aTags[2].click();
                  
                  return {success: true, message: '3rd link clicked'};
                } catch (e) {
                  return {success: false, message: e.message};
                }
              `);
              
              if (jsClickResult.success) {
                console.log("📢 3rd <a> clicked successfully via JavaScript!");
                clickSuccess = true;
                
                // Wait for OK button and click it with JavaScript
                await driver.sleep(2000);
                
                let okClickSuccess = false;
                let okRetryCount = 0;
                
                while (okRetryCount < 3 && !okClickSuccess) {
                  try {
                    const okClickResult = await driver.executeScript(`
                      try {
                        const okButton = document.querySelector("div.ft button");
                        if (!okButton) return {success: false, message: 'OK button not found'};
                        
                        // Check if button text contains 'OK'
                        const buttonText = okButton.textContent || okButton.innerText;
                        if (!buttonText.includes('OK')) return {success: false, message: 'Button text does not contain OK: ' + buttonText};
                        
                        // Scroll into view
                        okButton.scrollIntoView({block: 'center'});
                        
                        // Small delay
                        await new Promise(resolve => setTimeout(resolve, 500));
                        
                        // Click
                        okButton.click();
                        
                        return {success: true, message: 'OK button clicked'};
                      } catch (e) {
                        return {success: false, message: e.message};
                      }
                    `);
                    
                    if (okClickResult.success) {
                      console.log("✅ OK button clicked successfully via JavaScript!");
                      okClickSuccess = true;
                      
                      // Mark as published
                      publishedPOs.add(po);
                      currentAttemptPublished++;
                      console.log(`🎯 [${po}] SUCCESSFULLY PUBLISHED!`);
                    } else {
                      console.log(`⚠️ OK click attempt ${okRetryCount + 1} failed: ${okClickResult.message}`);
                      okRetryCount++;
                      await driver.sleep(1000);
                    }
                  } catch (okErr) {
                    console.log(`❌ OK click error on attempt ${okRetryCount + 1}: ${okErr.message}`);
                    okRetryCount++;
                    await driver.sleep(1000);
                  }
                }
                
                if (!okClickSuccess) {
                  console.log(`❌ Failed to click OK button after ${okRetryCount} attempts`);
                }
                
              } else {
                console.log(`⚠️ Click attempt ${clickRetryCount + 1} failed: ${jsClickResult.message}`);
                clickRetryCount++;
                await driver.sleep(1000);
              }
              
            } catch (clickErr) {
              console.log(`❌ Click error on attempt ${clickRetryCount + 1}: ${clickErr.message}`);
              clickRetryCount++;
              await driver.sleep(1000);
            }
          }
          
          if (!clickSuccess) {
            console.log(`❌ Failed to click 3rd link after ${clickRetryCount} attempts`);
          }

          console.log(`📢 [${po}] Publish process completed (version ${minutesAgo} min ago).`);
        } else {
          console.log(`⏩ [${po}] Version is ${minutesAgo} min ago, outside window (${minWait}-${maxWait} min).`);
        }
      } else {
        console.log(`❌ [${po}] No valid timestamp found in: "${timeText}"`);
      }
      
    } catch (err) {
      console.error(`⚠️ [${po}] Critical error:`, err.message);
      
      // More detailed error logging
      if (err.message.includes('stale element')) {
        console.log(`🔄 [${po}] Stale element - this should be fixed with JS approach`);
      } else if (err.message.includes('no such window')) {
        console.log(`❌ [${po}] Tab/window closed or invalid`);
      } else if (err.message.includes('timeout')) {
        console.log(`⏰ [${po}] Timeout - page may be loading slowly`);
      } else {
        console.log(`🚨 [${po}] Unexpected error type: ${err.name}`);
      }
    }
  }
  
  // Check if all POs are published
  const totalPOs = Object.keys(ptabs).length;
  console.log(`📊 Status: ${publishedPOs.size}/${totalPOs} POs published`);
  
  if (publishedPOs.size === totalPOs) {
    console.log(`🎉 ALL ${totalPOs} POs PUBLISHED! Stopping early at attempt ${attempt}/${maxChecks}`);
    allPublished = true;
    break;
  }
  
  if (currentAttemptPublished > 0) {
    console.log(`✅ This attempt published ${currentAttemptPublished} POs`);
  } else {
    console.log(`⏳ No POs published in this attempt`);
  }

  if (attempt < maxChecks) {
    console.log(`⏳ Sleeping 6 min before next check...`);
    await driver.sleep(6 * 60 * 1000);
  }
}

if (allPublished) {
  console.log("🏁 SUCCESS: All POs published successfully!");
} else {
  console.log(`🏁 COMPLETED: ${publishedPOs.size}/${Object.keys(ptabs).length} POs published after ${maxChecks} attempts`);
}

console.log("🎯 Final published POs:", Array.from(publishedPOs));





console.log("🏁 All publish checks completed!");

})();


} catch (err) {
    console.error("❌ Error:", err);
  }
})();
























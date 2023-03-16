import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class AppService {
  
  async executeData(requestBody) {
    console.log(`Form Fill called`);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');
    await page.goto(requestBody.url, {
      waitUntil: 'networkidle0'
    });
    await page.setCacheEnabled(false); // Disable caching
    await page.reload({ waitUntil: 'networkidle0' }); // Reload the page to clear the cache

    await page.screenshot({path: "Main_Page.png", fullPage: true});
    
    if(requestBody.trusteeConsentButton){
      await clickTrusteeButton(requestBody.trusteeConsentButton,page);
    }
    await fillDropdownType(requestBody.dropdownType, page);
    await fillInputType(requestBody.inputType, page);
    await fillCheckboxType(requestBody.checkboxType, page);
    if(requestBody.submitButton === '1'){
      await clickSumbitButton(page);
    }else{
      await clickSumbitButtonType(requestBody.submitButtonType,page);
    }

    setTimeout(async () => {
      await page.screenshot({path: "After-submitting-buttonType.png", fullPage: true});
    }, 5000);

    await page.waitForNavigation({ timeout: 50000 });

    page.on('navigation' as keyof puppeteer.PageEventObject, (navigationEvent) => {
      console.log('Page navigated to:', navigationEvent);
    });
  
    let successMessage;

    setTimeout(async () => {
      await page.screenshot({path: "After-submitting-buttonType2.png", fullPage: true});
      successMessage = await page.$eval(requestBody.successTextElement, (element) => element.textContent);
      console.log("Success Message is:" +successMessage);
    }, 2000);

    // try {
    //   await Promise.all([
    //     page.waitForNavigation({ timeout: 30000 }),
    //     page.waitForSelector(requestBody.successTextElement, { visible: true, timeout: 30000 })
    //   ]);
    //   const successMessage = await page.$eval(requestBody.successTextElement, (element) => element.textContent);
    //   console.log("Sucess Message is:" +successMessage)
    //   return successMessage;
    // } catch (error) {
    //   console.error('Error:', error);
    //   // Take some alternative action here, such as retrying the navigation or closing the browser
    // }

    // await page.reload({ waitUntil: 'networkidle0' });
    // Assert the success message in an h3 tag
    console.log("Success Message is:" +successMessage);
    return successMessage;
  }

  getHello(): string {
    return 'Hello World!';
  }


  async execute() {
    const url = 'https://www.servicenow.com/contact-us.html';
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');
    await page.setCacheEnabled(false); // Disable caching
    await page.reload({ waitUntil: 'networkidle0' }); // Reload the page to clear the cache
    await page.goto(url, {
      waitUntil: 'networkidle0'
    });

    await page.reload({ waitUntil: 'networkidle0' });
    await page.screenshot({path: "Before-login.png", fullPage: true},);
    await servicenowLoginForm(page);
    await page.screenshot({path: "After-submitting-data.png", fullPage: true});
    await browser.close();
  }
}

async function servicenowLoginForm(page) {
  const randonNumber = Math.random();
  const mail = await page.$('[name="email"]');
  await mail.type(`Sample_${randonNumber}@gmail.com`);

  const [continuebtn] = await page.$x("//button[contains(., 'Continue')]");
  if (continuebtn) {
      // await continuebtn.click();
      continuebtn.evaluate(b => b.click());
  }

  const iwantsto = await page.$('[name="Iwouldliketo"]');
  await iwantsto.select("Learn more about specific ServiceNow applications");

  const iAmIntresterIn = await page.$('[name="iAmInterestedIn"]');
  await iAmIntresterIn.select("Field Service");
  
  const firstName = await page.$('[name="firstname"]');
  await firstName.type(`firstname_${randonNumber}`);
    
  const lastname = await page.$('[name="lastname"]');
  await lastname.type(`lastname_${randonNumber}`);

  const company = await page.$('[name="company"]');
  await company.type(`company_${randonNumber}`);

  const businessPhone = await page.$('[name="businessPhone"]');
  await businessPhone.type(`12345678`);

  const jobLevel = await page.$('[name="jobLevel"]');
  await jobLevel.select("Developer/Engineer");

  const jobRole = await page.$('[name="jobRole"]');
  await jobRole.select("Cloud Operations");

  // const jobFunction = await page.$('[name="jobFunction"]');
  const jobFunction = await page.$('[id="field12"]');

  await jobFunction.select("Cloud Operations");
  await page.screenshot({path: "After-filling-data1.png", fullPage: true},);


  const country = await page.$('[name="country"]');
  await country.select("IN");
  
  const state = await page.$('[name="state"]');
  await state.select("Tamil Nadu");
  
  await page.screenshot({path: "After-filling-data2.png", fullPage: true},);

  
  const [contact] = await page.$x("//button[contains(., 'Contact Sales')]");
  if (contact) {
      // await contact.click();
      contact.evaluate(b => b.click());
  }

  await page.waitForNavigation({
    waitUntil: 'networkidle0',
  });
  

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');
  await page.setCacheEnabled(false); // Disable caching
  await page.reload({ waitUntil: 'networkidle0' }); // Reload the page to clear the cache

  await page.screenshot({path: "After-submitting-data.png", fullPage: true});

  const successText = 'Thank you!';
  await page.waitForSelector(`:contains("${successText}")`);
  expect(await page.$eval('body', el => el.innerText)).toContain(successText); 
  return page;
}


async function loginForm(page: any) {
  await page.type('#ctl00_CPHContainer_txtUserLogin', 'Kathir_9909');
  await page.type('#ctl00_CPHContainer_txtPassword', '123456');
  await page.screenshot({path: "After-filling-data.png", fullPage: true});
  // const btn = await page.$('input[name="ctl00$CPHContainer$btnLoginn"]');
  await page.click('input[id="ctl00_CPHContainer_btnLoginn"]', {
    waitUntil: 'networkidle0'
  });
  // await btn?.click();
  return page;
}

async function fillInputType(inputType: any,page: any) {
  console.log('fillInputType Called');
  const entries = Object.entries(inputType);
  for (const [key, value] of entries) {
    // await page.type(`input[name=${key}]`, `${value}`);
    const inputField = await page.$(`[name=${key}]`);
    if(inputField)
    await inputField.type(`${value}`);
  }
  await page.screenshot({path: "After-submitting-inputType.png", fullPage: true});
  return page;
}

async function clickSumbitButton(page: any){
  console.log('Clicking Submit button');
  const summitbtn = await page.$(`[type="SUBMIT"]`);
  if (summitbtn) {
    await page.screenshot({path: "Click_submit.png", fullPage: true});
    console.log('Submitbutton Valid');
      summitbtn.evaluate(b => b.click());
  }
  setTimeout( async () => {
    await page.screenshot({path: "Click_submit.png", fullPage: true});
  }, 10000);
}

async function clickSumbitButtonType(btnSelector: any, page: any){
  console.log('Clicking Submit button for '+btnSelector);
  // const summitbtn = await page.$(`[type="SUBMIT"]`);
  // await page.waitForXPath(`//button[contains(., ${btnSelector})]`);
  // const [summitbtn] = await page.$x(`//button[contains(., ${btnSelector})]`);
  // const summitbtn = await page.
  // const buttonText = await page.evaluate(element => element.textContent, summitbtn);
  // console.log('Selected button is : '+buttonText); 
  // if (summitbtn) {
  //   console.log('Submitbutton Valid');
  //     summitbtn.evaluate(b => b.click());
  // }

  const selector = `.green-button submit reg-form-mobile ladda-button`;
  if(selector){
    await page.waitForSelector(selector);
    await page.click(selector);
  }
  await page.screenshot({path: "Click_submit.png", fullPage: true});
}

async function fillButtonType(buttonType: any,page: any) {
  console.log('fillButtonType Called');

    //service now
  // const selector = '#truste-consent-button';
  // if(selector){
  //   await page.waitForSelector(selector);
  //   await page.click(selector);
  // }


  //Servicenow
  // const [summitbtn] = await page.$x("//button[contains(., 'Contact Sales')]");
  // if (summitbtn) {
  //     // await contact.click();
  //     console.log('submit button available'+JSON.stringify(summitbtn))
  //     summitbtn.evaluate(b => b.click());
  // }

  const entries = Object.entries(buttonType);
  for (const [key, value] of entries) {
    console.log(`Button click for ${key}: ${value}`);
      const [summitbtn] = await page.$x(`//button[contains(., ${key})]`);
      if (summitbtn) {
          // await continuebtn.click();
          summitbtn.evaluate(b => b.click());
      }
  }
  return page;
}

async function fillDropdownType(inputType: any,page: any) {
  console.log('fillDropdownType Called');
  const entries = Object.entries(inputType);
  for (const [key, value] of entries) {
    // page.waitForNavigation({ waitUntil: 'networkidle0' })
    await page.select(`select[name=${key}]`, `${value}`);
  }
  await page.screenshot({path: "After-submitting-dropdownType.png", fullPage: true});
  return page;
}

async function fillCheckboxType(checkfield: any,page: any){
  const entries = Object.entries(checkfield);
  for (const [key, value] of entries) {
    let checkbox;
    if(key){
      checkbox = await page.$(`input[type="checkbox"][id=${key}]`);
    }else{
      checkbox = await page.$(`input[type="checkbox"][name=${value}]`);
    }
    if (checkbox) {
        checkbox.evaluate(b => b.click());
    }
  }
  await page.screenshot({path: "After-check-checkbox.png", fullPage: true});
}

async function clickTrusteeButton(trusteButton: any, page: puppeteer.Page) {
  console.log('clickTrusteeButton called');
  const selector = `#${trusteButton}`;
  if(selector){
    await page.waitForSelector(selector);
    await page.click(selector);
  }
  return page;
}

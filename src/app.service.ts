import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class AppService {
  
  async executeData(requestBody) {
    console.log(`Form Fill called`);
    let browser;
    try{
      //to check running on lambda or not
      // const path = await chromium.executablePath;
      const executablePath = "C:\\Users\\Kathiresan S\\AppData\\Local\\Google\\Chrome SxS\\Application\\chrome.exe";
      console.log('chromium.executablePath is:'+executablePath);
      // if(false){
      //   console.log('Serverless flow is running');
      //   browser = await chromium.puppeteer.launch({
      //     args: chromium.args,
      //     defaultViewport: chromium.defaultViewport,
      //     executablePath: executablePath,
      //     headless: true,
      //     ignoreHTTPSErrors: true,
      //   }
      //   );
      // }else{
      //   console.log('Normal flow is running');
      //   browser = await puppeteer.launch();
      // }

      browser = await puppeteer.launch();

      console.log('Browser object is: '+ browser);
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');
      await page.goto(requestBody.url, {
        waitUntil: 'networkidle0'
      });
      // await page.setCacheEnabled(false); // Disable caching
      // await page.reload({ waitUntil: 'networkidle0' }); // Reload the page to clear the cache
  
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
  
      // page.on('navigation' as keyof puppeteer.PageEventObject, (navigationEvent) => {
      //   console.log('Page navigated to:', navigationEvent);
      // });
    
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
    }catch(error){
      console.log('Exception Happened'+error);
      return error;
    }finally {
      if (browser !== null && browser !== 'undefined') {
        await browser.close();
      }
    }
  }

  getHello(): string {
    return 'Hello World!';
  }


  // async execute() {
  //   const url = 'https://www.servicenow.com/contact-us.html';
  //   const browser = await chromium.puppeteer.launch();
  //   const page = await browser.newPage();
  //   await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');
  //   await page.setCacheEnabled(false); // Disable caching
  //   await page.reload({ waitUntil: 'networkidle0' }); // Reload the page to clear the cache
  //   await page.goto(url, {
  //     waitUntil: 'networkidle0'
  //   });

  //   await page.reload({ waitUntil: 'networkidle0' });
  //   await page.screenshot({path: "Before-login.png", fullPage: true},);
  //   await page.screenshot({path: "After-submitting-data.png", fullPage: true});
  //   await browser.close();
  // }
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

async function clickTrusteeButton(trusteButton: any, page: any) {
  console.log('clickTrusteeButton called');
  const selector = `#${trusteButton}`;
  if(selector){
    await page.waitForSelector(selector);
    await page.click(selector);
  }
  return page;
}



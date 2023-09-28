import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import axios from 'axios';
// import * as puppeteer from 'puppeteer-core';
// const chromium = require("@sparticuz/chromium");


// import {assert } from 'assert';
import ImageKit from "imagekit";
const AWS = require("aws-sdk");
const s3 = new AWS.S3({
  endpoint: 'http://localhost:4566',
  s3ForcePathStyle: true
});

@Injectable()
export class FormfillserviceService {

  async formFilling1(){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Load the local HTML file using a file:// URL
    const filePath = 'F:\\Real projects\\sample_puppeteer\\sample.html';
    await page.goto(filePath);
    let a = "372431_583698pi_372431_583698";

    const firstNameInput = await page.$(`[id="${a}"]`);
    const lastNameInput = await page.$('[id="2ndField"]');
    const emailInput = await page.$('[id="3email"]');
    const usernameInput = await page.$('[id="4user_name"]');
  
    if (firstNameInput && lastNameInput && emailInput && usernameInput) {
      // You can interact with the found elements here
      await firstNameInput.type('John55'); // Fill in the First Name field
      await lastNameInput.type('Doe');  // Fill in the Last Name field
      await emailInput.type('john.doe@example.com');  // Fill in the Email field
      await usernameInput.type('johndoe123'); // Fill in the Username field
  
      // Submit the form (if necessary)
      // await page.click('input[type="submit"]');
    }
  
    // Take a screenshot (optional)
    await page.screenshot({ path: 'screenshot_sampe.png' });
  
    // You can add more test operations here
  
    await browser.close();
  }
    async formFilling(event){
      console.log(event.Records.size)
        for(const data of event.Records){
          console.log(`Requestbody is ${data}`);
          await FormFilling(data.body);
        }
      }

}

export async function FormFilling(event) {
  console.log(`Form Fill called with`, event);
  let isSuccess = false;
  const browser = await puppeteer.launch({
    // defaultViewport: chromium.defaultViewport,
    executablePath: 'C:\\ASUS\\Thorium_AVX2_114.0.5735.134\\BIN\\thorium.exe',
    headless: true,
    ignoreHTTPSErrors: true,
  });
  let screenshot;
  let response;
  const randomId = Math.random();
  const page = await browser.newPage();
  const ver = await browser.version();
  console.log('Browser version:', ver);
  // event = JSON.parse(event);
  const URL = event.url;
  console.log('url is', URL);
  const timeStamp = new Date();
  let requestBody = {};

  const { jobId, parentId, config, url, tiggeredAt } = event; 
  const { formFields, version }  = config; 

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');
  await page.goto(URL, {
    waitUntil: 'networkidle0',
    timeout:60000
  });
  const successUrl = event.config.successConfig;
  let selectorsNotFound = [];
  try{
    // page.on('response', response => {
    //   console.log('Response is and status is====',response.url(), response.status());
    // });
    console.log('page object before form fill',page);
    const formData = event.config.formFields;
    for(const data of formData){
      console.log(`key is ${data.selector} and value is ${data.value}`);
      selectorsNotFound = await autoFormFilling(page, data.selector, data.value, selectorsNotFound);
    }
    console.log('selectorsNotFound-', selectorsNotFound);

    if(selectorsNotFound.length > 0){
      throw new Error(`Could not find elements with selectors: ${selectorsNotFound} Please provide a valid selectors for those fields`);
    }
    // await page.waitForNavigation({waitUntil: 'networkidle0',timeout:60000});
    await page.waitForNavigation({waitUntil: 'networkidle0'});
    console.log('Page Navigated');
    const currentUrl = await page.url();
    if (currentUrl === successUrl) {
      isSuccess = true;
      console.log('The navigated URL matches the given URL.');
    } else {
      isSuccess = false;
      console.log('The navigated URL does not match the given URL.');
    }

  }catch(error){
    const currentUrl = await page.url();
    console.log('Exception Happened '+error);
    if (currentUrl === successUrl) {
      isSuccess = true;
      console.log('The navigated URL matches the given URL.');
    } else {
      isSuccess = false;
      console.log('The navigated URL does not match the given URL.');
    }

  };

  if(isSuccess){
    console.log('SUCCESS config');
    let imageResult;
    console.log('page object after form fill',page);
    console.log('page.viewport().width',page.viewport().width);
    console.log('page.isClosed()',page.isClosed());

    if(page.viewport().width !== 0 && !page.isClosed()){
      screenshot = await page.screenshot({path: 'success.png', fullPage: true});
      imageResult = await uploadImageToS3(screenshot, `${timeStamp.toISOString()}_success.png`,event);
    }
    requestBody = {
      result: "SUCCESS",
      outputFile: imageResult,
      parentId: event.parentId,
      accountId: event.accountId,
      url: event.url,
      configName: event.configName,
      mailId: event.mailId
    }
    console.log('requestBody----',requestBody);
  }else {
    console.log('FAILURE config');
    let imageResult
    if(page.viewport().width !== 0 && !page.isClosed()){
      screenshot = await page.screenshot({path: `failure.png`, fullPage: true});
      const imageResult = await uploadImageToS3(screenshot, `${timeStamp.toISOString()}failure.png`, event);
    }
    requestBody = {
      result: "FAILURE",
      outputFile: imageResult,
      parentId: event.parentId,
      accountId: event.accountId,
      url: event.url,
      configName: event.configName,
      mailId: event.mailId,
      failureReason: `Could not find elements with selectors: ${selectorsNotFound} Please provide a valid selectors for those fields`
    }
    console.log('requestBody----',requestBody);
  }
    
  console.log('Request body',requestBody);

  const taskId = `${event.jobId}::${event.taskId}`;

  const { data, status } = await axios.patch(
    `http://localhost:9090/wh/task/${taskId}`,
    requestBody,
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    },
  );
  console.log('Response from POST call === ',data, status);
  await browser.close();

  console.log(`Form Fill Completed`);
  return response;
}

function escapeSelector(selector) {
  // Replace any characters that are not valid in CSS selectors with their escaped counterparts
  return selector.replace(/[^a-zA-Z0-9_-]/g, '\\$&');
}

export async function autoFormFilling(page, selector, value, selectorsNotFound) {
  let element;
  let tempselector = selector.replace(/^#/, '');
  var startsWithNumber = /^\d/.test(tempselector);
  if(startsWithNumber && selector.includes('#')){
    // element = await page.evaluate(tempselector => {
    //   return document.getElementById(tempselector);
    // }, tempselector);
    //  `#${CSS.escape(selector)}`
    // selector = escapeSelector(tempselector);
    // const firstNameInput = await page.$(`[id="${a}"]`);

    // await page.waitForSelector('[id="372431_583698pi_372431_583698"]');
    // const frame = page.frames().find(frame => frame.name() === 'iframeName'); // Replace 'iframeName' with the actual iframe name or index
    // await frame.waitForSelector('[id="372431_583698pi_372431_583698"]');
    element = await page.$(`[id="372431_583698pi_372431_583698"]`);
  }else {
    element = await page.$(selector);
  }
    if (element) {
      const tagName = await element.evaluate(node => node.tagName);
      console.log('inputType is',tagName);
      switch (tagName) {
        case 'INPUT':
          const inputType = await element.evaluate(node => node.type);
          console.log('inputType is',inputType);
          switch (inputType) {
            case 'checkbox':
              await element.evaluate(b => b.click());
              break;
            case 'radio':
              await element.click();
              break;
            case 'date':
              await element.type(value);
              break;
            case 'time':
              await element.type(value);
              break;
            case 'text':
              await element.type(value);
              break;
            case 'submit':
              await element.click();
              break;
            default:
              await element.type(value);
              break;
          }
          break;
        case 'SELECT':
          await element.select(value);
          break;
        case 'BUTTON':
          await element.evaluate(b => b.click());
          setTimeout( async () => {
            await page.screenshot({path: "Click_cookie.png", fullPage: true});
          }, 1000);
          break;
        case 'SPAN':
          const spanType = await page.$eval(selector, el => el.tagName);
          console.log('spanType is',spanType);
          await element.click();
          break;
        default:
          console.log(`Element ${selector} not supported`);
          break;
      }
    } else {
      selectorsNotFound.push(selector);
      // throw new Error(`Could not find element with selector: ${selector}`);
      console.log(`Element ${selector} not found`);
    }
    console.log('Form fill completed');
    console.log('selectorsNotFound',selectorsNotFound);
    return selectorsNotFound;
}

  async function uploadImage(screenshot,filename,event){
    console.log('uploadImage called for image: ',filename, process.env.IMAGEKIT_PRIVATE_KEY, process.env.IMAGEKIT_PUBLIC_KEY);
    var imagekit = new ImageKit({
      privateKey: 'public_N7QEgDCH7zQ+6FjR7yCs9fglTkc=',
      publicKey: 'private_huYT/zY8hoIeQFVK/E/ss5hd7js=',
      urlEndpoint : "https://ik.imagekit.io/rukipll9z/"
    });
    let res;

    const folderPath = `${event.partnerId}/${event.parentId}/`;
    

    console.log('folderPath is ===',folderPath.replace(/:/g, "_"));
    console.log('Filename is ===',filename);

    try{
      res = await imagekit.upload({
        file : screenshot,
        fileName : filename,
        folder: folderPath.replace(/:/g, "_"),
        useUniqueFileName: false,
        extensions: [
            {
                name: "google-auto-tagging",
                maxTags: 5,
                minConfidence: 95
            }
        ],
      });
      return res;
    } catch(error) {
        console.log(error);
    }; 
  }

  async function uploadImageToS3(screenshot, filename, event){
    console.log('uploadImageToS3 called for image: ',filename);
    const { parentId, partnerId } = event;
    let signedUrl;
    const bucket = 'dev.private.rebbly.io';
    const key = `${partnerId}/${parentId}/${filename}`;
    try{
      const params = {
        Bucket: bucket,
        Key: key, 
        Body: screenshot,
        ACL: 'public-read',
        Expires: 31536000
      };
      // await s3.putObject(params).promise();
      console.log('S3 params to upload', params);
      // await s3.upload(this.s3Bucket, params);
      await s3.upload(params, (error, data) => {
        if (error) {
          console.error('Error uploading screenshot to S3:', error);
        } else {
          console.log('Screenshot uploaded to S3:',data);
        }
      });
      console.log('Signed URL');
      signedUrl = await s3.getSignedUrl('getObject', {
        Bucket: bucket,
        Key: key,
        Expires: 31536000
      });
      // s3.upload(params, (err, data) => {
      //   if (err) {
      //     console.error(err);
      //     callback(err);
      //   } else {
      //     console.log(`File uploaded successfully. ETag: ${data.ETag}`);
      //     const signedUrlExpireSeconds = 60 * 5; // 5 minutes
      //     signedUrl = s3.getSignedUrl("getObject", {
      //       Bucket: bucketName,
      //       Key: fileName,
      //       Expires: signedUrlExpireSeconds,
      //     });
      //     console.log(`Signed URL: ${url}`);
      //     callback(null, {
      //       statusCode: 200,
      //       body: JSON.stringify({
      //         message: "File uploaded successfully",
      //         url: url,
      //       }),
      //     });
      //   }
      // });
      console.log('signedUrl is',signedUrl);
      return signedUrl;
    } catch(error) {
        console.log(error);
    }; 
  }
  
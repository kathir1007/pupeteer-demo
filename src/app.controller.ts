import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { FormfillserviceService } from './formfillservice/formfillservice.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,private readonly formFillService: FormfillserviceService) {}

  @Get('test')
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('formFill')
  async executePuppeteer(): Promise<string> {
    // const data = await this.appService.execute();
    // const data = await this.appService.execute();
    return '';
  //   return data;
  }

  @Post('newFormTest')
  async create(@Body() requestBody: any) {
    const result = await this.formFillService.formFilling(requestBody);
    console.log('Successfull screenshot URL:', result);
    return result;
  }

  @Get('newFormTest1')
  async create1() {
    const result = await this.formFillService.formFilling1();
    console.log('Successfull screenshot URL:', result);
    return result;
  }
//   @Get('screenshot')
//   async getScreenshot(@Query('url') url: string) {
//     console.log('getScreenshot called');
//     // const browser = await puppeteer.launch({ 
//     //   executablePath: 'C:\\Users\\Kathiresan S\\AppData\\Local\\Google\\Chrome SxS\\Application\\chrome.exe',
//     //   args: ['--no-sandbox']
//     // });
//     // console.log('chromium.executablePath is:----'+JSON.stringify(chromium.executablePath));
//     // const  browser = await chromium.puppeteer.launch({
//     //   args: chromium.args,
//     //   defaultViewport: chromium.defaultViewport,
//     //   executablePath: 'C:\\Users\\Kathiresan S\\AppData\\Local\\Google\\Chrome SxS\\Application\\chrome.exe',
//     //   headless: chromium.headless,
//     //   ignoreHTTPSErrors: true,
//     // });

//     const browser = await getChrome();

//     console.log('Broswer object is: '+browser);
//     const page = await browser.newPage();
//     await page.goto(url, { waitUntil: 'networkidle2' });
//     // await page.screenshot({ encoding: 'base64',path: "screenshot.png", fullPage: true });
//     await browser.close();
//     // res.setHeader('Content-Type', 'image/png');
//     // res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent('screenshot.png')}`);
//     // res.send(Buffer.from(screenshot, 'base64'));
//   }
// }
}

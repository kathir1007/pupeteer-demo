import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import serverlessExpress from '@vendia/serverless-express';
import { Handler, Context, Callback  } from 'aws-lambda';
declare const module: any;


let server: Handler;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
  await app.init();
  //This is for servered application
//   await app.listen(3000);

//For serverless
const expressApp = app.getHttpAdapter().getInstance();
return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
    event: any,
    context: Context,
    callback: Callback,
  ) => {
    server = server ?? (await bootstrap());
    return server(event, context, callback);
  };
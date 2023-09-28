import { Test, TestingModule } from '@nestjs/testing';
import { FormfillserviceService } from './formfillservice.service';

describe('FormfillserviceService', () => {
  let service: FormfillserviceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FormfillserviceService],
    }).compile();

    service = module.get<FormfillserviceService>(FormfillserviceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

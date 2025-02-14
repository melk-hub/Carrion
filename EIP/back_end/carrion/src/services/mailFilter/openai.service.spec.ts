import { Test, TestingModule } from '@nestjs/testing';
import { MailFilterService } from './mailFilter.service';

describe('mailFilterService', () => {
  let service: MailFilterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailFilterService],
    }).compile();

    service = module.get<MailFilterService>(MailFilterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

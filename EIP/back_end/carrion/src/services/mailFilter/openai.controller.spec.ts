import { Test, TestingModule } from '@nestjs/testing';
import { MailFilterController } from './mailFilter.controller';

describe('OpenaiController', () => {
  let controller: MailFilterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MailFilterController],
    }).compile();

    controller = module.get<MailFilterController>(MailFilterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

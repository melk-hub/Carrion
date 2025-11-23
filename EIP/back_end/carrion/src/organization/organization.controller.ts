import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt-auth.guard';
import { OrganizationService } from './organization.service';
import {
  CreateOrganizationInvitationDTO,
  JoinOrganizationDTO,
} from './dto/organization.dto';

@Controller('organization')
@UseGuards(JwtAuthGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get('')
  async getOrganizationInfo(@Request() req) {
    return this.organizationService.getUserOrganization(req.user.id);
  }

  @Post('join')
  async joinOrganization(@Request() req, @Body() body: JoinOrganizationDTO) {
    return this.organizationService.joinOrganization(req.user.id, body);
  }

  @Post('send')
  async sendInvitationToOrganization(
    @Request() req,
    @Body() body: CreateOrganizationInvitationDTO,
  ) {
    const userId: string = req.user.id;
    return this.organizationService.sendInvitationToOrganization(userId, body);
  }
}

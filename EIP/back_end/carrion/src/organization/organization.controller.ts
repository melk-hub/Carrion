import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Body,
  Query,
  Put,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt-auth.guard';
import { OrganizationService } from './organization.service';
import {
  ChangeMemberRoleDTO,
  CreateOrganizationInvitationDTO,
  GetInformationOrganizationDTO,
  KickMemberFromOrganizationDTO,
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
  async joinOrganization(
    @Request() req,
    @Body() body: GetInformationOrganizationDTO,
  ) {
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

  @Get('get-info')
  async getOrganizationInformation(
    @Request() req,
    @Query() query: GetInformationOrganizationDTO,
  ) {
    return this.organizationService.getOrganizationInformation(
      req.user.id,
      query,
    );
  }

  @Put('edit-role')
  async editMemberRole(@Request() req, @Body() body: ChangeMemberRoleDTO) {
    return this.organizationService.editMemberRole(req.user.id, body);
  }

  @Delete('kick-member')
  async kickMember(
    @Request() req,
    @Body() body: KickMemberFromOrganizationDTO,
  ) {
    return this.organizationService.kickMemberFromOrganization(
      req.user.id,
      body,
    );
  }
}

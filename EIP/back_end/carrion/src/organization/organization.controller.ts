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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt-auth.guard';
import { OrganizationService } from './organization.service';
import {
  AcceptInvitationDTO,
  ChangeMemberRoleDTO,
  ChangeOrganizationOwnerDTO,
  CreateOrganizationInvitationDTO,
  EditInvitationRoleDTO,
  GetInformationOrganizationDTO,
  JoinOrganizationDTO,
  KickMemberFromOrganizationDTO,
  LeaveOrganizationDTO,
  RevokeOrganizationInvitationDTO,
} from './dto/organization.dto';
import { OrgRoles } from '@/auth/decorators/organizationsRoles.decorator';
import { Public } from '@/auth/decorators/public.decorator';

@Controller('organization')
@UsePipes(new ValidationPipe({ transform: true }))
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) { }

  @Public()
  @Get('invitation-details')
  async getInvitationDetails(@Query('token') token: string) {
    return this.organizationService.getInvitationByToken(token);
  }


  @Get('')
  @UseGuards(JwtAuthGuard)
  async getOrganizationInfo(@Request() req) {
    return this.organizationService.getUserOrganization(req.user.id);
  }

  @Post('accept-invite')
  @UseGuards(JwtAuthGuard)
  async acceptInvitation(@Request() req, @Body() body: AcceptInvitationDTO) {
    return this.organizationService.acceptInvitation(req.user.id, body.token);
  }

  @Post('join')
  @UseGuards(JwtAuthGuard)
  async joinOrganization(@Request() req, @Body() body: JoinOrganizationDTO) {
    return this.organizationService.joinOrganization(req.user.id, body);
  }

  @OrgRoles('OWNER', 'TEACHER')
  @Post('invite')
  @UseGuards(JwtAuthGuard)
  async sendInvitationToOrganization(
    @Request() req,
    @Body() body: CreateOrganizationInvitationDTO,
  ) {
    const userId: string = req.user.id;
    return this.organizationService.sendInvitationToOrganization(userId, body);
  }

  @Get('get-info')
  @UseGuards(JwtAuthGuard)
  async getOrganizationInformation(
    @Query() query: GetInformationOrganizationDTO,
  ) {
    return this.organizationService.getOrganizationInformation(query);
  }

  @OrgRoles('OWNER')
  @Put('edit-role')
  @UseGuards(JwtAuthGuard)
  async editMemberRole(@Body() body: ChangeMemberRoleDTO) {
    return this.organizationService.editMemberRole(body);
  }

  @OrgRoles('OWNER')
  @Delete('kick-member')
  @UseGuards(JwtAuthGuard)
  async kickMember(@Body() body: KickMemberFromOrganizationDTO) {
    return this.organizationService.kickMemberFromOrganization(body);
  }

  @OrgRoles('OWNER', 'TEACHER')
  @Get('settings-data')
  @UseGuards(JwtAuthGuard)
  async getInvitationList(@Query('organizationId') organizationId: string) {
    return this.organizationService.getOrganizationSettingsData(organizationId);
  }

  @OrgRoles('OWNER')
  @Put('change-owner')
  @UseGuards(JwtAuthGuard)
  async changeOrganizationOwner(
    @Request() req,
    @Body() body: ChangeOrganizationOwnerDTO,
  ) {
    return this.organizationService.changeOrganizationOwner(req.user.id, body);
  }

  @OrgRoles('OWNER')
  @Put('edit-invitation-role')
  @UseGuards(JwtAuthGuard)
  async editInvitationRole(
    @Request() req,
    @Body() body: EditInvitationRoleDTO,
  ) {
    return this.organizationService.editInvitationRole(req.user.id, body);
  }

  @OrgRoles('OWNER', 'TEACHER')
  @Delete('revoke-invitation')
  @UseGuards(JwtAuthGuard)
  async revokeOrganizationInvitation(
    @Request() req,
    @Body() body: RevokeOrganizationInvitationDTO,
  ) {
    return this.organizationService.revokeOrganizationInvitation(
      req.user.id,
      body,
    );
  }

  @Delete('leave')
  @UseGuards(JwtAuthGuard)
  async leaveOrganization(@Request() req, @Body() body: LeaveOrganizationDTO) {
    return this.organizationService.leaveOrganization(req.user.id, body);
  }
}
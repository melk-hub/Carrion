import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CreateJobApplyDto,
  JobApplyDto,
  UpdateJobApplyDto,
} from './dto/jobApply.dto';
import { ApplicationStatus } from './enum/application-status.enum';
import { NotificationService } from '@/notification/notification.service';

export interface JobApplyParams {
  title: string;
  company: string;
  contractType: string;
  location?: string;
}

export interface UpdateJobApply {
  title?: string;
  company?: string;
  location?: string;
  salary?: number;
  imageUrl?: string;
  status?: ApplicationStatus;
  contractType?: string;
  interviewDate?: Date;
}

@Injectable()
export class JobApplyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async getAllJobApplies(userId: string): Promise<JobApplyDto[]> {
    try {
      const jobApplies = await this.prisma.jobApply.findMany({
        where: {
          userId: userId,
        },
        include: {
          user: true,
        },
      });
      return jobApplies.map((jobApply) => ({
        id: jobApply.id,
        title: jobApply.title,
        company: jobApply.company,
        location: jobApply.location,
        salary: jobApply.salary,
        imageUrl: jobApply.imageUrl,
        status: jobApply.status as ApplicationStatus,
        contractType: jobApply.contractType,
        interviewDate: jobApply.interviewDate,
        createdAt: jobApply.createdAt,
      }));
    } catch (error) {
      throw new Error(`Error retrieving applications ${error}`);
    }
  }

  async getJobApplyByParam(
    userId: string,
    jobApplyParams: JobApplyParams,
  ): Promise<JobApplyDto> {
    try {
      console.log(`Searching for job apply with params:`, {
        userId,
        title: jobApplyParams.title,
        company: jobApplyParams.company,
        contractType: jobApplyParams.contractType,
        location: jobApplyParams.location,
      });

      const searchCriteria: any = {
        userId: userId,
        title: jobApplyParams.title,
        company: jobApplyParams.company,
      };

      if (jobApplyParams.contractType) {
        searchCriteria.contractType = jobApplyParams.contractType;
      }

      if (jobApplyParams.location) {
        searchCriteria.location = jobApplyParams.location;
      }

      console.log(`Final search criteria:`, searchCriteria);

      const jobApply = await this.prisma.jobApply.findFirst({
        where: searchCriteria,
        include: {
          user: true,
        },
      });

      if (!jobApply) {
        console.log(`No job apply found for criteria`);
        return null;
      }

      console.log(`Found existing job apply:`, {
        id: jobApply.id,
        title: jobApply.title,
        company: jobApply.company,
        contractType: jobApply.contractType,
        location: jobApply.location,
      });

      return {
        id: jobApply.id,
        title: jobApply.title,
        company: jobApply.company,
        location: jobApply.location,
        salary: jobApply.salary,
        imageUrl: jobApply.imageUrl,
        status: jobApply.status as ApplicationStatus,
        contractType: jobApply.contractType,
        interviewDate: jobApply.interviewDate,
        createdAt: jobApply.createdAt,
      };
    } catch (error) {
      throw new Error(`Error retrieving applications ${error}`);
    }
  }

  async createJobApply(
    userId: string,
    createJobApplyDto: CreateJobApplyDto,
  ): Promise<JobApplyDto> {
    try {
      const jobApply = await this.prisma.jobApply.create({
        data: {
          userId: userId,
          company: createJobApplyDto.company,
          location: createJobApplyDto.location,
          salary: createJobApplyDto.salary,
          imageUrl: createJobApplyDto.imageUrl,
          status: createJobApplyDto.status,
          contractType: createJobApplyDto.contractType,
          interviewDate: createJobApplyDto.interviewDate,
          title: createJobApplyDto.title,
        },
      });

      await this.notificationService.createNotification({
        userId: userId,
        titleKey: 'notifications.titles.application.created',
        messageKey: 'notifications.application.created',
        type: 'POSITIVE',
        variables: {
          company: createJobApplyDto.company,
          jobTitle: createJobApplyDto.title,
        },
      });

      return {
        id: jobApply.id,
        title: jobApply.title,
        company: jobApply.company,
        location: jobApply.location,
        salary: jobApply.salary,
        imageUrl: jobApply.imageUrl,
        status: jobApply.status as ApplicationStatus,
        contractType: jobApply.contractType,
        interviewDate: jobApply.interviewDate,
        createdAt: jobApply.createdAt,
      };
    } catch (error) {
      throw new Error(`Error creating job application: ${error}`);
    }
  }

  async deleteJobApply(
    jobApplyId: string,
    userId: string,
  ): Promise<{ message: string }> {
    try {
      const jobApply = await this.prisma.jobApply.findUnique({
        where: { id: jobApplyId },
      });

      if (!jobApply) {
        throw new NotFoundException(
          `Active job application with ID ${jobApplyId} not found.`,
        );
      }
      if (jobApply.userId !== userId) {
        throw new ForbiddenException(
          "You don't have permission to delete this job application.",
        );
      }

      await this.notificationService.createNotification({
        userId: userId,
        titleKey: 'notifications.titles.application.deleted',
        messageKey: 'notifications.application.deleted',
        type: 'NEGATIVE',
        variables: {
          company: jobApply.company,
          jobTitle: jobApply.title,
        },
      });

      await this.prisma.jobApply.delete({
        where: { id: jobApplyId },
      });
      return { message: 'Job application deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting job application: ${error.message}`);
    }
  }

  async deleteArchivedJobApply(
    jobApplyId: string,
    userId: string,
  ): Promise<{ message: string }> {
    try {
      const jobApply = await this.prisma.archivedJobApply.findUnique({
        where: { id: jobApplyId },
      });

      if (!jobApply) {
        throw new NotFoundException(
          `Active job application with ID ${jobApplyId} not found.`,
        );
      }
      if (jobApply.userId !== userId) {
        throw new ForbiddenException(
          "You don't have permission to delete this job application.",
        );
      }

      await this.notificationService.createNotification({
        userId: userId,
        titleKey: 'notifications.titles.archive.deleted',
        messageKey: 'notifications.archive.deleted',
        type: 'NEGATIVE',
        variables: {
          company: jobApply.company,
          jobTitle: jobApply.title,
        },
      });

      await this.prisma.archivedJobApply.delete({
        where: { id: jobApplyId },
      });
      return { message: 'Job application deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting job application: ${error.message}`);
    }
  }

  async updateJobApplyStatus(
    jobApplyId: string,
    userId: string,
    UpdateJobApplyDto: UpdateJobApplyDto,
  ): Promise<JobApplyDto> {
    try {
      const jobApply = await this.prisma.jobApply.findUnique({
        where: { id: jobApplyId },
      });

      if (!jobApply) {
        throw new NotFoundException(
          `Job application with ID ${jobApplyId} not found.`,
        );
      }

      if (jobApply.userId !== userId) {
        throw new ForbiddenException(
          "You don't have permission to update this job application.",
        );
      }

      const updatedJobApply = await this.prisma.jobApply.update({
        where: { id: jobApplyId },
        data: { ...UpdateJobApplyDto },
      });
      return {
        id: updatedJobApply.id,
        title: updatedJobApply.title,
        company: updatedJobApply.company,
        location: updatedJobApply.location,
        salary: updatedJobApply.salary,
        imageUrl: updatedJobApply.imageUrl,
        status: updatedJobApply.status as ApplicationStatus,
        contractType: updatedJobApply.contractType,
        interviewDate: updatedJobApply.interviewDate,
        createdAt: updatedJobApply.createdAt,
      };
    } catch (error) {
      throw new Error(
        `Error updating job application status: ${error.message}`,
      );
    }
  }

  async updateJobApplyByMail(
    jobApplyId: string,
    userId: string,
    updateJobApply: UpdateJobApply,
  ): Promise<string> {
    try {
      const jobApply = await this.prisma.jobApply.findUnique({
        where: { id: jobApplyId },
      });

      if (!jobApply) {
        throw new NotFoundException(
          `Job application with ID ${jobApplyId} not found.`,
        );
      }

      if (jobApply.userId !== userId) {
        throw new ForbiddenException(
          "You don't have permission to update this job application.",
        );
      }

      const validInterviewDate =
        updateJobApply.interviewDate &&
        updateJobApply.interviewDate instanceof Date &&
        !isNaN(updateJobApply.interviewDate.getTime())
          ? updateJobApply.interviewDate
          : null;

      const variables: any = {
        company: jobApply.company,
        jobTitle: jobApply.title,
      };

      let hasChanges = false;

      if (
        updateJobApply.location &&
        updateJobApply.location !== jobApply.location
      ) {
        variables.locationStart =
          jobApply.location || 'notifications.noLocation';
        variables.locationEnd = updateJobApply.location;
        hasChanges = true;
      }
      if (updateJobApply.salary && updateJobApply.salary !== jobApply.salary) {
        variables.salaryStart = jobApply.salary || 'notifications.noSalary';
        variables.salaryEnd = updateJobApply.salary;
        hasChanges = true;
      }
      if (updateJobApply.status && updateJobApply.status !== jobApply.status) {
        variables.statusStart = jobApply.status;
        variables.statusEnd = updateJobApply.status;
        hasChanges = true;
      }
      if (
        validInterviewDate &&
        validInterviewDate.getTime() !== jobApply.interviewDate?.getTime()
      ) {
        variables.interviewStart = jobApply.interviewDate
          ? jobApply.interviewDate.toLocaleDateString('fr-FR')
          : 'notifications.noInterview';
        variables.interviewEnd = validInterviewDate.toLocaleDateString('fr-FR');
        hasChanges = true;
      }

      await this.prisma.jobApply.update({
        where: { id: jobApplyId },
        data: {
          ...(updateJobApply.location
            ? { location: updateJobApply.location }
            : {}),
          ...(updateJobApply.salary ? { salary: updateJobApply.salary } : {}),
          ...(updateJobApply.status ? { status: updateJobApply.status } : {}),
          ...(validInterviewDate ? { interviewDate: validInterviewDate } : {}),
        },
      });

      if (hasChanges) {
        await this.notificationService.createNotification({
          userId: userId,
          titleKey: 'notifications.titles.application.updated',
          messageKey: 'notifications.application.updated',
          type: 'INFO',
          variables: variables,
        });
      }

      return `Job offer: ${jobApplyId} for user: ${userId} updated successfully`;
    } catch (error) {
      throw new Error(
        `Error updating job application status: ${error.message}`,
      );
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.deleteJobApply(id, userId);
  }

  async updateJobApplyByData(
    jobApplyId: string,
    userId: string,
    updateJobApplyDto: UpdateJobApplyDto,
  ): Promise<JobApplyDto> {
    try {
      const jobApply = await this.prisma.jobApply.findUnique({
        where: { id: jobApplyId },
      });

      if (!jobApply) {
        throw new NotFoundException(
          `Active job application with ID ${jobApplyId} not found. It may be archived.`,
        );
      }

      if (jobApply.userId !== userId) {
        throw new ForbiddenException(
          "You don't have permission to update this job application.",
        );
      }

      // Collecter les changements pour la notification
      const variables: any = {
        company: jobApply.company,
        jobTitle: jobApply.title,
      };

      let hasChanges = false;

      if (
        updateJobApplyDto.title &&
        updateJobApplyDto.title !== jobApply.title
      ) {
        variables.titleStart = jobApply.title;
        variables.titleEnd = updateJobApplyDto.title;
        hasChanges = true;
      }
      if (
        updateJobApplyDto.company &&
        updateJobApplyDto.company !== jobApply.company
      ) {
        variables.companyStart = jobApply.company;
        variables.companyEnd = updateJobApplyDto.company;
        hasChanges = true;
      }
      if (
        updateJobApplyDto.location &&
        updateJobApplyDto.location !== jobApply.location
      ) {
        variables.locationStart =
          jobApply.location || 'notifications.noLocation';
        variables.locationEnd = updateJobApplyDto.location;
        hasChanges = true;
      }
      if (
        updateJobApplyDto.salary !== undefined &&
        updateJobApplyDto.salary !== jobApply.salary
      ) {
        variables.salaryStart = jobApply.salary || 'notifications.noSalary';
        variables.salaryEnd =
          updateJobApplyDto.salary || 'notifications.noSalary';
        hasChanges = true;
      }
      if (
        updateJobApplyDto.status &&
        updateJobApplyDto.status !== jobApply.status
      ) {
        variables.statusStart = jobApply.status;
        variables.statusEnd = updateJobApplyDto.status;
        hasChanges = true;
      }
      if (
        updateJobApplyDto.contractType &&
        updateJobApplyDto.contractType !== jobApply.contractType
      ) {
        variables.contractTypeStart =
          jobApply.contractType || 'notifications.noContractType';
        variables.contractTypeEnd = updateJobApplyDto.contractType;
        hasChanges = true;
      }
      if (
        updateJobApplyDto.interviewDate &&
        updateJobApplyDto.interviewDate.getTime() !==
          jobApply.interviewDate?.getTime()
      ) {
        variables.interviewStart = jobApply.interviewDate
          ? jobApply.interviewDate.toLocaleDateString('fr-FR')
          : 'notifications.noInterview';
        variables.interviewEnd =
          updateJobApplyDto.interviewDate.toLocaleDateString('fr-FR');
        hasChanges = true;
      }

      const updatedJobApply = await this.prisma.jobApply.update({
        where: { id: jobApplyId },
        data: {
          ...(updateJobApplyDto.title
            ? { title: updateJobApplyDto.title }
            : {}),
          ...(updateJobApplyDto.company
            ? { company: updateJobApplyDto.company }
            : {}),
          ...(updateJobApplyDto.location
            ? { location: updateJobApplyDto.location }
            : {}),
          ...(updateJobApplyDto.salary !== undefined
            ? { salary: updateJobApplyDto.salary }
            : {}),
          ...(updateJobApplyDto.imageUrl
            ? { imageUrl: updateJobApplyDto.imageUrl }
            : {}),
          ...(updateJobApplyDto.status
            ? { status: updateJobApplyDto.status }
            : {}),
          ...(updateJobApplyDto.contractType
            ? { contractType: updateJobApplyDto.contractType }
            : {}),
          ...(updateJobApplyDto.interviewDate
            ? { interviewDate: updateJobApplyDto.interviewDate }
            : {}),
        },
      });

      // Créer la notification avec les détails des changements
      if (hasChanges) {
        await this.notificationService.createNotification({
          userId: userId,
          titleKey: 'notifications.titles.application.updated',
          messageKey: 'notifications.application.updated',
          type: 'INFO',
          variables: variables,
        });
      }

      return {
        id: updatedJobApply.id,
        title: updatedJobApply.title,
        company: updatedJobApply.company,
        location: updatedJobApply.location,
        salary: updatedJobApply.salary,
        imageUrl: updatedJobApply.imageUrl,
        status: updatedJobApply.status as ApplicationStatus,
        contractType: updatedJobApply.contractType,
        interviewDate: updatedJobApply.interviewDate,
        createdAt: updatedJobApply.createdAt,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new Error(`Error updating job application: ${error.message}`);
    }
  }

  async updateArchivedJobApplyByData(
    archivedJobApplyId: string,
    userId: string,
    updateJobApplyDto: UpdateJobApplyDto,
  ): Promise<JobApplyDto> {
    try {
      const jobApply = await this.prisma.archivedJobApply.findUnique({
        where: { id: archivedJobApplyId },
      });

      if (!jobApply) {
        throw new NotFoundException(
          `Active job application with ID ${archivedJobApplyId} not found. It may be archived.`,
        );
      }

      if (jobApply.userId !== userId) {
        throw new ForbiddenException(
          "You don't have permission to update this job application.",
        );
      }

      const updatedJobApply = await this.prisma.archivedJobApply.update({
        where: { id: archivedJobApplyId },
        data: {
          ...(updateJobApplyDto.title
            ? { title: updateJobApplyDto.title }
            : {}),
          ...(updateJobApplyDto.company
            ? { company: updateJobApplyDto.company }
            : {}),
          ...(updateJobApplyDto.location
            ? { location: updateJobApplyDto.location }
            : {}),
          ...(updateJobApplyDto.salary !== undefined
            ? { salary: updateJobApplyDto.salary }
            : {}),
          ...(updateJobApplyDto.imageUrl
            ? { imageUrl: updateJobApplyDto.imageUrl }
            : {}),
          ...(updateJobApplyDto.status
            ? { status: updateJobApplyDto.status }
            : {}),
          ...(updateJobApplyDto.contractType
            ? { contractType: updateJobApplyDto.contractType }
            : {}),
          ...(updateJobApplyDto.interviewDate
            ? { interviewDate: updateJobApplyDto.interviewDate }
            : {}),
        },
      });

      await this.notificationService.createNotification({
        userId: userId,
        titleKey: 'notifications.titles.archive.updated',
        messageKey: 'notifications.archive.updated',
        type: 'INFO',
        variables: {
          company: jobApply.company,
          jobTitle: jobApply.title,
        },
      });

      return {
        id: updatedJobApply.id,
        title: updatedJobApply.title,
        company: updatedJobApply.company,
        location: updatedJobApply.location,
        salary: updatedJobApply.salary,
        imageUrl: updatedJobApply.imageUrl,
        status: updatedJobApply.status as ApplicationStatus,
        contractType: updatedJobApply.contractType,
        interviewDate: updatedJobApply.interviewDate,
        createdAt: updatedJobApply.archivedAt,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new Error(`Error updating job application: ${error.message}`);
    }
  }

  async archiveJobApplication(jobApplyId: string, userId: string) {
    const job = await this.prisma.jobApply.findUniqueOrThrow({
      where: { id: jobApplyId },
    });

    if (job.userId !== userId) {
      throw new ForbiddenException(
        "You can't archive someone else's application.",
      );
    }

    await this.prisma.archivedJobApply.create({
      data: {
        originalId: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary,
        status: job.status,
        imageUrl: job.imageUrl,
        contractType: job.contractType,
        interviewDate: job.interviewDate,
        userId: job.userId,
      },
    });

    await this.notificationService.createNotification({
      userId: userId,
      titleKey: 'notifications.titles.application.archived',
      messageKey: 'notifications.application.archived',
      type: 'POSITIVE',
      variables: {
        company: job.company,
        jobTitle: job.title,
      },
    });

    await this.prisma.jobApply.delete({
      where: { id: job.id },
    });

    return { message: 'Job application archived successfully.' };
  }

  async unarchiveJobApplication(archivedJobId: string, userId: string) {
    const archivedJob = await this.prisma.archivedJobApply.findUnique({
      where: { id: archivedJobId },
    });

    if (archivedJob.userId !== userId) {
      throw new ForbiddenException(
        "You can't unarchive someone else's application.",
      );
    }

    await this.prisma.jobApply.create({
      data: {
        id: archivedJob.originalId,
        title: archivedJob.title,
        company: archivedJob.company,
        location: archivedJob.location,
        salary: archivedJob.salary,
        status: archivedJob.status,
        imageUrl: archivedJob.imageUrl,
        contractType: archivedJob.contractType,
        interviewDate: archivedJob.interviewDate,
        userId: archivedJob.userId,
      },
    });

    await this.notificationService.createNotification({
      userId: userId,
      titleKey: 'notifications.titles.application.unarchived',
      messageKey: 'notifications.application.unarchived',
      type: 'POSITIVE',
      variables: {
        company: archivedJob.company,
        jobTitle: archivedJob.title,
      },
    });

    await this.prisma.archivedJobApply.delete({
      where: { id: archivedJob.id },
    });

    return { message: 'Job application unarchived successfully.' };
  }

  async getAllArchivedJobApplies(userId: string) {
    try {
      const archivedJobApplies = await this.prisma.archivedJobApply.findMany({
        where: {
          userId: userId,
        },
        include: {
          user: true,
        },
      });

      return archivedJobApplies.map((archived) => ({
        id: archived.id,
        originalId: archived.originalId,
        title: archived.title,
        company: archived.company,
        location: archived.location,
        salary: archived.salary,
        imageUrl: archived.imageUrl,
        status: archived.status as ApplicationStatus,
        contractType: archived.contractType,
        interviewDate: archived.interviewDate,
        createdAt: archived.archivedAt,
      }));
    } catch (error) {
      throw new Error(`Error retrieving archived job applications: ${error}`);
    }
  }
}

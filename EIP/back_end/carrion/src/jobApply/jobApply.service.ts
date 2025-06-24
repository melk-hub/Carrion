import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateJobApplyDto, JobApplyDto, UpdateJobApplyDto } from './dto/jobApply.dto';
import { ApplicationStatus } from './enum/application-status.enum';

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
  constructor(private readonly prisma: PrismaService) {}

  async getAllJobApplies(userId: string): Promise<JobApplyDto[]> {
    try {
      const jobApplies = await this.prisma.jobApply.findMany({
        where: {
          UserId: userId,
        },
        include: {
          User: true,
        },
      });
      return jobApplies.map((jobApply) => ({
        id: jobApply.id,
        title: jobApply.Title,
        company: jobApply.Company,
        location: jobApply.Location,
        salary: jobApply.Salary,
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
      // Enhanced logging for debugging duplicate detection
      console.log(`Searching for job apply with params:`, {
        userId,
        title: jobApplyParams.title,
        company: jobApplyParams.company,
        contractType: jobApplyParams.contractType,
        location: jobApplyParams.location,
      });

      // Build the search criteria
      const searchCriteria: any = {
        UserId: userId,
        Title: jobApplyParams.title,
        Company: jobApplyParams.company,
      };

      // Only add contractType to search if it's defined and not null/undefined
      if (jobApplyParams.contractType) {
        searchCriteria.contractType = jobApplyParams.contractType;
      }

      // Only add location to search if it's provided
      if (jobApplyParams.location) {
        searchCriteria.Location = jobApplyParams.location;
      }

      console.log(`Final search criteria:`, searchCriteria);

      const jobApply = await this.prisma.jobApply.findFirst({
        where: searchCriteria,
        include: {
          User: true,
        },
      });

      if (!jobApply) {
        console.log(`No job apply found for criteria`);
        return null;
      }

      console.log(`Found existing job apply:`, {
        id: jobApply.id,
        title: jobApply.Title,
        company: jobApply.Company,
        contractType: jobApply.contractType,
        location: jobApply.Location,
      });

      return {
        id: jobApply.id,
        title: jobApply.Title,
        company: jobApply.Company,
        location: jobApply.Location,
        salary: jobApply.Salary,
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
          UserId: userId,
          Company: createJobApplyDto.company,
          Location: createJobApplyDto.location,
          Salary: createJobApplyDto.salary,
          imageUrl: createJobApplyDto.imageUrl,
          status: createJobApplyDto.status,
          contractType: createJobApplyDto.contractType,
          interviewDate: createJobApplyDto.interviewDate,
          Title: createJobApplyDto.title,
        },
      });

      return {
        id: jobApply.id,
        title: jobApply.Title,
        company: jobApply.Company,
        location: jobApply.Location,
        salary: jobApply.Salary,
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
          `Job application with ID ${jobApplyId} not found.`,
        );
      }
      if (jobApply.UserId !== userId) {
        throw new ForbiddenException(
          "You don't have permission to delete this job application.",
        );
      }
      await this.prisma.jobApply.delete({
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
      if (jobApply.UserId !== userId) {
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
        title: updatedJobApply.Title,
        company: updatedJobApply.Company,
        location: updatedJobApply.Location,
        salary: updatedJobApply.Salary,
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
      // Validate interview date before using it
      const validInterviewDate =
        updateJobApply.interviewDate &&
        updateJobApply.interviewDate instanceof Date &&
        !isNaN(updateJobApply.interviewDate.getTime())
          ? updateJobApply.interviewDate
          : null;

      await this.prisma.jobApply.update({
        where: { id: jobApplyId },
        data: {
          ...(updateJobApply.location
            ? { Location: updateJobApply.location }
            : {}),
          ...(updateJobApply.salary ? { Salary: updateJobApply.salary } : {}),
          ...(updateJobApply.status ? { status: updateJobApply.status } : {}),
          ...(validInterviewDate ? { interviewDate: validInterviewDate } : {}),
        },
      });
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
          `Job application with ID ${jobApplyId} not found.`,
        );
      }

      if (jobApply.UserId !== userId) {
        throw new ForbiddenException(
          "You don't have permission to update this job application.",
        );
      }

      const updatedJobApply = await this.prisma.jobApply.update({
        where: { id: jobApplyId },
        data: {
          ...(updateJobApplyDto.title ? { Title: updateJobApplyDto.title } : {}),
          ...(updateJobApplyDto.company ? { Company: updateJobApplyDto.company } : {}),
          ...(updateJobApplyDto.location ? { Location: updateJobApplyDto.location } : {}),
          ...(updateJobApplyDto.salary !== undefined ? { Salary: updateJobApplyDto.salary } : {}),
          ...(updateJobApplyDto.imageUrl ? { imageUrl: updateJobApplyDto.imageUrl } : {}),
          ...(updateJobApplyDto.status ? { status: updateJobApplyDto.status } : {}),
          ...(updateJobApplyDto.contractType ? { contractType: updateJobApplyDto.contractType } : {}),
          ...(updateJobApplyDto.interviewDate ? { interviewDate: updateJobApplyDto.interviewDate } : {}),
        },
      });

      return {
        id: updatedJobApply.id,
        title: updatedJobApply.Title,
        company: updatedJobApply.Company,
        location: updatedJobApply.Location,
        salary: updatedJobApply.Salary,
        imageUrl: updatedJobApply.imageUrl,
        status: updatedJobApply.status as ApplicationStatus,
        contractType: updatedJobApply.contractType,
        interviewDate: updatedJobApply.interviewDate,
        createdAt: updatedJobApply.createdAt,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new Error(`Error updating job application: ${error.message}`);
    }
  }

  async archiveJobApplication(jobApplyId: string, userId: string) {
    const job = await this.prisma.jobApply.findUniqueOrThrow({
      where: { id: jobApplyId },
    });

    if (job.UserId !== userId) {
      throw new ForbiddenException("You can't archive someone else's application.");
    }

    await this.prisma.archivedJobApply.create({
      data: {
        originalId: job.id,
        title: job.Title,
        company: job.Company,
        location: job.Location,
        salary: job.Salary,
        status: job.status,
        imageUrl: job.imageUrl,
        contractType: job.contractType,
        interviewDate: job.interviewDate,
        userId: job.UserId,
      },
    });

    await this.prisma.jobApply.delete({
      where: { id: job.id },
    });
    return { message: 'Job application archived successfully.' };
  }

  async unarchiveJobApplication(archivedJobId: string, userId: string) {
    const archivedJob = await this.prisma.archivedJobApply.findUniqueOrThrow({
      where: { id: archivedJobId },
    });

    if (archivedJob.userId !== userId) {
      throw new ForbiddenException("You can't unarchive someone else's application.");
    }

    await this.prisma.jobApply.create({
      data: {
        id: archivedJob.originalId,
        Title: archivedJob.title,
        Company: archivedJob.company,
        Location: archivedJob.location,
        Salary: archivedJob.salary,
        status: archivedJob.status,
        imageUrl: archivedJob.imageUrl,
        contractType: archivedJob.contractType,
        interviewDate: archivedJob.interviewDate,
        UserId: archivedJob.userId,
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

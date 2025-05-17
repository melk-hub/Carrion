import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateJobApplyDto, JobApplyDto } from './dto/jobApply.dto';
import { ApplicationStatus } from './enum/application-status.enum';
import { JobApplyParams, UpdateJobApply } from './interface/jobApply.interface';

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
      const jobApply = await this.prisma.jobApply.findFirst({
        where: {
          UserId: userId,
          Title: jobApplyParams.title,
          Company: jobApplyParams.company,
          // Location and contractType are optional, but prisma should take care of empty data and won't take care of it if there's no data
          Location: jobApplyParams.location,
          contractType: jobApplyParams.contractType,
        },
        include: {
          User: true,
        },
      });
      if (!jobApply) {
        return null;
      }
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
    newStatus: 'ON' | 'OFF' | 'PENDING',
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
        data: { status: newStatus },
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
      await this.prisma.jobApply.update({
        where: { id: jobApplyId },
        data: {
          Location: updateJobApply.location,
          Salary: updateJobApply.salary,
          status: updateJobApply.status,
          interviewDate: updateJobApply.interviewDate,
          contractType: updateJobApply.contractType,
        },
      });
      return `Job offer: ${jobApplyId} for user: ${userId} updated successfully`;
    } catch (error) {
      throw new Error(
        `Error updating job application status: ${error.message}`,
      );
    }
  }
}

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateJobApplyDto, JobApplyDto } from './dto/jobApply.dto';

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
        status: jobApply.status,
        createdAt: jobApply.createdAt,
      }));
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
        status: jobApply.status,
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
        status: updatedJobApply.status,
        createdAt: updatedJobApply.createdAt,
      };
    } catch (error) {
      throw new Error(
        `Error updating job application status: ${error.message}`,
      );
    }
  }
}

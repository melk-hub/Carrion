import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JobApplyDto } from './dto/jobApply.dto';

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
        company: jobApply.Company,
        location: jobApply.Location,
        salary: jobApply.Salary,
        imageUrl: jobApply.imageUrl,
        status: jobApply.status,
        createdAt: jobApply.createdAt,
      }));
    } catch (error) {
      throw new Error(
        `Erreur lors de la récupération des candidatures ${error}`,
      );
    }
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, Max, Min } from 'class-validator';

export class UpdateGoalDto {
  @ApiProperty({
    description: 'Weekly goal for job applications',
    example: 10,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Min(1)
  @Max(100)
  weeklyGoal?: number;

  @ApiProperty({
    description: 'Monthly goal for job applications',
    example: 30,
    minimum: 1,
    maximum: 500,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Min(1)
  @Max(500)
  monthlyGoal?: number;
}

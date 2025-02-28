import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

import { ReservationStatus } from '../../shared/enums/reservation-status.enum';
import { VALIDATION_MESSAGES } from '../validation-messages';

export class ReservationDto {
  @ApiProperty({ example: 12345, description: 'ID rezerwacji' })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.RESERVATION_ID_REQUIRED })
  @IsNumber({}, { message: VALIDATION_MESSAGES.RESERVATION_ID_NUMBER })
  reservation_id: number;

  @ApiProperty({ example: 'Jan Nowak', description: 'Imię i nazwisko gościa' })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.GUEST_NAME_REQUIRED })
  @IsString({ message: VALIDATION_MESSAGES.GUEST_NAME_STRING })
  guest_name: string;

  @ApiProperty({
    example: ReservationStatus.PENDING,
    enum: ReservationStatus,
    description: 'Status',
  })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.STATUS_REQUIRED })
  @IsEnum(ReservationStatus, { message: VALIDATION_MESSAGES.STATUS_INVALID })
  status: ReservationStatus;

  @ApiProperty({ example: '2024-05-01', description: 'Data zameldowania' })
  @IsDate({ message: VALIDATION_MESSAGES.CHECK_IN_DATE_INVALID }) // Is Date is checking if value is empty as well, so we don't need to add IsNotEmpty
  @Type(() => Date)
  check_in_date: Date;

  @ApiProperty({ example: '2024-05-07', description: 'Data wymeldowania' })
  @IsDate({ message: VALIDATION_MESSAGES.CHECK_OUT_DATE_INVALID }) // Is Date is checking if value is empty as well, so we don't need to add IsNotEmpty
  @Type(() => Date)
  check_out_date: Date;
}

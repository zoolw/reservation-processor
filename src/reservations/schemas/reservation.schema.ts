import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ReservationStatus } from '../../shared/enums/reservation-status.enum';

export type ReservationDocument = Reservation & Document;

@Schema({ timestamps: true })
export class Reservation {
  @Prop({ required: true, unique: true })
  reservation_id: number;

  @Prop({ required: true })
  guest_name: string;

  @Prop({ required: true, enum: ReservationStatus })
  status: ReservationStatus;

  @Prop({ required: true })
  check_in_date: Date;

  @Prop({ required: true })
  check_out_date: Date;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);

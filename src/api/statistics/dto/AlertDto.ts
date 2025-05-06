export class AlertDto {
  id: number;
  type: string;
  time: Date;
  date: Date;
  zone: string;
  status: string;
  device_id: number | null;
  level: string | null;
}

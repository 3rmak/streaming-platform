import { IsString } from 'class-validator';

export class SelectVideoDto {
  @IsString()
  public roomId: string;

  @IsString()
  public videoName: string;
}

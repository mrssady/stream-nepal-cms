import { PartialType } from '@nestjs/mapped-types';

import { CreateOcrProfileDto } from './create-ocr-profile.dto';

export class UpdateOcrProfileDto extends PartialType(CreateOcrProfileDto) {}

import { Controller, Get, Query, ParseArrayPipe } from '@nestjs/common';
import { StaffService } from '@/services/staff.service';
import { Staff } from '@/types';

@Controller('staffs')
export class StaffController {
    constructor(private readonly staffService: StaffService) {}

    @Get()
    getStaffs(
        @Query('ids', new ParseArrayPipe({ items: Number, separator: ',', optional: true })) ids?: number[]
    ): Staff[] {
        return this.staffService.getStaffs(ids);
    }
}

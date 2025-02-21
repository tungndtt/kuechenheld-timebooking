import { Injectable } from '@nestjs/common';
import { Staff } from '@/interfaces';

@Injectable()
export class StaffService {
    private staffs: Staff[];

    constructor() {
        // emulate dummy staff data
        // TODO: Store stuff data in the database
        this.staffs = [
            {id: 1, name: 'Phuong Hau'},
            {id: 2, name: 'Ngoc Chu'},
            {id: 3, name: 'Yannick Lorentz'},
            {id: 4, name: 'Armin Schoepf'},
        ]
    }

    getStaffs(ids?: number[]): Staff[] {
        return ids? this.staffs.filter(({id}) => ids.includes(id)) : this.staffs;
    }
}

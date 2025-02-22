"use client";
import {
    ReactNode,
    createContext,
    useState,
    useEffect,
    useContext,
} from "react";
import { SERVER_URL } from "@/app/config";

type StaffContextType = {
    staffs: Map<number, string>;
};

const StaffContext = createContext<StaffContextType>({
    staffs: new Map<number, string>(),
});

export default function StaffProvider(props: { children: ReactNode }) {
    const [staffs, setStaffs] = useState<Map<number, string>>(
        new Map<number, string>()
    );

    useEffect(() => {
        fetch(`${SERVER_URL}/staffs`).then(async (response) => {
            if (response.ok) {
                const data: { id: number; name: string }[] =
                    await response.json();
                setStaffs((oldStaffs) => {
                    const newStaffs = new Map<number, string>(oldStaffs);
                    data.forEach(({ id, name }) => newStaffs.set(id, name));
                    return newStaffs;
                });
            } else {
            }
        });
    }, []);

    return (
        <StaffContext.Provider value={{ staffs }}>
            {props.children}
        </StaffContext.Provider>
    );
}

export function useStaffContext() {
    return useContext(StaffContext);
}

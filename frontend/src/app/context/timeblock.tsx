"use client";
import { ReactNode, createContext, useState, useEffect, useRef, useContext } from "react";
import { usePathname } from "next/navigation";
import { useNotificationContext } from "@/app/context/notification";
import dayjs, { Dayjs } from "dayjs";
import { env } from "next-runtime-env";
import { TimeBlock } from "@/app/types";

type TimeBlockContextType = {
    date: Dayjs | null;
    timeBlocks: Map<number, TimeBlock[]>;
    setDate: (date: Dayjs | null) => void;
};

const TimeBlockContext = createContext<TimeBlockContextType>({
    date: null,
    timeBlocks: new Map<number, TimeBlock[]>(),
    setDate: () => {},
});

export default function TimeBlockProvider(props: { children: ReactNode }) {
    const SERVER_URL = env("NEXT_PUBLIC_SERVER_URL");
    const notify = useNotificationContext();
    const eventSource = useRef<EventSource | null>(null);
    const eventListener = useRef<(this: EventSource, ev: MessageEvent) => void | null>(null);
    const pathname = usePathname();
    const [date, setDate] = useState<Dayjs | null>(dayjs());
    const [timeBlocks, setTimeBlocks] = useState<Map<number, TimeBlock[]>>(new Map<number, TimeBlock[]>());

    const close = () => {
        if (eventSource.current) {
            eventSource.current.close();
            eventSource.current = null;
        }
    };

    const connect = () => {
        if (!["/user", "/admin"].includes(pathname)) return;
        if (!eventSource.current) {
            eventSource.current = new EventSource(`${SERVER_URL}/timeblocks/sse${pathname}`);
        }
        if (eventListener.current) {
            eventSource.current.onmessage = eventListener.current;
        }
        eventSource.current.onerror = function () {
            close();
            connect();
        };
    };

    useEffect(() => {
        connect();
        return close;
    }, [pathname]);

    useEffect(() => {
        if (!date) return;
        const iso8601Date = date.format("YYYY-MM-DD");
        fetch(`${SERVER_URL}/timeblocks?date=${iso8601Date}`)
            .then(async (response) => {
                if (response.ok) {
                    const tbs: TimeBlock[] = await response.json();
                    const timeBlocks = new Map<number, TimeBlock[]>();
                    for (const tb of tbs) {
                        let timeBlock = timeBlocks.get(tb.staffId);
                        if (!timeBlock) {
                            timeBlock = [];
                            timeBlocks.set(tb.staffId, timeBlock);
                        }
                        timeBlock.push(tb);
                    }
                    setTimeBlocks(timeBlocks);
                } else {
                    notify({ message: "Cannot fetch the time blocks", isError: true });
                }
            })
            .catch(() => notify({ message: "Cannot fetch the time blocks", isError: true }));
        if (eventSource.current) {
            eventListener.current = function (event) {
                const data = JSON.parse(event.data);
                const { id, staffId, date } = data;
                if (date !== iso8601Date) return;
                fetch(`${SERVER_URL}/timeblocks/${id}`)
                    .then(async (response) => {
                        if (response.ok) {
                            const timeBlock: TimeBlock = await response.json();
                            setTimeBlocks((timeBlocks) => {
                                let staffTimeBlocks = timeBlocks.get(staffId);
                                if (!staffTimeBlocks) {
                                    staffTimeBlocks = [timeBlock];
                                } else {
                                    const index = staffTimeBlocks.findIndex((tb) => tb.id === id);
                                    if (index !== -1) {
                                        staffTimeBlocks[index] = timeBlock;
                                    } else {
                                        let i = 0;
                                        for (i = 0; i < staffTimeBlocks.length; i++) {
                                            const staffTimeBlock = staffTimeBlocks[i];
                                            const timeDiff =
                                                (staffTimeBlock.duration.startHour - timeBlock.duration.startHour) * 60 +
                                                (staffTimeBlock.duration.startMinute - timeBlock.duration.startMinute);
                                            if (timeDiff > 0) {
                                                staffTimeBlocks.splice(i, 0, timeBlock);
                                                break;
                                            } else if (timeDiff === 0) {
                                                return timeBlocks;
                                            }
                                        }
                                        if (i === staffTimeBlocks.length) {
                                            staffTimeBlocks.push(timeBlock);
                                        }
                                    }
                                    staffTimeBlocks = [...staffTimeBlocks];
                                }
                                timeBlocks.set(staffId, staffTimeBlocks);
                                return new Map<number, TimeBlock[]>(timeBlocks);
                            });
                        } else {
                            notify({ message: "Cannot fetch the updated time block", isError: true });
                        }
                    })
                    .catch(() => notify({ message: "Cannot fetch the updated time block", isError: true }));
            };
            eventSource.current.onmessage = eventListener.current;
        }
    }, [date]);

    return <TimeBlockContext.Provider value={{ date, timeBlocks, setDate }}>{props.children}</TimeBlockContext.Provider>;
}

export function useTimeBlockContext() {
    return useContext(TimeBlockContext);
}

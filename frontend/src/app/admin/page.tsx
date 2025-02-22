import { useState, useEffect, memo, useMemo } from "react";
import { useTimeBlockContext } from "@/app/context/timeblock";
import { useStaffContext } from "@/app/context/staff";
import { Box, Button, Card, CardContent, Chip, FormControl, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import { DatePicker, TimeField } from "@mui/x-date-pickers";
import { TimeBlock, Duration } from "@/app/types";
import dayjs, { Dayjs } from "dayjs";
import { SERVER_URL } from "../config";
import { useNotificationContext } from "../context/notification";

export default function AdminPage() {
    const notify = useNotificationContext();
    const { timeBlocks, date, setDate } = useTimeBlockContext();
    const { staffs } = useStaffContext();
    const [timeBlockDuration, setTimeBlockDuration] = useState<Duration>({
        startHour: 9,
        startMinute: 0,
        endHour: 17,
        endMinute: 0,
    });
    const [staffId, setStaffId] = useState<number | null>(null);
    const isValidTimeBlock = useMemo(
        () =>
            (timeBlockDuration.endHour - timeBlockDuration.startHour) * 60 +
                (timeBlockDuration.endMinute - timeBlockDuration.startMinute) >
            0,
        [timeBlockDuration]
    );

    const changeBlockTime = (type: "start" | "end", value: Dayjs | null) => {
        if (!value) return;
        const hour = value.hour();
        const minute = value.minute();
        if (type === "start") {
            setTimeBlockDuration((duration) => ({ ...duration, startHour: hour, startMinute: minute }));
        } else {
            setTimeBlockDuration((duration) => ({ ...duration, endHour: hour, endMinute: minute }));
        }
    };

    const addTimeBlock = () => {
        if (!staffId || !date) return;
        fetch(`${SERVER_URL}/timeblocks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ staffId, date: date.format("YYYY-MM-DD"), duration: timeBlockDuration }),
        })
            .then(async (response) => {
                if (response.ok) {
                    notify({ message: "Scheduled time block successfully", isError: false });
                } else {
                    notify({ message: "Cannot schedule the time block", isError: true });
                }
            })
            .catch(() => notify({ message: "Cannot schedule the time block", isError: true }));
    };

    return (
        <Box>
            <DatePicker label="Appointment Date" value={date} onChange={(date) => setDate(date)} />
            <FormControl fullWidth size="small">
                <InputLabel id="staff-select-label">Staff</InputLabel>
                <Select
                    labelId="staff-select-label"
                    id="staff-select"
                    value={staffId}
                    label="Staff"
                    onChange={(e) => setStaffId(e.target.value as number)}
                >
                    {staffs
                        .entries()
                        .toArray()
                        .map(([staffId, name]) => (
                            <MenuItem key={staffId} value={staffId}>
                                {name}
                            </MenuItem>
                        ))}
                </Select>
            </FormControl>
            <TimeField
                label="Start time"
                value={dayjs(`${timeBlockDuration.startHour}:${timeBlockDuration.startMinute}`, "HH:mm")}
                format="HH:mm"
                onChange={(value) => changeBlockTime("start", value)}
            />
            <TimeField
                label="End time"
                value={dayjs(`${timeBlockDuration.endHour}:${timeBlockDuration.endMinute}`, "HH:mm")}
                format="HH:mm"
                onChange={(value) => changeBlockTime("end", value)}
            />
            {staffId && isValidTimeBlock && (
                <Card>
                    <CardContent>
                        <Typography>Invalid schedule timeblock</Typography>
                    </CardContent>
                </Card>
            )}
            <Button size="small" variant="outlined" disabled={!isValidTimeBlock || !staffId} onClick={addTimeBlock}>
                Schedule timeblock
            </Button>
            {timeBlocks
                .entries()
                .toArray()
                .map(([staffId, staffTimeBlocks]) => (
                    <StaffTimeBlocks key={staffId} name={staffs.get(staffId) ?? "unknown"} timeBlocks={staffTimeBlocks} />
                ))}
        </Box>
    );
}

const StaffTimeBlocks = memo((props: { name: string; timeBlocks: TimeBlock[] }) => {
    const { name, timeBlocks } = props;

    return (
        <Box>
            <Typography>{name}</Typography>
            <Box>
                {timeBlocks.map(({ id, duration }) => (
                    <Chip
                        key={id}
                        label={`${duration.startHour}:${duration.startMinute} - ${duration.endHour}:${duration.endMinute}`}
                        variant="filled"
                    />
                ))}
            </Box>
        </Box>
    );
});

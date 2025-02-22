"use client";
import { useState, memo, useMemo } from "react";
import { useNotificationContext } from "@/app/context/notification";
import { useTimeBlockContext } from "@/app/context/timeblock";
import { useStaffContext } from "@/app/context/staff";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Typography,
} from "@mui/material";
import { DatePicker, TimeField } from "@mui/x-date-pickers";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import dayjs, { Dayjs } from "dayjs";
import { TimeBlock, Duration } from "@/app/types";
import { SERVER_URL } from "@/app/config";

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
    const [staffId, setStaffId] = useState<number>(-1);
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
        if (staffId === -1 || !date) {
            console.log(staffId, date);
            return;
        }
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
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, m: "20px 10px" }}>
            <DatePicker
                label="Appointment Date"
                value={date}
                onChange={(date) => setDate(date)}
                slotProps={{
                    textField: {
                        size: "small",
                    },
                }}
            />
            <Box
                sx={{
                    width: "fit-content",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                }}
            >
                <FormControl size="small">
                    <InputLabel id="staff-select-label">Staff</InputLabel>
                    <Select
                        labelId="staff-select-label"
                        id="staff-select"
                        value={staffId}
                        label="Staff"
                        onChange={(e) => setStaffId(e.target.value as number)}
                    >
                        <MenuItem value={-1} disabled>
                            No selection
                        </MenuItem>
                        {[...staffs.entries()].map(([staffId, name]) => (
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
                    slotProps={{
                        textField: {
                            size: "small",
                        },
                    }}
                />
                <TimeField
                    label="End time"
                    value={dayjs(`${timeBlockDuration.endHour}:${timeBlockDuration.endMinute}`, "HH:mm")}
                    format="HH:mm"
                    onChange={(value) => changeBlockTime("end", value)}
                    slotProps={{
                        textField: {
                            size: "small",
                        },
                    }}
                />
                {staffId === -1 || !isValidTimeBlock ? <ErrorIcon color="error" /> : <CheckCircleIcon color="success" />}
                <Button size="medium" variant="outlined" disabled={!isValidTimeBlock || staffId === -1} onClick={addTimeBlock}>
                    Add timeblock
                </Button>
            </Box>
            <Divider>
                <Chip label="Time Blocks" size="small" />
            </Divider>
            {[...timeBlocks.entries()].map(([staffId, staffTimeBlocks]) => (
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

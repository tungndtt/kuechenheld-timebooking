"use client";
import React, { useState, memo, useMemo } from "react";
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
    Step,
    StepIcon,
    StepLabel,
    Stepper,
    Typography,
} from "@mui/material";
import { DatePicker, TimeField } from "@mui/x-date-pickers";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EventIcon from "@mui/icons-material/Event";
import dayjs, { Dayjs } from "dayjs";
import { env } from "next-runtime-env";
import { getDurationDisplay } from "@/app/utils";
import { TimeBlock, Duration } from "@/app/types";

export default function AdminPage() {
    const SERVER_URL = env("NEXT_PUBLIC_SERVER_URL");
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
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
                <Chip label="Time Blocks" size="small" sx={{ borderRadius: "5px", fontWeight: "bold" }} />
            </Divider>
            {[...timeBlocks.entries()].map(([staffId, staffTimeBlocks]) => (
                <StaffTimeBlocks key={staffId} name={staffs.get(staffId) ?? "unknown"} timeBlocks={staffTimeBlocks} />
            ))}
        </Box>
    );
}

function TimeBlockStepIcon() {
    return <StepIcon icon={<EventIcon />} />;
}

const StaffTimeBlocks = memo(function StaffTimeBlocks(props: { name: string; timeBlocks: TimeBlock[] }) {
    const { name, timeBlocks } = props;

    return (
        <Card elevation={4}>
            <CardContent sx={{ display: "flex", flexDirection: "column", p: 2, gap: 1, overflowX: "auto" }}>
                <Typography variant="body1">
                    <b>{name}</b>
                </Typography>
                <Stepper alternativeLabel sx={{ width: "fit-content" }}>
                    {timeBlocks.map(({ id, duration }) => (
                        <Step key={id}>
                            <StepLabel
                                slots={{ stepIcon: TimeBlockStepIcon }}
                                sx={{
                                    "& .MuiStepLabel-label.MuiStepLabel-alternativeLabel": {
                                        marginTop: "5px",
                                    },
                                }}
                            >
                                <Chip label={getDurationDisplay(duration)} sx={{ borderRadius: "10px", fontWeight: "bold" }} />
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </CardContent>
        </Card>
    );
});

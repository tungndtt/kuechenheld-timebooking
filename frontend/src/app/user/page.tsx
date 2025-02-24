"use client";
import { memo, useState, useCallback, useMemo } from "react";
import { useNotificationContext } from "../context/notification";
import { useTimeBlockContext } from "@/app/context/timeblock";
import { useStaffContext } from "@/app/context/staff";
import {
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Chip,
    Modal,
    Button,
    Card,
    CardContent,
    StepIcon,
    Stepper,
    Step,
    StepLabel,
    Divider,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimeField } from "@mui/x-date-pickers";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import CircleIcon from "@mui/icons-material/Circle";
import dayjs, { Dayjs } from "dayjs";
import { env } from "next-runtime-env";
import { TimeBlock, Duration } from "@/app/types";
import { getDuration, getDurationDisplay, getTimeDiff } from "@/app/utils";

const durations = [10, 15, 25, 30, 60];

export default function UserPage() {
    const SERVER_URL = env("NEXT_PUBLIC_SERVER_URL");
    const notify = useNotificationContext();
    const { timeBlocks, date, setDate } = useTimeBlockContext();
    const { staffs } = useStaffContext();
    const [duration, setDuration] = useState(durations[0]);
    const [bookingTimeBlock, setBookingTimeBlock] = useState<{ id: number; duration: Duration } | null>(null);
    const [bookingAppointment, setBookingAppointment] = useState<Duration | null>(null);
    const [bookingOpen, setBookingOpen] = useState(false);
    const onBooking = useCallback(
        (id: number, appointment: Duration) => {
            setBookingTimeBlock({ id, duration: appointment });
            const { startHour, startMinute } = appointment;
            const bookingAppointment = getDuration(startHour, startMinute, duration);
            setBookingAppointment(bookingAppointment);
            setBookingOpen(true);
        },
        [duration]
    );
    const isValidBookingAppointment = useMemo(() => {
        if (!bookingTimeBlock || !bookingAppointment) return false;
        const timeBlockDuration = bookingTimeBlock.duration;
        return (
            getTimeDiff(
                bookingAppointment.startHour,
                bookingAppointment.startMinute,
                timeBlockDuration.startHour,
                timeBlockDuration.startMinute
            ) >= 0 &&
            getTimeDiff(
                bookingAppointment.endHour,
                bookingAppointment.endMinute,
                timeBlockDuration.endHour,
                timeBlockDuration.endMinute
            ) <= 0
        );
    }, [bookingAppointment]);

    const bookAppointment = () => {
        if (!bookingTimeBlock || !bookingAppointment) return;
        fetch(`${SERVER_URL}/timeblocks/appointment?id=${bookingTimeBlock.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bookingAppointment),
        })
            .then(async (response) => {
                if (response.ok) {
                    notify({ message: "Booked appointment successfully", isError: false });
                    setBookingOpen(false);
                } else {
                    notify({ message: "Cannot book the appointment. There might overlapping", isError: true });
                }
            })
            .catch(() => notify({ message: "Cannot book the appointment", isError: true }));
    };

    const changeBookingTime = (value: Dayjs | null) => {
        if (!value) return;
        const startHour = value.hour();
        const startMinute = value.minute();
        const bookingDuration = getDuration(startHour, startMinute, duration);
        setBookingAppointment(bookingDuration);
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", flexDirection: "row", justifyItems: "center", alignContent: "space-between", gap: 1 }}>
                <DatePicker
                    label="Appointment Date"
                    value={date}
                    onChange={(date) => setDate(date)}
                    slotProps={{
                        textField: {
                            size: "small",
                            fullWidth: true,
                        },
                    }}
                />
                <FormControl fullWidth size="small">
                    <InputLabel id="duration-select-label">Appointment Duration</InputLabel>
                    <Select
                        labelId="duration-select-label"
                        id="duration-select"
                        value={duration}
                        label="Appointment Duration"
                        onChange={(e) => setDuration(e.target.value as number)}
                    >
                        {durations.map((duration) => (
                            <MenuItem key={duration} value={duration}>
                                {duration} Minutes
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
            <Divider>
                <Chip label="Appointments" size="small" sx={{ borderRadius: "5px", fontWeight: "bold" }} />
            </Divider>
            {[...timeBlocks.entries()].map(([staffId, staffTimeBlocks]) => (
                <StaffTimeBlocks
                    key={staffId}
                    name={staffs.get(staffId) ?? "unknown"}
                    timeBlocks={staffTimeBlocks}
                    duration={duration}
                    onBooking={onBooking}
                />
            ))}
            <Modal
                sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                open={bookingOpen}
                onClose={() => setBookingOpen(false)}
                aria-labelledby="modal-title"
            >
                <Box
                    sx={{
                        height: "fit-content",
                        width: "fit-content",
                        backgroundColor: "white",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        borderRadius: 3,
                        p: 2,
                        gap: 1,
                    }}
                >
                    <Typography id="modal-title" variant="body1">
                        <b>Book appointment</b>
                    </Typography>
                    <Divider />
                    <Typography>
                        Timeblock: <b>{getDurationDisplay(bookingTimeBlock?.duration)}</b>
                    </Typography>
                    <Typography>
                        Duration: <b>{duration} mins</b>
                    </Typography>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1,
                            mt: 1,
                        }}
                    >
                        <TimeField
                            label="Start time"
                            value={dayjs(`${bookingAppointment?.startHour}:${bookingAppointment?.startMinute}`, "HH:mm")}
                            format="HH:mm"
                            onChange={changeBookingTime}
                            slotProps={{
                                textField: {
                                    size: "small",
                                },
                            }}
                        />
                        <TimeField
                            label="End time"
                            value={dayjs(`${bookingAppointment?.endHour}:${bookingAppointment?.endMinute}`, "HH:mm")}
                            format="HH:mm"
                            disabled
                            slotProps={{
                                textField: {
                                    size: "small",
                                },
                            }}
                        />
                    </Box>
                    {!isValidBookingAppointment && (
                        <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "left", gap: 1 }}>
                            <ErrorOutlineIcon color="error" />
                            <Typography variant="body2" color="error">
                                <b>Invalid booking appointment</b>
                            </Typography>
                        </Box>
                    )}
                    <Button size="small" variant="outlined" disabled={!isValidBookingAppointment} onClick={bookAppointment}>
                        Confirm
                    </Button>
                </Box>
            </Modal>
        </Box>
    );
}

function AvailableStepIcon() {
    return <StepIcon icon={<EventAvailableIcon color="success" />} />;
}

function BookedStepIcon() {
    return <StepIcon icon={<CircleIcon color="warning" />} />;
}

const StaffTimeBlocks = memo(function StaffTimeBlocks(props: {
    name: string;
    timeBlocks: TimeBlock[];
    duration: number;
    onBooking: (id: number, duration: Duration) => void;
}) {
    const { name, timeBlocks, duration, onBooking } = props;
    const appointments = [] as { id: number; duration: Duration; available: boolean }[];
    for (const timeBlock of timeBlocks) {
        const id = timeBlock.id;
        let { startHour, startMinute } = timeBlock.duration;
        for (const appointment of timeBlock.appointments) {
            const { startHour: endHour, startMinute: endMinute } = appointment;
            if ((endHour - startHour) * 60 + (endMinute - startMinute) >= duration) {
                const duration = { startHour, startMinute, endHour, endMinute };
                appointments.push({ id, duration, available: true });
            }
            startHour = appointment.endHour;
            startMinute = appointment.endMinute;
            appointments.push({ id, duration: appointment, available: false });
        }
        const { endHour, endMinute } = timeBlock.duration;
        if ((endHour - startHour) * 60 + (endMinute - startMinute) >= duration) {
            const duration = { startHour, startMinute, endHour, endMinute };
            appointments.push({ id, duration, available: true });
        }
    }
    return (
        <Card elevation={4}>
            <CardContent sx={{ display: "flex", flexDirection: "column", p: 2, gap: 1, overflowX: "auto" }}>
                <Typography variant="body1">
                    <b>{name}</b>
                </Typography>
                <Stepper alternativeLabel sx={{ width: "fit-content" }}>
                    {appointments.map(({ id, duration, available }) => {
                        const label = getDurationDisplay(duration);
                        return (
                            <Step key={label}>
                                <StepLabel
                                    slots={{ stepIcon: available ? AvailableStepIcon : BookedStepIcon }}
                                    sx={{
                                        "& .MuiStepLabel-label.MuiStepLabel-alternativeLabel": {
                                            marginTop: "5px",
                                        },
                                    }}
                                >
                                    <Chip
                                        label={label}
                                        sx={{ borderRadius: "10px", fontWeight: "bold" }}
                                        onClick={available ? () => onBooking(id, duration) : undefined}
                                        color={available ? "success" : "warning"}
                                    />
                                </StepLabel>
                            </Step>
                        );
                    })}
                </Stepper>
            </CardContent>
        </Card>
    );
});

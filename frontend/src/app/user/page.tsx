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
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimeField } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { TimeBlock, Duration } from "@/app/types";
import { SERVER_URL } from "@/app/config";

const durations = [10, 15, 25, 30, 60];
const getDuration = (startHour: number, startMinute: number, duration: number): Duration => {
    let minutes = startMinute + duration;
    let endMinute = minutes % 60;
    let hours = Math.floor(minutes / 60);
    let endHour = startHour + hours;
    return { startHour, startMinute, endHour, endMinute };
};
const getTimeDiff = (startHour1: number, startMinute1: number, startHour2: number, startMinute2: number): number => {
    return (startHour1 - startHour2) * 60 + (startMinute1 - startMinute2);
};

export default function UserPage() {
    const notify = useNotificationContext();
    const { timeBlocks, date, setDate } = useTimeBlockContext();
    const { staffs } = useStaffContext();
    const [duration, setDuration] = useState(durations[0]);
    const [bookingTimeBlock, setBookingTimeBlock] = useState<{ id: Number; duration: Duration } | null>(null);
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
        if (!bookingTimeBlock) return;
        fetch(`${SERVER_URL}/timeblocks/appointment?${bookingTimeBlock.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bookingTimeBlock.duration),
        })
            .then(async (response) => {
                if (response.ok) {
                    notify({ message: "Booked appointment successfully", isError: false });
                } else {
                    notify({ message: "Cannot book the appointment", isError: true });
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
        <Box>
            <DatePicker label="Appointment Date" value={date} onChange={(date) => setDate(date)} />
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
            {timeBlocks
                .entries()
                .toArray()
                .map(([staffId, staffTimeBlocks]) => (
                    <StaffTimeBlocks
                        key={staffId}
                        name={staffs.get(staffId) ?? "unknown"}
                        timeBlocks={staffTimeBlocks}
                        duration={duration}
                        onBooking={onBooking}
                    />
                ))}
            <Modal open={bookingOpen} onClose={() => setBookingOpen(false)} aria-labelledby="modal-title">
                <Box>
                    <Typography id="modal-title" variant="h6" component="h2">
                        Book appointment
                    </Typography>
                    <Typography>
                        Timeblock:{" "}
                        <b>
                            {bookingTimeBlock?.duration.startHour}:{bookingTimeBlock?.duration.startMinute} -{" "}
                            {bookingTimeBlock?.duration.endHour}:{bookingTimeBlock?.duration.endMinute}
                        </b>
                    </Typography>
                    <Typography>
                        Duration: <b>{duration}</b>
                    </Typography>
                    <TimeField
                        label="Start time"
                        value={dayjs(`${bookingAppointment?.startHour}:${bookingAppointment?.startMinute}`, "HH:mm")}
                        format="HH:mm"
                        onChange={changeBookingTime}
                    />
                    <TimeField
                        label="End time"
                        value={dayjs(`${bookingAppointment?.endHour}:${bookingAppointment?.endMinute}`, "HH:mm")}
                        format="HH:mm"
                        disabled
                    />
                    {isValidBookingAppointment && (
                        <Card>
                            <CardContent>
                                <Typography>Invalid booking appointment</Typography>
                            </CardContent>
                        </Card>
                    )}
                    <Button size="small" variant="outlined" disabled={!isValidBookingAppointment} onClick={bookAppointment}>
                        Confirm
                    </Button>
                </Box>
            </Modal>
        </Box>
    );
}

const StaffTimeBlocks = memo(
    (props: { name: string; timeBlocks: TimeBlock[]; duration: number; onBooking: (id: number, duration: Duration) => void }) => {
        const { name, timeBlocks, duration, onBooking } = props;
        const bookedAppointments = [] as Duration[];
        const availableAppointments = [] as { id: number; duration: Duration }[];
        for (const timeBlock of timeBlocks) {
            const id = timeBlock.id;
            let { startHour, startMinute } = timeBlock.duration;
            for (const appointment of timeBlock.appointments) {
                let { startHour: endHour, startMinute: endMinute } = appointment;
                if ((endHour - startHour) * 60 + (endMinute - startMinute) >= duration) {
                    const duration = { startHour, startMinute, endHour, endMinute };
                    availableAppointments.push({ id, duration });
                }
                startHour = appointment.endHour;
                startMinute = appointment.endMinute;
                bookedAppointments.push(appointment);
            }
            let { endHour, endMinute } = timeBlock.duration;
            if ((endHour - startHour) * 60 + (endMinute - startMinute) >= duration) {
                const duration = { startHour, startMinute, endHour, endMinute };
                availableAppointments.push({ id, duration });
            }
        }
        return (
            <Box>
                <Typography>{name}</Typography>
                <Box>
                    {availableAppointments.map(({ id, duration }) => (
                        <Chip
                            key={`available ${duration.startHour}:${duration.startMinute}`}
                            label={`${duration.startHour}:${duration.startMinute} - ${duration.endHour}:${duration.endMinute}`}
                            onClick={() => onBooking(id, duration)}
                            variant="outlined"
                        />
                    ))}
                </Box>
                <Box>
                    {bookedAppointments.map(({ startHour, startMinute, endHour, endMinute }) => (
                        <Chip
                            key={`booked ${startHour}:${startMinute}`}
                            label={`${startHour}:${startMinute} - ${endHour}:${endMinute}`}
                        />
                    ))}
                </Box>
            </Box>
        );
    }
);

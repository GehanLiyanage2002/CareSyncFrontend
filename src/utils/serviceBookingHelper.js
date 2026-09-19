const dayNameToIndex = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6
};

export const generateAvailableDates = (rawSchedules) => {
  if (!rawSchedules || !Array.isArray(rawSchedules) || rawSchedules.length === 0) return [];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const datesMap = new Map();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Specific date schedules
  rawSchedules.forEach(sch => {
    if (sch.schedule_date) {
      const parts = sch.schedule_date.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        if (d >= today) {
          const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          datesMap.set(dateKey, {
            ...sch,
            schedule_date: dateKey,
            dayName: daysOfWeek[d.getDay()],
            dayNum: d.getDate(),
            month: months[d.getMonth()],
            year: d.getFullYear(),
            formattedDate: `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`,
            timestamp: d.getTime()
          });
        }
      }
    }
  });

  // 2. Weekday recurring schedules (generate next 28 days)
  const weekdaySchedules = rawSchedules.filter(
    sch => sch.day_of_week && dayNameToIndex[sch.day_of_week.toLowerCase()] !== undefined
  );

  if (weekdaySchedules.length > 0) {
    for (let i = 0; i < 28; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
      const targetDayIndex = targetDate.getDay();

      const year = targetDate.getFullYear();
      const month = targetDate.getMonth();
      const day = targetDate.getDate();
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      const matchingSchedule = weekdaySchedules.find(
        sch => dayNameToIndex[sch.day_of_week.toLowerCase()] === targetDayIndex
      );

      if (matchingSchedule && !datesMap.has(dateKey)) {
        datesMap.set(dateKey, {
          ...matchingSchedule,
          schedule_date: dateKey,
          dayName: daysOfWeek[targetDayIndex],
          dayNum: day,
          month: months[month],
          year: year,
          formattedDate: `${day} ${months[month]} ${year}`,
          timestamp: targetDate.getTime()
        });
      }
    }
  }

  return Array.from(datesMap.values()).sort((a, b) => a.timestamp - b.timestamp);
};

export const generateSlots = (schedule) => {
  if (!schedule || !schedule.start_time || !schedule.end_time) return [];
  const slots = [];
  let [currHour, currMin] = schedule.start_time.split(':').map(Number);
  let [endHour, endMin] = schedule.end_time.split(':').map(Number);
  const duration = Number(schedule.slot_duration_minutes) || 30;

  if (endHour < currHour || (endHour === currHour && endMin < currMin)) {
    endHour += 24;
  }

  while (currHour < endHour || (currHour === endHour && currMin < endMin)) {
    const displayHour = currHour % 24;
    const hh = displayHour.toString().padStart(2, '0');
    const mm = currMin.toString().padStart(2, '0');
    slots.push(`${hh}:${mm}`);

    currMin += duration;
    if (currMin >= 60) {
      currHour += Math.floor(currMin / 60);
      currMin = currMin % 60;
    }
  }
  return slots;
};

export const filterPastSlotsIfToday = (slots, scheduleDateStr) => {
  if (!slots || slots.length === 0 || !scheduleDateStr) return slots;
  const now = new Date();
  const parts = scheduleDateStr.split('-');
  if (parts.length === 3) {
    const schYear = parseInt(parts[0], 10);
    const schMonth = parseInt(parts[1], 10) - 1;
    const schDay = parseInt(parts[2], 10);

    if (
      schYear === now.getFullYear() &&
      schMonth === now.getMonth() &&
      schDay === now.getDate()
    ) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      return slots.filter(timeStr => {
        const [slotHour, slotMinute] = timeStr.split(':').map(Number);
        if (slotHour > currentHour) return true;
        if (slotHour === currentHour && slotMinute > currentMinute) return true;
        return false;
      });
    }
  }
  return slots;
};

export const formatTimeDisplay = (time24) => {
  if (!time24) return '';
  const [h, m] = time24.split(':');
  const hours = parseInt(h, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12.toString().padStart(2, '0')}:${m} ${ampm}`;
};
